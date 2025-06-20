"use client";

import React, { useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

interface Nivel {
  cod_nivel: string;
  capacidade: number;
  quantidade: number;
}

interface Coluna {
  cod_coluna: string;
  capacidade: number;
  quantidade: number;
  niveis?: Nivel[];
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

export default function EstoqueHierarquicoTable({ data }: Props) {
  const [expandedRowsRua, setExpandedRowsRua] = useState<any>([]);
  const [expandedRowsColuna, setExpandedRowsColuna] = useState<any>([]);

  const nivelTemplate = (coluna: Coluna) => (
    <DataTable value={coluna.niveis} responsiveLayout="scroll">
      <Column field="cod_nivel" header="Nível" />
      <Column field="capacidade" header="Capacidade" />
      <Column field="quantidade" header="Quantidade" />
    </DataTable>
  );

  const colunaTemplate = (rowData: any) => {
    return (
      <div className="p-2">
        <DataTable
          value={rowData.colunas}
          responsiveLayout="scroll"
          tableStyle={{
            borderCollapse: "collapse",
            width: "100%",
          }}
          className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2"
          rowClassName={() => "hover:bg-gray-100"}
        >
          <Column
            field="cod_coluna"
            header="Coluna"
            headerStyle={{
              fontSize: "1.1rem",
              color: "#1B405D",
              fontWeight: "bold",
              border: "1px solid #ccc",
              textAlign: "center",
              backgroundColor: "#D9D9D980",
              verticalAlign: "middle",
              padding: "10px",
            }}
            style={{
              border: "1px solid #ccc",
              textAlign: "center",
            }}
          />
          <Column
            field="capacidade"
            header="Capacidade"
            headerStyle={{
              fontSize: "1.1rem",
              color: "#1B405D",
              fontWeight: "bold",
              border: "1px solid #ccc",
              textAlign: "center",
              backgroundColor: "#D9D9D980",
              verticalAlign: "middle",
              padding: "10px",
            }}
            style={{
              border: "1px solid #ccc",
              textAlign: "center",
            }}
          />
          <Column
            field="quantidade"
            header="Quantidade"
            headerStyle={{
              fontSize: "1.1rem",
              color: "#1B405D",
              fontWeight: "bold",
              border: "1px solid #ccc",
              textAlign: "center",
              backgroundColor: "#D9D9D980",
              verticalAlign: "middle",
              padding: "10px",
            }}
            style={{
              border: "1px solid #ccc",
              textAlign: "center",
            }}
          />
        </DataTable>
      </div>
    );
  };


  return (
    <div >

      <div
        className="flex mb-4"
        style={{
          fontSize: "1.2rem",
          color: "#1B405D",
          fontWeight: "bold",
          border: "1px solid #ccc",
          backgroundColor: "#D9D9D980",
          padding: "10px",
          userSelect: "none",
        }}
      >
        <div
          style={{
            flex: 1,
            textAlign: "center",
            borderRight: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Estabelecimento: {data.estabelecimento}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            borderRight: "1px solid #ccc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Capacidade: {data.capacidadeTotal}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          Quantidade: {data.quantidadeTotal}
        </div>
      </div>

      <DataTable
        value={data.ruas}
        responsiveLayout="scroll"
        expandedRows={expandedRowsRua}
        onRowToggle={(e) => setExpandedRowsRua(e.data)}
        rowExpansionTemplate={colunaTemplate}
        dataKey="cod_rua"
        tableStyle={{
          borderCollapse: "collapse",
          width: "100%",
        }}
        className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2"
        rowClassName={() => "hover:bg-gray-200"}
      >
        <Column
          expander
          style={{
            width: "3em",
            border: "1px solid #ccc",
            backgroundColor: "#D9D9D980",
          }}
        />
        <Column
          field="cod_rua"
          header="Rua"
          headerStyle={{
            fontSize: "1.2rem",
            color: "#1B405D",
            fontWeight: "bold",
            border: "1px solid #ccc",
            textAlign: "center",
            backgroundColor: "#D9D9D980",
            verticalAlign: "middle",
            padding: "10px",
          }}
          style={{
            border: "1px solid #ccc",
            textAlign: "center",
          }}
        />
        <Column
          field="capacidade"
          header="Capacidade"
          headerStyle={{
            fontSize: "1.2rem",
            color: "#1B405D",
            fontWeight: "bold",
            border: "1px solid #ccc",
            textAlign: "center",
            backgroundColor: "#D9D9D980",
            verticalAlign: "middle",
            padding: "10px",
          }}
          style={{
            border: "1px solid #ccc",
            textAlign: "center",
          }}
        />
        <Column
          field="quantidade"
          header="Quantidade"
          headerStyle={{
            fontSize: "1.2rem",
            color: "#1B405D",
            fontWeight: "bold",
            border: "1px solid #ccc",
            textAlign: "center",
            backgroundColor: "#D9D9D980",
            verticalAlign: "middle",
            padding: "10px",
          }}
          style={{
            border: "1px solid #ccc",
            textAlign: "center",
          }}
        />
      </DataTable>
    </div>

  );

}
