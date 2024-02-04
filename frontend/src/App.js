import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:3001/predictions');
        const flattenedPredictions = response.data.flat(); // Flatten the received array of arrays
        setPredictions(flattenedPredictions);
        setError(''); // Clear any previous error
      } catch (err) {
        console.error('Failed to fetch predictions:', err);
        setError('Failed to fetch predictions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchPredictions(); 
  }, []);
  // Helper function for rounding numbers
  const roundNumber = (num) => Math.round(num * 100) / 100;

  return (
    <div className="App">
      <h1>Prédictions</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Baguettes</th>
              <th>Café</th>
              <th>Croissants</th>
              <th>Fruits</th>
              <th>Jus d'Orange</th>
              <th>Pain au Chocolat</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction, index) => (
              <tr key={index}>
                <td>{prediction.date}</td>
                <td>{roundNumber(prediction.baguettes)}</td>
                <td>{roundNumber(prediction.café)}</td>
                <td>{roundNumber(prediction.croissants)}</td>
                <td>{roundNumber(prediction.fruits)}</td>
                <td>{roundNumber(prediction['jus d\'orange'])}</td>
                <td>{roundNumber(prediction['pain au chocolat'])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;