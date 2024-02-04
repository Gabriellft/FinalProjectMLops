import pandas as pd
import numpy as np
import boto3
from io import BytesIO
import pyarrow.parquet as pq
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.metrics import mean_squared_error
import joblib
from datetime import datetime

# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'
parquet_key = 'curred_data/preprocessed_latest.parquet'
timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
logs_folder = f'logs/{timestamp}/'
log_file_name = f'{timestamp}_log.txt'

# Fonction pour charger le fichier Parquet depuis S3
def load_data_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

# Fonction pour sauvegarder les meilleurs paramètres dans S3
def save_best_params_to_s3(best_params, bucket, key):
    params_buffer = BytesIO()
    joblib.dump(best_params, params_buffer)
    params_buffer.seek(0)
    s3.put_object(Bucket=bucket, Key=key, Body=params_buffer.getvalue())

# Fonction pour sauvegarder le fichier log dans S3
def save_log_to_s3(log_content, bucket, key):
    encoded_log = log_content.encode()
    s3.put_object(Bucket=bucket, Key=key, Body=encoded_log)

# Charger le fichier Parquet depuis S3 et préparer les données
df = load_data_from_s3(bucket_name, parquet_key)
X = df[['expected', 'month', 'day', 'weekday']]
y = df[['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat']]
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Configuration et exécution de RandomizedSearchCV pour Random Forest Regressor
param_distributions = {
    'n_estimators': [100, 200, 300, 400, 500],
    'max_depth': [None, 10, 20, 30, 40, 50],
    'min_samples_split': [2, 5, 10],
    'min_samples_leaf': [1, 2, 4],
    'bootstrap': [True, False]
}
random_search = RandomizedSearchCV(estimator=RandomForestRegressor(), param_distributions=param_distributions, 
                                    n_iter=10, cv=3, verbose=2, random_state=42, n_jobs=-1)
random_search.fit(X_train, y_train)

# Calcul du RMSE sur l'ensemble de test
predictions = random_search.predict(X_test)
rmse = np.sqrt(mean_squared_error(y_test, predictions))

# Sauvegarde des meilleurs paramètres et création du fichier log
save_best_params_to_s3(random_search.best_params_, bucket_name, 'model/best_params.joblib')
log_content = f"Date du run: {timestamp}\nMeilleurs paramètres: {random_search.best_params_}\nRMSE sur X_test: {rmse}\n"
save_log_to_s3(log_content, bucket_name, logs_folder + log_file_name)

print(f"RMSE sur X_test: {rmse}")
print(f"Log sauvegardé dans S3: {bucket_name}/{logs_folder}{log_file_name}")
