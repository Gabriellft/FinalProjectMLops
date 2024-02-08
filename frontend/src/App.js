import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PredictionsPage from './pages/PredictionsPage';
import ComparisonPage from './pages/ComparisonPage';
import HistoricalPage from './pages/HistoricalPage';
import Sidebar from './components/Sidebar';
import DataDisplayPage from './pages/DataDisplayPage';

function App() {
  const [endDate, setEndDate] = useState(new Date());
  const [fetchedData, setFetchedData] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [expectedGuests, setExpectedGuests] = useState(30);

  // Fonction pour appeler le backend et récupérer les données
  const fetchGenerateDateData = async (formattedEndDate, expectedGuests) => {
    setFetching(true);
    const apiUrl = 'http://localhost:3001/api/v0/generate_date';
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          days: [
            {
              date: formattedEndDate,
              expected_guests: parseInt(expectedGuests, 10),
            }
          ]
        }),
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFetchedData(data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleFetchClick = () => {
    const formattedEndDate = endDate.toISOString().split('T')[0];
    fetchGenerateDateData(formattedEndDate, expectedGuests);
  };

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <Router>
      <div className="App bg-gray-100 min-h-screen flex flex-col">
        <header className="bg-tremor-brand bg-opacity-90 text-white text-center p-5 shadow-lg">
          <h1 className="text-3xl font-bold">Dashboard - {today}</h1>
        </header>

        <div className="flex flex-grow">
          <Sidebar />
          <main className="flex-grow flex flex-col">
            <div className="p-5">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <DatePicker 
                  selected={endDate} 
                  onChange={date => setEndDate(date)} 
                  dateFormat="P" 
                  className="form-input rounded-tremor-default" // Utilisation de classes de formulaire Tailwind personnalisées
                />
                <input 
                  type="number" 
                  value={expectedGuests} 
                  onChange={(e) => setExpectedGuests(e.target.value)} 
                  className="form-input rounded-tremor-default" // Utilisation de classes de formulaire Tailwind personnalisées
                />
                <button 
                  onClick={handleFetchClick} 
                  disabled={fetching} 
                  className="btn btn-primary" // Utilisation de classes de bouton Tailwind personnalisées
                >
                  {fetching ? 'Récupération...' : 'Récupérer les données'}
                </button>
              </div>
              {fetchedData && <div className="text-gray-800"><strong>Résultat :</strong> <pre className="p-4 bg-white rounded shadow">{JSON.stringify(fetchedData, null, 2)}</pre></div>}
            </div>

            <div className="flex-grow p-5 bg-white shadow-tremor-card rounded-tremor-default">
              <Routes>
                <Route path="/" element={<PredictionsPage />} />
                <Route path="/predictions" element={<PredictionsPage />} />
                <Route path="/comparison" element={<ComparisonPage />} />
                <Route path="/historical" element={<HistoricalPage />} />
                <Route path="/data-display" element={<DataDisplayPage data={fetchedData} />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;