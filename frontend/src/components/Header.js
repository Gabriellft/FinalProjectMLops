import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Header = ({ startDate, endDate, setStartDate, setEndDate, fetchGenerateDateData }) => {
  useEffect(() => {
    if (endDate) {
      // Format endDate to 'YYYY-MM-DD' before sending
      const formattedEndDate = endDate.toISOString().split('T')[0];
      fetchGenerateDateData(formattedEndDate);
    }
  }, [endDate, fetchGenerateDateData]);

  // Utiliser Date.now() pour obtenir le jour actuel et l'afficher
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="header">
      <h1>Données et Comparaisons - {today}</h1>
      <div className="date-filters">
        <div>
          <label>Date de début :</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            dateFormat="P"
          />
        </div>
        <div>
          <label>Date de fin :</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            dateFormat="P"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
