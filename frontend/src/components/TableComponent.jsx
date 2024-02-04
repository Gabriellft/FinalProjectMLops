import React from "react";
import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Title } from "@tremor/react";

const predictions = [
  {
    date: "2024-02-06",
    Baguettes: 57.8,
    Café: 56.82,
    Croissants: 56.52,
    Fruits: 57.74,
    Jus_dOrange: 53.51,
    Pain_au_Chocolat: 58.72,
  },
  {
    date: "2024-02-07",
    Baguettes: 56.97,
    Café: 59.02,
    Croissants: 55.72,
    Fruits: 57.72,
    Jus_dOrange: 53.03,
    Pain_au_Chocolat: 58.74,
  },
  {
    date: "2024-02-08",
    Baguettes: 50.48,
    Café: 59.16,
    Croissants: 62.41,
    Fruits: 55.73,
    Jus_dOrange: 58.69,
    Pain_au_Chocolat: 60.47,
  },
];

const TableComponent = () => {
  return (
    <Card className="mt-4">
      <Title>Prédictions</Title>
      <Table className="mt-5">
        <TableHead>
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
          {predictions.map((prediction) => (
            <TableRow key={prediction.date}>
              <TableCell>{prediction.date}</TableCell>
              <TableCell>{prediction.Baguettes}</TableCell>
              <TableCell>{prediction.Café}</TableCell>
              <TableCell>{prediction.Croissants}</TableCell>
              <TableCell>{prediction.Fruits}</TableCell>
              <TableCell>{prediction.Jus_dOrange}</TableCell>
              <TableCell>{prediction.Pain_au_Chocolat}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default TableComponent;
