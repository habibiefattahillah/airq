import sys
import json
import torch
import torch.nn as nn
import numpy as np
import joblib
import os

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

def load_rf_model():
    return joblib.load("models/rf_model.pkl")

def load_tabnet_model():
    return joblib.load("models/tabnet_model.pkl")

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

    models = json.loads(sys.argv[1])
    parameters = json.loads(sys.argv[2])

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

    model_results = {}
    for m in models:
        if m == "RF":
            rf = load_rf_model()
            result = predict_rf(rf, X)
            model_results["RF"] = {
                "value": result,
                "confidence": 1  # Dummy confidence
            }

    final_wqi = next(iter(model_results.values()))["value"]

    print(json.dumps({
        "modelResults": model_results,
        "finalWQI": final_wqi
    }))


if __name__ == "__main__":
    main()
