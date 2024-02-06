// components/ClientInput.js
import React from 'react';

const ClientInput = ({ expectedClients, setExpectedClients }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Nombre de clients attendus: ${expectedClients}`);
  };

  return (
    <div className="client-input">
      <form onSubmit={handleSubmit}>
        <label htmlFor="expectedClients">Nombre de clients attendus pour le petit-déjeuner :</label>
        <input
          type="number"
          id="expectedClients"
          value={expectedClients}
          onChange={(e) => setExpectedClients(e.target.value)}
        />
        <button type="submit">Envoyer</button>
      </form>
    </div>
  );
};

export default ClientInput;
