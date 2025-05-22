import axios from "axios";

export interface NfsServico {
  cod_nf_servico: number;
  numero_rps?: number;
  serie?: number;
  cod_natureza_operacao?: number;
  dt_emissao?: Date;
  hr_emissao?: string; // TIME(0) como string 'HH:mm:ss'
  cod_entidade?: number;
  cnpj_cpf_ent?: string;
  razao_social_ent?: string;
  tipo_contribuinte_ent?: string;
  insc_estadual_ent?: string;
  insc_municipal_ent?: string;
  cep_ent?: string;
  logradouro_ent?: string;
  numero_ent?: number;
  estado_ent?: string;
  bairro_ent?: string;
  cidade_ent?: string;
  descricao_servico?: string;
  total_icms?: number;
  aliquota_icms?: number;
  total_cofins?: number;
  aliquota_cofins?: number;
  total_pis?: number;
  aliquota_pis?: number;
  total_csll?: number;
  aliquota_csll?: number;
  total_ir?: number;
  aliquota_ir?: number;
  total_inss?: number;
  aliquota_inss?: number;
  observacoes?: string;
  informacoes_adicionais?: string;
  descontar_impostos?: "Sim" | "Nao";
  total_nf?: number;
  valor_servicos?: number;
  valor_deducoes?: number;
  valor_iss?: number;
  aliquota?: number;
  descontos?: number;
  base_calculo?: number;
  iss_retido?: "Sim" | "Nao";
  situacao?: string;
}

// Função para buscar Notas Fiscais de Serviços
export const fetchNfsServicos = async (
  token: string | null
): Promise<NfsServico[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/nfsServicos",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const nfs = response.data.nfsServicos;
    return nfs;
  } catch (error) {
    console.error("Erro ao carregar Notas Fiscais de Serviço:", error);
    return [];
  }
};

// EXEMPLO DE USO NAS PÁGINAS:

// const [nfsServicos, setNfsServicos] = useState<NfsServico[]>([]);
// const [selectedNfsServico, setSelectedNfsServico] = useState<NfsServico | null>(null);

// useEffect(() => {
//   const carregarNfsServicos = async () => {
//     const nfs = await fetchNfsServicos(token);
//     setNfsServicos(nfs);
//   };

//   carregarNfsServicos();
// }, [token]);
