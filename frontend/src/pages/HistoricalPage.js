// pages/HistoricalPage.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DataTable from '../components/DataTable';
import LoadingError from '../components/LoadingError';

const HistoricalPage = () => {
  const [historical, setHistorical] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('http://localhost:3001/historical-data')
      .then(response => {
        setHistorical(response.data); // Assuming this data does not need flattening
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch historical data:', err);
        setError('Failed to fetch historical data. Please try again later.');
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {loading ? (
        <LoadingError message="Loading..." />
      ) : error ? (
        <LoadingError message={error} />
      ) : (
        <DataTable title="Historique Seul" data={historical} />
      )}
    </div>
  );
};

export default HistoricalPage;
