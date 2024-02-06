import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import ClientInput from './components/ClientInput';
import DataTable from './components/DataTable';
import LoadingError from './components/LoadingError';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [historical, setHistorical] = useState([]);
  const [combined, setCombined] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [expectedClients, setExpectedClients] = useState('');

  useEffect(() => {
    setLoading(true);
    const fetchPredictions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/predictions');
        const flattenedPredictions = response.data.flat(); // Assuming data structure requires flattening
        setPredictions(flattenedPredictions);
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
        setError('Failed to fetch predictions. Please try again later.');
      }
    };

    const fetchHistorical = async () => {
      try {
        const response = await axios.get('http://localhost:3001/historical-data');
        setHistorical(response.data); // Assuming this data does not need flattening
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
        setError('Failed to fetch historical data. Please try again later.');
      }
    };

    Promise.all([fetchPredictions(), fetchHistorical()]).then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const combinedData = predictions.map(prediction => {
      const match = historical.find(h => h.date === prediction.date);
      return { ...prediction, historical: match };
    }).filter(item => item.historical); // Keep only matched items

    setCombined(combinedData);
  }, [predictions, historical]);

  const roundNumber = num => Math.ceil(num);

  return (
    <div className="App">
      <Header startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
      <ClientInput expectedClients={expectedClients} setExpectedClients={setExpectedClients} />
      {loading ? <LoadingError message="Loading..." /> : error ? <LoadingError message={error} /> : (
        <>
          <DataTable title="Prédictions Seules" data={predictions} />
          <DataTable title="Comparaison Prédictions et Historique" data={combined} includeHistorical={true} />
          <DataTable title="Historique Seul" data={historical} />
        </>
      )}
    </div>
  );
}

export default App;
