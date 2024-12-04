"use client"
import { useState, useEffect } from "react";
import axios from "axios";
import { useToken } from "./accessToken";

interface GroupPermission {
  cod_grupo: number;
  cod_modulo: number;
  insercao: string;
  edicao: string;
  delecao: string;
  visualizacao: string;
}

const useUserPermissions = (userGroupId: number, moduleLabel: string) => {
  const { token } = useToken();
  const [permissions, setPermissions] = useState<GroupPermission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await axios.get(
          `https://back-end-birigui.vercel.app/api/groupPermission/groups/permissions/${userGroupId}/${moduleLabel}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        const data = response.data.permissions;

        if (data && data.length > 0) {
          setPermissions(data[0]);
        } else {
          setPermissions(null);
        }
      } catch (err) {
        console.error("Erro ao buscar permissões:", err);
        setError("Erro ao buscar permissões");
      } finally {
        setLoading(false);
      }
    };

    if (userGroupId) {
      fetchPermissions();
    } else {
      setLoading(false);
    }
  }, [userGroupId, moduleLabel]);

  const hasViewPermission = () => permissions?.visualizacao === "SIM";
  const hasInsertPermission = () => permissions?.insercao === "SIM";
  const hasEditPermission = () => permissions?.edicao === "SIM";
  const hasDeletePermission = () => permissions?.delecao === "SIM";

  return {
    permissions,
    loading,
    error,
    hasViewPermission,
    hasInsertPermission,
    hasEditPermission,
    hasDeletePermission,
  };
};

export default useUserPermissions;
