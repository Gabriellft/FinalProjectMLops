// components/DataTable.js
import React from 'react';
const roundNumber = num => Math.ceil(num);
const DataTable = ({
  title,
  data,
  includeHistorical = false
}) => {
  return /*#__PURE__*/React.createElement("div", {
    className: "data-table"
  }, /*#__PURE__*/React.createElement("h2", null, title), /*#__PURE__*/React.createElement("table", null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Date"), /*#__PURE__*/React.createElement("th", null, "Baguettes"), includeHistorical && /*#__PURE__*/React.createElement("th", null, "Historique (Baguettes)"), /*#__PURE__*/React.createElement("th", null, "Caf\xE9"), includeHistorical && /*#__PURE__*/React.createElement("th", null, "Historique (Caf\xE9)"), /*#__PURE__*/React.createElement("th", null, "Croissants"), includeHistorical && /*#__PURE__*/React.createElement("th", null, "Historique (Croissants)"), /*#__PURE__*/React.createElement("th", null, "Fruits"), includeHistorical && /*#__PURE__*/React.createElement("th", null, "Historique (Fruits)"), /*#__PURE__*/React.createElement("th", null, "Jus d'Orange"), includeHistorical && /*#__PURE__*/React.createElement("th", null, "Historique (Jus d'Orange)"), /*#__PURE__*/React.createElement("th", null, "Pain au Chocolat"), includeHistorical && /*#__PURE__*/React.createElement("th", null, "Historique (Pain au Chocolat)"))), /*#__PURE__*/React.createElement("tbody", null, data.map((item, index) => /*#__PURE__*/React.createElement("tr", {
    key: index
  }, /*#__PURE__*/React.createElement("td", null, item.date), /*#__PURE__*/React.createElement("td", null, roundNumber(item.baguettes)), includeHistorical && /*#__PURE__*/React.createElement("td", null, item.historical ? roundNumber(item.historical.baguettes) : 'N/A'), /*#__PURE__*/React.createElement("td", null, roundNumber(item.café)), includeHistorical && /*#__PURE__*/React.createElement("td", null, item.historical ? roundNumber(item.historical.café) : 'N/A'), /*#__PURE__*/React.createElement("td", null, roundNumber(item.croissants)), includeHistorical && /*#__PURE__*/React.createElement("td", null, item.historical ? roundNumber(item.historical.croissants) : 'N/A'), /*#__PURE__*/React.createElement("td", null, roundNumber(item.fruits)), includeHistorical && /*#__PURE__*/React.createElement("td", null, item.historical ? roundNumber(item.historical.fruits) : 'N/A'), /*#__PURE__*/React.createElement("td", null, roundNumber(item['jus d\'orange'])), includeHistorical && /*#__PURE__*/React.createElement("td", null, item.historical ? roundNumber(item.historical['jus d\'orange']) : 'N/A'), /*#__PURE__*/React.createElement("td", null, roundNumber(item['pain au chocolat'])), includeHistorical && /*#__PURE__*/React.createElement("td", null, item.historical ? roundNumber(item.historical['pain au chocolat']) : 'N/A'))))));
};
export default DataTable;