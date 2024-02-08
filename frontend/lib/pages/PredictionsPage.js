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
    axios.get('http://localhost:3001/predictions').then(response => {
      setPredictions(response.data.flat()); // Assuming data structure requires flattening
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch predictions:', err);
      setError('Failed to fetch predictions. Please try again later.');
      setLoading(false);
    });
  }, []);
  return /*#__PURE__*/React.createElement("div", null, loading ? /*#__PURE__*/React.createElement(LoadingError, {
    message: "Loading..."
  }) : error ? /*#__PURE__*/React.createElement(LoadingError, {
    message: error
  }) : /*#__PURE__*/React.createElement(DataTable, {
    title: "Pr\xE9dictions Seules",
    data: predictions
  }));
};
export default PredictionsPage;