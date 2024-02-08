import pandas as pd
import numpy as np
import boto3
from io import BytesIO
import pyarrow.parquet as pq
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import RandomizedSearchCV, TimeSeriesSplit
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
from datetime import datetime
import mlflow
import mlflow.sklearn
import matplotlib.pyplot as plt
import os

# Initialiser le client S3 en utilisant les variables d'environnement
s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)
bucket_name = 'hotel-breakfast'
parquet_key = 'preprocessed_data/preprocessed_latest.parquet'
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
def upload_directory_to_s3(bucket_name, directory_name, s3_prefix):
    s3 = boto3.client('s3')
    for root, dirs, files in os.walk(directory_name):
        for file in files:
            local_path = os.path.join(root, file)
            relative_path = os.path.relpath(local_path, directory_name)
            s3_path = os.path.join(s3_prefix, relative_path)
            
            print(f"Uploading {local_path} to s3://{bucket_name}/{s3_path}")
            s3.upload_file(local_path, bucket_name, s3_path)
def load_data_from_s3(bucket, key):
    """Charge les données depuis S3."""
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

def save_to_s3(bucket, key, content, is_json=True):
    """Sauvegarde les résultats dans S3."""
    s3_buffer = BytesIO()
    if is_json:
        s3_buffer.write(content.to_json().encode())
    else:
        joblib.dump(content, s3_buffer)
        s3_buffer.seek(0)
    s3.put_object(Bucket=bucket, Key=key, Body=s3_buffer.getvalue())
    s3_buffer.close()

# Configuration de MLflow
mlflow.set_tracking_uri("file:///app/mlruns")
mlflow.set_experiment('Hotel Breakfast TimeSeries Split')

mlflow.sklearn.autolog()

# Charger les données
df = load_data_from_s3(bucket_name, parquet_key)
X = df[['expected', 'month', 'day', 'weekday']]
y = df[['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat']]

# Configuration de TimeSeriesSplit pour la cross-validation
tscv = TimeSeriesSplit(n_splits=5)

# Paramètres pour RandomizedSearchCV
param_distributions = {
    'n_estimators': [100, 200, 300, 400, 500],
    'max_depth': [None, 10, 20, 30, 40, 50],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'bootstrap': [True, False]
}

# Initialisation des meilleures métriques pour comparaison
best_rmse = float("inf")
best_params = None
best_model = None

# Lancer la recherche avec cross-validation
for train_index, test_index in tscv.split(X):
    X_train, X_test = X.iloc[train_index], X.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]
    
    with mlflow.start_run():
        mlflow.set_tags({"type": "Random Forest", "domain": "Hotel Breakfast Prediction"})
        
        random_search = RandomizedSearchCV(estimator=RandomForestRegressor(), 
                                           param_distributions=param_distributions,
                                           n_iter=10, cv=3, verbose=2, random_state=42, n_jobs=-1)
        random_search.fit(X_train, y_train)
        predictions = random_search.predict(X_test)
        
        # Calcul du RMSE pour chaque cible
        rmse = np.sqrt(mean_squared_error(y_test, predictions, multioutput='raw_values')).mean()
        mae = mean_absolute_error(y_test, predictions, multioutput='raw_values').mean()
        r2 = r2_score(y_test, predictions, multioutput='uniform_average')
        
        if rmse < best_rmse:
            best_rmse = rmse
            best_params = random_search.best_params_
            best_model = random_search.best_estimator_
        
        # Logging supplémentaire
        mlflow.log_metrics({"rmse": rmse, "mae": mae, "r2_score": r2})

        print(f"RMSE: {rmse}, MAE: {mae}, R²: {r2}")

# Sauvegarde manuelle du meilleur modèle dans S3
save_to_s3(bucket_name, f'model/best_model_{timestamp}.joblib', best_model, is_json=False)
log_content = f"Date du run: {timestamp}\nMeilleurs paramètres: {best_params}\nMeilleur RMSE moyen: {best_rmse}\nMeilleur MAE: {mae}\nMeilleur R²: {r2}"
save_to_s3(bucket_name, f'logs/log_{timestamp}.txt', pd.Series([log_content]), is_json=False)
print(f"Meilleur RMSE moyen: {best_rmse}")
print(f"Log et meilleur modèle sauvegardés dans S3: {bucket_name}")
upload_directory_to_s3(bucket_name, 'mlruns', 'mlflow/')