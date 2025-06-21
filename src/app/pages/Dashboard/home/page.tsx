"use client";

import React from "react";
import SidebarLayout from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";
import Dashboard from "@/components/home/Dashboard";

export default function HomePage() {
  return (
    <>
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
              h-[700px]  /* altura fixa ajustável */
              rounded-md
              box-border
              flex flex-col
              [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
            "
          >
            <h2 className="text-white text-2xl font-semibold mb-3 pl-3 mt-1">
              Seja bem-vindo!
            </h2>

            <div
              className="
                bg-blue/20
                backdrop-blur-md
                border border-cyan-100/30
                shadow-md
                rounded-lg
                p-8 pt-8
                w-full
                flex-1
                flex flex-col
                box-border
                overflow-auto
                [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)]
              "
            >
              <Dashboard />
            </div>
          </div>
        </div>
      </SidebarLayout>
      <Footer />
    </>
  );
}
