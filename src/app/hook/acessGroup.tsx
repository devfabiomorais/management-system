"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";

interface GroupContextType {
  groupCode: number | null;
  setGroupCode: (groupCode: number | null) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

interface GroupProviderProps {
  children: ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [groupCode, setGroupCode] = useState<number | null>(null);

  useEffect(() => {
    const storedGroupCode = localStorage.getItem("@Portal:cod_grupo");
    if (storedGroupCode) {
      setGroupCode(parseInt(storedGroupCode, 10));
    }
  }, []);

  return (
    <GroupContext.Provider value={{ groupCode, setGroupCode }}>
      {children}
    </GroupContext.Provider>
  );
};

export const useGroup = (): GroupContextType => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroup deve ser usado dentro de um GroupProvider");
  }
  return context;
};
