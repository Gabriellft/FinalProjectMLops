import pandas as pd
import numpy as np
import boto3
from io import BytesIO
import joblib
import pyarrow.parquet as pq
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import mlflow
import mlflow.sklearn
import tempfile
import os
# Initialiser le suivi MLflow
mlflow.set_experiment('Hotel Breakfast Prediction')

# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'
data_key = 'curred_data/preprocessed_latest.parquet'
model_params_key = 'model/best_params.joblib'

def load_data_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

def load_model_params(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    best_params = joblib.load(BytesIO(response['Body'].read()))
    return best_params

df = load_data_from_s3(bucket_name, data_key)
best_params = load_model_params(bucket_name, model_params_key)

X = df[['expected', 'month', 'day', 'weekday']]
y = df[['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat']]

with mlflow.start_run():
    # Enregistrer les paramètres du modèle
    mlflow.log_params(best_params)
    
    # Entraîner le modèle
    rf = RandomForestRegressor(**best_params)
    rf.fit(X, y)
    
    # Enregistrer le modèle
    mlflow.sklearn.log_model(rf, "random_forest_regressor")
    
    def expected_guests(date):
        month = date.month
        if month in [6, 7, 8, 12]:
            return np.random.randint(80, 120)
        else:
            return np.random.randint(50, 80)

    last_date = df['date'].max()
    dates = [last_date + timedelta(days=i) for i in range(1, 4)]
    X_pred = pd.DataFrame({
        'date': dates,
        'expected': [expected_guests(date) for date in dates],
        'month': [date.month for date in dates],
        'day': [date.day for date in dates],
        'weekday': [date.weekday() for date in dates]
    })

    y_pred = rf.predict(X_pred[['expected', 'month', 'day', 'weekday']])

    for i, date in enumerate(dates):
        predictions_df = pd.DataFrame([{
            'date': date.strftime("%Y-%m-%d"),
            **{col: y_pred[i][j] for j, col in enumerate(['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat'])}
        }])
        json_str = predictions_df.to_json(orient='records')
        output_key = f'output/predictions_{date.strftime("%Y-%m-%d")}.json'
        s3.put_object(Bucket=bucket_name, Key=output_key, Body=json_str)
        print(f'Predictions for {date.strftime("%Y-%m-%d")} saved to S3: {bucket_name}/{output_key}')

        # Utiliser tempfile pour créer un fichier temporaire compatible avec le système d'exploitation
        with tempfile.NamedTemporaryFile(delete=False, mode='w', suffix='.json') as tmpfile:
            tmpfile.write(json_str)
            tmpfile_path = tmpfile.name  # Sauvegarder le chemin pour l'utiliser après la fermeture du bloc

        # Le bloc with assure que le fichier est fermé avant de passer à l'étape suivante
        mlflow.log_artifact(tmpfile_path, "predictions")
        os.remove(tmpfile_path)  # Supprimer le fichier temporaire après l'avoir téléchargé

        print(f"Predictions for {date.strftime('%Y-%m-%d')} have been logged in MLflow.")
    
        
