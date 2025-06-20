"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface TokenContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  codUsuarioLogado: number | null;
  setCodUsuarioLogado: (cod: number | null) => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

interface TokenProviderProps {
  children: ReactNode;
}

export const TokenProvider: React.FC<TokenProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("@Portal:token");
    }
    return null;
  });

  const [codUsuarioLogado, setCodUsuarioLogado] = useState<number | null>(() => {
    if (typeof window !== "undefined") {
      const storedCod = localStorage.getItem("@Portal:cod_usuario");
      return storedCod ? parseInt(storedCod, 10) : null;
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

  useEffect(() => {
    if (codUsuarioLogado !== null) {
      localStorage.setItem("@Portal:cod_usuario", String(codUsuarioLogado));
    } else {
      localStorage.removeItem("@Portal:cod_usuario");
    }
  }, [codUsuarioLogado]);

  return (
    <TokenContext.Provider value={{ token, setToken, codUsuarioLogado, setCodUsuarioLogado }}>
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
