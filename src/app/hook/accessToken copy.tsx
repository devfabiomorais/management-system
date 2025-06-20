"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface TokenContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    // Recupera o token do localStorage no carregamento inicial
    if (typeof window !== "undefined") {
      return localStorage.getItem("@Portal:token");
    }
    return null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("@Portal:token", token);
    } else {
      localStorage.removeItem("@Portal:token");
    }
  }, [token]);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      {children}
    </TokenContext.Provider>
  );
};

export const useToken = (): TokenContextType => {
  const context = useContext(TokenContext);
  if (!context) {
    throw new Error("useToken deve ser usado dentro de um TokenProvider");
  }
  return context;
};
