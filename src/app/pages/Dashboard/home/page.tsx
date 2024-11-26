"use client";

import React from "react";
import SidebarLayout from "@/app/components/Sidebar";

export default function HomePage() {
  return (
    <SidebarLayout>
      <h2 className="text-gray-800 text-xl">Conteúdo principal</h2>
      <p className="text-gray-600 mt-2">
        Bem-vindo ao Portal Birigui
      </p>
    </SidebarLayout>
  );
}
