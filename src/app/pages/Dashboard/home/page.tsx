"use client";

import React from "react";
import SidebarLayout from "@/app/components/Sidebar";
import Footer from "@/app/components/Footer";
import Dashboard from "@/components/home/Dashboard";

export default function HomePage() {
  return (
    <>
      <SidebarLayout>
        <div className="flex justify-center">


          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3 mt-1">
                  Seja bem-vindo!
                </h2>

              </div>

            </div>
            <div
              className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col mt-2"
              style={{ height: "95%" }}
            >
              <div>
                <Dashboard />
              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>
      <Footer />
    </>
  );
}
