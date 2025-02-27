"use client";

import React, { useState, useEffect } from "react";
import { FaHome, FaDolly, FaTags, FaCogs } from "react-icons/fa";
import { FaHandHoldingDollar, FaSackDollar } from "react-icons/fa6";
import { IoMdMenu } from "react-icons/io";
import { MdMenuOpen } from "react-icons/md";
import Logo from "../../assets/imgs/logoConviver.png";
import useUserPermissions from "../../hook/useUserPermissions";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState<string>("");  // Active path is stored here
  const [userGroupId, setUserGroupId] = useState<number>(0);

  useEffect(() => {
    const groupId = parseInt(localStorage.getItem("@Birigui:cod_grupo") || "0");
    setUserGroupId(groupId);

    // Verificar se há um botão ativo no localStorage
    const savedActivePath = localStorage.getItem("activeButton");
    if (savedActivePath) {
      setActivePath(savedActivePath);
    }
  }, []);

  const navItems = [
    { href: "/pages/Dashboard/home", icon: <FaHome className="text-4xl mb-1" />, label: "Início", module: "Home" },
    { href: "/pages/Dashboard/commercial", icon: <FaSackDollar className="text-4xl mb-1" />, label: "Comercial", module: "Comercial" },
    { href: "/pages/Dashboard/stock", icon: <FaDolly className="text-4xl mb-1" />, label: "Estoque", module: "Estoque" },
    { href: "#", icon: <FaTags className="text-4xl mb-1" />, label: "Faturamento", module: "Faturamento" },
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
    // Salvar o botão ativo no localStorage
    localStorage.setItem("activeButton", href);
    setActivePath(href); // Atualizar o estado local
  };

  return (
    <div className="flex bg-gray-200 max-h-full">
      <div className="flex-1 flex flex-col">
        <header className="bg-blue text-white flex items-center justify-between p-5">
          {isSidebarOpen ? (
            <MdMenuOpen className="text-4xl cursor-pointer" onClick={toggleSidebar} />
          ) : (
            <IoMdMenu className="text-4xl cursor-pointer" onClick={toggleSidebar} />
          )}
          <h1 className="text-3xl font-bold flex-1 text-start pl-5">Portal Birigui</h1>
          <img src={Logo.src} alt="Logo" className="w-14 h-14" />
        </header>

        <div className="flex">
          {isSidebarOpen && (
            <aside className="w-40 text-white flex flex-col">
              <nav className="flex flex-col flex-1 items-start space-y-4 pt-5 mt-4 pl-5">
                {permissions.map(
                  (item) =>
                    item.canView && (
                      <a
                        key={item.label}
                        href={item.href}
                        className={`flex flex-col items-center justify-center w-28 h-24 rounded-lg transform transition-transform duration-50 ${activePath === item.href
                          ? "bg-green100 cursor-default scale-125"  // Active button styles
                          : "bg-blue hover:bg-blue600 hover:scale-125 hover:z-10"
                          }`}
                        onClick={() => handleButtonClick(item.href)}  // Handle button click and save to localStorage
                      >
                        {item.icon}
                        <span className="text-sm">{item.label}</span>
                      </a>
                    )
                )}
              </nav>
            </aside>
          )}
          <main className="bg-gray-200 p-4 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;
