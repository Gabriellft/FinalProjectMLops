import pandas as pd
import numpy as np
import boto3
from io import BytesIO
import pyarrow.parquet as pq
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import joblib
import pyarrow as pa
# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'
data_key = 'curred_data/preprocessed_latest.parquet'
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

# Définir la fonction expected_guests
def expected_guests(date):
    month = date.month
    if month in [6, 7, 8, 12]:
        return np.random.randint(80, 120)
    else:
        return np.random.randint(50, 80)

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
    predictions_df = pd.DataFrame(y_pred[i], index=['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat']).T
    predictions_df['date'] = date.strftime("%Y-%m-%d")  # S'assurer que la date est au format string pour PyArrow
    buffer = BytesIO()
    table = pa.Table.from_pandas(predictions_df)
    pq.write_table(table, buffer)
    output_key = f'output/predictions_{date.strftime("%Y-%m-%d")}.parquet'
    s3.put_object(Bucket=bucket_name, Key=output_key, Body=buffer.getvalue())
    print(f'Predictions for {date.strftime("%Y-%m-%d")} saved to S3: {bucket_name}/{output_key}')
