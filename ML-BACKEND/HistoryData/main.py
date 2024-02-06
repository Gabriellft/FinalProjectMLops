import pandas as pd
import boto3
from io import BytesIO
import pyarrow.parquet as pq

# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'

def get_preprocessed_df(bucket, preprocessed_key):
    try:
        response = s3.get_object(Bucket=bucket, Key=preprocessed_key)
        df_preprocessed = pq.read_table(BytesIO(response['Body'].read())).to_pandas()
        return df_preprocessed
    except s3.exceptions.NoSuchKey:
        return None

# Fonction pour convertir le DataFrame mis à jour en JSON et le sauvegarder dans S3
def save_df_as_json_to_s3(df, bucket, key):
    json_buffer = BytesIO()
    # Convertir le DataFrame en JSON
    df.to_json(json_buffer, orient='records', lines=True)
    json_buffer.seek(0)
    # Stocker le JSON dans S3
    s3.put_object(Bucket=bucket, Key=key, Body=json_buffer.getvalue())
    print(f'JSON file saved to S3: {key}')

# Processus principal pour la sauvegarde en JSON
preprocessed_key = 'curred_data/preprocessed_latest.parquet'
historical_key = 'curred_data/historical/historical_data.json'  # Clé pour le fichier JSON historique

df_preprocessed = get_preprocessed_df(bucket_name, preprocessed_key)

if df_preprocessed is not None:
    # Sauvegarder le DataFrame prétraité en JSON
    save_df_as_json_to_s3(df_preprocessed, bucket_name, historical_key)
else:
    print("No preprocessed data to convert to JSON or no data files found in the specified S3 bucket.")
