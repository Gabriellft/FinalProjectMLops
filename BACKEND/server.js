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
      
      // Filter out null values as before
      const validPredictions = predictions.filter(prediction => prediction !== null);
  
      res.json(validPredictions);
    } catch (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la récupération des prédictions');
    }
  });
  

app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
