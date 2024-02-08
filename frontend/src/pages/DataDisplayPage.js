import React from 'react';
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Title } from '@tremor/react';

// Styles CSS supplémentaires pour améliorer l'esthétique du tableau
const styles = {
  tableHeader: {
    backgroundColor: '#f0f0f0', // Couleur de fond des en-têtes pour un contraste doux
    color: '#333', // Couleur du texte pour assurer une bonne lisibilité
    fontWeight: 'bold', // Texte en gras pour les en-têtes
  },
  tableRow: {
    '&:nth-of-type(odd)': {
      backgroundColor: '#f9f9f9', // Bandes zébrées pour améliorer la lisibilité
    },
  },
  tableCell: {
    color: '#555', // Couleur du texte légèrement assombrie pour un contraste agréable
    padding: '8px 16px', // Espacement interne pour éviter la sensation de surcharge
  },
  cardStyle: {
    marginTop: '1rem',
    padding: '1rem',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Ombre portée légère pour un effet de profondeur
    borderRadius: '8px', // Bords arrondis pour une apparence douce et moderne
    backgroundColor: '#fff', // Fond blanc pour le contraste et la clarté
  },
  titleStyle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#222', // Couleur du titre pour une hiérarchie visuelle claire
    paddingBottom: '0.5rem', // Espacement sous le titre pour séparer du contenu
  },
};

function DataDisplayPage({ data }) {
  return (
    <Card className="mt-4 p-4 shadow-lg rounded-lg bg-white" style={styles.cardStyle}>
      <Title className="text-2xl font-bold text-gray-800" style={styles.titleStyle}>Données récupérées</Title>
      <Table className="mt-5 w-full">
        <TableHead style={styles.tableHeader}>
          <TableRow>
            <TableHeaderCell>Date</TableHeaderCell>
            <TableHeaderCell>Baguettes</TableHeaderCell>
            <TableHeaderCell>Café</TableHeaderCell>
            <TableHeaderCell>Croissants</TableHeaderCell>
            <TableHeaderCell>Fruits</TableHeaderCell>
            <TableHeaderCell>Jus d'Orange</TableHeaderCell>
            <TableHeaderCell>Pain au Chocolat</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index} style={styles.tableRow}>
              <TableCell style={styles.tableCell}>{item.date}</TableCell>
              <TableCell style={styles.tableCell}>{item.Baguettes}</TableCell>
              <TableCell style={styles.tableCell}>{item.Café}</TableCell>
              <TableCell style={styles.tableCell}>{item.Croissants}</TableCell>
              <TableCell style={styles.tableCell}>{item.Fruits}</TableCell>
              <TableCell style={styles.tableCell}>{item.Jus_dOrange}</TableCell>
              <TableCell style={styles.tableCell}>{item.Pain_au_Chocolat}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default DataDisplayPage;
