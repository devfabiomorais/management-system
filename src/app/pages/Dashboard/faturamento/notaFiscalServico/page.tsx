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
import type { NfsServico } from "@/services/faturamento/nfsServicos";
import { fetchNfsServicos } from "@/services/faturamento/nfsServicos";
import { fetchGruposTributacao, GrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { Cfop, fetchCfops } from "@/services/faturamento/cfops";
import NaturezaOperacao from "../naturezaOperacao/page";
import { fetchNaturezaOperacao } from "@/services/faturamento/naturezaOperacao";
import { fetchFornecedores, Fornecedor } from "@/services/commercial/fornecedores";
import type { Client } from "@/services/commercial/clients";
import { fetchClients } from "@/services/commercial/clients";
import { FaTimes } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import AddButton from "@/app/components/Buttons/AddButton";
import { AtividadesServicos, fetchAtividadesServicos } from "@/services/faturamento/atividadesServicos";
import { AiFillFilePdf } from "react-icons/ai";
import { GiCalculator } from "react-icons/gi";
import { TbFileTypeXml, TbInvoice } from "react-icons/tb";



const NfsServico: React.FC = () => {
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

  const [nfsServicos, setNfsServicos] = useState<NfsServico[]>([]);
  const [selectedNfsServico, setSelectedNfsServico] = useState<NfsServico | null>(null);

  // useEffect para carregar os dados ao montar a página
  useEffect(() => {
    const carregarNfsServicos = async () => {
      const nfs = await fetchNfsServicos(token);
      setNfsServicos(nfs);
    };

    carregarNfsServicos();
  }, [token]);

  const filteredNfsServicos = (nfsServicos ?? []).filter((nfs) => {
    if (nfs.situacao !== 'Ativo') return false;

    return Object.values(nfs).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });




  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [NfsServicosIdToDelete, setNfsServicoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<NfsServico>({
    cod_nf_servico: 0,
    numero_rps: undefined,
    serie: undefined,
    cod_natureza_operacao: undefined,
    dt_emissao: undefined,
    hr_emissao: undefined,
    cod_entidade: undefined,
    cnpj_cpf_ent: "",
    telefone_ent: "",
    celular_ent: "",
    email_ent: "",
    razao_social_ent: "",
    tipo_contribuinte_ent: "Cliente",
    insc_estadual_ent: "",
    insc_municipal_ent: "",
    cep_ent: "",
    logradouro_ent: "",
    numero_ent: undefined,
    estado_ent: "",
    bairro_ent: "",
    cidade_ent: "",
    cod_atividade_servico: undefined,
    descricao_servico: "",
    total_icms: undefined,
    aliquota_icms: undefined,
    total_cofins: undefined,
    aliquota_cofins: undefined,
    total_pis: undefined,
    aliquota_pis: undefined,
    total_csll: undefined,
    aliquota_csll: undefined,
    total_ir: undefined,
    aliquota_ir: undefined,
    total_inss: undefined,
    aliquota_inss: undefined,
    observacoes: "",
    informacoes_adicionais: "",
    descontar_impostos: "Sim",
    total_nf: undefined,
    valor_servicos: undefined,
    valor_deducoes: undefined,
    valor_iss: undefined,
    aliquota: undefined,
    descontos: undefined,
    base_calculo: undefined,
    iss_retido: undefined,
    situacao: "Ativo",
    item_lista_servico: "",
    venc_fatura: undefined,
  });


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_nf_servico: 0,
      numero_rps: undefined,
      serie: undefined,
      cod_natureza_operacao: undefined,
      dt_emissao: undefined,
      hr_emissao: undefined,
      cod_entidade: undefined,
      cnpj_cpf_ent: "",
      telefone_ent: "",
      celular_ent: "",
      email_ent: "",
      razao_social_ent: "",
      tipo_contribuinte_ent: "Cliente",
      insc_estadual_ent: "",
      insc_municipal_ent: "",
      cep_ent: "",
      logradouro_ent: "",
      numero_ent: undefined,
      estado_ent: "",
      bairro_ent: "",
      cidade_ent: "",
      cod_atividade_servico: undefined,
      descricao_servico: "",
      total_icms: undefined,
      aliquota_icms: undefined,
      total_cofins: undefined,
      aliquota_cofins: undefined,
      total_pis: undefined,
      aliquota_pis: undefined,
      total_csll: undefined,
      aliquota_csll: undefined,
      total_ir: undefined,
      aliquota_ir: undefined,
      total_inss: undefined,
      aliquota_inss: undefined,
      observacoes: "",
      informacoes_adicionais: "",
      descontar_impostos: "Sim",
      total_nf: undefined,
      valor_servicos: undefined,
      valor_deducoes: undefined,
      valor_iss: undefined,
      aliquota: undefined,
      descontos: undefined,
      base_calculo: undefined,
      iss_retido: undefined,
      situacao: "Ativo",
      item_lista_servico: "",
      venc_fatura: undefined,
    });
    setSelectedEstablishments([]);
  };


  const handleSaveEdit = async (cod_nf_servico: any) => {
    try {

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/edit/${cod_nf_servico}`,
        formValues,
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
        const novasNfsServicos = await fetchNfsServicos(token);
        setNfsServicos(novasNfsServicos);
        toast.success("Nota Fiscal de Serviço editada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao editar Nota Fiscal de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao editar Nota Fiscal de Serviço:", error);
    }
  };


  const [rowData, setRowData] = useState<NfsServico[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {


      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/register`,
        { ...formValues },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Nota Fiscal de Serviço salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        const novasNaturezas = await fetchNfsServicos(token);
        setNfsServicos(novasNaturezas);
        clearInputs();
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar Nota Fiscal de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar Nota Fiscal de Serviço:", error);
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

  const handleEdit = (NfsServicos: any, visualizar: boolean) => {
    console.log(NfsServicos)
    setVisualizar(visualizar);

    setFormValues(NfsServicos);



    setSelectedNfsServico(NfsServicos);
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
    setNfsServicoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setNfsServicoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (NfsServicosIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/cancel/${NfsServicosIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const novasNaturezas = await fetchNfsServicos(token);
        setNfsServicos(novasNaturezas);
        setModalDeleteVisible(false);
        toast.success("Nota Fiscal de Serviço cancelada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Nota Fiscal de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar Nota Fiscal de Serviço:", error);
      toast.error("Erro ao cancelar Nota Fiscal de Serviço. Tente novamente.", {
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
          insc_estadual_ent: entidade.insc_estadual,
          insc_municipal_ent: entidade.insc_municipal,
          ...(usarEndereco === true
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
          telefone_ent: entidade.telefone || "",
          celular_ent: entidade.celular || "",
          email_ent: entidade.email || "",
          insc_estadual_ent: entidade.insc_estadual,
          insc_municipal_ent: entidade.insc_municipal,
          ...(usarEndereco === true
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



  const handleUsarEndereco = (valor: string) => {
    setUsarEndereco(valor);

    if (valor === true) {
      setIsDisabled(true);
      if (entidadeSelecionada) {
        restaurarEnderecoDaEntidade(entidadeSelecionada);
      }
    } else {
      setIsDisabled(false);
      clearInputsEndereco();
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


  const [totalsInput, setTotalsInput] = useState({
    total_pis: formValues.total_pis?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '',
    total_cofins: formValues.total_cofins?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '',
    total_csll: formValues.total_csll?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '',
    total_ir: formValues.total_ir?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '',
    total_inss: formValues.total_inss?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '',
  });
  const handleTotalsChange = (key: keyof typeof totalsInput, value: string) => {
    setTotalsInput(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const [totalComAliquota, setTotalComAliquota] = useState('0,00');

  useEffect(() => {
    if (formValues.descontar_impostos === 'Sim') {
      const totais = [
        formValues.total_icms,
        formValues.total_cofins,
        formValues.total_pis,
        formValues.total_csll,
        formValues.total_ir,
        formValues.total_inss,
      ];

      const aliquotas = [
        formValues.aliquota_icms,
        formValues.aliquota_cofins,
        formValues.aliquota_pis,
        formValues.aliquota_csll,
        formValues.aliquota_ir,
        formValues.aliquota_inss,
      ];

      const somaTotais = totais.reduce((acc, val) => (acc ?? 0) + (parseFloat(val as any) || 0), 0);
      const somaAliquotas = aliquotas.reduce((acc, val) => (acc ?? 0) + (parseFloat(val as any) || 0), 0);

      const resultado = (somaTotais ?? 0) * (somaAliquotas ?? 0);

      const resultadoFormatado = resultado.toFixed(2).replace('.', ',');

      setTotalComAliquota(resultadoFormatado);

      setFormValues((prevValues) => ({
        ...prevValues,
        total_nf: parseFloat(resultadoFormatado.replace(',', '.')) || 0,
      }));
    } else {
      // Se não descontar impostos, zera o total ou mantém conforme a regra de negócio
      setTotalComAliquota('0,00');

      setFormValues((prevValues) => ({
        ...prevValues,
        total_nf: 0,
      }));
    }
  }, [
    formValues.descontar_impostos,
    formValues.total_icms,
    formValues.aliquota_icms,
    formValues.total_cofins,
    formValues.aliquota_cofins,
    formValues.total_pis,
    formValues.aliquota_pis,
    formValues.total_csll,
    formValues.aliquota_csll,
    formValues.total_ir,
    formValues.aliquota_ir,
    formValues.total_inss,
    formValues.aliquota_inss,
  ]);




  const [atividadesServicos, setAtividadesServicos] = useState<AtividadesServicos[]>([]);
  const [selectedAtividadesServicos, setSelectedAtividadesServicos] = useState<AtividadesServicos[]>([]);

  // useEffect para carregar dados
  useEffect(() => {
    const carregarAtividades = async () => {
      const atividades = await fetchAtividadesServicos(token);
      setAtividadesServicos(atividades);
    };

    carregarAtividades();
  }, [token]);

  async function gerarXmlNotaDownload(nfsServico: NfsServico) {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/nfse/gerar-xml",
        nfsServico,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'text', // mantém como texto puro
        }
      );

      const xml = response.data;

      // Cria um blob do tipo XML
      const blob = new Blob([xml], { type: 'application/xml' });

      // Cria uma URL temporária
      const url = window.URL.createObjectURL(blob);

      // Cria um link de download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedNfsServico ? selectedNfsServico.cod_nf_servico : ''}-XML-NFS-e.xml`;

      document.body.appendChild(link);
      link.click();

      // Limpa o link e a URL temporária
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return xml;
    } catch (error) {
      console.error('Erro ao gerar XML:', error);
      throw error;
    }
  }


  async function gerarXmlNota(nfsServico: NfsServico) {
    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/nfse/gerar-xml",
        nfsServico,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'text', // mantém como texto puro
        }
      );

      const xml = response.data;

      return xml;
    } catch (error) {
      console.error('Erro ao gerar XML:', error);
      throw error;
    }
  }

  const [xmlSaida, setXmlSaida] = useState<string | null>(null);

  async function gerarNFSe(nfsServico: NfsServico) {
    setLoading(true);

    const xml = await gerarXmlNota(nfsServico);

    if (!xml) {
      toast.error("Erro ao gerar XML para gerar NFSe");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/nfse/emitir-nfse",
        { xml },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'text', // Recebe como texto
        }
      );

      const XMLsaida = response.data;
      console.log("RESPONSE DATA:", XMLsaida);

      try {
        const data = JSON.parse(XMLsaida);
        console.log("DATA PARSED:", data);

        if (data.message) {
          toast.success(data.message);
        }

        const { xmlResposta } = data;
        console.log("XML RESPOSTA:", xmlResposta);

        if (xmlResposta) {
          setXmlSaida(xmlResposta);
        }

        setLoading(false);
        return data;

      } catch (parseError) {
        console.error("Erro ao fazer parse do retorno:", parseError);
        toast.error("Erro ao interpretar retorno da NFS-e");
        setLoading(false);
      }

    } catch (error: any) {
      console.error('Erro ao emitir NFS-e:', error);
      setLoading(false);

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Erro ao emitir NFS-e');
      }

      throw error;
    }
  }

  const [LoadingPDF, setLoadingPDF] = useState<boolean>(false);

  async function gerarPdfDanfe(xml: string) {
    setLoadingPDF(true);

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/nfse/gerar-pdf",
        { xml },
        {
          responseType: 'blob',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = window.URL.createObjectURL(pdfBlob);

      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>DANFSe PDF</title></head>
            <body style="margin:0">
              <iframe 
                src="${pdfUrl}" 
                frameborder="0" 
                style="border:none; width:100vw; height:100vh"
                allowfullscreen>
              </iframe>
            </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        // Popup bloqueado, faz o download como fallback
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'danfse.pdf';
        link.click();
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Falha ao gerar o PDF. Veja o console para detalhes.');
    } finally {
      setLoadingPDF(false);
    }
  }




  return (
    <>
      {(loading || LoadingPDF) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999]">
          <BeatLoader
            color={color}
            loading={(loading || LoadingPDF)}
            size={30}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
        </div>
      )}

      <SidebarLayout>
        <div className="flex justify-center">
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
            <p>Tem certeza que deseja cancelar este Nota Fiscal de Serviço?</p>
          </Dialog>



          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Nota Fiscal de Serviço" : "Editar Nota Fiscal de Serviço") : "Nova Nota Fiscal de Serviço"}
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

            {visualizando && (
              <div className={`flex gap-10 justify-center items-center pt-4 pb-4`}>

                <button
                  className={`${LoadingPDF ? 'bg-gray-400 cursor-not-allowed' : '!bg-red500 hover:bg-red700 hover:scale-125'}
    text-white rounded flex items-center gap-2 p-0 transition-all duration-150`}
                  onClick={() => {
                    if (!LoadingPDF) {
                      if (xmlSaida) {
                        gerarPdfDanfe(xmlSaida);
                      } else {
                        toast.error("Primeiro gere a NFS-e!");
                      }
                    }
                  }}
                  disabled={LoadingPDF}
                >
                  <div className={`${LoadingPDF ? 'bg-gray-600' : 'bg-red700'} w-10 h-10 flex items-center justify-center rounded`}>
                    <AiFillFilePdf className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap px-2">
                    {LoadingPDF ? 'Aguarde...' : 'PDF da NF-e'}&nbsp;&nbsp;
                  </span>
                </button>


                <button
                  className={`!bg-green-600 text-white rounded flex items-center gap-2 p-0 transition-all duration-50
    ${!xmlSaida ? 'bg-gray-400 cursor-not-allowed opacity-60' : 'hover:bg-green-800 hover:scale-125'}
  `}
                  onClick={async () => {
                    if (selectedNfsServico && xmlSaida) {
                      gerarXmlNotaDownload(selectedNfsServico);
                    }
                  }}
                  disabled={!xmlSaida}
                  title={!xmlSaida ? "Disponível somente após a emissão da NFS-e com sucesso" : "Baixar XML da NFS-e"}
                >
                  <div className="bg-green-800 w-10 h-10 flex items-center justify-center rounded">
                    <TbFileTypeXml className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap px-2">XML da NFS-e&nbsp;&nbsp;</span>
                </button>

                <button
                  className={`${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-cyan-500 hover:scale-125'
                    } text-white rounded flex items-center gap-2 p-0 transition-all duration-150`}
                  onClick={async () => {
                    if (!loading && selectedNfsServico) {
                      gerarNFSe(selectedNfsServico);
                    }
                  }}
                  disabled={loading}
                >
                  <div className="bg-cyan-700 w-10 h-10 flex items-center justify-center rounded">
                    <TbInvoice className="text-white" style={{ fontSize: '24px' }} />
                  </div>
                  <span className="whitespace-nowrap px-2">
                    {loading ? 'Aguarde...' : 'Gerar NFS-e'}&nbsp;&nbsp;
                  </span>
                </button>


              </div>
            )}


            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid gap-2 grid-cols-4">
                <div>
                  <label htmlFor="numero_rps" className="block text-blue font-medium">
                    Nº RPS
                  </label>
                  <input
                    type="number"
                    id="numero_rps"
                    name="numero_rps"
                    disabled
                    value={formValues.numero_rps}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200 cursor-not-allowed"
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
              </div>


              {
                // #region Cliente
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Cliente</h2>

                <div className="grid grid-cols-4 gap-2">

                  <div className="col-span-3">
                    <label htmlFor="clients" className="block text-blue font-medium">
                      Cliente
                    </label>
                    <select
                      id="clients"
                      name="clients"
                      value={formValues.cod_entidade || ""}
                      onChange={(e) => {
                        handleSelectEntidade(e.target.value);
                      }}
                      className={`w-full pl-1 rounded-sm h-8 ${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'}`}
                      disabled={visualizando}
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {clients.map((cliente) => (
                        <option key={cliente.cod_cliente} value={cliente.cod_cliente}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="">
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

                <div className="grid grid-cols-3 gap-2">

                  <div className="">
                    <label htmlFor="telefone_ent" className="block text-blue font-medium">
                      Telefone
                    </label>
                    <input
                      type="text"
                      id="telefone_ent"
                      name="telefone_ent"
                      value={formValues.telefone_ent || ""}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                      disabled={visualizando}
                    />
                  </div>

                  <div className="">
                    <label htmlFor="celular_ent" className="block text-blue font-medium">
                      Celular
                    </label>
                    <input
                      type="text"
                      id="celular_ent"
                      name="celular_ent"
                      value={formValues.celular_ent || ""}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                      disabled={visualizando}
                    />
                  </div>

                  <div className="">
                    <label htmlFor="email_ent" className="block text-blue font-medium">
                      Email
                    </label>
                    <input
                      type="text"
                      id="email_ent"
                      name="email_ent"
                      disabled
                      value={formValues.email_ent}
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
                      disabled
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
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
                      disabled
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
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
                          //audio.play();

                          setTimeout(() => {
                            handleUsarEndereco("sim");
                          }, 100);
                        }}
                        className={`h-[28px] px-8  rounded-full border font-medium ${usarEndereco === true ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        SIM
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          //audio.play();

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
                //#region Servicos
              }
              <div className="border border-gray-300 rounded space-y-1 p-2 bg-gray-50 mt-2 ">
                <div className="flex items-center top-0">
                  <h3 className="text-blue text-lg font-bold pt-1 mr-1">Serviços</h3>
                </div>
                <div style={{ height: "16px" }}></div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="descricao_servico" className="block text-blue font-medium">
                      Descrição do Serviço
                    </label>
                    <textarea
                      id="descricao_servico"
                      name="descricao_servico"
                      value={formValues.descricao_servico}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descricao_servico: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="atividade_servico" className="block text-blue font-medium">
                      Atividade do Serviço
                    </label>
                    <select
                      id="atividade_servico"
                      name="atividade_servico"
                      value={formValues.cod_atividade_servico || ''}  // Garante que mostre a opção selecionada
                      disabled={visualizando}
                      onChange={(e) => {
                        const selectedCod = Number(e.target.value);
                        setFormValues((prev) => ({
                          ...prev,
                          cod_atividade_servico: selectedCod,
                        }));

                        const atividadeSelecionada = atividadesServicos.find(
                          (atividade) => atividade.cod_atividade_servico === selectedCod
                        );

                        setSelectedAtividadesServicos(atividadeSelecionada ? [atividadeSelecionada] : []);
                      }}

                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {atividadesServicos.map((atividade) => (
                        <option key={atividade.cod_atividade_servico} value={atividade.cod_atividade_servico}>
                          {atividade.cod_atividade_servico}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="">
                    <label htmlFor="item_lista_servico" className="block text-blue font-medium">
                      Item da Lista de Serviço
                    </label>
                    <input
                      type="text"
                      id="item_lista_servico"
                      name="item_lista_servico"
                      value={formValues.item_lista_servico}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          item_lista_servico: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="ctm" className="block text-blue font-medium">
                      Cód Tributação Municipal
                    </label>
                    <input
                      type="text"
                      id="ctm"
                      name="ctm"
                      value={selectedAtividadesServicos[0]?.cod_tributacao}
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 cursor-not-allowed !bg-gray-300`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="cnae" className="block text-blue font-medium">
                      CNAE
                    </label>
                    <input
                      type="text"
                      id="cnae"
                      name="cnae"
                      value={selectedAtividadesServicos[0]?.cnae}
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 cursor-not-allowed !bg-gray-300`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="descricao_atividade" className="block text-blue font-medium">
                      Descrição da Atividade
                    </label>
                    <input
                      type="text"
                      id="descricao_atividade"
                      name="descricao_atividade"
                      value={selectedAtividadesServicos[0]?.descricao || ""}
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 cursor-not-allowed !bg-gray-300`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="">
                    <label htmlFor="valor_servicos" className="block text-blue font-medium">
                      Valor dos Serviços
                    </label>
                    <input
                      type="text"
                      id="valor_servicos"
                      name="valor_servicos"
                      value={formValues.valor_servicos}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          valor_servicos: Number(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="base_calculo" className="block text-blue font-medium">
                      Base de Cálculo
                    </label>
                    <input
                      type="number"
                      id="base_calculo"
                      name="base_calculo"
                      value={formValues.base_calculo}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          base_calculo: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="aliquota" className="block text-blue font-medium">
                      %Alíquota
                    </label>
                    <input
                      type="number"
                      id="aliquota"
                      name="aliquota"
                      value={formValues.aliquota}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          aliquota: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="">
                    <label htmlFor="valor_deducoes" className="block text-blue font-medium">
                      Valor Deduções
                    </label>
                    <input
                      type="number"
                      id="valor_deducoes"
                      name="valor_deducoes"
                      value={formValues.valor_deducoes}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          valor_deducoes: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="descontos" className="block text-blue font-medium">
                      Descontos
                    </label>
                    <input
                      type="number"
                      id="descontos"
                      name="descontos"
                      value={formValues.descontos}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descontos: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="valor_iss" className="block text-blue font-medium mb-1">
                      Valor ISS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="valor_iss"
                        name="valor_iss"
                        value={formValues.valor_iss ?? ""}
                        disabled={visualizando}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            valor_iss: parseFloat(e.target.value),
                          }))
                        }
                        className={`flex-1 w-[100px] border border-[#D9D9D9] rounded-l-sm h-8 `}
                      />
                      <Button
                        label={formValues.iss_retido === true ? "Retido" : "̶R̶̶e̶̶t̶̶i̶̶d̶̶o̶"}
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            iss_retido: prev.iss_retido === true ? "Não" : "Sim",
                          }))
                        }
                        className={`h-8 w-[80px] rounded-l-none rounded-r-sm text-white text-sm transition-all
                          ${formValues.iss_retido === true ? 'bg-blue400 hover:bg-blue175' : 'bg-gray-200 hover:bg-gray-400'}                          
                          focus:outline-none focus:ring-0 focus:border-none
                        `}

                      />
                    </div>

                  </div>

                </div>
              </div>



              {
                //#region Totais
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Totais</h2>
                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="aliquota_cofins" className="block text-blue font-medium">
                      %COFINS
                    </label>
                    <div className="flex items-center">

                      <input
                        type="number"
                        id="aliquota_cofins"
                        name="aliquota_cofins"
                        value={formValues.aliquota_cofins}
                        onChange={(e) => {

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            aliquota_cofins: parseFloat(e.target.value),
                          }))
                        }
                        }
                        disabled={visualizando}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border  pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="aliquota_pis" className="block text-blue font-medium">
                      %PIS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="aliquota_pis"
                        name="aliquota_pis"
                        value={formValues.aliquota_pis}
                        disabled={visualizando}
                        onChange={(e) => {

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            aliquota_pis: parseFloat(e.target.value),
                          }))
                        }
                        }
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="aliquota_csll" className="block text-blue font-medium">
                      %CSLL
                    </label>
                    <div className="flex items-center">

                      <input
                        type="number"
                        id="aliquota_csll"
                        name="aliquota_csll"
                        value={formValues.aliquota_csll}
                        disabled={visualizando}
                        onChange={(e) => {

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            aliquota_csll: parseFloat(e.target.value),
                          }))
                        }
                        }
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="aliquota_ir" className="block text-blue font-medium">
                      %IR
                    </label>
                    <div className="flex items-center">

                      <input
                        type="number"
                        id="aliquota_ir"
                        name="aliquota_ir"
                        value={formValues.aliquota_ir}
                        disabled={visualizando}
                        onChange={(e) => {

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            aliquota_ir: parseFloat(e.target.value),
                          }))
                        }
                        }
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                </div>

                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="total_cofins" className="block text-blue font-medium">
                      Valor COFINS
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
                        disabled={visualizando}
                        value={totalsInput.total_cofins}
                        onChange={(e) => handleTotalsChange('total_cofins', e.target.value)}
                        onBlur={() => {
                          const numericValue = parseFloat(
                            totalsInput.total_cofins.replace(/\./g, '').replace(',', '.')
                          );

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_cofins: numericValue,
                          }));

                          setTotalsInput((prev) => ({
                            ...prev,
                            total_cofins: !isNaN(numericValue)
                              ? numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '',
                          }));
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'
                          } border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />


                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_pis" className="block text-blue font-medium">
                      Valor PIS
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
                        disabled={visualizando}
                        value={totalsInput.total_pis}
                        onChange={(e) => handleTotalsChange('total_pis', e.target.value)}
                        onBlur={() => {
                          const numericValue = parseFloat(
                            totalsInput.total_pis.replace(/\./g, '').replace(',', '.')
                          );

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_pis: numericValue,
                          }));

                          setTotalsInput((prev) => ({
                            ...prev,
                            total_pis: !isNaN(numericValue)
                              ? numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '',
                          }));
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'
                          } border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />
                    </div>
                  </div>


                  <div>
                    <label htmlFor="total_csll" className="block text-blue font-medium">
                      Valor CSLL
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
                        id="total_csll"
                        name="total_csll"
                        disabled={visualizando}
                        value={totalsInput.total_csll}
                        onChange={(e) => handleTotalsChange('total_csll', e.target.value)}
                        onBlur={() => {
                          const numericValue = parseFloat(
                            totalsInput.total_csll.replace(/\./g, '').replace(',', '.')
                          );

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_csll: numericValue,
                          }));

                          setTotalsInput((prev) => ({
                            ...prev,
                            total_csll: !isNaN(numericValue)
                              ? numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '',
                          }));
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'
                          } border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />
                    </div>
                  </div>


                  <div>
                    <label htmlFor="total_ir" className="block text-blue font-medium">
                      Valor IR
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
                        id="total_ir"
                        name="total_ir"
                        disabled={visualizando}
                        value={totalsInput.total_ir}
                        onChange={(e) => handleTotalsChange('total_ir', e.target.value)}
                        onBlur={() => {
                          const numericValue = parseFloat(
                            totalsInput.total_ir.replace(/\./g, '').replace(',', '.')
                          );

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_ir: numericValue,
                          }));

                          setTotalsInput((prev) => ({
                            ...prev,
                            total_ir: !isNaN(numericValue)
                              ? numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '',
                          }));
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'
                          } border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />
                    </div>
                  </div>


                </div>

                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="aliquota_inss" className="block text-blue font-medium">
                      %INSS
                    </label>
                    <div className="flex items-center">

                      <input
                        type="number"
                        id="aliquota_inss"
                        name="aliquota_inss"
                        value={formValues.aliquota_inss}
                        disabled={visualizando}
                        onChange={(e) => {

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            aliquota_inss: parseFloat(e.target.value),
                          }))
                        }
                        }
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_inss" className="block text-blue font-medium">
                      Valor INSS
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
                        id="total_inss"
                        name="total_inss"
                        disabled={visualizando}
                        value={totalsInput.total_inss}
                        onChange={(e) => handleTotalsChange('total_inss', e.target.value)}
                        onBlur={() => {
                          const numericValue = parseFloat(
                            totalsInput.total_inss.replace(/\./g, '').replace(',', '.')
                          );

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_inss: numericValue,
                          }));

                          setTotalsInput((prev) => ({
                            ...prev,
                            total_inss: !isNaN(numericValue)
                              ? numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                              : '',
                          }));
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'
                          } border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />
                    </div>
                  </div>


                  <div>
                    <label htmlFor="total_icms" className="block text-blue font-medium">
                      Descontar Impostos
                    </label>
                    <div className="flex items-center">

                      <select
                        id="total_icms"
                        name="total_icms"
                        value={formValues.descontar_impostos}
                        disabled={visualizando}
                        onChange={(e) => {
                          setFormValues((prevValues) => ({
                            ...prevValues,
                            descontar_impostos: e.target.value === true ? "Sim" : e.target.value === "Não" ? "Não" : undefined,
                          }));
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'
                          } border  pl-1 rounded-r-sm h-8 w-full`}
                      >
                        <option disabled value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                      </select>
                    </div>
                  </div>


                  <div>
                    <label htmlFor="total_nf" className="block text-blue font-medium">
                      Total Nota
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 !bg-gray-300 !border-gray-400 rounded-l-sm rounded-r-none h-8"
                      />
                      <input
                        type="text"
                        id="total_nf"
                        name="total_nf"
                        value={totalComAliquota}
                        disabled
                        readOnly
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : '!bg-gray-300 !border-gray-400 border-l-gray-300'} border border-l-0 pl-1 rounded-r-sm rounded-l-none h-8 w-full`}
                      />

                    </div>
                  </div>

                </div>
              </div>
              {
                //#endregion
              }

              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label htmlFor="observacoes" className="block text-blue font-medium">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"

                    value={formValues.observacoes}
                    onChange={(e) => setFormValues(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24 "
                  />
                </div>

                <div>
                  <label htmlFor="informacoes_adicionais" className="block text-blue font-medium">
                    Informações Adicionais
                  </label>
                  <textarea
                    id="informacoes_adicionais"
                    name="informacoes_adicionais"

                    value={formValues.informacoes_adicionais}
                    onChange={(e) => setFormValues(prev => ({ ...prev, informacoes_adicionais: e.target.value }))}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24 "
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2 grid-cols-4">
              <div className="col-start-4 col-span-1">
                <label htmlFor="venc_fatura" className="block text-blue font-medium">
                  Vencimento da Fatura
                </label>
                <input
                  type="date"
                  id="venc_fatura"
                  name="venc_fatura"
                  className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                  disabled={visualizando}
                  value={!isEditing ?
                    (formValues.venc_fatura ? new Date(formValues.venc_fatura).toISOString().split("T")[0] : "") :
                    (formValues.venc_fatura ? new Date(formValues.venc_fatura).toISOString().split("T")[0] : "")}


                  onChange={(e) => {
                    const value = e.target.value;
                    setFormValues((prevValues) => ({
                      ...prevValues,
                      venc_fatura: value ? new Date(value) : undefined,
                    }));
                  }}
                />
              </div>
            </div>
            <Button
              label="console.log(formValues)"
              className="text-black bg-yellow h-8 w-[300px] shadow-lg shadow-black
                active:scale-95 duration-100 transition-all active:translate-y-2 active:shadow-none"
              onClick={() => console.log(formValues)}
            />


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
                    onClick={() => handleSaveEdit(formValues.cod_nf_servico)}
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
                  Nota Fiscal de Serviço
                </h2>
              </div>
              {permissions?.insercao === permissions?.insercao && (
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
                value={filteredNfsServicos.slice(first, first + rows)}
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
                  field="numero_rps"
                  header="Número"
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
                  field="pedido"
                  header="Pedido"
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
                  field="dt_emissao"
                  header="Data"
                  style={{
                    width: "2%",
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
                  body={(rowData) => {
                    const date = new Date(rowData.dt_emissao);
                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(date);

                    return <span>{formattedDate}</span>;
                  }}
                />

                <Column
                  field="razao_social_ent"
                  header="Destinatário"
                  style={{
                    width: "4%",
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
                  field="cod_natureza_operacao"
                  header="Natureza da Operação"
                  style={{
                    width: "4%",
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
                  field="situacao"
                  header="Situação"
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
                  field="total_nf"
                  header="Valor"
                  body={(rowData) => {
                    return `R$ ${new Intl.NumberFormat('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(rowData.total_nf)}`;
                  }}
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
                {permissions?.edicao === permissions?.edicao && (
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
                {permissions?.delecao === permissions?.delecao && (
                  <Column
                    header=""
                    body={() => (
                      <div className="flex gap-2 justify-center opacity-20 cursor-not-allowed"
                        title="Funcionalidade indisponível no momento">
                        <CancelButton
                          onClick={() => { }}
                        />
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

export default NfsServico;
function setSelectedNfsServico(arg0: any[]) {
  throw new Error("Function not implemented.");
}

