import React from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Title } from '@tremor/react';
function DataDisplayPage({
  data
}) {
  return /*#__PURE__*/React.createElement(Card, {
    className: "mt-4 p-4 shadow-lg rounded-lg"
  }, /*#__PURE__*/React.createElement(Title, {
    className: "text-2xl font-bold"
  }, "Donn\xE9es r\xE9cup\xE9r\xE9es"), /*#__PURE__*/React.createElement(Table, {
    className: "mt-5"
  }, /*#__PURE__*/React.createElement(TableHead, {
    className: "bg-gray-100"
  }, /*#__PURE__*/React.createElement(TableRow, null, /*#__PURE__*/React.createElement(TableHeaderCell, null, "Date"), /*#__PURE__*/React.createElement(TableHeaderCell, null, "Baguettes"), /*#__PURE__*/React.createElement(TableHeaderCell, null, "Caf\xE9"), /*#__PURE__*/React.createElement(TableHeaderCell, null, "Croissants"), /*#__PURE__*/React.createElement(TableHeaderCell, null, "Fruits"), /*#__PURE__*/React.createElement(TableHeaderCell, null, "Jus d'Orange"), /*#__PURE__*/React.createElement(TableHeaderCell, null, "Pain au Chocolat"))), /*#__PURE__*/React.createElement(TableBody, null, data.map((item, index) => /*#__PURE__*/React.createElement(TableRow, {
    key: index
  }, /*#__PURE__*/React.createElement(TableCell, null, item.date), /*#__PURE__*/React.createElement(TableCell, null, item.Baguettes), /*#__PURE__*/React.createElement(TableCell, null, item.Café), /*#__PURE__*/React.createElement(TableCell, null, item.Croissants), /*#__PURE__*/React.createElement(TableCell, null, item.Fruits), /*#__PURE__*/React.createElement(TableCell, null, item.Jus_dOrange), /*#__PURE__*/React.createElement(TableCell, null, item.Pain_au_Chocolat))))));
}
export default DataDisplayPage;