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
        {/* Container principal ocupa 100vh (altura da tela) e centraliza */}
        <div className="flex justify-center h-screen p-4">
          {/* Div mãe com altura fixa, flex column para organizar título + conteúdo */}
          <div
            className="
              bg-blue/20 
              backdrop-blur-md 
              border border-cyan-100/30
              shadow-md
              pt-3 px-1 
              w-full max-w-7xl
              h-[700px]  /* altura fixa que pode ajustar */
              rounded-md
              box-border
              flex flex-col
              [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
            "
          >
            {/* Título */}
            <h2 className="text-white text-2xl font-semibold mb-3 pl-3">Comercial</h2>

            {/* Div filha que preenche o espaço restante, flex para centralizar conteúdo */}
            <div
              className="
                bg-blue/20 
                backdrop-blur-md 
                border border-cyan-100/30
                shadow-md
                rounded-lg
                p-8 pt-14
                w-full
                flex-1     /* Preenche espaço restante da mãe */
                flex justify-center
                box-border
                overflow-auto /* Permite scroll interno se conteúdo extrapolar */
                [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
              "
            >
              <div className="flex flex-col items-center w-full">
                {/* Primeira linha de opções */}
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
                        } cursor-pointer text-white rounded-lg shadow-lg transform transition-transform duration-200 ml-5 first:ml-0`}
                    >
                      {item.icon}
                      <span className="text-lg mt-2 font-bold">{item.label}</span>
                    </div>
                  ))}
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {/* Categorias expandidas */}
                {openedCategory && (
                  <div className="flex gap-4 flex-wrap justify-center w-full">
                    {[
                      {
                        path: "commercial/clients",
                        icon: <TbUserScan className="text-5xl" />,
                        label: "Clientes",
                      },
                      {
                        path: "commercial/services",
                        icon: <TbTool className="text-5xl" />,
                        label: "Serviços",
                      },
                      {
                        path: "commercial/transportadoras",
                        icon: <TbTruck className="text-5xl" />,
                        label: "Transportadoras",
                      },
                      {
                        path: "commercial/fornecedores",
                        icon: <IoIosPeople className="text-5xl" />,
                        label: "Fornecedores",
                      },
                      {
                        path: "commercial/orcamentos?tipo=estrutura",
                        icon: <TbBuilding className="text-5xl" />,
                        label: (
                          <>
                            Estruturas de
                            <br />
                            &nbsp; Orçamento
                          </>
                        ),
                      },
                    ].map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleRedirect(item.path)}
                        className="relative flex flex-col justify-center items-center w-36 h-36  bg-cyan-200/20 
                        backdrop-blur-md 
                        hover:bg-cyan-200/30 
                        hover:scale-125 
                        hover:z-10
                        active:scale-125 
                        active:z-10
                        border border-cyan-100/30
                        shadow-md
                        [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)] cursor-pointer text-white rounded-lg transform transition-transform duration-200
                        "
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

                {/* Movimentações expandidas */}
                {openedMovements && (
                  <div className="flex gap-4 flex-wrap justify-center w-full mt-6">
                    {[
                      {
                        path: "commercial/orcamentos",
                        icon: <MdRequestQuote className="text-5xl" />,
                        label: "Orçamento",
                      },
                      {
                        path: "commercial/orcamentos?tipo=pedido",
                        icon: <FaClipboardList className="text-5xl" />,
                        label: "Pedidos de Venda",
                      },
                    ].map((item) => (
                      <div
                        key={item.path}
                        onClick={() => handleRedirect(item.path)}
                        className={`
                  relative flex flex-col justify-center items-center w-36 h-36 cursor-pointer text-white rounded-lg transform transition-transform duration-200
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
                `}
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

              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
      <Footer />
    </div>
  );
};