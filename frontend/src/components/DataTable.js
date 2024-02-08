import React from 'react';

const roundNumber = num => Math.ceil(num);

const DataTable = ({ title, data, includeHistorical = false }) => {
  return (
    <div className="data-table bg-white p-5 rounded-tremor-default shadow-tremor-card">
      <h2 className="text-tremor-title font-semibold text-tremor-content-strong mb-4">{title}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-tremor-default leading-normal">
          <thead className="text-left text-tremor-content-strong bg-tremor-brand-muted">
            <tr>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Baguettes</th>
              {includeHistorical && <th className="px-4 py-2">Historique (Baguettes)</th>}
              <th className="px-4 py-2">Café</th>
              {includeHistorical && <th className="px-4 py-2">Historique (Café)</th>}
              <th className="px-4 py-2">Croissants</th>
              {includeHistorical && <th className="px-4 py-2">Historique (Croissants)</th>}
              <th className="px-4 py-2">Fruits</th>
              {includeHistorical && <th className="px-4 py-2">Historique (Fruits)</th>}
              <th className="px-4 py-2">Jus d'Orange</th>
              {includeHistorical && <th className="px-4 py-2">Historique (Jus d'Orange)</th>}
              <th className="px-4 py-2">Pain au Chocolat</th>
              {includeHistorical && <th className="px-4 py-2">Historique (Pain au Chocolat)</th>}
            </tr>
          </thead>
          <tbody className="bg-tremor-background-muted divide-y divide-tremor-border">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-tremor-brand-faint">
                <td className="px-4 py-2">{item.date}</td>
                <td className="px-4 py-2">{roundNumber(item.baguettes)}</td>
                {includeHistorical && <td className="px-4 py-2">{item.historical ? roundNumber(item.historical.baguettes) : 'N/A'}</td>}
                <td className="px-4 py-2">{roundNumber(item.café)}</td>
                {includeHistorical && <td className="px-4 py-2">{item.historical ? roundNumber(item.historical.café) : 'N/A'}</td>}
                <td className="px-4 py-2">{roundNumber(item.croissants)}</td>
                {includeHistorical && <td className="px-4 py-2">{item.historical ? roundNumber(item.historical.croissants) : 'N/A'}</td>}
                <td className="px-4 py-2">{roundNumber(item.fruits)}</td>
                {includeHistorical && <td className="px-4 py-2">{item.historical ? roundNumber(item.historical.fruits) : 'N/A'}</td>}
                <td className="px-4 py-2">{roundNumber(item['jus d\'orange'])}</td>
                {includeHistorical && <td className="px-4 py-2">{item.historical ? roundNumber(item.historical['jus d\'orange']) : 'N/A'}</td>}
                <td className="px-4 py-2">{roundNumber(item['pain au chocolat'])}</td>
                {includeHistorical && <td className="px-4 py-2">{item.historical ? roundNumber(item.historical['pain au chocolat']) : 'N/A'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
