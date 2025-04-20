import sys
import json
import pandas as pd
import pickle

# Load model
with open("./models/imputer_miceforest.pkl", "rb") as f:
    model = pickle.load(f)

# Read input from argv
row_json = sys.argv[1]
row_data = json.loads(row_json)

# Convert to DataFrame and cast all to float
df = pd.DataFrame([row_data]).astype("float64")  # 🔥 This line fixes the type issue

# Impute
imputed_df = model.impute_new_data(df).complete_data()

# Return as JSON
print(imputed_df.to_json(orient="records"))
