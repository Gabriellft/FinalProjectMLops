from fastapi import Body, Depends, Header, APIRouter
from datetime import datetime
import pandas as pd
import numpy as np
import pyarrow as pa
import pyarrow.parquet as pq
import boto3
from io import BytesIO
from pydantic import BaseModel, validator
from typing import List

router = APIRouter(prefix='/generate_date', tags=["Generate Next Days Data"])

# Configuration pour la simulation de données
items = ['croissants', 'pain au chocolat', 'baguettes', 'fruits', 'jus d\'orange', 'café']
bucket_name = 'hotel-breakfast'

# Initialisation du client S3
s3 = boto3.client('s3')

class DayInput(BaseModel):
    date: str  # Date sous forme de chaîne de caractères
    expected_guests: int  # Nombre d'invités attendus pour cette date

    # Validation pour s'assurer que la date est dans un format correct
    @validator('date')
    def date_format_validator(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format")

class DateInput(BaseModel):
    days: List[DayInput]  # Liste des objets DayInput

def generate_data(day_input: DayInput):
    date = datetime.strptime(day_input.date, '%Y-%m-%d')
    expected = day_input.expected_guests
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

@router.post("")
async def root(date_input: DateInput = Body(...)):
    messages = []
    for day_input in date_input.days:
        df_next_day = generate_data(day_input)
        message = save_to_s3(df_next_day, datetime.strptime(day_input.date, '%Y-%m-%d'))
        messages.append(message)
    
    if not messages:
        return {"message": "No data was generated."}
    
    return {"messages": messages}
