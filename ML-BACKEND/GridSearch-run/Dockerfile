# Utiliser une image de base officielle Python
FROM python:3.9-slim

# Mettre à jour et installer les dépendances nécessaires
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de requirements.txt et le script Python dans l'image
COPY requirements.txt .
COPY . .

# Installer les packages Python nécessaires depuis requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Exposer le port utilisé par MLflow UI
EXPOSE 5000

# Commande pour lancer le script Python et démarrer MLflow UI
CMD ["sh", "-c", "python script.py & mlflow ui --host 0.0.0.0"]
