import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
const Header = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  fetchGenerateDateData
}) => {
  useEffect(() => {
    if (endDate) {
      // Format endDate to 'YYYY-MM-DD' before sending
      const formattedEndDate = endDate.toISOString().split('T')[0];
      fetchGenerateDateData(formattedEndDate);
    }
  }, [endDate, fetchGenerateDateData]);

  // Utiliser Date.now() pour obtenir le jour actuel et l'afficher
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "header"
  }, /*#__PURE__*/React.createElement("h1", null, "Donn\xE9es et Comparaisons - ", today), /*#__PURE__*/React.createElement("div", {
    className: "date-filters"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Date de d\xE9but :"), /*#__PURE__*/React.createElement(DatePicker, {
    selected: startDate,
    onChange: date => setStartDate(date),
    dateFormat: "P"
  })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("label", null, "Date de fin :"), /*#__PURE__*/React.createElement(DatePicker, {
    selected: endDate,
    onChange: date => setEndDate(date),
    dateFormat: "P"
  }))));
};
export default Header;