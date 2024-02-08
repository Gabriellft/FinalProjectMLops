import pandas as pd
import boto3
from io import BytesIO
import pyarrow.parquet as pq

# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'

# Fonction pour lister tous les fichiers Parquet dans le bucket S3
def list_parquet_files(bucket):
    response = s3.list_objects_v2(Bucket=bucket, Prefix='data/')
    files = [item['Key'] for item in response.get('Contents', []) if item['Key'].endswith('.parquet')]
    return files

# Fonction pour lire un fichier Parquet depuis S3 et le convertir en DataFrame
def read_parquet_file_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

# Fonction pour le prétraitement et le formatage du DataFrame
def preprocess_df(df):
    df['date'] = pd.to_datetime(df['date'])
    df_pivoted = df.pivot_table(index=['date', 'expected'], columns='item', values='quantity', aggfunc='sum').reset_index()
    df_pivoted['month'] = df_pivoted['date'].dt.month
    df_pivoted['day'] = df_pivoted['date'].dt.day
    df_pivoted['weekday'] = df_pivoted['date'].dt.weekday
    return df_pivoted

# Processus principal
files = list_parquet_files(bucket_name)
df_list = [read_parquet_file_from_s3(bucket_name, file) for file in files]
df_combined = pd.concat(df_list, ignore_index=True) if df_list else pd.DataFrame()

if not df_combined.empty:
    df_preprocessed = preprocess_df(df_combined)

    # Sauvegarder le DataFrame prétraité
    buffer = BytesIO()
    df_preprocessed.to_parquet(buffer, index=False)
    buffer.seek(0)
    preprocessed_key = 'preprocessed_data/preprocessed_latest.parquet'

    s3.put_object(Bucket=bucket_name, Key=preprocessed_key, Body=buffer.getvalue())
    print(f'Preprocessed file saved to S3: {preprocessed_key}')
else:
    print("No data files found in the specified S3 bucket.")
