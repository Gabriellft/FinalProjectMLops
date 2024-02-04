import pandas as pd
import boto3
from io import BytesIO
import pyarrow.parquet as pq

# Configuration
bucket_name = 'hotel-breakfast'
s3_client = boto3.client('s3')

# Fonction pour récupérer le nom du dernier fichier 'curred_data'
def get_latest_curred_data_file(bucket):
    response = s3_client.list_objects_v2(Bucket=bucket, Prefix='curred_data/')
    files = sorted([item['Key'] for item in response.get('Contents', []) if item['Key'].endswith('.parquet')],
                   key=lambda x: x.split('/')[-1])
    return files[-1] if files else None

# Fonction pour lire le dernier fichier Parquet de S3
def read_parquet_from_s3(bucket, key):
    response = s3_client.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df

# Fonction pour transformer et enregistrer le DataFrame
def transform_and_save_df(df):
    # Convertir 'date' en datetime et définir comme index si ce n'est pas déjà fait
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
        df.set_index('date', inplace=True)

    # Ajouter des caractéristiques de séries temporelles basées sur l'index
    df['month'] = df.index.month
    df['day'] = df.index.day
    df['weekday'] = df.index.weekday

    # Identifier les colonnes disponibles pour les items du petit-déjeuner
    breakfast_items = ['croissants', 'pain au chocolat', 'baguettes', 'jus d\'orange', 'café']
    available_columns = [col for col in breakfast_items if col in df.columns]

    # Préparer les colonnes finales incluant celles disponibles
    columns_required = ['expected', 'month', 'day', 'weekday'] + available_columns
    df_final = df[columns_required].copy()

    # Enregistrer le DataFrame final en CSV localement
    csv_file_name = 'latest_curred_data.csv'
    df_final.to_csv(csv_file_name, index_label='date')
    print(f'DataFrame saved to {csv_file_name}')

# Exécution du processus principal
latest_file_key = get_latest_curred_data_file(bucket_name)
if latest_file_key:
    df_latest = read_parquet_from_s3(bucket_name, latest_file_key)
    transform_and_save_df(df_latest)
else:
    print("No 'curred_data' files found in the bucket.")
