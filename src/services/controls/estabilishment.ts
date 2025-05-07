import axios from "axios";

export interface Establishment {
  cod_estabelecimento: number;
  nome: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  complemento: string;
  estado: string;
}

export const fetchEstabilishments = async (token: string | null) => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const ativos = response.data.estabelecimentos.filter(
      (estab: any) => estab.situacao === "Ativo"
    );

    return ativos;
  } catch (error) {
    console.error("Erro ao carregar estabelecimentos:", error);
    return [];
  }
};

//PARA USAR NAS PÁGINAS:
// const [establishments, setEstablishments] = useState<Establishment[]>([]);
// const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
// useEffect(() => {
//   const carregarEstabs = async () => {
//     const estabs = await fetchEstabilishments(token);
//     setEstablishments(estabs);
//   };

//   carregarEstabs();
// }, [token]);