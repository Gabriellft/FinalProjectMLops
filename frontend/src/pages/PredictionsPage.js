// pages/PredictionsPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import LoadingError from '../components/LoadingError';

const PredictionsPage = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3001/predictions')
      .then(response => {
        setPredictions(response.data.flat()); // Assuming data structure requires flattening
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch predictions:', err);
        setError('Failed to fetch predictions. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ? <LoadingError message="Loading..." /> : error ? <LoadingError message={error} /> : <DataTable title="Prédictions Seules" data={predictions} />}
    </div>
  );
};

export default PredictionsPage;
