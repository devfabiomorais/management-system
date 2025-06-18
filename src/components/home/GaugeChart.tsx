"use client";

import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface Props {
  percentage: number;
  realizado: number;
  falta: number;
  previsto: number;
  color: string;
}

export default function GaugeChart({
  percentage,
  realizado,
  falta,
  previsto,
  color,
}: Props) {
  const [modulesLoaded, setModulesLoaded] = useState(false);

  useEffect(() => {
    async function loadModules() {
      const HighchartsMore = await import("highcharts/highcharts-more");
      const SolidGauge = await import("highcharts/modules/solid-gauge");

      const highchartsMoreFn = (HighchartsMore as any).default || HighchartsMore;
      if (typeof highchartsMoreFn === "function") {
        highchartsMoreFn(Highcharts);
      } else {
        console.warn("highcharts-more module import sem função de inicialização");
      }

      const solidGaugeFn = (SolidGauge as any).default || SolidGauge;
      if (typeof solidGaugeFn === "function") {
        solidGaugeFn(Highcharts);
      } else {
        console.warn("solid-gauge module import sem função de inicialização");
      }

      setModulesLoaded(true); // sinaliza que módulos foram carregados
    }
    loadModules();
  }, []);

  // Enquanto os módulos não estão prontos, não renderiza o gráfico
  if (!modulesLoaded) {
    return <div>Carregando gráfico...</div>;
  }

  const options: Highcharts.Options = {
    chart: { type: "solidgauge", height: "150px" },
    title: { text: undefined },
    pane: {
      center: ["50%", "50%"],
      size: "100%",
      startAngle: -90,
      endAngle: 90,
      background: [
        {
          backgroundColor: "#e5e7eb",
          innerRadius: "60%",
          outerRadius: "100%",
          shape: "arc",
        },
      ],
    },
    tooltip: { enabled: false },
    yAxis: {
      min: 0,
      max: 100,
      lineWidth: 0,
      tickWidth: 0,
      labels: { enabled: false },
    },
    plotOptions: {
      solidgauge: {
        dataLabels: {
          y: -20,
          borderWidth: 0,
          useHTML: true,
          format: `<div style="text-align:center">
                      <span style="font-size:18px;color:${color}">${percentage.toFixed(
            1
          )}%</span>
                   </div>`,
        },
      },
    },
    series: [
      {
        name: "Progress",
        type: "solidgauge",
        data: [percentage],
      },
    ],
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
      <div className="text-sm mt-2">
        <div>Realizado: R$ {realizado.toLocaleString()}</div>
        <div>Falta: R$ {falta.toLocaleString()}</div>
        <div>Previsto: R$ {previsto.toLocaleString()}</div>
      </div>
    </div>
  );
}
