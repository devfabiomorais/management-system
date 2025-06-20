"use client";

import React from "react";
import GraficoFluxoCaixa from "./GraficoFluxoCaixa";
import GraficoContasBancarias from "./GraficoContasBancarias";
import GraficoVendas from "./GraficoVendas";
import GaugeChart from "./GaugeChart";

export default function Dashboard() {
  return (
    <div className="p-4 grid grid-cols-2 gap-4">
      {/* Top Cards */}
      <div className="bg-green-400 text-white p-4 rounded shadow flex justify-between items-center">
        <span>A Receber Hoje</span>
        <span>↕️</span>
      </div>

      <div className="bg-red400 text-white p-4 rounded shadow flex justify-between items-center">
        <span>A Receber Hoje</span>
        <span>↕️</span>
      </div>

      {/* Fluxo de Caixa */}
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">Fluxo de caixa</h2>
        <GraficoFluxoCaixa />
      </div>

      {/* Recebimentos */}
      <div className="bg-green-100 p-4 rounded shadow">
        <h2 className="font-bold text-gray-800">Recebimentos do Mês</h2>
        <GaugeChart
          percentage={24.7}
          realizado={55285.64}
          falta={168514.16}
          previsto={223799.80}
          color="#3b82f6"
        />
      </div>

      {/* Pagamentos */}
      <div className="bg-blue50 p-4 rounded shadow">
        <h2 className="font-bold text-gray-800">Pagamentos do Mês</h2>
        <GaugeChart
          percentage={7.3}
          realizado={13388.29}
          falta={169368.78}
          previsto={182757.07}
          color="#22c55e"
        />
      </div>

      {/* Contas Bancárias */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">Contas bancárias</h2>
        <GraficoContasBancarias />
      </div>

      {/* Gráfico de Vendas */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-bold mb-2">Gráfico de vendas</h2>
        <GraficoVendas />
      </div>
    </div>
  );
}
