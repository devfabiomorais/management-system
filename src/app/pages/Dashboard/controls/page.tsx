"use client";
import React, { useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { FaCubes, FaLock, FaStore } from "react-icons/fa";
import { FaUsers, FaFolderPlus } from "react-icons/fa6";
import { redirect } from "next/navigation";
import Footer from "@/app/components/Footer";
import loadingGif from "../../../assets/imgs/loading.gif";

export default function ControlsPage() {
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
                        <h2 className="text-white text-2xl font-semibold mb-3 pl-3">Controles</h2>

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
                                <div
                                    onClick={checkOpen}
                                    className={`flex flex-col justify-center items-center w-40 h-40 ${openedCategory
                                        ? "bg-green100 [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]"
                                        : "bg-cyan-200/20 backdrop-blur-md hover:bg-cyan-200/30 hover:scale-125 hover:z-10 border border-cyan-100/30 shadow-md [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]"
                                        } cursor-pointer text-white rounded-lg shadow-lg transform transition-transform duration-200 ml-5 first:ml-0`}
                                >
                                    <FaFolderPlus className="text-5xl" />
                                    <span className="text-lg mt-2 font-bold">Cadastros</span>
                                </div>

                                <hr className="w-full border-t border-gray-300 my-6" />

                                {openedCategory && (
                                    <div className="flex gap-4 flex-wrap justify-center w-full">
                                        {[
                                            { path: "controls/users", icon: <FaUsers className="text-5xl" />, label: "Usuários" },
                                            { path: "controls/modules", icon: <FaCubes className="text-5xl" />, label: "Módulos" },
                                            { path: "controls/permissions", icon: <FaLock className="text-5xl" />, label: "Permissões" },
                                            { path: "controls/establishments", icon: <FaStore className="text-5xl" />, label: "Estabelecimentos" },
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
                          cursor-pointer text-white rounded-lg
                          transform transition-transform duration-200
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
}
