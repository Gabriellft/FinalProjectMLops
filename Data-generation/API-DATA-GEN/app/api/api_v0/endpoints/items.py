from fastapi import Body, Depends, Header, APIRouter
from datetime import datetime, timedelta
import pandas as pd
import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq
import boto3
from io import BytesIO
from pydantic import BaseModel

router = APIRouter(prefix='/generate_date', tags=["Generate Next Days Data"])

# Configuration pour la simulation de données
items = ['croissants', 'pain au chocolat', 'baguettes', 'fruits', 'jus d\'orange', 'café']
bucket_name = 'hotel-breakfast'

# Initialisation du client S3
s3 = boto3.client('s3')

class DateInput(BaseModel):
    end_date: str  # Utiliser une chaîne de caractères pour la date
    expected_guests: int  # Ajout de la nouvelle entrée pour les invités attendus

def generate_data(date, expected):
    base_quantity = np.random.randint(20, 50, size=len(items))
    variation = 1 + (expected / 100)
    data = {
        'date': [date] * len(items),
        'item': items,
        'quantity': (base_quantity * variation).astype(int),
        'expected': [expected] * len(items)
    }
    return pd.DataFrame(data)

def save_to_s3(df, current_date):
    buffer = BytesIO()
    table = pa.Table.from_pandas(df)
    pq.write_table(table, buffer)
    buffer.seek(0)
    file_name_in_s3 = f'data/{current_date.strftime("%Y-%m-%d")}.parquet'
    
    s3.put_object(Bucket=bucket_name, Key=file_name_in_s3, Body=buffer.getvalue())
    return f'File {file_name_in_s3} uploaded to S3.'

def find_last_generated_date(bucket):
    response = s3.list_objects_v2(Bucket=bucket, Prefix='data/')
    files = [item['Key'] for item in response.get('Contents', []) if item['Key'].endsWith('.parquet')]
    dates = [datetime.strptime(file.split('/')[-1].replace('.parquet', ''), '%Y-%m-%d') for file in files]
    return max(dates) if dates else None

@router.post("")
async def root(date_input: DateInput = Body(...)):
    # Parser la chaîne de caractères en un objet datetime
    try:
        end_date = datetime.strptime(date_input.end_date, '%Y-%m-%d')
        expected_guests = date_input.expected_guests  # Récupération des invités attendus de l'entrée
        
        last_generated_date = find_last_generated_date(bucket_name)
        if last_generated_date:
            next_date = last_generated_date + timedelta(days=1)
        else:
            next_date = datetime.now().date()  # Assuming start today if no data found
        
        messages = []
        while next_date <= end_date:
            df_next_day = generate_data(next_date, expected_guests)  # Passer expected_guests comme argument
            message = save_to_s3(df_next_day, next_date)
            messages.append(message)
            next_date += timedelta(days=1)
        
        if not messages:
            return {"message": "All data up to the end date has already been generated or no data found."}
        
        return {"messages": messages}
    
    except Exception as e:
        # Logging the exception can help diagnose the problem
        return {"Error": "Error processing your request", "Exception": str(e)}
