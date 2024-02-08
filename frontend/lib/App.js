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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          days: [{
            date: formattedEndDate,
            expected_guests: parseInt(expectedGuests, 10)
          }]
        })
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return /*#__PURE__*/React.createElement(Router, null, /*#__PURE__*/React.createElement("div", {
    className: "App"
  }, /*#__PURE__*/React.createElement("div", {
    className: "header"
  }, /*#__PURE__*/React.createElement("h1", null, "Donn\xE9es et Comparaisons - ", today), /*#__PURE__*/React.createElement("div", {
    className: "date-filters"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Date de fin :"), /*#__PURE__*/React.createElement(DatePicker, {
    selected: endDate,
    onChange: date => setEndDate(date),
    dateFormat: "P"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Nombre de petits-d\xE9jeuners :"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: expectedGuests,
    onChange: e => setExpectedGuests(e.target.value)
  })), /*#__PURE__*/React.createElement("button", {
    onClick: handleFetchClick,
    disabled: fetching
  }, fetching ? 'Récupération...' : 'Récupérer les données')), fetchedData && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "R\xE9sultat :"), " ", /*#__PURE__*/React.createElement("pre", null, JSON.stringify(fetchedData, null, 2)))), /*#__PURE__*/React.createElement("div", {
    className: "dashboard"
  }, /*#__PURE__*/React.createElement(Sidebar, null), /*#__PURE__*/React.createElement("div", {
    className: "main-content"
  }, /*#__PURE__*/React.createElement(Routes, null, /*#__PURE__*/React.createElement(Route, {
    path: "/",
    element: /*#__PURE__*/React.createElement(PredictionsPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/predictions",
    element: /*#__PURE__*/React.createElement(PredictionsPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/comparison",
    element: /*#__PURE__*/React.createElement(ComparisonPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/historical",
    element: /*#__PURE__*/React.createElement(HistoricalPage, null)
  }), /*#__PURE__*/React.createElement(Route, {
    path: "/data-display",
    element: /*#__PURE__*/React.createElement(DataDisplayPage, {
      data: fetchedData
    })
  }))))));
}
export default App;