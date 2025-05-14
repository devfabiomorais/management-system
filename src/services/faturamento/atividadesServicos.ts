import axios from "axios";

export interface AtividadesServicos {
  cod_atividade_servico?: number;
  cod_tributacao: number;
  cnae: string;
  descricao: string;
  iss: number;
  cofins: number;
  pis: number;
  csll: number;
  ir: number;
  inss: number;
  desconta_imp_tot: string;
  desconta_ded_tot: string;
  servico_const_civil: string;
  situacao: string;
  estabelecimentos?: []
}


// Função para buscar Natureza de Operação
export const fetchAtividadesServicos = async (
  token: string | null
): Promise<AtividadesServicos[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/atividadesServicos",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Filtra apenas as atividades com situação ativa (caso necessário)
    // const atividadesAtivas = response.data.atividades.filter(
    //   (atividades: any) => atividades.situacao === "Ativo"
    // );

    // return naturezaAtivas;
    const atividades = response.data.atividades
    return atividades
  } catch (error) {
    console.error("Erro ao carregar atividade de serviço:", error);
    return [];
  }
};


// COMO USAR NAS PAGINAS:
// const [atividadesServicos, setAtividadesServicos] = useState<AtividadesServicos[]>([]);
// const [selectedAtividadesServicos, setSelectedAtividadesServicos] = useState<AtividadesServicos[]>([]);

// // useEffect para carregar dados
// useEffect(() => {
//   const carregarAtividades = async () => {
//     const atividades = await fetchAtividadesServicos(token);
//     setAtividadesServicos(atividades);
//   };

//   carregarAtividades();
// }, [token]);
