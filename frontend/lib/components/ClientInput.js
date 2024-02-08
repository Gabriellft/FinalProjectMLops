// components/ClientInput.js
import React from 'react';
const ClientInput = ({
  expectedClients,
  setExpectedClients
}) => {
  const handleSubmit = e => {
    e.preventDefault();
    alert(`Nombre de clients attendus: ${expectedClients}`);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "client-input"
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: handleSubmit
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: "expectedClients"
  }, "Nombre de clients attendus pour le petit-d\xE9jeuner :"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    id: "expectedClients",
    value: expectedClients,
    onChange: e => setExpectedClients(e.target.value)
  }), /*#__PURE__*/React.createElement("button", {
    type: "submit"
  }, "Envoyer")));
};
export default ClientInput;