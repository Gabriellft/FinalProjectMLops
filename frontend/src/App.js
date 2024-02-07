import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PredictionsPage from './pages/PredictionsPage';
import ComparisonPage from './pages/ComparisonPage';
import HistoricalPage from './pages/HistoricalPage';
import Sidebar from './components/Sidebar';
import DataDisplayPage from './pages/DataDisplayPage'; // Page pour afficher les données

function App() {
  const [endDate, setEndDate] = useState(new Date());
  const [fetchedData, setFetchedData] = useState(null);
  const [fetching, setFetching] = useState(false); // État pour indiquer si les données sont en cours de récupération

  // Modifiez cette fonction pour appeler votre backend
  const fetchGenerateDateData = async (formattedEndDate) => {
    setFetching(true); // Commence le fetch
    const apiUrl = 'http://localhost:3001/api/v0/generate_date'; // URL de l'API backend
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ end_date: formattedEndDate }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFetchedData(data); // Stocke les données récupérées
      setFetching(false); // Termine le fetch
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setFetching(false); // Assurez-vous de gérer l'état de chargement même en cas d'erreur
    }
  };

  const handleFetchClick = () => {
    const formattedEndDate = endDate.toISOString().split('T')[0];
    fetchGenerateDateData(formattedEndDate);
  };

  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Router>
      <div className="App">
        <div className="header">
          <h1>Données et Comparaisons - {today}</h1>
          <div className="date-filters">
            <div>
              <label>Date de fin :</label>
              <DatePicker
                selected={endDate}
                onChange={date => setEndDate(date)}
                dateFormat="P"
              />
            </div>
            <button onClick={handleFetchClick} disabled={fetching}>
              {fetching ? 'Récupération...' : 'Récupérer les données'}
            </button>
          </div>
          {fetchedData && <div><strong>Résultat :</strong> <pre>{JSON.stringify(fetchedData, null, 2)}</pre></div>}
        </div>
        <div className="dashboard">
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<PredictionsPage />} />
              <Route path="/predictions" element={<PredictionsPage />} />
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/historical" element={<HistoricalPage />} />
              <Route path="/data-display" element={<DataDisplayPage data={fetchedData} />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
