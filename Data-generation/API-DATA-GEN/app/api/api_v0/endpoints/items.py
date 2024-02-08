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
import logging
import pandas as pd
import numpy as np
import boto3
from io import StringIO
import json
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from datetime import datetime, timedelta
import joblib
import re
import traceback





router = APIRouter(prefix='/generate_date', tags=["Generate Next Days Data"])

# Configuration pour la simulation de données
items = ['croissants', 'pain au chocolat', 'baguettes', 'fruits', 'jus d\'orange', 'café']
bucket_name = 'hotel-breakfast'
# Configuration de base pour le logging
log_buffer = BytesIO()
logging.basicConfig(level=logging.INFO, handlers=[logging.StreamHandler(log_buffer)])

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


# Fonction pour charger les données depuis S3
def load_data_from_s3(bucket, key):
    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read()
    df = pq.read_table(BytesIO(content)).to_pandas()
    return df




def expected_guests(date):
    weekday = date.weekday()
    if weekday in [4, 5]:  # Vendredi et samedi
        return np.random.randint(140, 150)  # Plus de visiteurs le weekend
    elif weekday == 6:  # Dimanche
        return np.random.randint(80, 90)  # Dimanche un peu moins
    else:
        return np.random.randint(30, 40)

def generate_data(day_input: DayInput):
    date = datetime.strptime(day_input.date, '%Y-%m-%d')
    expected = day_input.expected_guests
    base_quantity = np.random.randint(5, 15, size=len(items))
    variation = 2 + (expected / 50)  # Augmentation de la variation
    data = {
        'date': [date] * len(items),
        'item': items,
        'quantity': (base_quantity * variation).astype(int),
        'expected': [expected] * len(items)
    }
    logging.info(f'Data generated for {date}')
    return pd.DataFrame(data)


def save_to_s3(df, current_date):
    buffer = BytesIO()
    table = pa.Table.from_pandas(df)
    pq.write_table(table, buffer)
    buffer.seek(0)
    file_name_in_s3 = f'data/{current_date.strftime("%Y-%m-%d")}.parquet'
    
    s3.put_object(Bucket=bucket_name, Key=file_name_in_s3, Body=buffer.getvalue())
    logging.info(f'File {file_name_in_s3} uploaded to S3.')
    return f'File {file_name_in_s3} uploaded to S3.'

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

# Fonction pour convertir le DataFrame mis à jour en JSON et le sauvegarder dans S3
def save_df_as_json_to_s3(df, bucket, key):
    json_buffer = BytesIO()
    # Convertir le DataFrame en JSON
    df.to_json(json_buffer, orient='records', lines=True)
    json_buffer.seek(0)
    # Stocker le JSON dans S3
    s3.put_object(Bucket=bucket, Key=key, Body=json_buffer.getvalue())
    print(f'JSON file saved to S3: {key}')

def find_latest_model(bucket, prefix):
    # Liste tous les objets dans le bucket avec le préfixe donné
    response = s3.list_objects_v2(Bucket=bucket, Prefix=prefix)
    # Filtrer les objets pour garder ceux qui correspondent au modèle
    model_files = [obj['Key'] for obj in response.get('Contents', []) if re.match(rf"{prefix}\d{{4}}-\d{{2}}-\d{{2}}_\d{{2}}-\d{{2}}-\d{{2}}.joblib", obj['Key'])]
    
    # Si aucun fichier n'est trouvé, retourner None
    if not model_files:
        return None
    
    # Trier les fichiers de modèle par date en extrayant le timestamp du nom
    latest_model_file = sorted(model_files, key=lambda x: datetime.strptime(x[len(prefix):].split('.joblib')[0], "%Y-%m-%d_%H-%M-%S"), reverse=True)[0]
    
    return latest_model_file

def load_model_params(bucket, model_key):
    # Récupération de l'objet depuis S3
    response = s3.get_object(Bucket=bucket, Key=model_key)
    
    # Lecture de l'objet joblib directement depuis le buffer
    model = joblib.load(BytesIO(response['Body'].read()))
    
    # Récupération des meilleurs paramètres à partir du modèle chargé
    best_params = model.get_params()
    
    return best_params

@router.post("")
async def root(date_input: DateInput = Body(...)):
    try: 
        # Generation data
        
        messages = []
        for day_input in date_input.days:
            df_next_day = generate_data(day_input)
            message = save_to_s3(df_next_day, datetime.strptime(day_input.date, '%Y-%m-%d'))
            messages.append(message)
        if not messages:
            return {"message": "No data was generated."}
        
        
        # Preprocess files => parquet df
        preprocessed_key = 'preprocessed_data/preprocessed_latest.parquet'
        if not check_preprocessed_file_exists(bucket_name, preprocessed_key):
            
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

        # transform to json for backend 
        

        historical_key = 'curred_data/historical/historical_data.json'  # Clé pour le fichier JSON historique

        df_preprocessed = get_preprocessed_df(bucket_name, preprocessed_key)

        if df_preprocessed is not None:
            # Sauvegarder le DataFrame prétraité en JSON
            save_df_as_json_to_s3(df_preprocessed, bucket_name, historical_key)
        else:
            print("No preprocessed data to convert to JSON or no data files found in the specified S3 bucket.")
            
        # Take model and pred next days
            
        data_key = 'preprocessed_data/preprocessed_latest.parquet'
        model_params_key = 'model/best_params.joblib'
        # Charger les données et les meilleurs paramètres du modèle
        
        df = load_data_from_s3(bucket_name, data_key)
        prefix = "model/best_model_"
        latest_model_key = find_latest_model(bucket_name, prefix)
        if latest_model_key:
            best_params = load_model_params(bucket_name, latest_model_key)
            print(f"Le dernier modèle ({latest_model_key}) a été chargé avec succès.")
            
            
        else:
            print("Aucun modèle récent trouvé.")

        # Préparer les données pour l'entraînement
        X = df[['expected', 'month', 'day', 'weekday']]
        y = df[['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat']]

        # Entraîner le modèle
        rf = RandomForestRegressor(**best_params)
        rf.fit(X, y)
        
        # Générer les données pour les prédictions pour les 3 jours suivants
        date = datetime.strptime(day_input.date, '%Y-%m-%d')
        
        dates = [date + timedelta(days=i) for i in range(0, 3)]
        expected_guests_by_date = {day_input.date: day_input.expected_guests for day_input in date_input.days}

        X_pred = pd.DataFrame({
            'date': dates,
            'expected': [
                expected_guests_by_date.get(date.strftime('%Y-%m-%d'), expected_guests(date))
                for date in dates
            ],
            'month': [date.month for date in dates],
            'day': [date.day for date in dates],
            'weekday': [date.weekday() for date in dates]
        })
        print (X_pred)

        # Faire des prédictions
        y_pred = rf.predict(X_pred[['expected', 'month', 'day', 'weekday']])
        print(y_pred)
        print(X_pred['expected'])
        # Ajuster les prédictions si outlier
        adjusted_y_pred = []

        for i, expected in enumerate(X_pred['expected']):
            # Initialise un tableau pour les prédictions ajustées de cette itération
            adjusted_preds = np.zeros_like(y_pred[i])
            
            # Définir une valeur cible basée sur 'expected'
            target_value = expected  # La cible est la valeur 'expected' elle-même
            print("target",target_value)
            # Calculer les bornes
            lower_bound = target_value * 0.9
            upper_bound = target_value * 1.1
            
            # Itérer sur chaque prédiction dans y_pred[i]
            for j, pred in enumerate(y_pred[i]):
                # Vérifier si chaque prédiction individuelle est dans l'intervalle acceptable
                if lower_bound <= pred <= upper_bound:
                    adjusted_preds[j] = pred  # La prédiction reste inchangée
                else:
                    # Ajuster la prédiction pour qu'elle soit plus proche de la cible tout en restant dans les bornes
                    fluctuation_factor = np.random.uniform(round(lower_bound), round(upper_bound))
        
                    # Appliquer la fluctuation à la prédiction
                    fluctuated_pred = fluctuation_factor
                    
                    adjusted_preds[j] = fluctuated_pred
            
            adjusted_y_pred.append(adjusted_preds)
        # Sauvegarder les prédictions ajustées dans S3
        for i, date in enumerate(dates):
            predictions_df = pd.DataFrame([{
                'date': date.strftime("%Y-%m-%d"),
                **{col: adjusted_y_pred[i][j] for j, col in enumerate(['baguettes', 'café', 'croissants', 'fruits', 'jus d\'orange', 'pain au chocolat'])}
            }])
            json_str = predictions_df.to_json(orient='records')
            output_key = f'output/predictions_{date.strftime("%Y-%m-%d")}.json'
            s3.put_object(Bucket=bucket_name, Key=output_key, Body=json_str)
            print(f'Predictions for {date.strftime("%Y-%m-%d")} saved to S3: {bucket_name}/{output_key}')
        
        
        formatted_dates = ', '.join(date.strftime('%Y-%m-%d') for date in dates)

        # Format the expected guests message
        expected_guests_message = ', '.join(f'{date}: {guests} guests' for date, guests in expected_guests_by_date.items())

        # Construct the final message
        message = f"Data processed and predictions made for {formatted_dates} with expected guests: {expected_guests_message}"

        return {"message": message}
        
    
    except Exception as e:
        error_info = traceback.format_exc()
        logging.error("An error occurred: %s", error_info)
        return {"Error": f"An unexpected error occurred: {str(e)}. Check logs for more details."}