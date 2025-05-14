"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";
import { IoAddCircleOutline } from "react-icons/io5";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";
import CancelButton from "@/app/components/Buttons/CancelButton";
import { MultiSelect } from "primereact/multiselect";
import { Establishment, fetchEstabilishments } from "@/services/controls/estabilishment";
import type { NfsProduto } from "@/services/faturamento/nfsProdutos";
import { fetchNfsProdutos } from "@/services/faturamento/nfsProdutos";
import { fetchGruposTributacao, GrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { Cfop, fetchCfops } from "@/services/faturamento/cfops";
import NaturezaOperacao from "../naturezaOperacao/page";
import { fetchNaturezaOperacao } from "@/services/faturamento/naturezaOperacao";
import { fetchFornecedores, Fornecedor } from "@/services/commercial/fornecedores";
import type { Client } from "@/services/commercial/clients";
import { fetchClients } from "@/services/commercial/clients";
import { FaPlus, FaTimes } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import AddButton from "@/app/components/Buttons/AddButton";

interface Transportadora {
  cod_transportadora: number;
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

interface ProdutoNFS {
  id: number;
  cod_item: number;
  descricao?: string;
  ncm?: string;
  cfop?: string;
  quantidade?: number;
  valor_unitario?: number;
  valor_total?: number;
}

interface ItemFamilia {
  cod_familia: number;
  descricao: string;
  nome: string;
}

interface ItemMedida {
  cod_un: number;
  descricao: string;
  un: string;
}

interface ProdutosCadastro {
  cod_item: string;
  descricao: string;
  narrativa: string;
  dbs_unidades_medida?: {
    un?: string;
    cod_un: number;
  } | null;
  dbs_familias?: {
    cod_familia: number;
    nome: string;
    descricao: string
  };
  dbs_estabelecimentos_item?: Array<{
    cod_estabel: number;
    cod_estabel_item: number;
    cod_item: string;
  }>;
  cod_un: { cod_un: number; un: string; descricao: string } | null;
  cod_familia: { cod_familia: number; nome: string; descricao: string } | null
  cod_estabelecimento: string[];
  dt_hr_criacao?: string;
  anexo?: File;
  situacao: string;
  valor_custo: number;
  valor_venda: number;
}

interface Produto {
  id: number; // Novo campo id
  cod_item: number;
  cod_produto: string;
  descricao: string;
  valor_venda?: string;
  valor_custo?: string;
  valor_total?: string;
  valor_unitario?: string;
  quantidade?: number;
  descontoUnitProdtipo?: string;
  descontoProd?: number;
  desconto?: number;
  tipo_juros?: "Percentual" | "Reais";
  valor_desconto: number;
  tipo_desconto: "Percentual" | "Reais";
}

const NfsProduto: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Financeiro");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");
  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] =
    useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const [nfsProdutos, setNfsProdutos] = useState<NfsProduto[]>([]);
  const [selectedNfsProduto, setSelectedNfsProduto] = useState<NfsProduto | null>(null);

  // useEffect para carregar os dados ao montar a página
  useEffect(() => {
    const carregarNfsProdutos = async () => {
      const nfs = await fetchNfsProdutos(token);
      setNfsProdutos(nfs);
    };

    carregarNfsProdutos();
  }, [token]);

  const filteredNfsProdutos = (nfsProdutos ?? []).filter((nfs) => {
    if (nfs.situacao !== 'Ativo') return false;

    return Object.values(nfs).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });




  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [NfsProdutosIdToDelete, setNfsProdutoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<NfsProduto>({
    cod_nf_produto: 0,
    numero_nf: 0,
    serie: 0,
    cod_natureza_operacao: 0,
    tipo: "",
    dt_emissao: undefined,
    hr_emissao: undefined,
    dt_entrada_saida: undefined,
    hr_entrada_saida: undefined,
    finalidade_emissao: "",
    forma_emissao: "",
    destinacao_operacao: "",
    tipo_atendimento: "",
    cod_entidade: 0,
    tipo_en: "",
    cnpj_cpf_ent: "",
    razao_social_ent: "",
    tipo_contribuinte_ent: "",
    insc_estadual_ent: "",
    insc_municipal_ent: "",
    cep_ent: "",
    logradouro_ent: "",
    numero_ent: 0,
    estado_ent: "",
    bairro_ent: "",
    cidade_ent: "",
    cod_transportadora: 0,
    cnpj_cpf_transp: "",
    razao_social_transp: "",
    tipo_contribuinte_transp: "",
    insc_estadual_transp: "",
    insc_municipal_transp: "",
    cep_transp: "",
    logradouro_transp: "",
    numero_transp: 0,
    estado_transp: "",
    bairro_transp: "",
    cidade_transp: "",
    estado_uf: "",
    placa_veiculo: "",
    reg_nac_trans_carga: "",
    modalidade: "",
    total_icms: 0,
    total_pis: 0,
    total_cofins: 0,
    total_ipi: 0,
    total_produtos: 0,
    total_frete: 0,
    total_nf: 0,
    impostos_federais: 0,
    impostos_estaduais: 0,
    impostos_municipais: 0,
    total_impostos: 0,
    informacoes_complementares: "",
    informacoes_fisco: "",
    situacao: "Ativo"
  });
  const [formValuesProdutoNFS, setFormValuesProdutoNFS] = useState<ProdutoNFS>({
    id: Date.now(),
    cod_item: 0,
    descricao: "",
    ncm: "",
    cfop: "",
    quantidade: 0,
    valor_unitario: 0,
    valor_total: 0,
  });


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_nf_produto: 0,
      numero_nf: 0,
      serie: 0,
      cod_natureza_operacao: 0,
      tipo: "",
      dt_emissao: undefined,
      hr_emissao: undefined,
      dt_entrada_saida: undefined,
      hr_entrada_saida: undefined,
      finalidade_emissao: "",
      forma_emissao: "",
      destinacao_operacao: "",
      tipo_atendimento: "",
      cod_entidade: 0,
      tipo_en: "",
      cnpj_cpf_ent: "",
      razao_social_ent: "",
      tipo_contribuinte_ent: "",
      insc_estadual_ent: "",
      insc_municipal_ent: "",
      cep_ent: "",
      logradouro_ent: "",
      numero_ent: 0,
      estado_ent: "",
      bairro_ent: "",
      cidade_ent: "",
      cod_transportadora: 0,
      cnpj_cpf_transp: "",
      razao_social_transp: "",
      tipo_contribuinte_transp: "",
      insc_estadual_transp: "",
      insc_municipal_transp: "",
      cep_transp: "",
      logradouro_transp: "",
      numero_transp: 0,
      estado_transp: "",
      bairro_transp: "",
      cidade_transp: "",
      estado_uf: "",
      placa_veiculo: "",
      reg_nac_trans_carga: "",
      modalidade: "",
      total_icms: 0,
      total_pis: 0,
      total_cofins: 0,
      total_ipi: 0,
      total_produtos: 0,
      total_frete: 0,
      total_nf: 0,
      impostos_federais: 0,
      impostos_estaduais: 0,
      impostos_municipais: 0,
      total_impostos: 0,
      informacoes_complementares: "",
      informacoes_fisco: "",
      situacao: "Ativo"
    });
    setSelectedEstablishments([]);
  };


  const handleSaveEdit = async (cod_natureza_operacao: any) => {
    try {
      const requiredFields = [
        "numero_nf",
        "serie",
        "cod_natureza_operacao",
        "tipo",
        "dt_emissao",
        "hr_emissao",
        "dt_entrada_saida",
        "hr_entrada_saida",
        "finalidade_emissao",
        "forma_emissao",
        "destinacao_operacao",
        "tipo_atendimento",
        "cod_entidade",
        "tipo_en",
        "cnpj_cpf_ent",
        "razao_social_ent",
        "tipo_contribuinte_ent",
        "insc_estadual_ent",
        "insc_municipal_ent",
        "cep_ent",
        "logradouro_ent",
        "numero_ent",
        "estado_ent",
        "bairro_ent",
        "cidade_ent",
        "cod_transportadora",
        "cnpj_cpf_transp",
        "razao_social_transp",
        "tipo_contribuinte_transp",
        "insc_estadual_transp",
        "insc_municipal_transp",
        "cep_transp",
        "logradouro_transp",
        "numero_transp",
        "estado_transp",
        "bairro_transp",
        "cidade_transp",
        "estado_uf",
        "placa_veiculo",
        "reg_nac_trans_carga",
        "modalidade",
        "total_icms",
        "total_pis",
        "total_cofins",
        "total_ipi",
        "total_produtos",
        "total_frete",
        "total_nf",
        "impostos_federais",
        "impostos_estaduais",
        "impostos_municipais",
        "total_impostos",
        "informacoes_complementares",
        "informacoes_fisco",
      ];


      const verificarCamposObrigatorios = (dados: NfsProduto): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof NfsProduto];

          if (valor === "" || valor === null || valor === undefined) {
            return campo; // Retorna o primeiro campo inválido
          }

        }
        return null; // Todos os campos estão válidos
      };
      const campoFaltando = verificarCamposObrigatorios(formValues);

      if (campoFaltando) {
        toast.info(`O campo obrigatório "${campoFaltando}" não foi preenchido.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      } else if (selectedEstablishments == null) {
        toast.info(`Selecione pelo menos um estabelecimento.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsProdutos/edit/${cod_natureza_operacao}`,
        { ...formValues, estabelecimentos: selectedEstablishments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setItemEditDisabled(false);
        setLoading(false);
        clearInputs();
        const novasNaturezas = await fetchNfsProdutos(token);
        setNfsProdutos(novasNaturezas);
        toast.success("Nota Fiscal de Produto editada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao editar Nota Fiscal de Produto.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao editar Nota Fiscal de Produto:", error);
    }
  };


  const [rowData, setRowData] = useState<NfsProduto[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = [
        "nome",
        "padrao",
        "tipo",
        "finalidade_emissao",
        "tipo_agendamento",
        "consumidor_final",
        "observacoes",
        "cod_grupo_tributacao",
        "cod_cfop_interno",
        "cod_cfop_externo",
      ];

      const verificarCamposObrigatorios = (dados: NfsProduto): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof NfsProduto];

          if (valor === "" || valor === null || valor === undefined) {
            return campo; // Retorna o primeiro campo inválido
          }

        }
        return null; // Todos os campos estão válidos
      };
      const campoFaltando = verificarCamposObrigatorios(formValues);

      if (campoFaltando) {
        toast.info(`O campo obrigatório "${campoFaltando}" não foi preenchido.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }


      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsProdutos/register`,
        { ...formValues, estabelecimentos: selectedEstablishments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Nota Fiscal de Produto salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        const novasNaturezas = await fetchNfsProdutos(token);
        setNfsProdutos(novasNaturezas);
        clearInputs();
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar Nota Fiscal de Produto.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar Nota Fiscal de Produto:", error);
      toast.error("Erro interno ao tentar salvar.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };



  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (NfsProdutos: any, visualizar: boolean) => {
    console.log(NfsProdutos)
    setVisualizar(visualizar);

    setFormValues(NfsProdutos);
    // Filtra os estabelecimentos com base no cod_estabel
    const selectedEstablishmentsWithNames = NfsProdutos.dbs_estabelecimentos_natureza.map(({ cod_estabel }: any) =>
      establishments.find((estab) => estab.cod_estabelecimento === cod_estabel)
    )
      .filter(Boolean); // Remove valores undefined (caso algum código não tenha correspondência)

    setSelectedEstablishments(selectedEstablishmentsWithNames);
    setSelectedNfsProduto(NfsProdutos);
    setIsEditing(true);
    setVisible(true);
  };


  const [naturezaOperacao, setNaturezaOperacao] = useState<NaturezaOperacao[]>([]);
  const [selectedNaturezaOperacao, setSelectedNaturezaOperacao] = useState<NaturezaOperacao[]>([]);

  // useEffect para carregar dados
  useEffect(() => {
    const carregarNatureza = async () => {
      const natureza = await fetchNaturezaOperacao(token);
      setNaturezaOperacao(natureza);
    };

    carregarNatureza();
  }, [token]);



  const openDialog = (id: number) => {
    setNfsProdutoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setNfsProdutoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (NfsProdutosIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsProdutos/cancel/${NfsProdutosIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const novasNaturezas = await fetchNfsProdutos(token);
        setNfsProdutos(novasNaturezas);
        setModalDeleteVisible(false);
        toast.success("Nota Fiscal de Produto cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Nota Fiscal de Produto.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar Nota Fiscal de Produto:", error);
      toast.error("Erro ao cancelar Nota Fiscal de Produto. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };




  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
  useEffect(() => {
    const carregarEstabs = async () => {
      const estabs = await fetchEstabilishments(token);
      setEstablishments(estabs);
    };

    carregarEstabs();
  }, [token]);


  const [gruposTributacao, setGruposTributacao] = useState<GrupoTributacao[]>([]);
  const [selectedGruposTributacao, setSelectedGruposTributacao] = useState<GrupoTributacao[]>([]);
  useEffect(() => {
    const carregarGrupos = async () => {
      const grupos = await fetchGruposTributacao(token);
      setGruposTributacao(grupos);
    };

    carregarGrupos();
  }, [token]);


  const [cfops, setCfops] = useState<Cfop[]>([]);
  const [selectedCfops, setSelectedCfops] = useState<Cfop[]>([]);

  // useEffect para carregar os CFOPs
  useEffect(() => {
    const carregarCfops = async () => {
      const data = await fetchCfops(token);
      setCfops(data);
    };

    carregarCfops();
  }, [token]);

  const [usarEndereco, setUsarEndereco] = useState("nao");
  const [usarEnderecoTransp, setUsarEnderecoTransp] = useState("nao");
  const [entidadeSelecionada, setEntidadeSelecionada] = useState<any>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<any>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDisabledTransp, setIsDisabledTransp] = useState(false);

  const clearInputsEndereco = () => {
    setFormValues((prev) => ({
      ...prev,
      cep_ent: "",
      logradouro_ent: "",
      numero_ent: 0,
      estado_ent: "",
      bairro_ent: "",
      cidade_ent: "",
    }));
  };

  const clearInputsEnderecoTransp = () => {
    setFormValues((prev) => ({
      ...prev,
      cep_transp: "",
      logradouro_transp: "",
      numero_transp: 0,
      estado_transp: "",
      bairro_transp: "",
      cidade_transp: "",
    }));
  };

  const restaurarEnderecoDaEntidade = (entidade: any) => {
    setFormValues((prev) => ({
      ...prev,
      cep_ent: entidade.cep || "",
      logradouro_ent: entidade.logradouro || "",
      numero_ent: Number(entidade.numero) || 0,
      estado_ent: entidade.estado || "",
      bairro_ent: entidade.bairro || "",
      cidade_ent: entidade.cidade || "",
    }));
  };

  const restaurarEnderecoDaTransp = (transp: any) => {
    if (!transp) return;
    setFormValues((prev) => ({
      ...prev,
      cep_transp: transp.cep ?? undefined,
      logradouro_transp: transp.logradouro || "",
      numero_transp: Number(transp.numero) || 0,
      estado_transp: transp.estado || "",
      bairro_transp: transp.bairro || "",
      cidade_transp: transp.cidade || "",
    }));
  };

  const [tipoEntidade, setTipoEntidade] = useState<'cliente' | 'fornecedor'>('cliente');


  const handleSelectEntidade = (id: string) => {
    let entidade: any;

    if (tipoEntidade === "fornecedor") {
      // Busca fornecedor
      entidade = fornecedores.find((f) => f.cod_fornecedor.toString() === id);

      setEntidadeSelecionada(entidade);

      if (entidade) {
        setFormValues((prev) => ({
          ...prev,
          tipo_en: id,
          cod_entidade: entidade.cod_fornecedor,
          razao_social_ent: entidade.nome,
          cnpj_cpf_ent: "",
          insc_estadual_ent: "",
          insc_municipal_ent: "",
          ...(usarEndereco === "sim"
            ? {
              cep_ent: entidade.cep || "",
              logradouro_ent: entidade.logradouro || "",
              numero_ent: Number(entidade.numero) || 0,
              estado_ent: entidade.estado || "",
              bairro_ent: entidade.bairro || "",
              cidade_ent: entidade.cidade || "",
            }
            : {
              cep_ent: "",
              logradouro_ent: "",
              numero_ent: 0,
              estado_ent: "",
              bairro_ent: "",
              cidade_ent: "",
            }),
        }));
      }
    } else {
      // Busca cliente
      entidade = clients.find((c) => c.cod_cliente.toString() === id);

      setEntidadeSelecionada(entidade);

      if (entidade) {
        setFormValues((prev) => ({
          ...prev,
          tipo_en: id,
          cod_entidade: entidade.cod_cliente,
          razao_social_ent: entidade.nome,
          cnpj_cpf_ent: entidade.documento || "",
          insc_estadual_ent: "",
          insc_municipal_ent: "",
          ...(usarEndereco === "sim"
            ? {
              cep_ent: entidade.cep || "",
              logradouro_ent: entidade.logradouro || "",
              numero_ent: Number(entidade.numero) || 0,
              estado_ent: entidade.estado || "",
              bairro_ent: entidade.bairro || "",
              cidade_ent: entidade.cidade || "",
            }
            : {
              cep_ent: "",
              logradouro_ent: "",
              numero_ent: 0,
              estado_ent: "",
              bairro_ent: "",
              cidade_ent: "",
            }),
        }));
      }
    }
  };

  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const fetchTransportadoras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/transportadoras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRowData(response.data.transportadoras);
      setIsDataLoaded(true);
      setTransportadoras(response.data.transportadoras);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar transportadoras:", error);
    }
  };

  const handleSelectTransp = (id: string) => {
    let transp: any;

    transp = transportadoras.find((f) => f.cod_transportadora.toString() === id);

    setTransportadoraSelecionada(transp);

    if (transp) {
      setFormValues((prev) => ({
        ...prev,
        cod_transportadora: transp.cod_transportadora,
        razao_social_transp: transp.nome,
        cnpj_cpf_transp: "",
        insc_estadual_transp: "",
        insc_municipal_transp: "",
        ...(usarEnderecoTransp === "sim"
          ? {
            cep_transp: transp.cep || "",
            logradouro_transp: transp.logradouro || "",
            numero_transp: Number(transp.numero) || 0,
            estado_transp: transp.estado || "",
            bairro_transp: transp.bairro || "",
            cidade_transp: transp.cidade || "",
          }
          : {
            cep_transp: "",
            logradouro_transp: "",
            numero_transp: 0,
            estado_transp: "",
            bairro_transp: "",
            cidade_transp: "",
          }),
      }));
    }

  };


  const handleUsarEndereco = (valor: string) => {
    setUsarEndereco(valor);

    if (valor === "sim") {
      setIsDisabled(true);
      if (entidadeSelecionada) {
        restaurarEnderecoDaEntidade(entidadeSelecionada);
      }
    } else {
      setIsDisabled(false);
      clearInputsEndereco();
    }
  };

  const handleUsarEnderecoTransp = (valor: string) => {
    setUsarEnderecoTransp(valor);

    if (valor === "sim") {
      setIsDisabledTransp(true);
      restaurarEnderecoDaTransp(transportadoraSelecionada);
    } else {
      setIsDisabledTransp(false);
      clearInputsEnderecoTransp();
    }
  };

  const handleCepInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');

    // Formata o CEP como 'XXXXX-XXX'
    let formattedValue = numericValue;
    if (numericValue.length > 5) {
      formattedValue = `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }

    // Atualiza o estado do formulário
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: formattedValue,
    }));

    // Se o CEP tiver 8 dígitos, faz a busca do endereço
    if (numericValue.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${numericValue}/json/`);

        if (!response.data.erro) {
          setFormValues(prevValues => ({
            ...prevValues,
            cep_ent: response.data.cep || "",
            logradouro_ent: response.data.logradouro || "",
            bairro_ent: response.data.bairro || "",
            cidade_ent: response.data.localidade || "",
            estado_ent: response.data.uf || "",
          }));
        } else {
          toast.info("CEP não encontrado!", {
            position: "top-center",
            autoClose: 3000,
            progressStyle: { background: "yellow" },
            icon: <span>⚠️</span>,
          });
          setFormValues(prevValues => ({
            ...prevValues,
            logradouro_ent: "",
            bairro_ent: "",
            cidade_ent: "",
            estado_ent: "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
      }
    }
  };

  const handleCepInputChangeTransp = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');

    // Formata o CEP como 'XXXXX-XXX'
    let formattedValue = numericValue;
    if (numericValue.length > 5) {
      formattedValue = `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }

    // Atualiza o estado do formulário
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: formattedValue,
    }));

    // Se o CEP tiver 8 dígitos, faz a busca do endereço
    if (numericValue.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${numericValue}/json/`);

        if (!response.data.erro) {
          setFormValues(prevValues => ({
            ...prevValues,
            cep_transp: response.data.cep || "",
            logradouro_transp: response.data.logradouro || "",
            bairro_transp: response.data.bairro || "",
            cidade_transp: response.data.localidade || "",
            estado_transp: response.data.uf || "",
          }));
        } else {
          toast.info("CEP não encontrado!", {
            position: "top-center",
            autoClose: 3000,
            progressStyle: { background: "yellow" },
            icon: <span>⚠️</span>,
          });
          setFormValues(prevValues => ({
            ...prevValues,
            logradouro_transp: "",
            bairro_transp: "",
            cidade_transp: "",
            estado_transp: "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
      }
    }
  };



  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedFornecedores, setSelectedFornecedores] = useState<Fornecedor[]>([]);
  useEffect(() => {
    const carregarFornecedores = async () => {
      const fornecedores = await fetchFornecedores(token);
      setFornecedores(fornecedores);
    };

    carregarFornecedores();
  }, [token]);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  useEffect(() => {
    const carregarClients = async () => {
      const clients = await fetchClients(token);
      setClients(clients);
    };

    carregarClients();
  }, [token]);


  // #region PRODUTOS  
  const [visibleProd, setVisibleProd] = useState(false);
  const [produtosCadastro, setProdutosCadastro] = useState<ProdutosCadastro[]>([]);
  const [produtos, setProd] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdSelecionados] = useState<ProdutoNFS[]>([]);
  const [selectedProd, setSelectedProd] = useState<Produto | null>(null);
  const [formValuesProd, setFormValuesProd] = useState<Produto>({
    id: 0, // Inicializando com um id padrão (pode ser 0 ou um valor único)
    cod_item: 0,
    descricao: "",
    valor_custo: "",
    valor_venda: "",
    cod_produto: "0",
    quantidade: 0,
    descontoUnitProdtipo: "",
    descontoProd: 0,
    desconto: 0,
    valor_total: "",
    valor_unitario: "",
    valor_desconto: 0,
    tipo_juros: "Percentual",
    tipo_desconto: "Percentual",
  });
  useEffect(() => {
    setFormValuesProd((prev) => ({
      ...prev,
      valor_unitario: prev.valor_venda,
    }));
  }, [formValuesProd.valor_venda]);

  const clearInputsProd = () => {
    setFormValuesCadastroProdutos({
      cod_item: "",
      descricao: "",
      narrativa: "",
      dbs_unidades_medida: {
        un: "",
        cod_un: 0
      },
      cod_estabelecimento: [],
      cod_un: null,
      cod_familia: null,
      situacao: "",
      valor_custo: 0,
      valor_venda: 0,
    });
    setSelectedUnit(null);
    setSelectedFamily(null);
    setSelectedEstablishments([]);
  };

  const [quantidadeProd, setQuantidadeProd] = useState(1);
  const [descontoProd, setDescontoProd] = useState<number>(0);
  const [descontoUnitProd, setDescontoUnitProd] = useState('Percentual'); // '%' ou 'R$'
  const [valorTotalProd, setValorTotalProd] = useState(0);

  //produtos-handles
  const handleRemoveLinhaProd = (id: number) => {
    setProdSelecionados((prev) => prev.filter((produto) => produto.id !== id));
  };
  const handleAdicionarLinha = () => {
    if (!selectedProd || !quantidadeProd) {
      toast.info("Após selecionar um produto, insira a quantidade.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
    // Garante que tenha um produto e quantidade antes de adicionar

    const novoProduto: ProdutoNFS = {
      id: Date.now(),  // Usando Date.now() para criar um identificador único numérico
      cod_item: Number(selectedProd.cod_item),
      quantidade: quantidadeProd,
      ncm: formValuesProdutoNFS.ncm,
      cfop: formValuesProdutoNFS.cfop,
      valor_total: valorTotalProd,
      valor_unitario: Number(selectedProd.valor_venda),
    };

    // Adiciona o novo produto à lista de selecionados
    setProdSelecionados((prev) => [...prev, novoProduto]);

    // Reseta os estados para permitir a seleção de um novo produto
    setSelectedProd(null); // Permite escolher um novo produto
    setQuantidadeProd(0);
    setDescontoProd(0);
    setDescontoUnitProd('%prod');
    setValorTotalProd(0);

    // Reseta os valores do formValuesProd
    setFormValuesProd({
      id: 0, // Adicionando o campo id
      cod_item: 0,
      descricao: "",
      valor_venda: "",
      valor_custo: "",
      cod_produto: "",
      quantidade: 0,
      valor_total: "",
      descontoUnitProdtipo: "",
      descontoProd: 0,
      desconto: 0,
      tipo_juros: "Percentual",
      valor_unitario: "",
      valor_desconto: 0,
      tipo_desconto: "Percentual",
    });
  };
  const handleQuantidadeProdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQuantidadeProd(value);
  };

  const handleDescontoProdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(",", "."); // Permite digitação com vírgula e converte para ponto
    let numericValue = Number(value);

    const maxValue = descontoUnitProd === "Percentual" ? 100 : quantidadeProd * Number(selectedProd?.valor_venda ?? 0);

    if (numericValue > maxValue) {
      numericValue = maxValue; // Limita ao máximo permitido
    } else if (numericValue < 0 || isNaN(numericValue)) {
      numericValue = 0; // Evita valores negativos ou inválidos
    }

    setDescontoProd(numericValue);
  };


  const handleDescontoUnitProdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "%prod" ? "Percentual" : "Reais";
    setDescontoUnitProd(newValue);
  };


  //autopreenchimento de campos ao selecionar algo PRODUTOS
  useEffect(() => {
    if (selectedProd) {
      console.log('selectedProd mudou:', selectedProd);
      setFormValuesProd((prevValues) => ({
        ...prevValues,
        cod_item: selectedProd.cod_item || 0,
        descricao: selectedProd.descricao || '',
        valor_venda: selectedProd.valor_venda || '',
        valor_custo: selectedProd.valor_custo || '',
      }));

      let total = (selectedProd.valor_venda ? Number(selectedProd.valor_venda) : 0) * quantidadeProd;
      if (descontoUnitProd === 'Percentual') {
        total -= total * (descontoProd / 100);
      } else {
        total -= descontoProd;
      }
      setValorTotalProd(parseFloat(total.toFixed(2)));
    }
  }, [selectedProd, quantidadeProd, descontoProd, descontoUnitProd]);

  const fetchProd = async () => {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/itens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProd(response.data.items);
      setProdutosCadastro(response.data.items);
      setFormValuesProd((prevValues) => ({
        ...prevValues,
        cod_item: (response.data.items.length + 1).toString(), // Convertendo para string se necessário
      }));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar produtos:", error);
    }
  };

  useEffect(() => {
    const total = produtosSelecionados.reduce((acc, produto) => {
      const valor = Number(produto.valor_total) || 0;
      return acc + valor;
    }, 0);

    setFormValues((prev: any) => ({
      ...prev,
      total_produtos: Number(total.toFixed(2)),
    }));
  }, [produtosSelecionados]);

  useEffect(() => {
    const {
      total_icms = 0,
      total_pis = 0,
      total_cofins = 0,
      total_ipi = 0,
      total_produtos = 0,
      total_frete = 0,
    } = formValues;

    const totalNF =
      Number(total_icms) +
      Number(total_pis) +
      Number(total_cofins) +
      Number(total_ipi) +
      Number(total_produtos) +
      Number(total_frete);

    setFormValues((prev: any) => ({
      ...prev,
      total_nf: Number(totalNF.toFixed(2)),
    }));
  }, [
    formValues.total_icms,
    formValues.total_pis,
    formValues.total_cofins,
    formValues.total_ipi,
    formValues.total_produtos,
    formValues.total_frete,
  ]);


  //produtos-cadastro  
  const [fileName, setFileName] = useState("");
  const [families, setFamilies] = useState<ItemFamilia[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [units, setUnits] = useState<ItemMedida[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProdutosCadastro | null>(null);
  const [formValuesCadastroProdutos, setFormValuesCadastroProdutos] = useState<ProdutosCadastro>({
    cod_item: "",
    descricao: "",
    narrativa: "",
    dbs_unidades_medida: {
      un: "",
      cod_un: 0
    },
    cod_estabelecimento: [],
    cod_un: null,
    cod_familia: null,
    situacao: "",
    valor_custo: 0,
    valor_venda: 0,
  });

  const handleSaveEditProdutos = async (produto: any = selectedItem) => {
    if (!produto?.cod_item) {
      toast.error("Item não selecionado ou inválido. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }


    try {
      const formData = new FormData();
      formData.append("descricao", produto.descricao);
      formData.append("narrativa", produto.narrativa);
      if (produto.cod_un !== null) {
        formData.append("cod_un", produto.cod_un.toString());
      }
      if (produto.cod_familia !== null) {
        formData.append("cod_familia", produto.cod_familia.toString());
      }
      formData.append("situacao", produto.situacao);

      // Enviar os estabelecimentos como um array serializado
      formData.append("cod_estabelecimento", JSON.stringify(selectedEstablishments.map(e => e.cod_estabelecimento)));

      // Adicionar arquivo de anexo, se presente
      if (produto.anexo) {
        formData.append("anexo", produto.anexo);
      }

      // Caso a situação seja "DESATIVADO", atualiza os dados do item
      const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/itens/edit/${produto.cod_item}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status >= 200 && response.status < 300) {
        clearInputsProd();
        fetchProd();
        toast.success("Item atualizado com sucesso!", { position: "top-right", autoClose: 3000 });
        setVisibleProd(false);
      } else {
        toast.error("Erro ao salvar item.", { position: "top-right", autoClose: 3000 });
      }
    } catch (error: any) {
      console.error("Erro ao atualizar item:", error);
      toast.error(`Erro ao atualizar item: ${error.response?.data?.msg || "Erro desconhecido"}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSaveReturnProdutos = async (fecharTela: boolean) => {
    try {
      const requiredFields = [
        "descricao",
        "narrativa",
        "cod_un",
        "situacao",
        "cod_familia",
        "valor_custo",
        "valor_venda"
      ];

      const isEmptyField = requiredFields.some((field) => {
        const value = formValuesCadastroProdutos[field as keyof typeof formValuesCadastroProdutos];
        return Array.isArray(value) ? value.length === 0 : value === "" || value === null || value === undefined;
      });

      if (selectedEstablishments.length === 0) {
        toast.info("Você deve selecionar pelo menos um estabelecimento!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      if (isEmptyField) {
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const formData = new FormData();
      formData.append("descricao", formValuesCadastroProdutos.descricao);
      formData.append("narrativa", formValuesCadastroProdutos.narrativa);
      formData.append("cod_item", formValuesCadastroProdutos.cod_item);
      if (formValuesCadastroProdutos.cod_un && formValuesCadastroProdutos.cod_un.cod_un !== undefined) {
        formData.append("cod_un", formValuesCadastroProdutos.cod_un.cod_un.toString());
      }

      formData.append("situacao", formValuesCadastroProdutos.situacao);
      formData.append("valor_custo", formValuesCadastroProdutos.valor_custo.toString());
      formData.append("valor_venda", formValuesCadastroProdutos.valor_venda.toString());

      if (formValuesCadastroProdutos.cod_familia && formValuesCadastroProdutos.cod_familia.cod_familia !== undefined) {
        formData.append("cod_familia", formValuesCadastroProdutos.cod_familia.cod_familia.toString());
      }

      selectedEstablishments.forEach((establishment) => {
        if (establishment.cod_estabelecimento) {
          console.log(establishment.cod_estabelecimento);
          formData.append("cod_estabelecimento[]", establishment.cod_estabelecimento.toString());
        } else {
          console.error("Valor inválido para cod_estabelecimento:", establishment);
        }
      });

      if (formValuesCadastroProdutos.anexo) {
        const file = formValuesCadastroProdutos.anexo;
        formData.append("anexo", file);
      }

      // Verificar se o "nome" já existe no banco de dados no storedRowData
      const nomeExists = produtosCadastro.some((item) => item.descricao === formValuesCadastroProdutos.descricao);

      if (nomeExists) {
        const itemEncontrado = produtosCadastro.find((item) => item.descricao === formValuesCadastroProdutos.descricao);
        const situacaoAtivo = itemEncontrado?.situacao === "ATIVO";

        if (situacaoAtivo) {
          // Caso o nome exista e a situação seja ATIVO, não permite a ação
          toast.info("Essa descrição já existe no banco de dados, escolha outra!", {
            position: "top-right",
            autoClose: 3000,
            progressStyle: { background: "yellow" },
            icon: <span>⚠️</span>, // Usa o emoji de alerta
          });
          return;
        } else {
          // Caso a situação seja DESATIVADO, atualiza os dados
          if (itemEncontrado) {
            setSelectedItem(itemEncontrado);
          } else {
            setSelectedItem(null);
          }
          await handleSaveEditProdutos(itemEncontrado); // Passa o serviço diretamente para atualização
          fetchProd();  // Recarrega os produtos
          clearInputsProd();
          setVisibleProd(fecharTela);
          toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
            position: "top-right",
            autoClose: 10000,
            progressStyle: { background: "green" },
            icon: <span>♻️</span>, // Ícone de recarga
          });
          return;
        }
      }

      // Se o nome não existir, cadastra o item normalmente
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/itens/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });

      if (response.status >= 200 && response.status < 300) {
        clearInputsProd();
        fetchProd();
        toast.success("Item salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        clearInputsProd();
        setVisibleProd(fecharTela);
      } else {
        toast.error("Erro ao salvar item.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar item:", error);
    }
  };


  useEffect(() => {
    fetchUnits();
    fetchFamilias();
    fetchProd();
    fetchTransportadoras();
  }, []);



  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/unMedida", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUnits(response.data.units);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar unidades de medida:", error);
    }
  };

  const fetchFamilias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/familia/itens/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFamilies(response.data.families);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar famílias de itens:", error);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0]; // Pega o primeiro arquivo selecionado
      setFileName(file.name); // Atualiza o nome do arquivo no estado
    }
  };

  const handleProdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = produtos.find((produto) => produto.cod_item === Number(e.target.value));
    setSelectedProd(selected || null);

    if (selected) {
      setFormValuesProd({
        id: selected.id || 0, // Adiciona o id do produto selecionado
        cod_item: selected.cod_item,
        descricao: selected.descricao || '',
        valor_venda: selected.valor_venda || '',
        valor_custo: selected.valor_custo || '',
        cod_produto: selected.cod_produto || '',
        valor_total: '',
        quantidade: 0,
        descontoUnitProdtipo: '',
        descontoProd: 0,
        desconto: 0,
        tipo_juros: 'Percentual',
        valor_unitario: selected.valor_venda || '',
        valor_desconto: 0,
        tipo_desconto: "Percentual",
      });
      console.log('formValuesProd atualizado:', formValuesProd);
    }
  };

  const closeModalProd = () => {
    clearInputsProd();
    setVisibleProd(false);
  };

  // #endregion

  const [totalICMSInput, setTotalICMSInput] = useState(
    formValues.total_icms?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );
  const [totalPISInput, setTotalPISInput] = useState(
    formValues.total_pis?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );
  const [totalCOFINSInput, setTotalCOFINSInput] = useState(
    formValues.total_cofins?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );
  const [totalIPIInput, setTotalIPIInput] = useState(
    formValues.total_ipi?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );

  const [totalFreteInput, setTotalFreteInput] = useState(
    formValues.total_frete?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );

  const impostosFederais =
    (formValues.total_ipi || 0) +
    (formValues.total_pis || 0) +
    (formValues.total_cofins || 0);

  const [impostosFederaisInput, setImpostosFederaisInput] = useState(
    impostosFederais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    const novosFederais =
      (formValues.total_ipi || 0) +
      (formValues.total_pis || 0) +
      (formValues.total_cofins || 0);

    setImpostosFederaisInput(
      novosFederais.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, [formValues.total_ipi, formValues.total_pis, formValues.total_cofins]);


  const [impostosEstaduaisInput, setImpostosEstaduaisInput] = useState(
    (formValues.total_icms || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    const impostosEstaduais = (formValues.total_icms || 0);
    setImpostosEstaduaisInput(
      impostosEstaduais.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, [formValues.total_icms]);



  const [impostosMunicipaisInput, setImpostosMunicipaisInput] = useState(
    formValues.impostos_municipais?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || '0,00'
  );


  const [totalImpostosInput, setTotalImpostosInput] = useState(
    ((formValues.impostos_federais || 0) +
      (formValues.impostos_estaduais || 0) +
      (formValues.impostos_municipais || 0)
    ).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  );

  useEffect(() => {
    const total =
      (formValues.impostos_federais || 0) +
      (formValues.impostos_estaduais || 0) +
      (formValues.impostos_municipais || 0);

    setTotalImpostosInput(
      total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    );
  }, [
    formValues.impostos_federais,
    formValues.impostos_estaduais,
    formValues.impostos_municipais
  ]);





  return (
    <>
      <SidebarLayout>
        <div className="flex justify-center">
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <BeatLoader
                color={color}
                loading={loading}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )}

          <Dialog
            header="Confirmar Cancelamento"
            visible={modalDeleteVisible}
            style={{ width: "auto" }}
            onHide={closeDialog}
            footer={
              <div>
                <Button
                  label="Não"
                  icon="pi pi-times"
                  onClick={closeDialog}
                  className="p-button-text bg-red text-white p-2 hover:bg-red700 transition-all"
                />
                <Button
                  label="Sim"
                  icon="pi pi-check"
                  onClick={handleCancelar}
                  className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all"
                />
              </div>
            }
          >
            <p>Tem certeza que deseja cancelar este Nota Fiscal de Produto?</p>
          </Dialog>

          {
            //#region MODAL PRODUTOS
          }
          <Dialog
            header={"Novo Item"}
            visible={visibleProd}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModalProd()}
          // style={{ width: "60vw", maxHeight: "80vh", overflowY: "auto" }}
          >
            <div className="p-fluid grid gap-3 mt-2 space-y-0">
              <div className="grid grid-cols-4 gap-2">

                <div className="">
                  <label htmlFor="code" className="block text-blue font-medium">
                    Código
                  </label>
                  <input
                    type="text"
                    id="code"
                    name="descricao"
                    value={formValuesCadastroProdutos.cod_item}
                    onChange={(e) => setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, cod_item: e.target.value })}
                    className="w-full  border border-[#D9D9D9] pl-1 rounded-sm h-[35px]"
                  />
                </div>

              </div>

              <div className="">
                <label htmlFor="description" className="block text-blue  font-medium">
                  Descrição
                </label>
                <input
                  type="text"
                  id="description"
                  name="descricao"
                  value={formValuesCadastroProdutos.descricao}
                  onChange={(e) => setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, descricao: e.target.value })}
                  className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
                  placeholder="" />
              </div>

              <div className="">
                <label htmlFor="narrative" className="block text-blue  font-medium">
                  Narrativa
                </label>
                <textarea
                  id="narrative"
                  rows={3}
                  name="narrativa"
                  value={formValuesCadastroProdutos.narrativa}
                  onChange={(e) => setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, narrativa: e.target.value })}
                  className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-16"
                  placeholder="" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="">
                  <label htmlFor="un" className="block text-blue  font-medium">
                    UN
                  </label>
                  <Dropdown
                    id="un"
                    name="cod_un"
                    value={selectedUnit}
                    onChange={(e) => {
                      setSelectedUnit(e.value);
                      setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, cod_un: e.value });
                    }}
                    options={units}
                    optionLabel="descricao"
                    placeholder="Selecione"
                    filter

                    className="w-full h-[35px] flex items-center" />
                </div>
                <div className="">
                  <label htmlFor="family" className="block text-blue  font-medium">
                    Família
                  </label>
                  <Dropdown
                    id="family"
                    name="cod_familia"
                    value={selectedFamily}
                    onChange={(e) => {
                      console.log(e.value);
                      setSelectedFamily(e.value);
                      setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, cod_familia: e.value });
                    }}
                    options={families}
                    optionLabel="nome"
                    placeholder="Selecione a Família"
                    filter
                    className="w-full md:w-14rem h-[35px] flex items-center" />
                </div>

                <div>
                  <label htmlFor="situation" className="block text-blue  font-medium">
                    Situação
                  </label>
                  <Dropdown
                    id="situacao"
                    name="situacao"
                    value={formValuesCadastroProdutos.situacao}
                    onChange={(e) => setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, situacao: e.value })}
                    options={[
                      { label: 'Ativo', value: 'ATIVO' },
                      { label: 'Inativo', value: 'DESATIVADO' }
                    ]}
                    placeholder="Selecione"
                    className="w-full md:w-14rem h-[35px] flex items-center"
                    style={{ backgroundColor: 'white', borderColor: '#D9D9D9' }} />
                </div>

              </div>

              <div className="grid grid-cols-2 gap-2">

                <div className="">
                  <label htmlFor="valor_venda" className="block text-blue  font-medium">
                    Valor Venda
                  </label>
                  <input
                    id="valor_venda"
                    name="valor_venda"
                    type="text"
                    value={`R$ ${Number(formValuesCadastroProdutos.valor_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, valor_venda: numericValue });
                    }}
                    placeholder="R$ 0,00"
                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-[35px]"
                  />

                </div>

                <div className="">
                  <label htmlFor="valor_custo" className="block text-blue  font-medium">
                    Valor Unitário
                  </label>
                  <input
                    id="valor_custo"
                    name="valor_custo"
                    type="text"
                    value={`R$ ${Number(formValuesCadastroProdutos.valor_custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValuesCadastroProdutos({ ...formValuesCadastroProdutos, valor_custo: numericValue });
                    }}
                    placeholder="R$ 0,00"
                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-[35px]"
                  />

                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2">
                  <label htmlFor="photo" className="block text-blue font-medium">
                    Foto
                  </label>

                  <input
                    type="file"
                    id="photo"
                    name="foto"
                    onChange={handleFileChange}
                    className="file-input"
                    style={{ display: "none" }}  // Esconde o input real
                  />

                  <label
                    htmlFor="photo"
                    className="custom-file-input w-full"
                    style={{
                      display: "inline-block",
                      padding: "10px 20px",
                      backgroundColor: "#f0f0f0",  // Cor de fundo cinza claro
                      color: "#1D4ED8",  // Cor do texto blue (Tailwind)
                      fontSize: "16px",
                      fontWeight: "bold",
                      borderRadius: "5px",
                      cursor: "pointer",
                      border: "2px solid #D1D5DB",  // Borda cinza escuro
                      transition: "background-color 0.3s ease",
                      lineHeight: "12.5px",
                    }}
                  >
                    <span>Escolher arquivo</span>
                  </label>

                  {/* Exibe o nome do arquivo selecionado, se houver */}
                  {fileName && (
                    <div className="mt-2 text-blue-500 ">
                      <strong>Arquivo selecionado: </strong> {fileName}
                    </div>
                  )}
                </div>

                <div className="">
                  <label htmlFor="estabilishments" className="block text-blue  font-medium">
                    Estabelecimentos
                  </label>

                  <MultiSelect
                    value={selectedEstablishments}
                    onChange={(e) => setSelectedEstablishments(e.value)}
                    options={establishments}
                    optionLabel="nome"
                    filter
                    placeholder="Selecione os Estabelecimentos"
                    maxSelectedLabels={3}
                    className="w-full border text-black h-[35px] flex items-center"
                  />

                </div>
              </div>
            </div>

            <br></br>
            <br></br>

            {/* Botões */}
            <div className="grid grid-cols-2 gap-3 w-full">

              {!isEditing && (
                <>
                  <Button
                    label="Salvar e Voltar à Listagem"
                    className="text-white"
                    icon="pi pi-refresh"
                    onClick={() => { handleSaveReturnProdutos(false) }}
                    style={{
                      backgroundColor: "#007bff",
                      border: "1px solid #007bff",
                      padding: "0.75rem 2rem",
                      fontSize: "16px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                  <Button
                    label="Salvar e Adicionar Outro"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={() => { handleSaveReturnProdutos(true) }}
                    style={{
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.75rem 2rem",
                      fontSize: "16px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                </>
              )}
            </div>


          </Dialog>
          {
            //#endregion
          }


          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Nota Fiscal de Produto" : "Editar Nota Fiscal de Produto") : "Nova Nota Fiscal de Produto"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            style={{ position: 'fixed', width: '60rem' }}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid gap-2 grid-cols-4">
                <div>
                  <label htmlFor="cod_nf_produto" className="block text-blue font-medium">
                    Código
                  </label>
                  <input
                    type="text"
                    id="cod_nf_produto"
                    name="cod_nf_produto"
                    disabled
                    value={formValues.cod_nf_produto}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200 cursor-not-allowed"
                  />
                </div>



                <div>
                  <label htmlFor="serie" className="block text-blue font-medium">
                    Série
                  </label>
                  <input
                    type="number"
                    id="serie"
                    name="serie"
                    disabled={visualizando}
                    value={formValues.serie}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>

                <div className="">
                  <label htmlFor="cod_natureza_operacao" className="block text-blue font-medium">
                    Natureza de Operação
                  </label>
                  <select
                    id="cod_natureza_operacao"
                    disabled={visualizando}
                    value={formValues.cod_natureza_operacao || ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cod_natureza_operacao: Number(e.target.value),
                      }))
                    }
                    className="w-full border text-black h-[35px] px-2 rounded"
                  >
                    <option value="">Selecione</option>
                    {naturezaOperacao.map((natureza) => (
                      <option key={natureza.cod_natureza_operacao} value={natureza.cod_natureza_operacao}>
                        {natureza.nome}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label htmlFor="tipo" className="block text-blue font-medium">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    disabled={visualizando}
                    value={formValues.tipo}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Entrada">Entrada</option>
                    <option value="Saida">Saída</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="dt_emissao" className="block text-blue font-medium">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    id="dt_emissao"
                    name="dt_emissao"
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    disabled={visualizando}
                    value={!isEditing ?
                      (formValues.dt_emissao ? new Date(formValues.dt_emissao).toISOString().split("T")[0] : "") :
                      (formValues.dt_emissao ? new Date(formValues.dt_emissao).toISOString().split("T")[0] : "")}


                    onChange={(e) => {
                      const value = e.target.value;
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        dt_emissao: value ? new Date(value) : undefined,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="hr_emissao" className="block text-blue font-medium">
                    Hora de Emissão
                  </label>
                  <input
                    type="time"
                    id="hr_emissao"
                    name="hr_emissao"
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    disabled={visualizando}
                    value={
                      formValues.hr_emissao
                        ? new Date(formValues.hr_emissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value; // formato: "HH:MM"
                      const [hours, minutes] = value.split(':');
                      const now = new Date();
                      now.setHours(parseInt(hours));
                      now.setMinutes(parseInt(minutes));
                      now.setSeconds(0);
                      now.setMilliseconds(0);
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        hr_emissao: value ? new Date(now) : undefined,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="dt_entrada_saida" className="block text-blue font-medium">
                    Data de Entrada/Saída
                  </label>
                  <input
                    type="date"
                    id="dt_entrada_saida"
                    name="dt_entrada_saida"
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    disabled={visualizando}
                    value={!isEditing ?
                      (formValues.dt_entrada_saida ? new Date(formValues.dt_entrada_saida).toISOString().split("T")[0] : "") :
                      (formValues.dt_entrada_saida ? new Date(formValues.dt_entrada_saida).toISOString().split("T")[0] : "")}


                    onChange={(e) => {
                      const value = e.target.value;
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        dt_entrada_saida: value ? new Date(value) : undefined,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="hr_entrada_saida" className="block text-blue font-medium">
                    Hora de Entrada/Saída
                  </label>
                  <input
                    type="time"
                    id="hr_entrada_saida"
                    name="hr_entrada_saida"
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    disabled={visualizando}
                    value={
                      formValues.hr_entrada_saida
                        ? new Date(formValues.hr_entrada_saida).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value; // formato: "HH:MM"
                      const [hours, minutes] = value.split(':');
                      const now = new Date();
                      now.setHours(parseInt(hours));
                      now.setMinutes(parseInt(minutes));
                      now.setSeconds(0);
                      now.setMilliseconds(0);
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        hr_entrada_saida: value ? new Date(now) : undefined,
                      }));
                    }}
                  />
                </div>


              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="finalidade_emissao" className="block text-blue font-medium">
                    Finalidade de Emissão
                  </label>
                  <select
                    id="finalidade_emissao"
                    name="finalidade_emissao"
                    disabled={visualizando}
                    value={formValues.finalidade_emissao}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        finalidade_emissao: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="NF-e normal">NF-e normal</option>
                    <option value="NF-e complementar">NF-e complementar</option>
                    <option value="NF-e de ajuste">NF-e de ajuste</option>
                    <option value="Devolução de mercadoria">Devolução de mercadoria</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="forma_emissao" className="block text-blue font-medium">
                    Forma de Emissão
                  </label>
                  <select
                    id="forma_emissao"
                    name="forma_emissao"
                    disabled={visualizando}
                    value={formValues.forma_emissao}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        forma_emissao: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Normal">Emissão normal</option>
                    <option value="Contingencia">Contingência</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="destinacao_operacao" className="block text-blue font-medium">
                    Destino da Operação
                  </label>
                  <select
                    id="destinacao_operacao"
                    name="destinacao_operacao"
                    disabled={visualizando}
                    value={formValues.destinacao_operacao}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        destinacao_operacao: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Interna">Operação Interna</option>
                    <option value="Interestadual">Operação Interestadual</option>
                    <option value="Exterior">Operação com Exterior</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tipo_atendimento" className="block text-blue font-medium">
                    Tipo de Atendimento
                  </label>
                  <select
                    id="tipo_atendimento"
                    name="tipo_atendimento"
                    disabled={visualizando}
                    value={formValues.tipo_atendimento}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        tipo_atendimento: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Não se aplica">Não se aplica</option>
                    <option value="Operação presencial">Operação presencial</option>
                    <option value="Operação não presencial, pela internet">Operação não presencial, pela internet</option>
                    <option value="Operação não presencial, teleatendimento">Operação não presencial, teleatendimento</option>
                    <option value="Operação não presencial, outros">Operação não presencial, outros</option>
                  </select>
                </div>

              </div>

              {
                // #region Destinatário
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Destinatário</h2>

                <div className="grid grid-cols-4 gap-2">

                  <div className="col-span-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          audio.play();

                          setTimeout(() => {
                            setTipoEntidade('cliente');
                          }, 100);
                        }}

                        className={`h-[28px] px-8 rounded-full border font-medium 
                        ${tipoEntidade === 'cliente' ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        Cliente
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          audio.play();

                          setTimeout(() => {
                            setTipoEntidade('fornecedor');
                          }, 100);
                        }}
                        className={`h-[28px] px-8 rounded-full border font-medium 
                        ${tipoEntidade === 'fornecedor' ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        Fornecedor
                      </button>
                    </div>

                    <select
                      id="tipo_en"
                      disabled={visualizando}
                      value={formValues.tipo_en || ""}
                      onChange={(e) => {
                        handleSelectEntidade(e.target.value);
                      }}

                      className="w-full border text-black h-[34px] px-2 rounded mt-1"
                    >
                      <option value="">Selecione</option>
                      {tipoEntidade === "fornecedor" ? (
                        fornecedores.map((fornecedor) => (
                          <option key={fornecedor.cod_fornecedor} value={fornecedor.cod_fornecedor}>
                            {fornecedor.nome}
                          </option>
                        ))
                      ) : (
                        clients.map((client) => (
                          <option key={client.cod_cliente} value={client.cod_cliente}>
                            {client.nome}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="pt-[8px]">
                    <label htmlFor="cnpj_cpf_ent" className="block text-blue font-medium">
                      Documento (CNPJ/CPF)
                    </label>
                    <input
                      type="text"
                      id="cnpj_cpf_ent"
                      name="cnpj_cpf_ent"
                      disabled
                      value={formValues.cnpj_cpf_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="razao_social_ent" className="block text-blue font-medium">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      id="razao_social_ent"
                      name="razao_social_ent"
                      disabled
                      value={formValues.razao_social_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo_contribuinte_ent" className="block text-blue font-medium">
                      Tipo de Contribuinte
                    </label>
                    <select
                      id="tipo_contribuinte_ent"
                      name="tipo_contribuinte_ent"
                      value={formValues.tipo_contribuinte_ent || ""}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 bg-white"
                      disabled={visualizando}
                    >
                      <option value="">Selecione</option>
                      <option value="Contribuinte ICMS">Contribuinte ICMS</option>
                      <option value="Contribuinte ISENTO">Contribuinte ISENTO</option>
                      <option value="Não Contribuinte">Não Contribuinte</option>
                    </select>
                  </div>


                  <div>
                    <label htmlFor="insc_estadual_ent" className="block text-blue font-medium">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      id="insc_estadual_ent"
                      name="insc_estadual_ent"
                      value={formValues.insc_estadual_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>

                  <div>
                    <label htmlFor="insc_municipal_ent" className="block text-blue font-medium">
                      Inscrição Municipal
                    </label>
                    <input
                      type="text"
                      id="insc_municipal_ent"
                      name="insc_municipal_ent"
                      value={formValues.insc_municipal_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="mb-2">
                    <label className="block text-blue font-medium mb-1">
                      Usar Endereço do Cliente
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          audio.play();

                          setTimeout(() => {
                            handleUsarEndereco("sim");
                          }, 100);
                        }}
                        className={`h-[28px] px-8  rounded-full border font-medium ${usarEndereco === "sim" ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        SIM
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          audio.play();

                          setTimeout(() => {
                            handleUsarEndereco("nao");
                          }, 100);
                        }}
                        className={`h-[28px] px-8 rounded-full border font-medium ${usarEndereco === "nao" ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cep_ent" className="block text-blue font-medium">
                      CEP
                    </label>
                    <input
                      id="cep_ent"
                      name="cep_ent"
                      type="text"
                      value={formValues.cep_ent ?? undefined}
                      onChange={handleCepInputChange}
                      maxLength={9}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="logradouro_ent" className="block text-blue font-medium">
                      Logradouro
                    </label>
                    <input
                      id="logradouro_ent"
                      name="logradouro_ent"
                      type="text"
                      value={formValues.logradouro_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>

                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label htmlFor="numero_ent" className="block text-blue font-medium">
                      Número
                    </label>
                    <input
                      id="numero_ent"
                      name="numero_ent"
                      type="text"
                      value={formValues.numero_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                  <div>
                    <label htmlFor="estado_ent" className="block text-blue font-medium">
                      Estado (sigla)
                    </label>
                    <input
                      id="estado_ent"
                      name="estado_ent"
                      type="text"
                      value={formValues.estado_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label htmlFor="bairro_ent" className="block text-blue font-medium">
                      Bairro
                    </label>
                    <input
                      id="bairro_ent"
                      name="bairro_ent"
                      type="text"
                      value={formValues.bairro_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                  <div>
                    <label htmlFor="cidade_ent" className="block text-blue font-medium">
                      Cidade
                    </label>
                    <input
                      id="cidade_ent"
                      name="cidade_ent"
                      type="text"
                      value={formValues.cidade_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                </div>
              </div>
              {
                // #endregion
              }

              {
                //#region Produtos
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 ">
                <div className="flex items-center top-0">
                  <h3 className="text-blue text-lg font-bold pt-1 mr-1">Produtos</h3>

                  <div className={visualizando ? "hidden" : "h-10 scale-75 text-sm"}>
                    <RegisterButton onClick={() => { console.log(produtos); setVisibleProd(true) }} title="Cadastrar" />
                  </div>
                </div>
                <div style={{ height: "16px" }}></div>

                {/* Linha principal (para entrada de dados) */}
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="produto" className="block text-blue font-medium">
                      Produto
                    </label>
                    <select
                      id="produto"
                      name="produto"
                      value={selectedProd ? selectedProd.cod_item : ''}
                      disabled={visualizando}
                      onChange={handleProdChange}
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    >
                      <option
                        value=''
                        disabled
                        selected
                      >
                        Selecione
                      </option>
                      {produtos.map((produto) => (
                        <option key={produto.cod_item} value={produto.cod_item}>
                          {produto.descricao}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ncm" className="block text-blue font-medium">
                      NCM
                    </label>
                    <input
                      id="ncm"
                      name="ncm"
                      type="text"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      disabled={visualizando}
                      value={formValuesProdutoNFS.ncm}
                      onChange={(e) =>
                        setFormValuesProdutoNFS((prev) => ({
                          ...prev,
                          ncm: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="cfop" className="block text-blue font-medium">
                      CFOP
                    </label>
                    <input
                      id="cfop"
                      name="cfop"
                      type="text"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      disabled={visualizando}
                      value={formValuesProdutoNFS.cfop}
                      onChange={(e) =>
                        setFormValuesProdutoNFS((prev) => ({
                          ...prev,
                          cfop: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label htmlFor="quantidadeProd" className="block text-blue font-medium">
                      Quant.
                    </label>
                    <input
                      id="quantidadeProd"
                      name="quantidadeProd"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      disabled={visualizando}
                      value={quantidadeProd}
                      onChange={handleQuantidadeProdChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="vl_unit_prod" className="block text-blue font-medium">
                      Valor Unitário
                    </label>
                    <input
                      id="vl_unit_prod"
                      name="vl_unit_prod"
                      type="text"
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      value={new Intl.NumberFormat('pt-BR', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(Number(formValuesProd.valor_venda ? formValuesProd.valor_venda : 0))}

                    />
                  </div>


                  <div className="flex flex-col items-start col-span-3">
                    <label htmlFor="vl_total_prod" className="block text-blue font-medium">
                      Valor Total
                    </label>
                    <div className="flex items-center w-full">
                      <input
                        id="vl_total_prod"
                        name="vl_total_prod"
                        type="text"
                        disabled
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                        value={`R$ ${new Intl.NumberFormat('pt-BR', {
                          style: 'decimal',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(Number(valorTotalProd ? valorTotalProd : 0))}`}
                      />
                      <div className={visualizando ? "hidden" : "h-10 scale-75 text-sm"}>
                        <AddButton onClick={handleAdicionarLinha} visualizando={visualizando} />
                      </div>


                    </div>
                  </div>
                </div>

                <br></br>

                {/* Linhas adicionadas de produtos */}
                {produtosSelecionados.map((produto, index) => (
                  <div key={`${produto.cod_item}-${index}`} className="grid grid-cols-12 gap-2">
                    <div className="col-span-4">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={
                          produtos.find(p => p.cod_item === produto.cod_item)?.descricao ?? ''
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.ncm}
                        disabled
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.cfop}
                        disabled
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.quantidade}
                        disabled
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ?
                          (produto.valor_unitario ?? produto.valor_unitario) :
                          ('dbs_itens' in produto ? (produto as any).dbs_itens?.valor_venda : produto.valor_unitario)
                        }
                        disabled
                      />
                    </div>

                    <div className="flex items-center gap-2 col-span-3">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.valor_total}
                        disabled
                      />
                      <button
                        className={`bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center hover:scale-150 duration-50 transition-all ${visualizando ? 'hidden' : ''}`}
                        onClick={() => handleRemoveLinhaProd(produto.id)}
                      >
                        <FaTimes className="text-red text-2xl" />
                      </button>

                    </div>

                  </div>
                ))}

              </div>
              {
                //#endregion
              }

              {
                //#region Transporte
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Transporte</h2>

                <div className="grid grid-cols-4 gap-2">

                  <div className="col-span-3">
                    <label htmlFor="cod_transportadora" className="block text-blue font-medium">
                      Transportadora
                    </label>

                    <select
                      id="cod_transportadora"
                      disabled={visualizando}
                      value={formValues.cod_transportadora || 0}
                      onChange={(e) => {
                        handleSelectTransp(e.target.value);
                      }}
                      className="w-full border text-black h-[34px] px-2 rounded mt-1"
                    >
                      <option value="">Selecione</option>
                      {transportadoras.map((transportadora) => (
                        <option key={transportadora.cod_transportadora} value={transportadora.cod_transportadora}>
                          {transportadora.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-[8px]">
                    <label htmlFor="cnpj_cpf_transp" className="block text-blue font-medium">
                      Documento (CNPJ/CPF)
                    </label>
                    <input
                      type="text"
                      id="cnpj_cpf_transp"
                      name="cnpj_cpf_transp"
                      disabled
                      value={formValues.cnpj_cpf_transp}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="razao_social_transp" className="block text-blue font-medium">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      id="razao_social_transp"
                      name="razao_social_transp"
                      disabled
                      value={formValues.razao_social_transp}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo_contribuinte_transp" className="block text-blue font-medium">
                      Tipo de Contribuinte
                    </label>
                    <select
                      id="tipo_contribuinte_transp"
                      name="tipo_contribuinte_transp"
                      value={formValues.tipo_contribuinte_transp || ""}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 bg-white"
                      disabled={visualizando}
                    >
                      <option value="">Selecione</option>
                      <option value="Contribuinte ICMS">Contribuinte ICMS</option>
                      <option value="Contribuinte ISENTO">Contribuinte ISENTO</option>
                      <option value="Não Contribuinte">Não Contribuinte</option>
                    </select>
                  </div>


                  <div>
                    <label htmlFor="insc_estadual_transp" className="block text-blue font-medium">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      id="insc_estadual_transp"
                      name="insc_estadual_transp"
                      value={formValues.insc_estadual_transp}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>

                  <div>
                    <label htmlFor="insc_municipal_transp" className="block text-blue font-medium">
                      Inscrição Municipal
                    </label>
                    <input
                      type="text"
                      id="insc_municipal_transp"
                      name="insc_municipal_transp"
                      value={formValues.insc_municipal_transp}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="mb-2">
                    <label className="block text-blue font-medium mb-1">
                      Usar Endereço da Transp.
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          audio.play();

                          setTimeout(() => {
                            handleUsarEnderecoTransp("sim");
                          }, 100);
                        }}
                        className={`h-[28px] px-8  rounded-full border font-medium ${usarEnderecoTransp === "sim" ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        SIM
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          audio.play();

                          setTimeout(() => {
                            handleUsarEnderecoTransp("nao");
                          }, 100);
                        }}
                        className={`h-[28px] px-8 rounded-full border font-medium ${usarEnderecoTransp === "nao" ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cep_transp" className="block text-blue font-medium">
                      CEP
                    </label>
                    <input
                      id="cep_transp"
                      name="cep_transp"
                      type="text"
                      value={formValues.cep_transp ?? ""}
                      onChange={handleCepInputChangeTransp}
                      maxLength={9}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabledTransp || visualizando}
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="logradouro_transp" className="block text-blue font-medium">
                      Logradouro
                    </label>
                    <input
                      id="logradouro_transp"
                      name="logradouro_transp"
                      type="text"
                      value={formValues.logradouro_transp}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabledTransp || visualizando}
                    />
                  </div>

                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label htmlFor="numero_transp" className="block text-blue font-medium">
                      Número
                    </label>
                    <input
                      id="numero_transp"
                      name="numero_transp"
                      type="text"
                      value={formValues.numero_transp}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabledTransp || visualizando}
                    />
                  </div>
                  <div>
                    <label htmlFor="estado_transp" className="block text-blue font-medium">
                      Estado (sigla)
                    </label>
                    <input
                      id="estado_transp"
                      name="estado_transp"
                      type="text"
                      value={formValues.estado_transp}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabledTransp || visualizando}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label htmlFor="bairro_transp" className="block text-blue font-medium">
                      Bairro
                    </label>
                    <input
                      id="bairro_transp"
                      name="bairro_transp"
                      type="text"
                      value={formValues.bairro_transp}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabledTransp || visualizando}
                    />
                  </div>
                  <div>
                    <label htmlFor="cidade_transp" className="block text-blue font-medium">
                      Cidade
                    </label>
                    <input
                      id="cidade_transp"
                      name="cidade_transp"
                      type="text"
                      value={formValues.cidade_transp}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabledTransp || visualizando}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="estado_uf" className="block text-blue font-medium">
                      UF do Veículo
                    </label>
                    <input
                      type="text"
                      id="estado_uf"
                      name="estado_uf"
                      maxLength={2}
                      disabled={visualizando}
                      value={formValues.estado_uf}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="placa_veiculo" className="block text-blue font-medium">
                      Placa do Veículo
                    </label>
                    <input
                      type="text"
                      id="placa_veiculo"
                      name="placa_veiculo"
                      disabled={visualizando}
                      value={formValues.placa_veiculo}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="reg_nac_trans_carga" className="block text-blue font-medium">
                      Reg. Nac. Transp. Carga
                    </label>
                    <input
                      type="text"
                      id="reg_nac_trans_carga"
                      name="reg_nac_trans_carga"
                      disabled={visualizando}
                      value={formValues.reg_nac_trans_carga}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="modalidade" className="block text-blue font-medium">
                      Modalidade
                    </label>
                    <select
                      id="modalidade"
                      name="modalidade"
                      disabled={visualizando}
                      value={formValues.modalidade}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    >
                      <option value="">Selecione</option>
                      <option value="0">Contratação do Frete por conta do Remetente (CIF)</option>
                      <option value="1">Contratação do Frete por conta do Destinatário (FOB)</option>
                      <option value="2">Contratação do Frete por conta de Terceiros</option>
                      <option value="3">Transporte Próprio por conta do Remetente</option>
                      <option value="4">Transporte Próprio por conta do Destinatário</option>
                      <option value="9">Sem Ocorrência de Transporte</option>
                    </select>
                  </div>
                </div>

              </div>
              {
                //#endregion
              }
              {
                //#region Totais
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Totais</h2>
                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="total_icms" className="block text-blue font-medium">
                      Total ICMS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_icms"
                        name="total_icms"
                        value={totalICMSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          // Permite apenas números e vírgula, substitui vírgula por ponto para parse
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          // Atualiza o input com vírgula para visualização
                          setTotalICMSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_icms: numericValue,
                          }));

                          setTotalICMSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_pis" className="block text-blue font-medium">
                      Total PIS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_pis"
                        name="total_pis"
                        value={totalPISInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalPISInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_pis: numericValue,
                          }));

                          setTotalPISInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_cofins" className="block text-blue font-medium">
                      Total COFINS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_cofins"
                        name="total_cofins"
                        value={totalCOFINSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalCOFINSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_cofins: numericValue,
                          }));

                          setTotalCOFINSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_ipi" className="block text-blue font-medium">
                      Total IPI
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_ipi"
                        name="total_ipi"
                        value={totalIPIInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalIPIInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_ipi: numericValue,
                          }));

                          setTotalIPIInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                </div>
                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="total_produtos" className="block text-blue font-medium">
                      Total Produtos
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm rounded-r-none h-8 !bg-gray-300 cursor-not-allowed"
                      />
                      <input
                        type="text"
                        id="total_produtos"
                        name="total_produtos"
                        disabled
                        value={formValues.total_produtos?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onChange={handleInputChange}
                        className="w-full border border-l-0 border-[#D9D9D9] pl-1 rounded-r-sm rounded-l-none h-8 !bg-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>


                  <div>
                    <label htmlFor="total_frete" className="block text-blue font-medium">
                      Total Frete
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_frete"
                        name="total_frete"
                        value={totalFreteInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalFreteInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_frete: numericValue,
                          }));

                          setTotalFreteInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>


                  <div className="col-span-2">
                    <label htmlFor="total_nf" className="block text-blue font-medium">
                      Total Nota
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm rounded-r-none h-8 !bg-gray-300 cursor-not-allowed"
                      />
                      <input
                        type="text"
                        id="total_nf"
                        name="total_nf"
                        disabled
                        value={formValues.total_nf?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        onChange={handleInputChange}
                        className="w-full border border-l-0 border-[#D9D9D9] pl-1 rounded-r-sm rounded-l-none h-8 !bg-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>

                </div>
                <h2 className="text-blue text-lg font-bold mb-4 pt-4">Lei da Transparência</h2>
                <div className="grid gap-2 grid-cols-4">
                  {/* Impostos Federais */}
                  <div>
                    <label htmlFor="impostos_federais" className="block text-blue font-medium">
                      Impostos Federais
                    </label>
                    <input
                      type="text"
                      id="impostos_federais"
                      name="impostos_federais"
                      disabled
                      value={impostosFederaisInput}
                      onChange={() => { }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>

                  {/* Impostos Estaduais */}
                  <div>
                    <label htmlFor="impostos_estaduais" className="block text-blue font-medium">
                      Impostos Estaduais
                    </label>
                    <input
                      type="text"
                      id="impostos_estaduais"
                      name="impostos_estaduais"
                      disabled
                      value={impostosEstaduaisInput}
                      onChange={() => { }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>

                  {/* Impostos Municipais */}
                  <div>
                    <label htmlFor="impostos_municipais" className="block text-blue font-medium">
                      Impostos Municipais
                    </label>
                    <input
                      type="text"
                      id="impostos_municipais"
                      name="impostos_municipais"
                      disabled
                      value={impostosMunicipaisInput}
                      onChange={() => { }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>


                  <div>
                    <label htmlFor="total_impostos" className="block text-blue font-medium">
                      Total Impostos
                    </label>
                    <input
                      type="text"
                      id="total_impostos"
                      name="total_impostos"
                      disabled
                      value={totalImpostosInput}
                      onChange={() => { }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>

                </div>
              </div>
              {
                //#endregion
              }
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label htmlFor="informacoes_complementares" className="block text-blue font-medium">
                    Informações Complementares
                  </label>
                  <textarea
                    id="informacoes_complementares"
                    name="informacoes_complementares"

                    value={formValues.informacoes_complementares}
                    onChange={(e) => setFormValues(prev => ({ ...prev, informacoes_complementares: e.target.value }))}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24 "
                  />
                </div>

                <div>
                  <label htmlFor="informacoes_fisco" className="block text-blue font-medium">
                    Informações para o Fisco
                  </label>
                  <textarea
                    id="informacoes_fisco"
                    name="informacoes_fisco"

                    value={formValues.informacoes_fisco}
                    onChange={(e) => setFormValues(prev => ({ ...prev, informacoes_fisco: e.target.value }))}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24 "
                  />
                </div>
              </div>
              <Button
                label="console.log(formValues)"
                className="text-black bg-yellow h-8 w-[300px] shadow-lg shadow-black
                active:scale-95 duration-100 transition-all active:translate-y-2 active:shadow-none"
                onClick={() => console.log(formValues)}
              />
            </div>


            <div className="flex justify-between items-center mt-16 w-full">
              <div className={`${visualizando ? "hidden" : ""} grid gap-3 w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
                <Button
                  label="Sair Sem Salvar"
                  className="text-white"
                  icon="pi pi-times"
                  style={{
                    backgroundColor: '#dc3545',
                    border: '1px solid #dc3545',
                    padding: '0.5rem 1.5rem',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                  }}
                  onClick={() => closeModal()}
                />

                {!isEditing ? (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={() => handleSaveReturn(false)}
                      disabled={itemCreateReturnDisabled}
                      style={{
                        backgroundColor: '#007bff',
                        border: '1px solid #007bff',
                        padding: '0.5rem 1.5rem',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                      }}
                    />
                    <Button
                      label="Salvar e Adicionar Outro"
                      className="text-white"
                      disabled={itemCreateDisabled}
                      icon="pi pi-check"
                      onClick={() => handleSaveReturn(true)}
                      style={{
                        backgroundColor: '#28a745',
                        border: '1px solid #28a745',
                        padding: '0.5rem 1.5rem',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                      }}
                    />
                  </>
                ) : (
                  <Button
                    label="Salvar"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={() => handleSaveEdit(formValues.cod_natureza_operacao)}
                    disabled={itemEditDisabled}
                    style={{
                      backgroundColor: '#28a745',
                      border: '1px solid #28a745',
                      padding: '0.5rem 1.5rem',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                    }}
                  />
                )}
              </div>
            </div>

          </Dialog>

          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className=" text-blue text-2xl font-extrabold mb-3 pl-3 mt-1
">
                  Nota Fiscal de Produto
                </h2>
              </div>
              {permissions?.insercao === "SIM" && (
                <div className="mr-2">
                  <RegisterButton onClick={() => { setVisible(true); }} title="Cadastrar" />
                </div>
              )}
            </div>
            <div
              className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col mt-2"
              style={{ height: "95%" }}
            >
              <div className="mb-4 flex justify-end">
                <p className="text-blue font-bold text-lg">Busca:</p>
                <InputText
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder=""
                  className="p-inputtext-sm border rounded-md ml-1 text-black pl-1"
                  style={{
                    border: "1px solid #1B405D80",
                  }}
                />
              </div>
              <DataTable
                value={filteredNfsProdutos.slice(first, first + rows)}
                paginator={true}
                rows={rows}
                rowsPerPageOptions={[5, 10]}
                rowClassName={(data) => 'hover:bg-gray-200'}
                onPage={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                tableStyle={{
                  borderCollapse: "collapse",
                  width: "100%",
                }}
                className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2"
                responsiveLayout="scroll"
              >

                <Column
                  field="nome"
                  header="Nome"
                  style={{
                    width: "1%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={{
                    fontSize: "1.2rem",
                    color: "#1B405D",
                    fontWeight: "bold",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    backgroundColor: "#D9D9D980",
                    verticalAlign: "middle",
                    padding: "10px",
                  }}
                />
                <Column
                  field="cod_grupo_tributacao"
                  header="Tributação"
                  style={{
                    width: "1%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={{
                    fontSize: "1.2rem",
                    color: "#1B405D",
                    fontWeight: "bold",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    backgroundColor: "#D9D9D980",
                    verticalAlign: "middle",
                    padding: "10px",
                  }}
                />
                <Column
                  field="padrao"
                  header="Padrão"
                  style={{
                    width: "0.5%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={{
                    fontSize: "1.2rem",
                    color: "#1B405D",
                    fontWeight: "bold",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    backgroundColor: "#D9D9D980",
                    verticalAlign: "middle",
                    padding: "10px",
                  }}
                />
                <Column
                  field="cod_cfop_interno"
                  header="CFOP Interno"
                  style={{
                    width: "0.5%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={{
                    fontSize: "1.2rem",
                    color: "#1B405D",
                    fontWeight: "bold",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    backgroundColor: "#D9D9D980",
                    verticalAlign: "middle",
                    padding: "10px",
                  }}
                />
                <Column
                  header=""
                  body={(rowData) => (
                    <div className="flex gap-2 justify-center">
                      <ViewButton onClick={() => handleEdit(rowData, true)} />
                    </div>
                  )}
                  className="text-black"
                  style={{
                    width: "0%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={{
                    fontSize: "1.2rem",
                    color: "#1B405D",
                    fontWeight: "bold",
                    border: "1px solid #ccc",
                    textAlign: "center",
                    backgroundColor: "#D9D9D980",
                    verticalAlign: "middle",
                    padding: "10px",
                  }}
                />
                {permissions?.edicao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <EditButton onClick={() => handleEdit(rowData, false)} />
                      </div>
                    )}
                    className="text-black"
                    style={{
                      width: "0%",
                      textAlign: "center",
                      border: "1px solid #ccc",
                    }}
                    headerStyle={{
                      fontSize: "1.2rem",
                      color: "#1B405D",
                      fontWeight: "bold",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      backgroundColor: "#D9D9D980",
                      verticalAlign: "middle",
                      padding: "10px",
                    }}
                  />
                )}
                {permissions?.delecao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <CancelButton onClick={() => openDialog(rowData.cod_natureza_operacao)} />
                      </div>
                    )}
                    className="text-black"
                    style={{
                      width: "0%",
                      textAlign: "center",
                      border: "1px solid #ccc",
                    }}
                    headerStyle={{
                      fontSize: "1.2rem",
                      color: "#1B405D",
                      fontWeight: "bold",
                      border: "1px solid #ccc",
                      textAlign: "center",
                      backgroundColor: "#D9D9D980",
                      verticalAlign: "middle",
                      padding: "10px",
                    }}
                  />
                )}
              </DataTable>
            </div>
          </div>
        </div >
      </SidebarLayout >
      <Footer />
    </>
  );
};

export default NfsProduto;
function setSelectedNfsProduto(arg0: any[]) {
  throw new Error("Function not implemented.");
}

