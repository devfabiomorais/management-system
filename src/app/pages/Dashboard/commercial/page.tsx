"use client";
import React, { useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaArrowsRotate, FaFolderPlus, FaClipboardList } from "react-icons/fa6";
import { TbTool, TbTruck, TbUserScan, TbBrandKick, TbBuilding } from "react-icons/tb";
import { MdRequestQuote } from "react-icons/md";
import { redirect } from "next/navigation";
import Footer from "@/app/components/Footer";
import loadingGif from "../../../assets/imgs/loading.gif";
import { IoIosPeople } from "react-icons/io";


export default function CommercialPage() {
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
            <div
              className="bg-white rounded-lg p-8 pt-14 shadow-md w-full flex justify-center"
              style={{ height: "95%" }}
            >
              <div className="flex flex-col items-center">
                <div className="flex gap-6">
                  {[{ label: "Cadastros", state: openedCategory, action: checkOpenCategory, icon: <FaFolderPlus className="text-5xl" /> },
                  { label: "Movimentações", state: openedMovements, action: checkOpenMovements, icon: <FaArrowsRotate className="text-5xl" /> }].map((item, index) => (
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
                    {[{ path: "commercial/clients", icon: <TbUserScan className="text-5xl" />, label: "Clientes" },
                    { path: "commercial/services", icon: <TbTool className="text-5xl" />, label: "Serviços" },
                    { path: "commercial/transportadoras", icon: <TbTruck className="text-5xl" />, label: "Transportadoras" },
                    { path: "commercial/fornecedores", icon: <IoIosPeople className="text-5xl" />, label: "Fornecedores" },
                    { path: "commercial/orcamentos?tipo=estrutura", icon: <TbBuilding className="text-5xl" />, label: <>Estruturas de <br />&nbsp;  Orçamento</> }].map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleRedirect(item.path)}
                        className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                      >
                        {item.icon}
                        <span className="text-sm mt-3 font-bold">{item.label}</span>
                        {loadingButton === item.path && (
                          <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                            <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {openedMovements && (
                  <div className="flex gap-4">
                    <div
                      onClick={() => handleRedirect("commercial/orcamentos")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <MdRequestQuote className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Orçamento</span>
                      {loadingButton === "commercial/orcamentos" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleRedirect("commercial/orcamentos?tipo=pedido")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200"
                    >
                      <FaClipboardList className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Pedidos de Venda</span>
                      {loadingButton === "commercial/orcamentos?tipo=pedido" && (
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