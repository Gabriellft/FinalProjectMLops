const express = require('express');
const AWS = require('aws-sdk');
const cors = require('cors');

const app = express();
const port = 3001;

const s3 = new AWS.S3();
const bucketName = 'hotel-breakfast';

app.use(cors());

// Endpoint pour récupérer les prédictions
app.get('/predictions', async (req, res) => {
    try {
      const { Contents: files } = await s3.listObjectsV2({ Bucket: bucketName, Prefix: 'output/' }).promise();
      
      const predictions = await Promise.all(files.map(async (file) => {
        const data = await s3.getObject({ Bucket: bucketName, Key: file.Key }).promise();
        const dataBody = data.Body.toString('utf-8');
      
        if (dataBody) {
          try {
            return JSON.parse(dataBody);
          } catch (parseError) {
            console.error(`JSON parsing failed for ${file.Key}:`, parseError);
            return null;
          }
        } else {
          console.log(`Fichier vide ou invalide : ${file.Key}`);
          return null;
        }
      }));
      
      const validPredictions = predictions.filter(prediction => prediction !== null);
  
      res.json(validPredictions);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des prédictions');
    }
});

// Endpoint pour récupérer le fichier historical_data.json
app.get('/historical-data', async (req, res) => {
  const key = 'curred_data/historical/historical_data.json'; // Chemin vers le fichier historical_data.json dans votre bucket S3

  try {
      const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
      const dataBody = data.Body.toString('utf-8');
      
      if (dataBody) {
          try {
              // Assume dataBody is linéarized JSON
              const jsonData = dataBody.split('\n').filter(line => line).map(line => {
                  const obj = JSON.parse(line);
                  // Convertir le timestamp en format de date "YYYY-MM-DD"
                  obj.date = new Date(obj.date).toISOString().split('T')[0];
                  return obj;
              });
              res.json(jsonData);
          } catch (parseError) {
              console.error(`JSON parsing failed for ${key}:`, parseError);
              res.status(500).send('Erreur lors du parsing du JSON');
          }
      } else {
          console.log(`Fichier vide ou invalide : ${key}`);
          res.status(404).send('Fichier non trouvé ou vide');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération du fichier historical_data.json');
  }
});

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
