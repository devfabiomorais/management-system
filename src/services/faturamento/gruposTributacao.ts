import axios from "axios";

export interface RegraGrupoTributacao {
  id?: number | null;
  cod_regra_grupo?: number | null;
  cod_grupo_tributacao?: number;
  tipo?: TipoRegraTributaria;
  aliquota?: number;
  cst_csosn?: string;
  observacoes?: string;
  grupo?: GrupoTributacao;
  estados: EstadoRegraGrupo[];
}

export enum TipoRegraTributaria {
  Estados = "Estados",
  PIS = "PIS",
  COFINS = "COFINS",
  ICMS = "ICMS",
  IPI = "IPI"
}

export interface GrupoTributacao {
  cod_grupo_tributacao: number;
  nome: string;
  descricao?: string;
  situacao?: string;
  regras?: RegraGrupoTributacao[];
}

export interface EstadoRegraGrupo {
  cod_estado: number;
  nome: string;
}

export interface EstadoBackend {
  cod_estado_regra: number;
  uf: string;
  cod_regra_grupo: number;
}



export const fetchGruposTributacao = async (token: string | null): Promise<GrupoTributacao[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/gruposTributacao",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // const gruposAtivos = response.data.grupos.filter(
    //   (grupo: any) => grupo.situacao === "Ativo"
    // );

    // return gruposAtivos;
    const grupos = response.data.grupos;
    return grupos
  } catch (error) {
    console.error("Erro ao carregar Grupos de Tributação:", error);
    return [];
  }
};

// PARA USAR NAS PÁGINAS:
// const [gruposTributacao, setGruposTributacao] = useState<GrupoTributacao[]>([]);
// const [selectedGruposTributacao, setSelectedGruposTributacao] = useState<GrupoTributacao[]>([]);
// useEffect(() => {
//   const carregarGrupos = async () => {
//     const grupos = await fetchGruposTributacao(token);
//     setGruposTributacao(grupos);
//   };

//   carregarGrupos();
// }, [token]);

