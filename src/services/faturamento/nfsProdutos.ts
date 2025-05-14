import axios from "axios";

export interface NfsProduto {
  cod_nf_produto: number;
  numero_nf?: number;
  serie?: number;
  cod_natureza_operacao?: number;
  tipo?: string;
  dt_emissao?: Date;
  hr_emissao?: Date;
  dt_entrada_saida?: Date;
  hr_entrada_saida?: Date;
  finalidade_emissao?: string;
  forma_emissao?: string;
  destinacao_operacao?: string;
  tipo_atendimento?: string;
  cod_entidade?: number;
  tipo_en?: string;
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
  cod_transportadora?: number;
  cnpj_cpf_transp?: string;
  razao_social_transp?: string;
  tipo_contribuinte_transp?: string;
  insc_estadual_transp?: string;
  insc_municipal_transp?: string;
  cep_transp?: string;
  logradouro_transp?: string;
  numero_transp?: number;
  estado_transp?: string;
  bairro_transp?: string;
  cidade_transp?: string;
  estado_uf?: string;
  placa_veiculo?: string;
  reg_nac_trans_carga?: string;
  modalidade?: string;
  total_icms?: number;
  total_pis?: number;
  total_cofins?: number;
  total_ipi?: number;
  total_produtos?: number;
  total_frete?: number;
  total_nf?: number;
  impostos_federais?: number;
  impostos_estaduais?: number;
  impostos_municipais?: number;
  total_impostos?: number;
  informacoes_complementares?: string;
  informacoes_fisco?: string;
  situacao?: string;
}

// Função para buscar Notas Fiscais de Produto
export const fetchNfsProdutos = async (
  token: string | null
): Promise<NfsProduto[]> => {
  try {
    const response = await axios.get(
      process.env.NEXT_PUBLIC_API_URL + "/api/nfsProdutos",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Filtra apenas as NFs com situação ativa (caso necessário)
    // const nfsAtivas = response.data.nfs.filter(
    //   (nfs: any) => nfs.situacao === "Ativo"
    // );

    // return nfsAtivas;
    const nfs = response.data.nfs;
    return nfs;
  } catch (error) {
    console.error("Erro ao carregar Notas Fiscais de Produto:", error);
    return [];
  }
};


// PARA USARS NAS PAGINAS:

// const [nfsProdutos, setNfsProdutos] = useState<NfsProduto[]>([]);
// const [selectedNfsProduto, setSelectedNfsProduto] = useState<NfsProduto | null>(null);

// // useEffect para carregar os dados ao montar a página
// useEffect(() => {
//   const carregarNfsProdutos = async () => {
//     const nfs = await fetchNfsProdutos(token);
//     setNfsProdutos(nfs);
//   };

//   carregarNfsProdutos();
// }, [token]);
