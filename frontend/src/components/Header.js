// components/Header.js
import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Header = ({ startDate, endDate, setStartDate, setEndDate }) => {
  return (
    <div className="header">
      <h1>Données et Comparaisons</h1>
      <div className="date-filters">
        <div>
          <label>Date de début :</label>
          <DatePicker selected={startDate} onChange={(date) => setStartDate(date)} />
        </div>
        <div>
          <label>Date de fin :</label>
          <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
        </div>
      </div>
    </div>
  );
};

export default Header;
