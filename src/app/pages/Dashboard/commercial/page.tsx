"use client"
import React, { useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaCubes, FaLock, FaStore, FaTools } from "react-icons/fa";
import { FaFolderPlus, FaArrowsRotate } from "react-icons/fa6";
import { TbHammer, TbTool, TbTruck, TbUserScan } from "react-icons/tb";
import { redirect } from "next/navigation";
import Footer from "@/app/components/Footer";
import { MdRequestQuote } from "react-icons/md";

export default function CommercialPage() {
  const [openedCategory, setOpenedCategory] = useState(false);
  const [openedMovements, setOpenedMovements] = useState(false);

  const checkOpenCategory = () => {
    setOpenedCategory(true);
    setOpenedMovements(false);
  };

  const checkOpenMovements = () => {
    setOpenedMovements(true);
    setOpenedCategory(false);
  };

  return (
    <div className="">
      <SidebarLayout>
        <div className="flex justify-center h-screen">
          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <h2 className="text-blue text-2xl font-bold mb-3 pl-3">Comercial</h2>
            <div
              className="bg-white rounded-lg p-8 pt-14 shadow-md w-full justify-center flex"
              style={{ height: "95%" }}
            >
              <div className="flex flex-col items-center">
                <div className="flex gap-6">
                  <div
                    onClick={checkOpenCategory}
                    className={`flex flex-col justify-center items-center w-40 h-40 ${
                      openedCategory ? "bg-green100" : "bg-blue"
                    } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaFolderPlus className="text-5xl" />
                    <span className="text-lg mt-2 font-bold">Cadastros</span>
                  </div>

                  <div
                    onClick={checkOpenMovements}
                    className={`flex flex-col justify-center items-center w-40 h-40 ${
                      openedMovements ? "bg-green100" : "bg-blue"
                    } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaArrowsRotate className="text-5xl" />
                    <span className="text-lg mt-2 font-bold">Movimentações</span>
                  </div>
                </div>
                <hr className="w-full border-t border-gray-300 my-6" />
                {openedCategory && (
                  <div className="flex gap-4">
                    <div
                      onClick={() => redirect("commercial/clients")}
                      className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <TbUserScan className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Clientes</span>
                    </div>
                    <div
                      onClick={() => redirect("commercial/services")}
                      className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <TbTool className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Serviços</span>
                    </div>
                    <div
                      onClick={() => redirect("commercial/transportadoras")}
                      className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <TbTruck className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Transportadoras</span>
                    </div>
                  </div>
                )}
                {openedMovements && (
                  <div className="flex gap-4">
                    <div
                      onClick={() => redirect("commercial/orcamentos")}
                      className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200"
                    >
                      <MdRequestQuote className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Orçamento</span>
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
