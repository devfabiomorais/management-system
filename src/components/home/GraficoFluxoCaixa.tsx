"use client";

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function GraficoFluxoCaixa() {
  const options: Highcharts.Options = {
    chart: {
      type: "column",
    },
    title: { text: undefined },
    xAxis: {
      categories: ["dez 2014", "jan 2015", "fev 2015", "mar 2015", "abr 2015"],
    },
    yAxis: {
      title: { text: "Valor" },
    },
    series: [
      {
        name: "Receitas",
        type: "column",
        data: [200000, 250000, 220000, 280000, 240000],
        color: "#16a34a", // verde
      },
      {
        name: "Despesas",
        type: "column",
        data: [-150000, -180000, -160000, -200000, -170000],
        color: "#dc2626", // vermelho
      },
      {
        name: "Linha de tendência",
        type: "spline",
        data: [50000, 70000, 60000, 80000, 70000],
        marker: { enabled: false },
        color: "black",
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
