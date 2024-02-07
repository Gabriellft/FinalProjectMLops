// Dans le fichier DataDisplayPage.js
import React from 'react';

function DataDisplayPage({ data }) {
  return (
    <div>
      <h2>Données récupérées</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DataDisplayPage;
