import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import pyarrow.parquet as pq
import pyarrow as pa
import boto3
from io import BytesIO

# Configuration pour la simulation de données
start_date = datetime(2024, 1, 1)
end_date = datetime(2024, 2, 4)
current_date = start_date

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

# Boucle pour créer un fichier par jour et l'envoyer à S3
while current_date <= end_date:
    df = generate_data(current_date)
    save_to_s3(df, current_date)
    current_date += timedelta(days=1)
