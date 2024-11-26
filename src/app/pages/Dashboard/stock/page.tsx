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

export default function StockPage() {
  const [openedCategory, setOpenedCategory] = useState(false);

  const checkOpen = () => {
    setOpenedCategory(!openedCategory);
  };

  return (
    <div className="">
      <SidebarLayout>
        <div className="flex justify-center h-full ">
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
                    className={`flex flex-col justify-center items-center w-40 h-40 ${
                      openedCategory ? "bg-green100" : "bg-blue"
                    } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaFolderPlus className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Cadastros</span>
                  </div>
                  <div
                    className={`ml-5 flex flex-col justify-center items-center w-40 h-40 ${
                      openedCategory ? "bg-green100" : "bg-blue"
                    } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <GoSync className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">
                      Movimentações
                    </span>
                  </div>
                  <div
                    className={`ml-5 flex flex-col justify-center items-center w-40 h-40 ${
                      openedCategory ? "bg-green100" : "bg-blue"
                    } cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}
                  >
                    <FaChartBar className="text-5xl " />
                    <span className="text-lg mt-2 font-bold">Dashboard</span>
                  </div>
                </div>

                <hr className="w-full border-t border-gray-300 my-6" />

                {openedCategory && (
                  <div className="flex gap-4">
                    <div onClick={() => redirect("stock/unMedida")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                      <IoMdAddCircle className="text-5xl" />
                      <span className="text-sm mt-3 font-bold text-wrap">
                        Unidade de Medida
                      </span>
                    </div>
                    <div onClick={() => redirect("stock/family")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                      <FaSitemap className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Famílias</span>
                    </div>
                    <div onClick={() => redirect("stock/itens")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                      <AiFillGold className="text-5xl" />
                      <span className="text-sm mt-3 font-bold">Itens</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
    </div>
  );
}
