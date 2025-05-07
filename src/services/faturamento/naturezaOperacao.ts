import axios from "axios";

export interface NaturezaOperacao {
  cod_natureza_operacao: number;
  nome?: string;
  padrao?: string;
  tipo?: string;
  finalidade_emissao?: string;
  tipo_agendamento?: string;
  consumidor_final?: string;
  observacoes?: string;
  cod_grupo_tributacao?: number;
  cod_cfop_interno?: number;
  cod_cfop_externo?: number;
  situacao?: 'Ativo' | 'Inativo';
  estabelecimentos: [];
}


// Função para buscar Natureza de Operação
export const fetchNaturezaOperacao = async (
  token: string | null
): Promise<NaturezaOperacao[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/naturezaOperacao",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Filtra apenas as natureza com situação ativa (caso necessário)
    // const naturezaAtivas = response.data.natureza.filter(
    //   (natureza: any) => natureza.situacao === "Ativo"
    // );

    // return naturezaAtivas;
    const naturezas = response.data.naturezas
    return naturezas
  } catch (error) {
    console.error("Erro ao carregar Natureza de Operação:", error);
    return [];
  }
};


// COMO USAR NAS PAGINAS:
// const [naturezaOperacao, setNaturezaOperacao] = useState<NaturezaOperacao[]>([]);
// const [selectedNaturezaOperacao, setSelectedNaturezaOperacao] = useState<NaturezaOperacao[]>([]);

// // useEffect para carregar dados
// useEffect(() => {
//   const carregarNatureza = async () => {
//     const natureza = await fetchNaturezaOperacao(token);
//     setNaturezaOperacao(natureza);
//   };

//   carregarNatureza();
// }, [token]);
