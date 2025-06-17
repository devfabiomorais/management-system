"use client";
import React, { useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaFolderPlus, FaSitemap, FaChartBar, FaWarehouse } from "react-icons/fa6";
import { GoSync } from "react-icons/go";
import { TbDeviceIpadHorizontalPin } from "react-icons/tb";
import { IoMdAddCircle } from "react-icons/io";
import { AiFillGold } from "react-icons/ai";
import { LuMapPin } from "react-icons/lu";
import Footer from "@/app/components/Footer";
import { redirect } from "next/navigation";
import loadingGif from "../../../assets/imgs/loading.gif";

export default function StockPage() {
  const [openedCadastro, setOpenedCadastro] = useState(false);
  const [openedMovimentacoes, setOpenedMovimentacoes] = useState(false);
  const [openedDashboard, setOpenedDashboard] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const toggleCategory = (category: string) => {
    setOpenedCadastro(category === "cadastro" ? !openedCadastro : false);
    setOpenedMovimentacoes(category === "movimentacoes" ? !openedMovimentacoes : false);
    setOpenedDashboard(category === "dashboard" ? !openedDashboard : false);
  };

  const handleRedirect = (path: string) => {
    setLoadingButton(path);
    redirect(path);
  };

  return (
    <div>
      <SidebarLayout>
        <div className="flex justify-center h-screen ">
          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <h2 className="text-blue text-2xl font-bold mb-3 pl-3">Estoque</h2>

            <div
              className="bg-white rounded-lg p-8 pt-14 shadow-md w-full justify-center flex"
              style={{ height: "95%" }}
            >
              <div className="flex flex-col items-center">
                {/* Botões principais */}
                <div className="justify-between flex">
                  {/* Botão Cadastros */}
                  <div
                    onClick={() => toggleCategory("cadastro")}
                    className={`flex flex-col justify-center items-center w-40 h-40 ${openedCadastro ? "bg-green100" : "bg-blue"
                      } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaFolderPlus className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Cadastros</span>
                  </div>

                  {/* Botão Movimentações */}
                  <div
                    onClick={() => toggleCategory("movimentacoes")}
                    className={`ml-5 flex flex-col justify-center items-center w-40 h-40 ${openedMovimentacoes ? "bg-green100" : "bg-blue"
                      } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <GoSync className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Movimentações</span>
                  </div>

                  {/* Botão Dashboard */}
                  <div
                    onClick={() => toggleCategory("dashboard")}
                    className={`ml-5 flex flex-col justify-center items-center w-40 h-40 ${openedDashboard ? "bg-green100" : "bg-blue"
                      } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaChartBar className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Dashboard</span>
                  </div>
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {/* Subcategorias de Cadastros */}
                {openedCadastro && (
                  <div className="flex gap-4 flex-wrap justify-center">
                    <OptionCard path="stock/unMedida" icon={<IoMdAddCircle className="text-5xl" />} text="Unidade de Medida" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/family" icon={<FaSitemap className="text-5xl" />} text="Famílias" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/itens" icon={<AiFillGold className="text-5xl" />} text="Itens" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/depositos" icon={<FaWarehouse className="text-5xl" />} text="Depósitos" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/localizacoes" icon={<LuMapPin className="text-5xl" />} text="Localizações" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/locaisItens" icon={<TbDeviceIpadHorizontalPin className="text-5xl" />} text="Local dos Itens" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                  </div>
                )}

                {/* Subcategorias de Movimentações */}
                {openedMovimentacoes && (
                  <div className="flex gap-4 flex-wrap justify-center">
                    <OptionCard path="stock/entradas" icon={<GoSync className="text-5xl" />} text="Entradas" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/saidas" icon={<GoSync className="text-5xl" />} text="Saídas" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                  </div>
                )}

                {/* Subcategoria de Dashboard */}
                {openedDashboard && (
                  <div className="flex gap-4 flex-wrap justify-center">
                    <OptionCard path="stock/saldoEstoque" icon={<FaChartBar className="text-5xl" />} text="Saldo do Estoque" loadingButton={loadingButton} handleRedirect={handleRedirect} />
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

type OptionCardProps = {
  path: string;
  icon: React.ReactNode;
  text: string;
  loadingButton: string | null;
  handleRedirect: (path: string) => void;
};

function OptionCard({ path, icon, text, loadingButton, handleRedirect }: OptionCardProps) {
  return (
    <div
      onClick={() => handleRedirect(path)}
      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
    >
      {icon}
      <span className="text-sm mt-3 font-bold text-center">{text}</span>
      {loadingButton === path && (
        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
        </div>
      )}
    </div>
  );
}
