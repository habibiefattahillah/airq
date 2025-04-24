import sys
import json
import torch
import torch.nn as nn
import numpy as np
import pickle
import joblib
import os
import io

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class CPU_Unpickler(pickle.Unpickler):
    def find_class(self, module, name):
        if module == 'torch.storage' and name == '_load_from_bytes':
            return lambda b: torch.load(io.BytesIO(b), map_location='cpu')
        else: return super().find_class(module, name)

# Define your MLP architecture (should match the one you trained and saved)
class MLP(nn.Module):
    def __init__(self, input_size=7, hidden_size=64, output_size=5):
        super(MLP, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        x = self.relu(self.fc1(x))
        return self.fc2(x)

def load_scaler():
    with open("models/scaler.pkl", 'rb') as scaler_file:
        scaler = pickle.load(scaler_file)
    return scaler

def scale_data(X, scaler):
    X = np.array(X).reshape(1, -1)
    X_scaled = scaler.transform(X)
    return X_scaled[0]

def load_rf_model():
    return joblib.load("models/rf_model.pkl")

def load_mlp_model(input_dim):
    class MLP(torch.nn.Module):
        def __init__(self, input_dim):
            super(MLP, self).__init__()
            self.fc1 = torch.nn.Linear(input_dim, 64)
            self.relu = torch.nn.ReLU()
            self.fc2 = torch.nn.Linear(64, 32)
            self.fc3 = torch.nn.Linear(32, 5)

        def forward(self, x):
            x = self.relu(self.fc1(x))
            x = self.relu(self.fc2(x))
            x = self.fc3(x)
            return x

    mlp_model = MLP(input_dim).to(device)
    mlp_model.load_state_dict(torch.load("models/mlp_model_wqi.pt", map_location=device, weights_only=True))
    mlp_model.eval()
    return mlp_model

def load_cnn_model(input_dim):
    class CNNModel(nn.Module):
        def __init__(self, input_dim):
            super(CNNModel, self).__init__()
            self.conv1 = nn.Conv1d(in_channels=1, out_channels=16, kernel_size=3, padding=1)
            self.conv2 = nn.Conv1d(in_channels=16, out_channels=32, kernel_size=3, padding=1)
            self.fc1 = nn.Linear(32 * input_dim, 64)
            self.fc2 = nn.Linear(64, 32)
            self.fc3 = nn.Linear(32, 5)  # Assuming 5 classes for WQI
            self.dropout = nn.Dropout(0.1)

        def forward(self, x):
            x = x.unsqueeze(1)  # Add channel dimension
            x = torch.relu(self.conv1(x))
            x = torch.relu(self.conv2(x))
            x = x.view(x.size(0), -1)  # Flatten the tensor
            x = torch.relu(self.fc1(x))
            x = torch.relu(self.fc2(x))
            x = self.fc3(x)  # No softmax activation here, as CrossEntropyLoss includes it
            x = self.dropout(x)
            return x

    cnn_model = CNNModel(input_dim).to(device)
    cnn_model.load_state_dict(torch.load("models/cnn_model_wqi.pt", map_location=device, weights_only=True))
    cnn_model.eval()  # Set the model to evaluation mode
    return cnn_model

def load_tabnet_model():
    with open("models/tabnet_model.pkl", 'rb') as model_file:
        tabnet_model = CPU_Unpickler(model_file).load()
        tabnet_model.device = torch.device('cpu')  # Ensure the model uses CPU
    return tabnet_model

def predict_rf(model, X):
    return int(model.predict([X])[0])

def predict_tabnet(model, X):
    X = np.array(X).reshape(1, -1)
    pred = model.predict(X)
    return int(pred[0])

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing arguments"}))
        return
    
    scaler = load_scaler()

    models = json.loads(sys.argv[1])
    parameters = json.loads(sys.argv[2])
    input_dim = 7

    param_order = [
        "Temperatur",
        "OksigenTerlarut",
        "SaturasiOksigen",
        "Konduktivitas",
        "Kekeruhan",
        "PH",
        "ZatPadatTerlarut"
    ]

    X = [parameters[k] if parameters[k] is not None else 0 for k in param_order]
    # X = scale_data(X, scaler)
    X_tensor = torch.tensor(X, dtype=torch.float32).unsqueeze(0)
    X_tensor = X_tensor.to(device)

    model_results = {}
    for m in models:
        if m == "RF":
            rf = load_rf_model()
            result = predict_rf(rf, X)
            model_results["RF"] = {
                "value": result,
                "confidence": 1  # Dummy confidence
            }
        if m == "TabNet":
            tabnet_model = load_tabnet_model()

            tabnet_classifications = tabnet_model.predict(X_tensor)
            tabnet_logits = tabnet_model.predict_proba(X_tensor)
            tabnet_confidence_scores = np.max(tabnet_logits, axis=1) * 100
            tabnet_confidence = tabnet_confidence_scores.max().item()
            tabnet_classification = int(tabnet_classifications[0])
            model_results["TabNet"] = {
                    "value": tabnet_classification,
                    "confidence": tabnet_confidence
                }
        if m == "CNN":
            cnn_model = load_cnn_model(input_dim)

            cnn_predictions = cnn_model(X_tensor)
            cnn_probs = torch.softmax(cnn_predictions, dim=1)
            cnn_confidence = torch.max(cnn_probs, dim=1).values.item() * 100
            cnn_prediction = torch.argmax(cnn_predictions, dim=1).item()
            model_results["CNN"] = {
                "value": cnn_prediction,
                "confidence": cnn_confidence
            }

        if m == "MLP":
            mlp_model = load_mlp_model(input_dim)

            mlp_predictions = mlp_model(X_tensor)
            mlp_probs = torch.softmax(mlp_predictions, dim=1)
            mlp_confidence = torch.max(mlp_probs, dim=1).values.item() * 100
            mlp_prediction = torch.argmax(mlp_predictions, dim=1).item()
            model_results["MLP"] = {
                "value": mlp_prediction,
                "confidence": mlp_confidence
            }

    print(json.dumps({
        "modelResults": model_results,
    }))


if __name__ == "__main__":
    main()
