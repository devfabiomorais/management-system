"use client";

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

export default function GraficoContasBancarias() {
  const options: Highcharts.Options = {
    chart: { type: "column" },
    title: { text: undefined },
    xAxis: { categories: ["Conta bancária", "Taxa"] },
    yAxis: { title: { text: "Saldo atual" } },
    series: [
      {
        name: "Saldo",
        type: "column",
        data: [
          { y: -130000, color: "#3b82f6" }, // azul
          { y: 890000, color: "#16a34a" },  // verde
        ],
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
