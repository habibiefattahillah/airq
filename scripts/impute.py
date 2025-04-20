import sys
import json
import pandas as pd
import pickle
from supabase import create_client, Client

# Supabase credentials (ideally stored in .env)
SUPABASE_URL = "https://omteheinzekndyvcvuxy.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tdGVoZWluemVrbmR5dmN2dXh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNDc4OTEsImV4cCI6MjA1OTYyMzg5MX0.FkQE4NBF9WBP7WWuz6mb4dLSObff25YVTb3FsqY4QjQ"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Load model
with open("models/mice_model.pkl", "rb") as f:
    model = pickle.load(f)

# Get ID from args
id = sys.argv[1]

# Fetch the row with the given ID
row = supabase.table("your_table_name").select("*").eq("id", id).single().execute()
data = row.data

# Convert to DataFrame
df = pd.DataFrame([data])
cols = ['dissolvedOxygenMgL', 'dissolvedOxygenSaturation', 'specificConductance',
        'temperatureWaterDegC', 'turbidityNTU', 'pHStdUnits', 'tdlMgL']
df = df[cols]

# Impute
imputed = model.impute(df)
result_df = imputed.complete_data()

# Update Supabase with imputed values and isImputed flags
update_payload = {
    col: {"value": float(result_df[col].iloc[0]), "isImputed": data[col] is None}
    for col in cols
}
update_payload["isImputed"] = True

supabase.table("your_table_name").update(update_payload).eq("id", id).execute()

# Output the result
print(json.dumps(update_payload))
