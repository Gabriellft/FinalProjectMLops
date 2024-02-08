import pandas as pd
import numpy as np
import boto3
from io import BytesIO
from io import StringIO
import json
import pyarrow.parquet as pq
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import joblib
import pyarrow as pa
# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'
data_key = 'preprocessed_data/preprocessed_latest.parquet'
model_params_key = 'model/best_params.joblib'

# Fonction pour charger les données depuis S3
def load_data_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

# Fonction pour charger les meilleurs paramètres du modèle depuis S3
def load_model_params(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    best_params = joblib.load(BytesIO(response['Body'].read()))
    return best_params

# Charger les données et les meilleurs paramètres du modèle
df = load_data_from_s3(bucket_name, data_key)
best_params = load_model_params(bucket_name, model_params_key)

# Préparer les données pour l'entraînement
X = df[['expected', 'month', 'day', 'weekday']]
y = df[['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat']]

# Entraîner le modèle
rf = RandomForestRegressor(**best_params)
rf.fit(X, y)

def expected_guests(date):
    weekday = date.weekday()
    if weekday in [4, 5]:  # Vendredi et samedi
        return np.random.randint(140, 150)  # Plus de visiteurs le weekend
    elif weekday == 6:  # Dimanche
        return np.random.randint(80, 90)  # Dimanche un peu moins
    else:
        return np.random.randint(30, 40)

# Générer les données pour les prédictions pour les 3 jours suivants
last_date = df['date'].max()
dates = [last_date + timedelta(days=i) for i in range(1, 4)]
X_pred = pd.DataFrame({
    'date': dates,
    'expected': [expected_guests(date) for date in dates],
    'month': [date.month for date in dates],
    'day': [date.day for date in dates],
    'weekday': [date.weekday() for date in dates]
})

# Faire des prédictions
y_pred = rf.predict(X_pred[['expected', 'month', 'day', 'weekday']])

# Sauvegarder les prédictions dans S3
for i, date in enumerate(dates):
    predictions_df = pd.DataFrame([{
        'date': date.strftime("%Y-%m-%d"),
        **{col: y_pred[i][j] for j, col in enumerate(['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat'])}
    }])
    json_str = predictions_df.to_json(orient='records')
    output_key = f'output/predictions_{date.strftime("%Y-%m-%d")}.json'
    s3.put_object(Bucket=bucket_name, Key=output_key, Body=json_str)
    print(f'Predictions for {date.strftime("%Y-%m-%d")} saved to S3: {bucket_name}/{output_key}')
