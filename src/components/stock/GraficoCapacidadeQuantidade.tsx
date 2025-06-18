"use client";

import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface Coluna {
  cod_coluna: string;
  capacidade: number;
  quantidade: number;
}

interface Rua {
  cod_rua: string;
  capacidade: number;
  quantidade: number;
  colunas?: Coluna[];
}

interface EstabelecimentoData {
  estabelecimento: string;
  capacidadeTotal: number;
  quantidadeTotal: number;
  ruas: Rua[];
}

interface Props {
  data: EstabelecimentoData;
}

export default function GraficoCapacidadeQuantidade({ data }: Props) {
  const categorias: string[] = [];
  const capacidadeData: number[] = [];
  const quantidadeOkData: number[] = [];
  const quantidadeExcedidaData: number[] = [];

  data.ruas.forEach((rua) => {
    rua.colunas?.forEach((coluna) => {
      categorias.push(`${rua.cod_rua} - ${coluna.cod_coluna}`);
      capacidadeData.push(coluna.capacidade);

      if (coluna.quantidade <= coluna.capacidade) {
        quantidadeOkData.push(coluna.quantidade);
        quantidadeExcedidaData.push(0);
      } else {
        quantidadeOkData.push(coluna.capacidade);
        quantidadeExcedidaData.push(coluna.quantidade - coluna.capacidade);
      }
    });
  });

  const options: Highcharts.Options = {
    chart: { type: "column" },
    title: { text: "Capacidade x Quantidade Utilizada" },
    xAxis: {
      categories: categorias,
      title: { text: "Rua - Coluna" },
      labels: {
        rotation: -45,
        style: { fontSize: "12px" },
      },
    },
    yAxis: {
      min: 0,
      title: { text: "Quantidade Utilizada" },
      stackLabels: {
        enabled: true,
        style: {
          fontWeight: "bold",
          color: "black",
          fontSize: "14px",
          textOutline: "1px 1px white",
        },
      },
    },
    legend: {
      align: "center",
      verticalAlign: "bottom",
      layout: "horizontal",
      backgroundColor: "#FFFFFF",
      borderColor: "#CCC",
      borderWidth: 1,
      shadow: false,
    },
    tooltip: {
      headerFormat: "<b>{point.x}</b><br/>",
      pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
    },
    plotOptions: {
      column: {
        stacking: "normal",
        dataLabels: { enabled: false },
      },
    },
    series: [
      {
        name: "Quantidade Utilizada OK",
        data: quantidadeOkData,
        color: "#22c55e",
        type: "column",
      },
      {
        name: "Quantidade Utilizada Excedida",
        data: quantidadeExcedidaData,
        color: "#dc2626",
        type: "column",
      },
      {
        name: "Capacidade",
        data: capacidadeData,
        color: "#7da8e8",
        type: "column",
        enableMouseTracking: false,
        showInLegend: true,
      },
    ],
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
