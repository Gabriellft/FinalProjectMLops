import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pyarrow.parquet as pq
import pyarrow as pa
import boto3
from io import BytesIO

# Configuration pour la simulation de données
end_date = datetime(2024, 2, 7)  # Date de fin pour la génération de données

# Items pour les petits-déjeuners
items = ['croissants', 'pain au chocolat', 'baguettes', 'fruits', 'jus d\'orange', 'café']

# Initialisation du client S3
s3 = boto3.client('s3')
bucket_name = 'hotel-breakfast'

# Fonction pour générer le nombre de personnes attendues en fonction du mois
def expected_guests(date):
    month = date.month
    if month in [6, 7, 8, 12]:
        return np.random.randint(80, 120)
    else:
        return np.random.randint(50, 80)

# Fonction pour générer des données simulées
def generate_data(date):
    expected = expected_guests(date)
    base_quantity = np.random.randint(20, 50, size=len(items))
    variation = 1 + (expected / 100)
    data = {
        'date': [date] * len(items),
        'item': items,
        'quantity': (base_quantity * variation).astype(int),
        'expected': [expected] * len(items)
    }
    return pd.DataFrame(data)

# Fonction pour sauvegarder les données dans S3
def save_to_s3(df, current_date):
    buffer = BytesIO()
    table = pa.Table.from_pandas(df)
    pq.write_table(table, buffer)
    buffer.seek(0)  # Retourner au début du buffer
    file_name_in_s3 = f'data/{current_date.strftime("%Y-%m-%d")}.parquet'
    
    s3.put_object(Bucket=bucket_name, Key=file_name_in_s3, Body=buffer.getvalue())
    print(f'File {file_name_in_s3} uploaded to S3.')

# Trouver la dernière date pour laquelle les données ont été générées
def find_last_generated_date(bucket):
    response = s3.list_objects_v2(Bucket=bucket, Prefix='data/')
    files = [item['Key'] for item in response.get('Contents', []) if item['Key'].endswith('.parquet')]
    dates = [datetime.strptime(file.split('/')[-1].replace('.parquet', ''), '%Y-%m-%d') for file in files]
    return max(dates) if dates else None

# Générer les données pour le jour suivant le dernier jour généré
last_generated_date = find_last_generated_date(bucket_name)
if last_generated_date and last_generated_date < end_date:
    next_date = last_generated_date + timedelta(days=1)
    df_next_day = generate_data(next_date)
    save_to_s3(df_next_day, next_date)
else:
    print("All data up to the end date has already been generated or no data found.")
