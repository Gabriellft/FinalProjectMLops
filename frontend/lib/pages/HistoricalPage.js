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
    axios.get('http://localhost:3001/historical-data').then(response => {
      setHistorical(response.data); // Assuming this data does not need flattening
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch historical data:', err);
      setError('Failed to fetch historical data. Please try again later.');
      setLoading(false);
    });
  }, []);
  return /*#__PURE__*/React.createElement("div", null, loading ? /*#__PURE__*/React.createElement(LoadingError, {
    message: "Loading..."
  }) : error ? /*#__PURE__*/React.createElement(LoadingError, {
    message: error
  }) : /*#__PURE__*/React.createElement(DataTable, {
    title: "Historique Seul",
    data: historical
  }));
};
export default HistoricalPage;