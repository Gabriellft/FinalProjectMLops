import pandas as pd
import boto3
from io import BytesIO
import pyarrow.parquet as pq

# Initialiser le client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'

# Fonction pour vérifier l'existence du fichier prétraité
def check_preprocessed_file_exists(bucket, key):
    try:
        s3.head_object(Bucket=bucket, Key=key)
        return True
    except s3.exceptions.ClientError:
        return False


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

# Fonction pour obtenir le DataFrame prétraité existant (s'il existe)
def get_preprocessed_df(bucket, preprocessed_key):
    try:
        response = s3.get_object(Bucket=bucket, Key=preprocessed_key)
        df_preprocessed = pq.read_table(BytesIO(response['Body'].read())).to_pandas()
        return df_preprocessed
    except s3.exceptions.NoSuchKey:
        return None

# Prétraitement et formatage du DataFrame pour les nouveaux jours uniquement
def preprocess_and_update_df(df_existing, df_new):
    df_new['date'] = pd.to_datetime(df_new['date'])
    df_new_pivoted = df_new.pivot_table(index=['date', 'expected'], columns='item', values='quantity', aggfunc='sum').reset_index()
    df_new_pivoted['month'] = df_new_pivoted['date'].dt.month
    df_new_pivoted['day'] = df_new_pivoted['date'].dt.day
    df_new_pivoted['weekday'] = df_new_pivoted['date'].dt.weekday
    
    if df_existing is not None:
        df_updated = pd.concat([df_existing, df_new_pivoted]).drop_duplicates(subset=['date']).reset_index(drop=True)
    else:
        df_updated = df_new_pivoted
    
    return df_updated
def read_parquet_file_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

# Fonction pour le prétraitement et le formatage du DataFrame (utilisée dans les deux logiques)
def preprocess_df(df):
    df['date'] = pd.to_datetime(df['date'])
    df_pivoted = df.pivot_table(index=['date', 'expected'], columns='item', values='quantity', aggfunc='sum').reset_index()
    df_pivoted['month'] = df_pivoted['date'].dt.month
    df_pivoted['day'] = df_pivoted['date'].dt.day
    df_pivoted['weekday'] = df_pivoted['date'].dt.weekday
    return df_pivoted

# Processus principal
preprocessed_key = 'preprocessed_data/preprocessed_latest.parquet'
if not check_preprocessed_file_exists(bucket_name, preprocessed_key):
    # Logique de reset.py
    print("Preprocessed file not found. Processing all available files.")
    files = list_parquet_files(bucket_name)
    df_list = [read_parquet_file_from_s3(bucket_name, file) for file in files]
    df_combined = pd.concat(df_list, ignore_index=True) if df_list else pd.DataFrame()

    if not df_combined.empty:
        df_preprocessed = preprocess_df(df_combined)
        # Sauvegarder le DataFrame prétraité
        buffer = BytesIO()
        df_preprocessed.to_parquet(buffer, index=False)
        buffer.seek(0)

        s3.put_object(Bucket=bucket_name, Key=preprocessed_key, Body=buffer.getvalue())
        print(f'Preprocessed file saved to S3: {preprocessed_key}')
    else:
        print("No data files found in the specified S3 bucket.")
else:
    # Logique du premier script
    print("Preprocessed file found. Processing new files only.")
    df_preprocessed = get_preprocessed_df(bucket_name, preprocessed_key)
    last_processed_date = df_preprocessed['date'].max() if df_preprocessed is not None else None
    print(f'Last processed date: {last_processed_date}')
    
    files = list_parquet_files(bucket_name)
    files_to_process = [f for f in files if last_processed_date is None or pd.to_datetime(f.split('/')[-1].replace('.parquet', '')) > last_processed_date]

    df_list = [read_parquet_file_from_s3(bucket_name, file) for file in files_to_process if files_to_process]
    df_new = pd.concat(df_list, ignore_index=True) if df_list else pd.DataFrame()

    if not df_new.empty:
        df_updated = preprocess_and_update_df(df_preprocessed, df_new)

        # Sauvegarder le DataFrame mis à jour
        buffer = BytesIO()
        df_updated.to_parquet(buffer, index=False)
        buffer.seek(0)

        s3.put_object(Bucket=bucket_name, Key=preprocessed_key, Body=buffer.getvalue())
        print(f'Updated preprocessed file saved to S3: {preprocessed_key}')
    else:
        print("No new data to process or no data files found in the specified S3 bucket.")
