import axios from "axios";

export interface RegraGrupoTributacao {
  cod_regra_grupo: number | null;
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
}

export interface EstadoRegraGrupo {
  cod_estado: number;
  nome: string;
}

export const fetchRegraGrupoTributacao = async (token: string | null): Promise<RegraGrupoTributacao[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/RegraGrupoTributacao",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // const regrasAtivos = response.data.regras.filter(
    //   (regra: any) => regra.situacao === "Ativo"
    // );

    // return regrasAtivos;
    const regras = response.data.regras;
    return regras;
  } catch (error) {
    console.error("Erro ao carregar regras de Tributação:", error);
    return [];
  }
};


// PARA USAR NAS PÁGINAS:
//REGRAS TRIBUTACAO
// const [RegraGrupoTributacao, setRegraGrupoTributacao] = useState<RegraGrupoTributacao[]>([]);
// const [selectedRegraGrupoTributacao, setSelectedRegraGrupoTributacao] = useState<RegraGrupoTributacao[]>([]);
// useEffect(() => {
//   const carregarRegraGrupoTributacao = async () => {
//     const regras = await fetchRegraGrupoTributacao(token);
//     setRegraGrupoTributacao(regras);
//   };

//   carregarRegraGrupoTributacao();
// }, [token]);

// const [formValuesRegraGrupoTributacao, setFormValuesRegraGrupoTributacao] = useState<RegraGrupoTributacao>({
//   cod_regra_grupo: null,
//   cod_grupo_tributacao: 0,
//   tipo: undefined,
//   aliquota: 0,
//   cst_csosn: "",
//   observacoes: "",
//   grupo: undefined,
//   estados: [],
// });

// services/regraGrupoTributacaoService.ts

interface FormValues {
  cod_regra_grupo: number | null;
  cod_grupo_tributacao?: number;
  tipo?: TipoRegraTributaria;
  aliquota?: number;
  cst_csosn?: string;
  observacoes?: string;
  grupo?: GrupoTributacao;
  estados: EstadoRegraGrupo[];
}

// export const validarCamposObrigatorios = (formValues: FormValues) => {
//   const requiredFields = ["tipo", "aliquota", "cst_csosn", "observacoes"];
//   return requiredFields.some((field) => {
//     const value = formValues[field as keyof FormValues];
//     return value === "" || value === null || value === undefined;
//   });
// };

export const verificarDuplicidade = (formValues: FormValues, lista: any[]) => {
  const regra = lista.find(
    (item) => item.observacoes === formValues.observacoes
  );
  return regra;
};

export const salvarRegraGrupoTributacao = async (
  formValues: FormValues,
  token: string
) => {
  const response = await axios.post(
    process.env.NEXT_PUBLIC_API_URL +
    "/api/RegraGrupoTributacao/register",
    formValues,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response;
};
