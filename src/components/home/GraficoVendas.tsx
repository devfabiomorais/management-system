"use client";

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function GraficoVendas() {
  const options: Highcharts.Options = {
    chart: { type: "column" },
    title: { text: undefined },
    xAxis: {
      categories: ["dez 2014", "jan 2015", "fev 2015", "mar 2015", "mai 2015"],
    },
    yAxis: { title: { text: "Vendas" } },
    series: [
      {
        name: "Vendas",
        type: "column",
        data: [200000, 300000, 250000, 320000, 150000],
        color: "#2563eb", // azul
      },
      {
        name: "Meta",
        type: "spline",
        data: [250000, 250000, 250000, 250000, 250000],
        color: "black",
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
