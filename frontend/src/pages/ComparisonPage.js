// pages/ComparisonPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import LoadingError from '../components/LoadingError';

const ComparisonPage = () => {
  const [combinedData, setCombinedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);

    const fetchPredictions = axios.get('http://localhost:3001/predictions');
    const fetchHistorical = axios.get('http://localhost:3001/historical-data');

    Promise.all([fetchPredictions, fetchHistorical])
      .then(results => {
        const [predictionsResponse, historicalResponse] = results;
        const predictions = predictionsResponse.data.flat();
        const historical = historicalResponse.data;
        const combined = predictions.map(prediction => {
          const match = historical.find(h => h.date === prediction.date);
          return { ...prediction, historical: match };
        }).filter(item => item.historical);
        setCombinedData(combined);
      })
      .catch(err => {
        console.error('Failed to fetch data:', err);
        setError('Failed to fetch data. Please try again later.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {loading ? (
        <LoadingError message="Loading..." />
      ) : error ? (
        <LoadingError message={error} />
      ) : (
        <DataTable title="Comparaison Prédictions et Historique" data={combinedData} includeHistorical={true} />
      )}
    </div>
  );
};

export default ComparisonPage;
