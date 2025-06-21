"use client";
import React, { useState, Suspense } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaFolderPlus, FaSitemap, FaChartBar, FaWarehouse, FaCubesStacked } from "react-icons/fa6";
import { GoSync } from "react-icons/go";
import { TbDeviceIpadHorizontalPin } from "react-icons/tb";
import { IoIosDownload, IoMdAddCircle } from "react-icons/io";
import { AiFillGold } from "react-icons/ai";
import { LuMapPin } from "react-icons/lu";
import Footer from "@/app/components/Footer";
import { redirect } from "next/navigation";
import loadingGif from "../../../assets/imgs/loading.gif";
import { IoExit } from "react-icons/io5";

const StockPageContent: React.FC = () => {
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
            <h2 className="text-white text-2xl font-bold mb-3 pl-3">Estoque</h2>

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
                  <CategoryButton
                    label="Cadastros"
                    opened={openedCadastro}
                    toggle={() => toggleCategory("cadastro")}
                    icon={<FaFolderPlus className="text-5xl" />}
                  />
                  <CategoryButton
                    label="Movimentações"
                    opened={openedMovimentacoes}
                    toggle={() => toggleCategory("movimentacoes")}
                    icon={<GoSync className="text-5xl" />}
                  />
                  <CategoryButton
                    label="Dashboard"
                    opened={openedDashboard}
                    toggle={() => toggleCategory("dashboard")}
                    icon={<FaChartBar className="text-5xl" />}
                  />
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {openedCadastro && (
                  <div className="flex gap-4 flex-wrap justify-center w-full">
                    <OptionCard path="stock/unMedida" icon={<IoMdAddCircle className="text-5xl" />} text="Unidade de Medida" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/family" icon={<FaSitemap className="text-5xl" />} text="Famílias" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/itens" icon={<AiFillGold className="text-5xl" />} text="Itens" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/depositos" icon={<FaWarehouse className="text-5xl" />} text="Depósitos" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/localizacoes" icon={<LuMapPin className="text-5xl" />} text="Localizações" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/locaisItens" icon={<TbDeviceIpadHorizontalPin className="text-5xl" />} text="Local dos Itens" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                  </div>
                )}

                {openedMovimentacoes && (
                  <div className="flex gap-4 flex-wrap justify-center w-full">
                    <OptionCard path="stock/movimentacoes?tipo=Entrada" icon={<IoIosDownload className="text-5xl" />} text="Entradas" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                    <OptionCard path="stock/movimentacoes?tipo=Saida" icon={<IoExit className="text-5xl" />} text="Saídas" loadingButton={loadingButton} handleRedirect={handleRedirect} />
                  </div>
                )}

                {openedDashboard && (
                  <div className="flex gap-4 flex-wrap justify-center w-full">
                    <OptionCard path="stock/saldoEstoque" icon={<FaCubesStacked className="text-5xl" />} text="Saldo do Estoque" loadingButton={loadingButton} handleRedirect={handleRedirect} />
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

type CategoryButtonProps = {
  label: string;
  opened: boolean;
  toggle: () => void;
  icon: React.ReactNode;
};

function CategoryButton({ label, opened, toggle, icon }: CategoryButtonProps) {
  return (
    <div
      onClick={toggle}
      className={`flex flex-col justify-center items-center w-40 h-40 ${opened
        ? "bg-green100 [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]"
        : "bg-cyan-200/20 backdrop-blur-md hover:bg-cyan-200/30 hover:scale-125 hover:z-10 border border-cyan-100/30 shadow-md [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]"
        } cursor-pointer text-white rounded-lg shadow-lg transform transition-transform duration-200 ml-5 first:ml-0`}
    >
      {icon}
      <span className="text-lg mt-2 font-bold">{label}</span>
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
      <StockPageContent />
    </Suspense>
  );
}
