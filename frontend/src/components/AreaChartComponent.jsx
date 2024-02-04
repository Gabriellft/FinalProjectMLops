import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Card, Title, AreaChart } from "@tremor/react";

const chartdata = [
  {
    date: "2024-02-06",
    SemiAnalysis: 2890,
    "The Pragmatic Engineer": 2338,
  },
  {
    date: "2024-03-06",
    SemiAnalysis: 2756,
    "The Pragmatic Engineer": 2103,
  },
  {
    date: "2024-04-06",
    SemiAnalysis: 3322,
    "The Pragmatic Engineer": 2194,
  },
  {
    date: "2024-05-06",
    SemiAnalysis: 3470,
    "The Pragmatic Engineer": 2108,
  },
  {
    date: "2024-06-06",
    SemiAnalysis: 3475,
    "The Pragmatic Engineer": 1812,
  },
  {
    date: "2024-07-06",
    SemiAnalysis: 3129,
    "The Pragmatic Engineer": 1726,
  },
];

const dataFormatter = (number) => {
    return "$ " + Intl.NumberFormat("us").format(number).toString();
  };
  
  const AreaChartComponent = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
  
    // Filtrez les données en fonction de la sélection de l'utilisateur.
    const filteredChartData = chartdata.filter(item => {
      const itemDate = new Date(item.date);
      return (!startDate || itemDate >= startDate) && (!endDate || itemDate <= endDate);
    });
  
    return (
      <Card className="mt-4">
        <Title>Newsletter revenue over time (USD)</Title>
        <div className="flex justify-start items-center p-4 gap-x-4">
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            isClearable
            placeholderText="Start date"
            className="mr-2"
          />
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            isClearable
            placeholderText="End date"
          />
        </div>
        <AreaChart
          className="h-72 mt-4"
          data={filteredChartData} // Utilisez les données filtrées pour le graphique.
          index="date"
          categories={["SemiAnalysis", "The Pragmatic Engineer"]}
          colors={["indigo", "cyan"]}
          valueFormatter={dataFormatter}
        />
      </Card>
    );
  };
  
  export default AreaChartComponent;
