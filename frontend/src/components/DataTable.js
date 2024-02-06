// components/DataTable.js
import React from 'react';

const roundNumber = num => Math.ceil(num);

const DataTable = ({ title, data, includeHistorical = false }) => {
  return (
    <div className="data-table">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Baguettes</th>
            {includeHistorical && <th>Historique (Baguettes)</th>}
            <th>Café</th>
            {includeHistorical && <th>Historique (Café)</th>}
            <th>Croissants</th>
            {includeHistorical && <th>Historique (Croissants)</th>}
            <th>Fruits</th>
            {includeHistorical && <th>Historique (Fruits)</th>}
            <th>Jus d'Orange</th>
            {includeHistorical && <th>Historique (Jus d'Orange)</th>}
            <th>Pain au Chocolat</th>
            {includeHistorical && <th>Historique (Pain au Chocolat)</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{roundNumber(item.baguettes)}</td>
              {includeHistorical && <td>{item.historical ? roundNumber(item.historical.baguettes) : 'N/A'}</td>}
              <td>{roundNumber(item.café)}</td>
              {includeHistorical && <td>{item.historical ? roundNumber(item.historical.café) : 'N/A'}</td>}
              <td>{roundNumber(item.croissants)}</td>
              {includeHistorical && <td>{item.historical ? roundNumber(item.historical.croissants) : 'N/A'}</td>}
              <td>{roundNumber(item.fruits)}</td>
              {includeHistorical && <td>{item.historical ? roundNumber(item.historical.fruits) : 'N/A'}</td>}
              <td>{roundNumber(item['jus d\'orange'])}</td>
              {includeHistorical && <td>{item.historical ? roundNumber(item.historical['jus d\'orange']) : 'N/A'}</td>}
              <td>{roundNumber(item['pain au chocolat'])}</td>
              {includeHistorical && <td>{item.historical ? roundNumber(item.historical['pain au chocolat']) : 'N/A'}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;