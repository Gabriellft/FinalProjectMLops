// components/TimeSeriesChart.js
import React from "react";
import ReactApexChart from "react-apexcharts";

const TimeSeriesChart = ({ data }) => {
  const series = [{
    name: "Baguettes",
    data: data.map(item => ({ x: new Date(item.date), y: item.baguettes })),
  }, {
    name: "Café",
    data: data.map(item => ({ x: new Date(item.date), y: item.café })),
  }];

  const options = {
    chart: {
      type: 'area',
      stacked: false,
      height: 350,
      zoom: {
        type: 'x',
        enabled: true,
        autoScaleYaxis: true
      },
      toolbar: {
        autoSelected: 'zoom'
      }
    },
    dataLabels: {
      enabled: false
    },
    markers: {
      size: 0,
    },
    title: {
      text: 'Consommation Produits',
      align: 'left'
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.5,
        opacityTo: 0,
        stops: [0, 90, 100]
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return (val).toFixed(0);
        },
      },
      title: {
        text: 'Quantité'
      },
    },
    xaxis: {
      type: 'datetime',
    },
    tooltip: {
      shared: false,
      y: {
        formatter: function (val) {
          return (val).toFixed(0) + " unités"
        }
      }
    }
  };

  return (
    <div id="chart">
      <ReactApexChart options={options} series={series} type="area" height={350} />
    </div>
  );
};

export default TimeSeriesChart;
