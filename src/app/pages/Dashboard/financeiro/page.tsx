"use client";
import React, { useState, Suspense } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaArrowsRotate, FaFolderPlus } from "react-icons/fa6";
import { TbWallet } from "react-icons/tb";
import { redirect } from "next/navigation";
import Footer from "@/app/components/Footer";
import loadingGif from "../../../assets/imgs/loading.gif";
import { BsClipboard2DataFill } from "react-icons/bs";
import { BiSolidBank } from "react-icons/bi";
import { FaCreditCard, FaDollarSign, FaMoneyBillWave } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { GiPayMoney, GiReceiveMoney } from "react-icons/gi";
import { useSearchParams } from 'next/navigation';


export function CommercialPage() {
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo'); // "aPagar" ou "aReceber"
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
        <div className="flex justify-center h-screen">
          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <h2 className="text-blue text-2xl font-bold mb-3 pl-3">Comercial</h2>
            <div className="bg-white rounded-lg p-8 pt-14 shadow-md w-full flex justify-center" style={{ height: "95%" }}>
              <div className="flex flex-col items-center">
                <div className="flex gap-6">
                  {[{
                    label: "Cadastros",
                    state: openedCategory,
                    action: checkOpenCategory,
                    icon: <FaFolderPlus className="text-5xl" />
                  }, {
                    label: "Movimentações",
                    state: openedMovements,
                    action: checkOpenMovements,
                    icon: <FaArrowsRotate className="text-5xl" />
                  }].map((item, index) => (
                    <div
                      key={index}
                      onClick={item.action}
                      className={`flex flex-col justify-center items-center w-40 h-40 ${item.state ? "bg-green100" : "bg-blue"} cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200`}
                    >
                      {item.icon}
                      <span className="text-lg mt-2 font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {openedCategory && (
                  <div className="flex gap-4">
                    <div
                      onClick={() => handleRedirect("financeiro/centrosCusto")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <FaSackDollar className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Centro de Custo</span>
                      {loadingButton === "financeiro/centrosCusto" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleRedirect("financeiro/planoContas")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <BsClipboard2DataFill className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Plano de Contas</span>
                      {loadingButton === "financeiro/planoContas" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleRedirect("financeiro/contasBancarias")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <BiSolidBank className="text-6xl" />
                      <span className="text-sm mt-3 font-bold">Contas Bancárias</span>
                      {loadingButton === "financeiro/contasBancarias" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleRedirect("financeiro/formasPagamento")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <FaCreditCard className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Formas de</span>
                      <span className="text-sm font-bold">Pagamento</span>
                      {loadingButton === "financeiro/formasPagamento" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {openedMovements && (
                  <div className="flex gap-4">
                    <div
                      onClick={() => handleRedirect("financeiro/contasFinanceiro?tipo=aPagar")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <GiPayMoney className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Contas a Pagar</span>
                      {loadingButton === "financeiro/contasFinanceiro?tipo=aPagar" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>

                    <div
                      onClick={() => handleRedirect("financeiro/contasFinanceiro?tipo=aReceber")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <GiReceiveMoney className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Contas a Receber</span>
                      {loadingButton === "financeiro/contasFinanceiro?tipo=aReceber" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>

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

}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <img src="/loading.gif" alt="Carregando..." style={{ width: 100, height: 100 }} />
        </div>
      }
    >
      <CommercialPage />
    </Suspense>
  );
}