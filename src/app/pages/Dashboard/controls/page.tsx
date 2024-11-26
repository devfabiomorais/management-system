"use client"
import React, { useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaCubes, FaLock, FaStore } from "react-icons/fa";
import { FaUsers, FaFolderPlus } from "react-icons/fa6";
import { redirect } from "next/navigation";

export default function ControlsPage() {
    const [openedCategory, setOpenedCategory] = useState(false);

    const checkOpen = () => {
        setOpenedCategory(!openedCategory);
    };

    return (
        <div className="">
            <SidebarLayout>
                <div className="flex justify-center h-full ">
                    <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
                        <h2 className="text-blue text-2xl font-bold mb-3 pl-3">Controles</h2>

                        <div className="bg-white rounded-lg p-8 pt-14 shadow-md w-full  justify-center flex" style={{ height: "95%" }}>
                            <div className="flex flex-col items-center">
                                <div onClick={checkOpen} className={`flex flex-col justify-center items-center w-40 h-40 ${openedCategory ? 'bg-green100' : 'bg-blue'} cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200`}>
                                    <FaFolderPlus className="text-5xl " />
                                    <span className="text-lg mt-2 font-bold">Cadastros</span>
                                </div>

                                <hr className="w-full border-t border-gray-300 my-6" />

                                {openedCategory && (
                                    <div className="flex gap-4">
                                        <div onClick={() => redirect("controls/users")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                                            <FaUsers className="text-5xl" />
                                            <span className="text-sm mt-3 font-bold">Usuários</span>
                                        </div>
                                        <div onClick={() => redirect("controls/modules")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                                            <FaCubes className="text-5xl" />
                                            <span className="text-sm mt-3 font-bold">Módulos</span>
                                        </div>
                                        <div onClick={() => redirect("controls/permissions")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                                            <FaLock className="text-5xl" />
                                            <span className="text-sm mt-3 font-bold">Permissões</span>
                                        </div>
                                        <div onClick={() => redirect("controls/establishments")} className="flex flex-col justify-center items-center w-36 h-36 bg-blue cursor-pointer text-white rounded-lg shadow-lg hover:scale-105 transform transition-transform duration-200">
                                            <FaStore className="text-5xl" />
                                            <span className="text-sm mt-3 font-bold">Estabelecimentos</span>
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
