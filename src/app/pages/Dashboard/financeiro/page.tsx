"use client";
import React, { useState, Suspense } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaArrowsRotate, FaFolderPlus, FaCreditCard, FaSackDollar } from "react-icons/fa6";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { BsClipboard2DataFill } from "react-icons/bs";
import { BiSolidBank } from "react-icons/bi";
import Footer from "@/app/components/Footer";
import loadingGif from "../../../assets/imgs/loading.gif";
import { redirect, useSearchParams } from "next/navigation";

const FinanceiroPage: React.FC = () => {
  const searchParams = useSearchParams();
  const tipo = searchParams.get("tipo");
  const [openedCategory, setOpenedCategory] = useState(false);
  const [openedMovements, setOpenedMovements] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const checkOpenCategory = () => {
    setOpenedCategory(true);
    setOpenedMovements(false);
  };

  const checkOpenMovements = () => {
    setOpenedMovements(true);
    setOpenedCategory(false);
  };

  const handleRedirect = (path: string) => {
    setLoadingButton(path);
    redirect(path);
  };

  return (
    <div>
      <SidebarLayout>
        <div className="flex justify-center h-screen p-4">
          <div
            className="
              bg-blue/20
              backdrop-blur-md
              border border-cyan-100/30
              shadow-md
              pt-3 px-1
              w-full max-w-7xl
              h-[700px]
              rounded-md
              box-border
              flex flex-col
              [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
            "
          >
            <h2 className="text-white text-2xl font-bold mb-3 pl-3">Financeiro</h2>

            <div
              className="
                bg-blue/20
                backdrop-blur-md
                border border-cyan-100/30
                shadow-md
                rounded-lg
                p-8 pt-14
                w-full
                flex-1
                flex flex-col
                box-border
                overflow-auto
                [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
              "
            >
              <div className="flex flex-col items-center w-full">
                {/* Botões principais */}
                <div className="flex gap-6 justify-center w-full flex-wrap">
                  {[
                    {
                      label: "Cadastros",
                      state: openedCategory,
                      action: checkOpenCategory,
                      icon: <FaFolderPlus className="text-5xl" />,
                    },
                    {
                      label: "Movimentações",
                      state: openedMovements,
                      action: checkOpenMovements,
                      icon: <FaArrowsRotate className="text-5xl" />,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      onClick={item.action}
                      className={`flex flex-col justify-center items-center w-40 h-40 ${item.state
                        ? "bg-green100 [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]"
                        : "bg-cyan-200/20 backdrop-blur-md hover:bg-cyan-200/30 hover:scale-125 hover:z-10 border border-cyan-100/30 shadow-md [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]"
                        } cursor-pointer text-white rounded-lg shadow-lg transform transition-transform duration-200`}
                    >
                      {item.icon}
                      <span className="text-lg mt-2 font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {/* Categoria - Cadastros */}
                {openedCategory && (
                  <div className="flex gap-4 flex-wrap justify-center w-full">
                    {[
                      {
                        path: "financeiro/centrosCusto",
                        icon: <FaSackDollar className="text-5xl" />,
                        label: "Centro de Custo",
                      },
                      {
                        path: "financeiro/planoContas",
                        icon: <BsClipboard2DataFill className="text-5xl" />,
                        label: "Plano de Contas",
                      },
                      {
                        path: "financeiro/contasBancarias",
                        icon: <BiSolidBank className="text-6xl" />,
                        label: "Contas Bancárias",
                      },
                      {
                        path: "financeiro/formasPagamento",
                        icon: <FaCreditCard className="text-5xl" />,
                        label: (
                          <>
                            Formas de <br /> Pagamento
                          </>
                        ),
                      },
                    ].map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleRedirect(item.path)}
                        className="
                          relative flex flex-col justify-center items-center w-36 h-36
                          bg-cyan-200/20
                          backdrop-blur-md
                          hover:bg-cyan-200/30
                          hover:scale-125
                          hover:z-10
                          active:scale-125
                          active:z-10
                          border border-cyan-100/30
                          shadow-md
                          [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
                          cursor-pointer text-white rounded-lg transform transition-transform duration-200
                        "
                      >
                        {item.icon}
                        <span className="text-sm mt-3 font-bold text-center">{item.label}</span>
                        {loadingButton === item.path && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                            <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Categoria - Movimentações */}
                {openedMovements && (
                  <div className="flex gap-4 flex-wrap justify-center w-full">
                    {[
                      {
                        path: "financeiro/contasFinanceiro?tipo=aPagar",
                        icon: <GiPayMoney className="text-5xl" />,
                        label: "Contas a Pagar",
                      },
                      {
                        path: "financeiro/contasFinanceiro?tipo=aReceber",
                        icon: <GiReceiveMoney className="text-5xl" />,
                        label: "Contas a Receber",
                      },
                    ].map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleRedirect(item.path)}
                        className="
                          relative flex flex-col justify-center items-center w-36 h-36
                          bg-cyan-200/20
                          backdrop-blur-md
                          hover:bg-cyan-200/30
                          hover:scale-125
                          hover:z-10
                          active:scale-125
                          active:z-10
                          border border-cyan-100/30
                          shadow-md
                          [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
                          cursor-pointer text-white rounded-lg transform transition-transform duration-200
                        "
                      >
                        {item.icon}
                        <span className="text-sm mt-3 font-bold text-center">{item.label}</span>
                        {loadingButton === item.path && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                            <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
      <Footer />
    </div>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <img src="/loading.gif" alt="Carregando..." style={{ width: 100, height: 100 }} />
        </div>
      }
    >
      <FinanceiroPage />
    </Suspense>
  );
}
