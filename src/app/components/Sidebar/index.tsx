"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaHome, FaHandshake, FaChartLine, FaSearchDollar, FaSignOutAlt, FaCogs } from "react-icons/fa";
import { BsBoxes } from "react-icons/bs";
import { IoMdMenu } from "react-icons/io";
import { MdMenuOpen } from "react-icons/md";
import Logo from "../../assets/imgs/emerald.png";
import loadingGif from "../../assets/imgs/loading.gif";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState<string>("");
  const [loadingButton, setLoadingButton] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedActivePath = localStorage.getItem("activeButton");
    if (savedActivePath) {
      setActivePath(savedActivePath);
    }
  }, []);

  const navItems = [
    { href: "/pages/Dashboard/home", icon: <FaHome className="text-4xl mb-1" />, label: "Início" },
    { href: "/pages/Dashboard/commercial", icon: <FaHandshake className="text-4xl mb-1" />, label: "Comercial" },
    { href: "/pages/Dashboard/stock", icon: <BsBoxes className="text-4xl mb-1" />, label: "Estoque" },
    { href: "/pages/Dashboard/faturamento", icon: <FaChartLine className="text-4xl mb-1" />, label: "Faturamento" },
    { href: "/pages/Dashboard/financeiro", icon: <FaSearchDollar className="text-4xl mb-1" />, label: "Financeiro" },
    { href: "/pages/Dashboard/controls", icon: <FaCogs className="text-4xl mb-1" />, label: "Controles" },
  ];

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleButtonClick = (href: string) => {
    setLoadingButton(href);
    localStorage.setItem("activeButton", href);
    setActivePath(href);
    router.push(href);
  };

  const handleLogoff = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  return (
    <div className="bg-transparent min-h-screen text-white flex flex-col app-zoom">
      {/* Header */}
      <header className="flex items-center justify-between p-5">
        {isSidebarOpen ? (
          <MdMenuOpen className="text-4xl cursor-pointer" onClick={toggleSidebar} />
        ) : (
          <IoMdMenu className="text-4xl cursor-pointer" onClick={toggleSidebar} />
        )}
        <h1 className="text-3xl font-semibold flex-1 text-start pl-5">Seu portal</h1>
        <img src={Logo.src} alt="Logo" className="w-14 h-14" />
        <button
          onClick={() => setModalOpen(true)}
          className="bg-red-500 px-4 py-2 rounded-md flex items-center gap-2 transition-transform duration-200 hover:scale-110"
        >
          <FaSignOutAlt className="text-2xl text-white" />
        </button>
      </header>

      {/* Sidebar + Main */}
      <div className="flex flex-1">
        {isSidebarOpen && (
          <nav className="w-40 flex flex-col items-start space-y-5 pt-5 mt-4 pl-5">
            {navItems.map((item) => (
              <div className="relative" key={item.label}>
                <a
                  href={item.href}
                  className={`flex flex-col items-center justify-center w-28 h-24 rounded-lg transition-transform duration-200
                    ${activePath === item.href
                      ? `bg-green100/60 cursor-default scale-125
                      [box - shadow: inset_0_2px_6px_rgba(255, 255, 255, 0.3)]
                      `

                      : `
                        bg-cyan-200/20 
                        backdrop-blur-md 
                        hover:bg-cyan-200/30 
                        hover:scale-125 
                        hover:z-10
                        border border-cyan-100/30
                        shadow-md
                        [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
                      `
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
                  <div className="absolute inset-0 flex items-center justify-center bg-transparent rounded-lg">
                    <img src={loadingGif.src} alt="Carregando..." className="w-10 h-10" />
                  </div>
                )}
              </div>
            ))}
          </nav>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>

      {/* Modal de Logoff */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-grayPurple p-6 rounded-md shadow-md text-center">
            <p className="text-lg mb-4 text-white">Deseja realmente fazer logoff?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogoff}
                className="bg-green-500 px-4 py-2 rounded-md text-white"
              >
                Sim
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="bg-red500 px-4 py-2 rounded-md text-white"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SidebarLayout;
