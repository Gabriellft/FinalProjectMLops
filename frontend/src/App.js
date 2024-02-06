import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [historical, setHistorical] = useState([]);
  const [combined, setCombined] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    // Combine predictions with historical data where dates match
    const combinedData = predictions.map(prediction => {
      const match = historical.find(h => h.date === prediction.date);
      return { ...prediction, historical: match };
    }).filter(item => item.historical); // Keep only matched items

    setCombined(combinedData);
  }, [predictions, historical]);

  // Helper function for rounding numbers
  const roundNumber = num => Math.ceil(num);

  // Function to render a table given data
  const renderTable = (data, includeHistorical = false) => (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Baguettes</th>
          {includeHistorical && <th>Historique (Baguettes)</th>}
          <th>Café</th>
          {includeHistorical && <th>Historique (Café)</th>}
          <th>Croissants</th>
          {includeHistorical && <th>Historique (croissants)</th>}
          <th>Fruits</th>
          {includeHistorical && <th>Historique (Fruits)</th>}
          <th>Jus d'Orange</th>
          {includeHistorical && <th>Historique (Jus d'Orange)</th>}
          <th>Pain au Chocolat</th>
          {includeHistorical && <th>Historique (Pain au Chocolat)</th>}
          
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.date}</td>
            <td>{roundNumber(item.baguettes)}</td>
            {includeHistorical && <td>{item.historical ? roundNumber(item.historical.baguettes) : 'N/A'}</td>}
            <td>{roundNumber(item.café)}</td>
            {includeHistorical && <td>{item.historical ? roundNumber(item.historical.café) : 'N/A'}</td>}
            <td>{roundNumber(item.croissants)}</td>
            {includeHistorical && <td>{item.historical ? roundNumber(item.historical.croissants) : 'N/A'}</td>}
            <td>{roundNumber(item.fruits)}</td>
            {includeHistorical && <td>{item.historical ? roundNumber(item.historical.baguettes) : 'N/A'}</td>}
            <td>{roundNumber(item['jus d\'orange'])}</td>
            {includeHistorical && <td>{item.historical ? roundNumber(item.historical.baguettes) : 'N/A'}</td>}
            <td>{roundNumber(item['pain au chocolat'])}</td>
            {includeHistorical && <td>{item.historical ? roundNumber(item.historical.baguettes) : 'N/A'}</td>}
            
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="App">
      <h1>Données et Comparaisons</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <div>
            <h2>Prédictions Seules</h2>
            {renderTable(predictions)}
          </div>
          <div>
            <h2>Comparaison Prédictions et Historique</h2>
            {renderTable(combined, true)}
          </div>
          <div>
            <h2>Historique Seul</h2>
            {renderTable(historical)}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
