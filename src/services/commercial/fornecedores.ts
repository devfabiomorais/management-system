import axios from "axios";

export interface Fornecedor {
  cod_fornecedor: number;
  nome: string;
  logradouro?: string;
  cidade?: string;
  bairro?: string;
  estado?: string;
  complemento?: string;
  numero?: number;
  cep?: string;
  tipo: string;
  responsavel: string;
  observacoes: string;
  email: string;
  celular: string;
  telefone: string;
  dtCadastro?: string;
  estabelecimentos: [];
  situacao?: string;
}

export const fetchFornecedores = async (token: string | null) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/fornecedores",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const ativos = response.data.fornecedores.filter(
      (fornecedor: any) => fornecedor.situacao === "Ativo"
    );

    return ativos;
  } catch (error) {
    console.error("Erro ao carregar fornecedores:", error);
    return [];
  }
};

//PARA USAR NAS PÁGINAS:
// const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
// const [selectedFornecedores, setSelectedFornecedores] = useState<Fornecedor[]>([]);
// useEffect(() => {
//   const carregarFornecedores = async () => {
//     const fornecedores = await fetchFornecedores(token);
//     setFornecedores(fornecedores);
//   };

//   carregarFornecedores();
// }, [token]);