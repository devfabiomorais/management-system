"use client";
import React, { useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaFolderPlus, FaSitemap } from "react-icons/fa6";
import { TbUserScan } from "react-icons/tb";
import { IoMdAddCircle } from "react-icons/io";
import { AiFillGold } from "react-icons/ai";
import { GoSync } from "react-icons/go";
import { FaChartBar } from "react-icons/fa";
import { redirect } from "next/navigation";
import Footer from "@/app/components/Footer";
import loadingGif from "../../../assets/imgs/loading.gif";

export default function StockPage() {
  const [openedCategory, setOpenedCategory] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);

  const checkOpen = () => {
    setOpenedCategory(!openedCategory);
  };

  const handleRedirect = (path: string) => {
    setLoadingButton(path);
    redirect(path);
  };

  return (
    <div className="">
      <SidebarLayout>
        <div className="flex justify-center h-screen ">
          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <h2 className="text-blue text-2xl font-bold mb-3 pl-3">Estoque</h2>

            <div
              className="bg-white rounded-lg p-8 pt-14 shadow-md w-full  justify-center flex"
              style={{ height: "95%" }}
            >
              <div className="flex flex-col items-center">
                <div className="justify-between flex">
                  <div
                    onClick={checkOpen}
                    className={`flex flex-col justify-center items-center w-40 h-40 ${openedCategory ? "bg-green100" : "bg-blue"
                      } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaFolderPlus className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Cadastros</span>
                  </div>
                  <div
                    className={`ml-5 flex flex-col justify-center items-center w-40 h-40 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <GoSync className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">
                      Movimentações
                    </span>
                  </div>
                  <div
                    className={`ml-5 flex flex-col justify-center items-center w-40 h-40 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaChartBar className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Dashboard</span>
                  </div>
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {openedCategory && (
                  <div className="flex gap-4">
                    <div
                      onClick={() => handleRedirect("stock/unMedida")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <IoMdAddCircle className="text-5xl" />
                      <span className="text-sm mt-3 font-bold text-wrap">
                        Unidade de Medida
                      </span>
                      {loadingButton === "stock/unMedida" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleRedirect("stock/family")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <FaSitemap className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Famílias</span>
                      {loadingButton === "stock/family" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                          <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div
                      onClick={() => handleRedirect("stock/itens")}
                      className="relative flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <AiFillGold className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Itens</span>
                      {loadingButton === "stock/itens" && (
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
