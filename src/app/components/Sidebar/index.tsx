"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaDolly, FaTags, FaCogs } from "react-icons/fa";
import { FaHandHoldingDollar, FaSackDollar, FaRightFromBracket } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { MdMenuOpen } from "react-icons/md";
import Logo from "../../assets/imgs/logoConviver.png";
import loadingGif from "../../assets/imgs/loading.gif";
import useUserPermissions from "../../hook/useUserPermissions";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState<string>("");
  const [userGroupId, setUserGroupId] = useState<number>(0);
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false); // Estado para o modal
  const router = useRouter();

  useEffect(() => {
    const groupId = parseInt(localStorage.getItem("@Birigui:cod_grupo") || "0");
    setUserGroupId(groupId);

    const savedActivePath = localStorage.getItem("activeButton");
    if (savedActivePath) {
      setActivePath(savedActivePath);
    }
  }, []);

  const navItems = [
    { href: "/pages/Dashboard/home", icon: <FaHome className="text-4xl mb-1" />, label: "Início", module: "Home" },
    { href: "/pages/Dashboard/commercial", icon: <FaSackDollar className="text-4xl mb-1" />, label: "Comercial", module: "Comercial" },
    { href: "/pages/Dashboard/stock", icon: <FaDolly className="text-4xl mb-1" />, label: "Estoque", module: "Estoque" },
    { href: "/pages/Dashboard/faturamento", icon: <FaTags className="text-4xl mb-1" />, label: "Faturamento", module: "Financeiro" },
    { href: "/pages/Dashboard/financeiro", icon: <FaHandHoldingDollar className="text-4xl mb-1" />, label: "Financeiro", module: "Financeiro" },
    { href: "/pages/Dashboard/controls", icon: <FaCogs className="text-4xl mb-1" />, label: "Controles", module: "Controles" },
  ];

  const useModulePermissions = () => {
    return navItems.map((item) => {
      const permissions = useUserPermissions(userGroupId, item.module);
      return {
        ...item,
        canView: permissions?.hasViewPermission(),
        canEdit: permissions?.hasEditPermission(),
        canInsert: permissions?.hasInsertPermission(),
        canDelete: permissions?.hasDeletePermission(),
      };
    });
  };

  const permissions = useModulePermissions();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleButtonClick = (href: string) => {
    setLoadingButton(href); // Ativa o loading no botão específico
    localStorage.setItem("activeButton", href);
    setActivePath(href);
    router.push(href);
  };

  const handleLogoff = () => {
    localStorage.removeItem("token"); // Remove o token do usuário
    router.push("/"); // Redireciona para a tela de login
  };

  return (
    <div className="bg-gray-200 max-h-full">
      <div className="flex max-h-full app-zoom">
        <div className="flex-1 flex flex-col">
          <header className="bg-blue text-white flex items-center justify-between p-5">
            {isSidebarOpen ? (
              <MdMenuOpen className="text-4xl cursor-pointer" onClick={toggleSidebar} />
            ) : (
              <IoMdMenu className="text-4xl cursor-pointer" onClick={toggleSidebar} />
            )}
            <h1 className="text-3xl font-bold flex-1 text-start pl-5">Portal Birigui</h1>
            <img src={Logo.src} alt="Logo" className="w-14 h-14" />
            <button
              onClick={() => setModalOpen(true)}
              className="bg-red-500 px-4 py-2 rounded-md flex items-center gap-2 transition-transform duration-200 hover:scale-125"
            >
              <FaRightFromBracket className="text-2xl text-white" />
            </button>
          </header>

          <div className="flex">
            {isSidebarOpen && (
              <aside className="w-40 text-white flex flex-col ">
                <nav className="flex flex-col flex-1 items-start space-y-5 pt-5 mt-4 pl-5">
                  {permissions.map(
                    (item) =>
                      item.canView && (
                        <div className="relative" key={item.label}>
                          <a
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-28 h-24 rounded-lg transform transition-transform duration-50 ${activePath === item.href
                              ? "bg-green100 cursor-default scale-125"
                              : "bg-blue hover:bg-blue600 hover:scale-125 hover:z-10"
                              }`}
                            onClick={(e) => {
                              e.preventDefault();
                              handleButtonClick(item.href);
                            }}
                          >
                            {item.icon}
                            <span className="text-sm">{item.label}</span>
                          </a>

                          {loadingButton === item.href && (
                            <div className="absolute inset-0 flex items-center justify-center bg-green100 bg-opacity-75 rounded-lg">
                              <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                            </div>
                          )}
                        </div>
                      )
                  )}
                </nav>
              </aside>
            )}
            <main className="bg-gray-200 p-4 w-full">{children}</main>
          </div>
        </div>

        {/* Modal de Confirmação */}
        {modalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-blue p-6 rounded-md shadow-md text-center">
              <p className="text-lg  mb-4">Deseja realmente fazer logoff?</p>
              <div className="flex justify-center gap-4">
                <button onClick={handleLogoff} className="bg-red500 px-4 py-2 rounded-md text-white">Sim</button>
                <button onClick={() => setModalOpen(false)} className="bg-green-500 px-4 py-2 rounded-md">Não</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLayout;
