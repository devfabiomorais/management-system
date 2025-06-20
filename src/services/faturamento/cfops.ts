import axios from "axios";
import { NaturezaOperacao } from "./naturezaOperacao";

export interface Cfop {
  cod_cfop: string;
  descricao?: string;
  tipo_operacao?: 'Entrada' | 'Saida'; // ajuste se houver mais enum values
  origem_destino?: 'Interno' | 'Externo' | 'Exterior'; // idem acima
  dbs_cfopcol?: string;

  natureza_operacao_interna?: NaturezaOperacao[];
  natureza_operacao_externa?: NaturezaOperacao[];
}


// Função para buscar todos os CFOPs
export const fetchCfops = async (
  token: string | null
): Promise<Cfop[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/cfops",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const cfops = response.data.cfops;
    return cfops;
  } catch (error) {
    console.error("Erro ao carregar CFOPs:", error);
    return [];
  }
};

//COMO USAR NAS PAGINAS:
// const [cfops, setCfops] = useState<Cfop[]>([]);
// const [selectedCfops, setSelectedCfops] = useState<Cfop[]>([]);

// // useEffect para carregar os CFOPs
// useEffect(() => {
//   const carregarCfops = async () => {
//     const data = await fetchCfops(token);
//     setCfops(data);
//   };

//   carregarCfops();
// }, [token]);
