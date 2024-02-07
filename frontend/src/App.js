import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css';
import PredictionsPage from './pages/PredictionsPage';
import ComparisonPage from './pages/ComparisonPage';
import HistoricalPage from './pages/HistoricalPage';
import Header from './components/Header';
import Sidebar from './components/Sidebar'; // Nouveau composant Sidebar
import TimeSeriesChart from './components/TimeSeriesChart'; // Composant TimeSeriesChart

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="dashboard">
          {/* Sidebar avec des liens vers les pages */}
          <Sidebar />
          {/* Contenu principal */}
          <div className="main-content">
            <Routes>
              <Route path="/predictions" element={<Outlet />}>
                <Route index element={<PredictionsPage />} />
                </Route>
              <Route path="/comparison" element={<ComparisonPage />} />
              <Route path="/historical" element={<HistoricalPage />} />
              <Route path="/" element={<PredictionsPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
