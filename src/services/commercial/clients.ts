import axios from "axios";

export interface Client {
  cod_cliente: number;
  codigo?: number;
  nome: string;
  logradouro?: string;
  cidade?: string;
  bairro?: string;
  estado?: string;
  complemento?: string;
  numero?: string;
  cep?: string;
  tipo: string;
  situacao: string;
  email: string;
  celular: string;
  telefone: string;
  dtCadastro?: string;
  documento?: string;
}

export const fetchClients = async (token: string | null) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/clients",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const ativos = response.data.clients.filter(
      (client: any) => client.situacao === "ATIVO"
    );

    return ativos;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return [];
  }
};

//PARA USAR NAS PÁGINAS:
// const [clients, setClients] = useState<Client[]>([]);
// const [selectedClients, setSelectedClients] = useState<Client[]>([]);
// useEffect(() => {
//   const carregarClients = async () => {
//     const clients = await fetchClients(token);
//     setClients(clients);
//   };

//   carregarClients();
// }, [token]);