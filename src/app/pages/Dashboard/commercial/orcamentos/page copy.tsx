"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { FaTimes, FaPlus } from "react-icons/fa";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import ServicosPage from "../services/page";

interface Orcamento {
  cod_orcamento: number;
  cod_responsavel: number;
  cod_cliente: number;
  canal_venda: string;
  data_venda: Date;
  prazo: Date;
  cod_centro_custo: number;
  frota: string;
  nf_compra: string;
  cod_transportadora: number;
  frete: number;
  endereco_cliente: string;
  logradouro: string;
  cidade: string;
  bairro: string;
  estado: string;
  complemento?: string;
  numero: number;
  cep: string;
  observacoes_gerais?: string;
  observacoes_internas?: string;
  desconto_total: number;
}

interface Client {
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
}

interface CentroCusto {
  cod_centro_custo: number;
  nome: string;
  descricao?: string;
}

interface Servico {
  cod_servico: number;
  nome: string;
  descricao?: string;
  valor_venda?: string;
  valor_custo?: string;
  comissao?: string;
  dtCadastro?: string;
}

//mesma coisa que ITENS
interface Produto {
  cod_item: string;
  descricao: string;
  narrativa: string;
  valor_venda?: string;
  valor_custo?: string;
  dbs_unidades_medida?: {
    un?: string;
    cod_un: number;
  };
  dbs_familias?: {
    cod_familia: number;
    nome: string;
    descricao: string;
  };
  dbs_estabelecimentos_item?: Array<{
    cod_estabel: number;
    cod_estabel_item: number;
    cod_item: string;
  }>;
  cod_un: { cod_un: number; un: string; descricao: string } | null;
  cod_familia: { cod_familia: number; nome: string; descricao: string } | null;
  cod_estabelecimento: string[];
  dt_hr_criacao?: string;
  anexo?: File | null;
  situacao: string;
}

const OrcamentosPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Comercial");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");
  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] =
    useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [visibleProd, setVisibleProd] = useState(false);
  const [visibleServ, setVisibleServ] = useState(false);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [orcamentoIdToDelete, setOrcamentoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingProd, setIsEditingProd] = useState<boolean>(false);
  const [isEditingServ, setIsEditingServ] = useState<boolean>(false);

  //ORÇAMENTOS
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const filteredOrcamentos = orcamentos.filter((orcamento) =>
    orcamento.logradouro.toLowerCase().includes(search.toLowerCase())
  );
  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);
  const [formValues, setFormValues] = useState<Orcamento>({
    cod_orcamento: 0,
    cod_responsavel: 0,
    cod_cliente: 0,
    canal_venda: "",
    data_venda: new Date(),
    prazo: new Date(),
    cod_centro_custo: 0,
    frota: "",
    nf_compra: "",
    cod_transportadora: 0,
    frete: 0.0,
    endereco_cliente: "Sim",
    logradouro: "",
    cidade: "",
    bairro: "",
    estado: "",
    complemento: "",
    numero: 0,
    cep: "",
    observacoes_gerais: "",
    observacoes_internas: "",
    desconto_total: 0.0,
  });

  //CLIENTES
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formValuesClients, setFormValuesClients] = useState<Client>({
    cod_cliente: 0,
    nome: "",
    logradouro: "",
    cidade: "",
    bairro: "",
    estado: "",
    complemento: "",
    numero: "",
    cep: "",
    email: "",
    telefone: "",
    celular: "",
    situacao: "",
    tipo: "",
  });

  //CENTROS-DE-CUSTO
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<CentroCusto | null>(null);
  const [formValuesCentroCusto, setFormValuesCentroCusto] = useState<CentroCusto>({
    cod_centro_custo: 0,
    nome: "",
    descricao: "",
  });

  //SERVIÇOS
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [formValuesServico, setFormValuesServico] = useState<Servico>({
    cod_servico: 0,
    nome: "",
    descricao: "",
    valor_custo: "",
    valor_venda: "",
    comissao: "",
  });
  const [quantidadeServ, setQuantidadeServ] = useState(0);
  const [descontoServ, setDescontoServ] = useState(0);
  const [descontoUnit, setDescontoUnit] = useState('%'); // '%' ou 'R$'
  const [valorTotalServ, setValorTotalServ] = useState(0);
  //serviços-handles
  const handleQuantidadeServChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQuantidadeServ(value);
  };
  const handleDescontoServChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDescontoServ(value);
  };
  const handleDescontoUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDescontoUnit(e.target.value);
  };
  //serviços-cadastro
  const [descricaoServ, setDescricaoServ] = useState('');
  const handleInputChangeDescricaoServ = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValuesServico((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleSaveReturnServicos = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "descricao",
        "valor_custo",
        "valor_venda",
        "comissao",
      ];

      const isEmptyField = requiredFields.some((field) => {
        const value = formValuesServico[field as keyof typeof formValuesServico];
        return value === "" || value === null || value === undefined;
      });

      if (isEmptyField) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:9009/api/servicos/register",
        formValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        clearInputs();
        fetchServicos();
        toast.success("Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        closeModalServ();
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar serviços.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar serviços:", error);
    }
  };

  //PRODUTOS
  const [produtos, setProd] = useState<Produto[]>([]);
  const [selectedProd, setSelectedProd] = useState<Produto | null>(null);
  const [formValuesProd, setFormValuesProd] = useState<Produto>({
    cod_item: "",
    descricao: "",
    narrativa: "",
    valor_custo: "",
    valor_venda: "",
    dbs_unidades_medida: {
      un: "",
      cod_un: 0
    },
    cod_estabelecimento: [],
    cod_un: null,
    cod_familia: null,
    situacao: "",
  });
  const [quantidadeProd, setQuantidadeProd] = useState(0);
  const [descontoProd, setDescontoProd] = useState(0);
  const [descontoUnitProd, setDescontoUnitProd] = useState('%prod'); // '%' ou 'R$'
  const [valorTotalProd, setValorTotalProd] = useState(0);
  const handleAdicionaLinha = () => {
    // Criando um novo produto com os dados essenciais da linha atual
    const novoProduto: Produto = {
      cod_item: Date.now().toString(), // Gera um ID único
      descricao: "",
      narrativa: "",
      valor_venda: "",
      valor_custo: "",
      dbs_unidades_medida: {
        un: "",
        cod_un: 0
      },
      cod_estabelecimento: [],
      cod_un: null,
      cod_familia: null,
      situacao: "",
    };

    // Atualiza o estado com o novo produto adicionado à lista
    setProd([...produtos, novoProduto]);
  };

  // Função para remover a linha do produto
  const handleRemoveLinha = (cod_item: string) => {
    setProd((prevProdutos) => prevProdutos.filter((produto) => produto.cod_item !== cod_item));
  };
  //produtos-handles
  const handleQuantidadeProdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQuantidadeProd(value);
  };
  const handleDescontoProdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setDescontoProd(value);
  };
  const handleDescontoUnitProdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDescontoUnitProd(e.target.value);
  };

  //FUNÇÕES INPUTS
  const clearInputs = () => {
    setFormValues({
      cod_orcamento: 0,
      cod_responsavel: 0,
      cod_cliente: 0,
      canal_venda: "",
      data_venda: new Date(),
      prazo: new Date(),
      cod_centro_custo: 0,
      frota: "",
      nf_compra: "",
      cod_transportadora: 0,
      frete: 0.0,
      endereco_cliente: "Sim",
      logradouro: "",
      cidade: "",
      bairro: "",
      estado: "",
      complemento: "",
      numero: 0,
      cep: "",
      observacoes_gerais: "",
      observacoes_internas: "",
      desconto_total: 0.0,
    });
  };
  const clearInputsProd = () => {
    setFormValues({
      cod_orcamento: 0,
      cod_responsavel: 0,
      cod_cliente: 0,
      canal_venda: "",
      data_venda: new Date(),
      prazo: new Date(),
      cod_centro_custo: 0,
      frota: "",
      nf_compra: "",
      cod_transportadora: 0,
      frete: 0.0,
      endereco_cliente: "Sim",
      logradouro: "",
      cidade: "",
      bairro: "",
      estado: "",
      complemento: "",
      numero: 0,
      cep: "",
      observacoes_gerais: "",
      observacoes_internas: "",
      desconto_total: 0.0,
    });
  };
  const clearInputsServ = () => {
    setFormValues({
      cod_orcamento: 0,
      cod_responsavel: 0,
      cod_cliente: 0,
      canal_venda: "",
      data_venda: new Date(),
      prazo: new Date(),
      cod_centro_custo: 0,
      frota: "",
      nf_compra: "",
      cod_transportadora: 0,
      frete: 0.0,
      endereco_cliente: "Sim",
      logradouro: "",
      cidade: "",
      bairro: "",
      estado: "",
      complemento: "",
      numero: 0,
      cep: "",
      observacoes_gerais: "",
      observacoes_internas: "",
      desconto_total: 0.0,
    });
  };
  const [isDisabled, setIsDisabled] = useState(false);
  const openDialog = (id: number) => {
    setOrcamentoIdToDelete(id);
    setModalDeleteVisible(true);
  };
  const closeDialog = () => {
    setModalDeleteVisible(false);
    setOrcamentoIdToDelete(null);
  };

  //FUNÇÕES DOS BOTÕES
  const handleSaveEdit = async () => {
    setItemEditDisabled(true);
    setLoading(true);
    setIsEditing(false);
    try {
      const requiredFields = [
        "cod_responsavel",
        "cod_cliente",
        "canal_venda",
        "data_venda",
        "prazo",
        "cod_centro_custo",
        "frota",
        "nf_compra",
        "cod_transportadora",
        "frete",
        "endereco_cliente",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "cep"
      ];

      const isEmptyField = requiredFields.some((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (isEmptyField) {
        setItemEditDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.put(
        `http://localhost:9009/api/orcamentos/edit/${selectedOrcamento?.cod_orcamento}`,
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
        fetchOrcamentos();
        toast.success("Orçamento salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar orçamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar orçamento:", error);
    }
  };
  const handleSave = async () => {
    setItemCreateDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "cod_responsavel",
        "cod_cliente",
        "canal_venda",
        "data_venda",
        "prazo",
        "cod_centro_custo",
        "frota",
        "nf_compra",
        "cod_transportadora",
        "frete",
        "endereco_cliente",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "cep"
      ];

      const isEmptyField = requiredFields.some((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (isEmptyField) {
        setItemCreateDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:9009/api/orcamentos/register",
        formValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setItemCreateDisabled(false);
        setLoading(false);
        clearInputs();
        fetchOrcamentos();
        toast.success("Orçamento salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar orçamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar orçamento:", error);
    }
  };
  const handleSaveReturn = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "cod_responsavel",
        "cod_cliente",
        "canal_venda",
        "data_venda",
        "prazo",
        "cod_centro_custo",
        "frota",
        "nf_compra",
        "cod_transportadora",
        "frete",
        "endereco_cliente",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "cep"
      ];

      const isEmptyField = requiredFields.some((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (isEmptyField) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:9009/api/orcamentos/register",
        formValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        clearInputs();
        fetchOrcamentos();
        toast.success("Orçamento salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar orçamentos.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar orçamentos:", error);
    }
  };
  const handleEdit = (orcamento: Orcamento) => {
    setFormValues(orcamento);
    setSelectedOrcamento(orcamento);
    setIsEditing(true);
    setVisible(true);
  };
  const handleDelete = async () => {
    if (orcamentoIdToDelete === null) return;

    try {
      await axios.delete(
        `http://localhost:9009/api/orcamentos/${orcamentoIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Orçamento removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchOrcamentos();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir orçamento:", error);
      toast.error("Erro ao excluir orçamento. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  //EFFECTS
  const fetchOrcamentos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:9009/api/orcamentos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.orcamentos);
      setOrcamentos(response.data.orcamentos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar orçamentos:", error);
    }
  };
  //autopreenchimento de campos ao selecionar algo CLIENTS
  useEffect(() => {
    if (selectedClient) {
      setFormValuesClients((prevValues) => ({
        ...prevValues,
        logradouro: selectedClient.logradouro || '',
        cidade: selectedClient.cidade || '',
        bairro: selectedClient.bairro || '',
        estado: selectedClient.estado || '',
        complemento: selectedClient.complemento || '',
        numero: selectedClient.numero || '',
        cep: selectedClient.cep || ''
      }));
    }
  }, [selectedClient]);
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:9009/api/clients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.clients);
      setClients(response.data.clients);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar clientes:", error);
    }
  };
  //autopreenchimento de campos ao selecionar algo PRODUTOS
  useEffect(() => {
    if (selectedProd) {
      console.log('selectedProd mudou:', selectedProd);
      setFormValuesProd((prevValues) => ({
        ...prevValues,
        cod_item: selectedProd.cod_item || '',
        descricao: selectedProd.descricao || '',
        narrativa: selectedProd.narrativa || '',
        valor_venda: selectedProd.valor_venda || '',
        valor_custo: selectedProd.valor_custo || '',
      }));

      let total = (selectedProd.valor_venda ? Number(selectedProd.valor_venda) : 0) * quantidadeProd;
      if (descontoUnitProd === '%prod') {
        total -= total * (descontoProd / 100);
      } else {
        total -= descontoProd;
      }
      setValorTotalProd(total);
    }
  }, [selectedProd, quantidadeProd, descontoProd, descontoUnitProd]);
  const fetchProd = async () => {
    clearInputs();
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:9009/api/itens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.items);
      setProd(response.data.items);
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
  const fetchCentrosCusto = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:9009/api/centrosCusto",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.centrosCusto);
      setCentrosCusto(response.data.centrosCusto);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar centro de custos:", error);
    }
  };
  //autopreenchimento de campos ao selecionar algo SERVIÇOS
  useEffect(() => {
    if (selectedServico) {
      setFormValuesClients((prevValues) => ({
        ...prevValues,
        nome: selectedServico.nome || '',
        descricao: selectedServico.descricao || '',
        valor_venda: selectedServico.valor_venda ? Number(selectedServico.valor_venda) : '',
        valor_custo: selectedServico.valor_custo ? Number(selectedServico.valor_custo) : '',
        comissao: selectedServico.comissao ? Number(selectedServico.comissao) : '',
        dtCadastro: selectedServico.dtCadastro ? new Date(selectedServico.dtCadastro).toISOString().split('T')[0] : ''
      }));

      let total = (selectedServico.valor_venda ? Number(selectedServico.valor_venda) : 0) * quantidadeServ;
      if (descontoUnit === '%') {
        total -= total * (descontoServ / 100);
      } else {
        total -= descontoServ;
      }
      setValorTotalServ(total);
    }
  }, [selectedServico, quantidadeServ, descontoServ, descontoUnit]);
  const fetchServicos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:9009/api/servicos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.servicos);
      setServicos(response.data.servicos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar serviços:", error);
    }
  };
  useEffect(() => {
    fetchOrcamentos();
    fetchClients();
    fetchCentrosCusto();
    fetchServicos();
    fetchProd();
  }, []);


  //HANDLES
  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = clients.find(
      (client) => client.cod_cliente === Number(e.target.value)
    );
    setSelectedClient(selected || null);
    if (selected) {
      setFormValuesClients(selected);
      setFormValues((prevValues) => ({
        ...prevValues,
        cod_cliente: selected.cod_cliente,
      }));
    }
  };
  const handleServicoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = servicos.find(
      (servico) => servico.cod_servico === Number(e.target.value)
    );
    setSelectedServico(selected || null);
    if (selected) {
      setFormValuesServico(selected);
      setFormValues((prevValues) => ({
        ...prevValues,
        cod_servico: selected.cod_servico,
      }));
    }
  };
  const handleProdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    console.log('Produto selecionado:', e.target.value);
    const selected = produtos.find((produto) => produto.cod_item === e.target.value);
    console.log('Produto encontrado:', selected);
    setSelectedProd(selected || null);
    if (selected) {
      setFormValuesProd({
        cod_item: selected.cod_item,
        descricao: selected.descricao || '',
        narrativa: selected.narrativa || '',
        valor_venda: selected.valor_venda || '',
        valor_custo: selected.valor_custo || '',
        dbs_unidades_medida: selected.dbs_unidades_medida || { un: '', cod_un: 0 },
        cod_un: selected.cod_un || { cod_un: 0, un: '', descricao: '' },
        cod_familia: selected.cod_familia || { cod_familia: 0, nome: '', descricao: '' },
        cod_estabelecimento: selected.cod_estabelecimento || [],
        situacao: selected.situacao || '',
        anexo: selected.anexo || null,
      });
      console.log('formValuesProd atualizado:', formValuesProd);
    }
  };
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "usar") {
      setIsDisabled(false);
    } else {
      setIsDisabled(true);
      setFormValuesClients({
        cod_cliente: 0,
        nome: "",
        logradouro: "",
        cidade: "",
        bairro: "",
        estado: "",
        complemento: "",
        numero: "",
        cep: "",
        email: "",
        telefone: "",
        celular: "",
        situacao: "",
        tipo: "",
      });
    }
  }

  //FUNÇÕES DOS MODAIS
  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };
  const closeModalProd = () => {
    clearInputsProd();
    setIsEditingProd(false);
    setVisibleProd(false);
  };
  const closeModalServ = () => {
    clearInputsServ();
    setIsEditingServ(false);
    setVisibleServ(false);
  };

  //FUNÇÕES DE ENTRADA INPUTS
  //numérico
  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, ''); // Permite apenas números

    // Atualiza ambos os estados
    updateNumericFormValues(name, numericValue);
    updateNumericFormValuesServico(name, numericValue);
  };
  const updateNumericFormValues = (name: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const updateNumericFormValuesServico = (name: string, value: string) => {
    setFormValuesServico((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleNumericKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };
  //alfabético
  const handleAlphabeticInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const alphabeticValue = value.replace(/[\d]/g, '');

    // Atualiza ambos os estados
    updateFormValues(name, alphabeticValue);
    updateFormValuesServico(name, alphabeticValue);
  };
  const updateFormValues = (name: string, value: string) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const updateFormValuesServico = (name: string, value: string) => {
    setFormValuesServico((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };
  const handleAlphabeticKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    // Permite qualquer caractere que não seja número
    if (/[\d]/.test(char)) {
      e.preventDefault(); // Bloqueia a inserção de números
    }
  };


  return (
    <>
      <SidebarLayout>
        <div className="flex justify-center overflow-y-auto max-h-screen">
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

          {/* MODAL DE DELEÇÃO */}
          <Dialog
            header="Confirmar Exclusão"
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
                  onClick={handleDelete}
                  className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all"
                />
              </div>
            }
          >
            <p>Tem certeza que deseja excluir este orcamento?</p>
          </Dialog>

          {/* MODAL DE PRODUTOS */}
          <Dialog
            header={isEditingProd ? "Editar produtos" : "Novo Item"}
            visible={visibleProd}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModalProd()}
            style={{ width: "60vw", maxHeight: "60vh", overflowY: "auto" }} // Added styles for scroll
          >
            <div className="p-fluid grid gap-2 mt-2">
              {/* Primeira Linha */}
              <div className="border border-white p-2 rounded">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="codigoProd" className="block text-blue font-medium mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      id="codigoProd"
                      name="codigoProd"
                      disabled
                      className="bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8 w-full !important"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="descricaoProd" className="block text-blue font-medium mb-1">
                      Descrição
                    </label>
                    <input
                      type="text"
                      id="descricaoProd"
                      name="descricaoProd"
                      onChange={handleInputChange}
                      className="border border-gray-400 pl-1 rounded-sm h-8 w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Segunda Linha */}
              <div className="border border-white p-2 rounded mt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="unProd" className="block text-blue font-medium mb-1">
                      UN
                    </label>
                    <select
                      id="unProd"
                      name="unProd"
                      className="bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8 w-full !important"
                    >
                      {/* Adicione aqui as opções do select */}
                      <option value=""> </option>
                      <option value="UN1">UN1</option>
                      <option value="UN2">UN2</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="familiaProd" className="block text-blue font-medium mb-1">
                      Família
                    </label>
                    <select
                      id="familiaProd"
                      name="familiaProd"
                      className="border border-gray-400 pl-1 rounded-sm h-8 w-full"
                    >
                      {/* Adicione aqui as opções do select */}
                      <option value=""> </option>
                      <option value="Familia1">Família 1</option>
                      <option value="Familia2">Família 2</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vl_unitario_prod" className="block text-blue font-medium mb-1">
                      Valor Unitário
                    </label>
                    <input
                      type="text"
                      id="vl_unitario_prod"
                      name="vl_unitario_prod"
                      disabled
                      className="bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8 w-full !important"
                    />
                  </div>
                </div>
              </div>
            </div>


            <div className="flex justify-between items-center  mt-16">
              <div className="grid grid-cols-3 gap-3 w-full">
                <Button
                  label="Sair Sem Salvar"
                  className="text-white"
                  icon="pi pi-times"
                  style={{
                    backgroundColor: "#dc3545",
                    border: "1px solid #dc3545",
                    padding: "0.75rem 2rem",  // Tamanho aumentado
                    fontSize: "16px",  // Tamanho aumentado
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => closeModalProd()}
                />
                {!isEditing && (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={handleSaveReturn}
                      disabled={itemCreateReturnDisabled}
                      style={{
                        backgroundColor: "#007bff",
                        border: "1px solid #007bff",
                        padding: "0.75rem 2rem",  // Tamanho aumentado
                        fontSize: "16px",  // Tamanho aumentado
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                    <Button
                      label="Salvar e Adicionar Outro"
                      className="text-white"
                      icon="pi pi-check"
                      onClick={handleSave}
                      disabled={itemCreateDisabled}
                      style={{
                        backgroundColor: "#28a745",
                        border: "1px solid #28a745",
                        padding: "0.75rem 2rem",  // Tamanho aumentado
                        fontSize: "16px",  // Tamanho aumentado
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                  </>
                )}

                {isEditing && (
                  <Button
                    label="Salvar"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={handleSaveEdit}
                    disabled={itemEditDisabled}
                    style={{
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                )}
              </div>
            </div>


          </Dialog>

          {/* MODAL DE SERVIÇOS */}
          <Dialog
            header={isEditingServ ? "Editar servicos" : "Novo Serviço"}
            visible={visibleServ}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModalServ()}
            style={{ width: "60vw", maxHeight: "60vh", overflowY: "auto" }} // Added styles for scroll
          >
            <div className="p-fluid grid gap-2 mt-2">
              {/* Primeira Linha */}
              <div className="border border-white p-2 rounded">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="nome" className="block text-blue font-medium">
                      Nome
                    </label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={formValuesServico.nome}
                      onChange={handleAlphabeticInputChange} // Não permite números
                      onKeyPress={handleAlphabeticKeyPress} // Bloqueia números
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="descricao" className="block text-blue font-medium">
                      Descrição
                    </label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      value={formValuesServico.descricao}
                      onChange={handleInputChangeDescricaoServ}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm resize-y"
                      rows={4}
                      maxLength={255}
                    />
                  </div>
                </div>
              </div>

              {/* Segunda Linha */}
              <div className="border border-white p-2 rounded mt-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="valor_custo" className="block text-blue font-medium">
                      Valor de Custo
                    </label>
                    <input
                      type="text"
                      id="valor_custo"
                      name="valor_custo"
                      value={formValuesServico.valor_custo}
                      onChange={handleNumericInputChange} // Não permite letras
                      onKeyPress={handleNumericKeyPress} // Bloqueia letras
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="valor_venda" className="block text-blue font-medium">
                      Valor de Venda
                    </label>
                    <input
                      type="text"
                      id="valor_venda"
                      name="valor_venda"
                      value={formValuesServico.valor_venda}
                      onChange={handleNumericInputChange} // Não permite letras
                      onKeyPress={handleNumericKeyPress} // Bloqueia letras
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="comissao" className="block text-blue font-medium">
                      Comissão
                    </label>
                    <input
                      type="text"
                      id="comissao"
                      name="comissao"
                      value={formValuesServico.comissao}
                      onChange={handleNumericInputChange} // Não permite letras
                      onKeyPress={handleNumericKeyPress} // Bloqueia letras
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-between items-center  mt-16">
              <div className="grid grid-cols-2 gap-3 w-full">

                {!isEditing && (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={handleSaveReturnServicos}
                      disabled={itemCreateReturnDisabled}
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
                      onClick={handleSaveReturnServicos}
                      disabled={itemCreateDisabled}
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

                {isEditing && (
                  <Button
                    label="Salvar"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={handleSaveEdit}
                    disabled={itemEditDisabled}
                    style={{
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                )}
              </div>
            </div>

          </Dialog>

          {/* MODAL PRINCIPAL */}
          <Dialog
            header={isEditing ? "Editar orcamento" : "Novo Orçamento"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            style={{ width: "90vw", maxHeight: "90vh", overflowY: "auto" }} // Added styles for scroll
          >

            <div className="p-fluid grid gap-2 mt-2 ">

              {/* Primeira Linha */}
              <div className="border border-white p-2 rounded">
                <div className="grid grid-cols-4 gap-2">

                  <div>
                    <label htmlFor="codigo" className="block text-blue font-medium mb-1">
                      Código
                    </label>
                    <input
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={formValues.cod_orcamento}
                      disabled
                      className="bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8 w-full !important cursor-not-allowed disabled:!bg-gray-300"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="clients" className="block text-blue font-medium">
                      Cliente:
                    </label>
                    <select
                      id="clients"
                      name="clients"
                      value={selectedClient ? selectedClient.cod_cliente : ""}
                      onChange={handleClientChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    >
                      <option value="">Selecione</option>
                      {clients.map((cliente) => (
                        <option key={cliente.cod_cliente} value={cliente.cod_cliente}>
                          {cliente.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="responsavel" className="block text-blue font-medium mb-1">
                      Vendedor/Responsável
                    </label>
                    <select id="responsavel" name="responsavel" className="border border-gray-400 pl-1 rounded-sm h-8 w-full">
                      <option>Selecione</option>
                    </select>
                  </div>
                </div>

                <br></br>

                {/* Segunda Linha */}
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="canal_venda" className="block text-blue font-medium">
                      Canal de venda
                    </label>
                    <select id="canal_venda" name="canal_venda" className="w-full border border-gray-400 pl-1 rounded-sm h-8">
                      <option>Selecione</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="data_venda" className="block text-blue font-medium">
                      Data de venda
                    </label>
                    <input type="date" id="data_venda" name="data_venda" className="w-full border border-gray-400 pl-1 rounded-sm h-8" placeholder="Data da Venda" />
                  </div>
                  <div>
                    <label htmlFor="prazo_entrega" className="block text-blue font-medium">
                      Prazo de entrega
                    </label>
                    <input type="date" id="prazo_entrega" name="prazo_entrega" className="w-full border border-gray-400 pl-1 rounded-sm h-8" placeholder="Prazo de Entrega" />
                  </div>
                  <div>
                    <label htmlFor="centrosCusto" className="block text-blue font-medium">
                      Centro de Custo:
                    </label>
                    <select
                      id="centrosCusto"
                      name="centrosCusto"
                      value={selectedCentroCusto ? selectedCentroCusto.cod_centro_custo : ''}
                      onChange={(e) => {
                        const selected = centrosCusto.find(
                          (est) => est.cod_centro_custo === Number(e.target.value)
                        );
                        setSelectedCentroCusto(selected || null);
                        if (selected) {
                          setFormValuesCentroCusto(selected);
                          setFormValuesCentroCusto((prevValues) => ({
                            ...prevValues,
                            cod_centro_custo: selected.cod_centro_custo,
                          }));
                        }
                      }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    >
                      <option value="">Selecione</option>
                      {centrosCusto.map((centrosCusto) => (
                        <option key={centrosCusto.cod_centro_custo} value={centrosCusto.cod_centro_custo}>
                          {centrosCusto.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>


              <br></br>


              {/* Produtos */}
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-medium text-xl mr-2">Produtos</h3>
                  <button
                    className="bg-green200 rounded"
                    onClick={() => setVisibleProd(true)}
                    style={{ padding: "0.1rem 0.1rem" }}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "1.5rem" }}
                      className="text-white text-center"
                    />
                  </button>
                </div>
                <div style={{ height: "16px" }}></div>

                {produtos.map((produto) => (
                  <div key={produto.cod_item} className="grid grid-cols-5 gap-2">
                    <div>
                      <label htmlFor="produto" className="block text-blue font-medium">
                        Produto:
                      </label>
                      <select
                        id="produto"
                        name="produto"
                        value={selectedProd ? selectedProd.cod_item : ''}
                        onChange={handleProdChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      >
                        <option value="">Selecione</option>
                        {produtos.map((produto) => (
                          <option key={produto.cod_item} value={produto.cod_item}>
                            {produto.descricao}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="quantidadeProd" className="block text-blue font-medium">
                        Quantidade
                      </label>
                      <input
                        id="quantidadeProd"
                        name="quantidadeProd"
                        type="number"
                        className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                        value={quantidadeProd}
                        onChange={handleQuantidadeProdChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="vl_unit_prod" className="block text-blue font-medium">
                        Valor Unitário
                      </label>
                      <input
                        id="vl_unit_prod"
                        name="vl_unit_prod"
                        type="text"
                        disabled
                        className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                        value={formValuesProd.valor_venda}
                      />
                    </div>
                    <div>
                      <label htmlFor="descontoUnitProd" className="block text-blue font-medium">
                        Desconto
                        <select
                          id="descontoUnitProd"
                          name="descontoUnitProd"
                          value={descontoUnitProd}
                          onChange={handleDescontoUnitProdChange}
                          className="ml-2 border border-gray-400 rounded-sm small-select"
                        >
                          <option value="%prod">%</option>
                          <option value="R$prod">R$</option>
                        </select>
                      </label>
                      <input
                        id="descontoProd"
                        name="descontoProd"
                        type="text"
                        className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                        value={descontoProd}
                        onChange={handleDescontoProdChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="vl_total_prod" className="block text-blue font-medium">
                        Valor Total
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          id="vl_total_prod"
                          name="vl_total_prod"
                          type="text"
                          disabled
                          className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                          value={valorTotalProd}
                        />
                        <button
                          className="bg-red-200 rounded p-2 flex items-center justify-center"
                          onClick={() => handleRemoveLinha(produto.cod_item)}
                          style={{
                            padding: "0.1rem 0.05rem",
                          }}
                        >
                          <FaTimes className="text-red text-2xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Nova linha semi-invisível com botão de adição */}
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <input
                      id="produto"
                      name="produto"
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 bg-gray-200 opacity-30"
                      disabled
                    >
                    </input>
                  </div>
                  <div>
                    <input
                      id="quantidadeProd"
                      name="quantidadeProd"
                      type="number"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 bg-gray-200 opacity-30"
                      disabled
                    />
                  </div>
                  <div>
                    <input
                      id="vl_unit_prod"
                      name="vl_unit_prod"
                      type="text"
                      disabled
                      className="w-full bg-gray-200 border border-gray-400 pl-1 rounded-sm h-8 opacity-30"
                    />
                  </div>
                  <div>
                    <input
                      id="descontoProd"
                      name="descontoProd"
                      type="text"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 bg-gray-200 opacity-30"
                      disabled
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        id="vl_total_prod"
                        name="vl_total_prod"
                        type="text"
                        disabled
                        className="w-full bg-gray-200 border border-gray-400 pl-1 rounded-sm h-8 opacity-30"
                      />
                      <button
                        className="bg-green-200 rounded p-2 flex items-center justify-center"
                        onClick={handleAdicionaLinha} // Adiciona nova linha principal
                        style={{
                          padding: "0.1rem 0.05rem",
                          filter: "opacity(100%)",
                        }}
                      >
                        <IoAddCircleOutline className="text-green-600 text-2xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>


              <br></br>


              {/* Serviços */}
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-medium text-xl mr-2">Serviços</h3>
                  <button
                    className="bg-green200 rounded"
                    onClick={() => setVisibleServ(true)}
                    style={{
                      padding: "0.1rem 0.05rem",
                    }}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "1.5rem" }}
                      className="text-white text-center"
                    />
                  </button>
                </div>
                <div style={{ height: "16px" }}></div>
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label htmlFor="servico" className="block text-blue font-medium">
                      Serviço:
                    </label>
                    <select
                      id="servico"
                      name="servico"
                      value={selectedServico ? selectedServico.cod_servico : ''}
                      onChange={handleServicoChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    >
                      <option value="">Selecione</option>
                      {servicos.map((servicos) => (
                        <option key={servicos.cod_servico} value={servicos.cod_servico}>
                          {servicos.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantidadeServ" className="block text-blue font-medium">
                      Quantidade
                    </label>
                    <input id="quantidadeServ"
                      name="quantidadeServ"
                      type="number"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={quantidadeServ}
                      onChange={handleQuantidadeServChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="vl_unit_serv" className="block text-blue font-medium">
                      Valor Unitário
                    </label>
                    <input id="vl_unit_serv"
                      name="vl_unit_serv"
                      type="text"
                      disabled className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                      value={formValuesServico.valor_venda}
                    />
                  </div>
                  <div>
                    <label htmlFor="descontoServ" className="block text-blue font-medium">
                      Desconto
                      <select
                        id="descontoUnit"
                        name="descontoUnit"
                        value={descontoUnit}
                        onChange={handleDescontoUnitChange}
                        className="ml-2 border border-gray-400 rounded-sm small-select"
                      >
                        <option value="%">%</option>
                        <option value="R$">R$</option>
                      </select>
                    </label>
                    <input id="descontoServ"
                      name="descontoServ"
                      type="text"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={descontoServ}
                      onChange={handleDescontoServChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="vl_total_serv" className="block text-blue font-medium">
                      Valor Total
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="vl_total_serv"
                        name="vl_total_serv"
                        type="text"
                        disabled
                        className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                        value={valorTotalServ}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <br></br>


              {/* Proxima linha */}
              <div className="border border-white p-2 rounded">
                <div className="grid grid-cols-4 gap-2 ">
                  <div>
                    <label htmlFor="frota" className="block text-blue font-medium">
                      Frota
                    </label>
                    <select id="frota" name="frota" className="w-full border border-gray-400 pl-1 rounded-sm h-8">
                      <option>Selecione</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="nf-compra" className="block text-blue font-medium">
                      NF-Compra
                    </label>
                    <input type="text" id="nf-compra" name="nf-compra" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                  <div>
                    <label htmlFor="transportadora" className="block text-blue font-medium">
                      Transportadora
                    </label>
                    <input type="text" id="transportadora" name="transportadora" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                  <div>
                    <label htmlFor="frete" className="block text-blue font-medium">
                      Frete
                    </label>
                    <input id="frete" name="frete" className="w-full border border-gray-400 pl-1 rounded-sm h-8"></input>
                  </div>
                </div>
              </div>

              <br></br>

              {/* Endereço de Entrega */}
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-medium text-xl mr-2">Endereço de Entrega</h3>
                </div>
                <div style={{ height: "16px" }}></div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="usarEnd" className="block text-blue font-medium">
                      Usar Endereço do Cliente
                    </label>
                    <select
                      id="usarEnd"
                      name="usarEnd"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      onChange={handleSelectChange}
                    >
                      <option value="usar">SIM</option>
                      <option value="naoUsar">NÃO</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="CEP" className="block text-blue font-medium">
                      CEP
                    </label>
                    <input
                      id="CEP"
                      name="CEP"
                      type="text"
                      value={formValuesClients.cep}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled}
                    />
                  </div>
                  <div className="col-span-2">
                    <label htmlFor="logradouro" className="block text-blue font-medium">
                      Logradouro
                    </label>
                    <input
                      id="logradouro"
                      name="logradouro"
                      type="text"
                      value={formValuesClients.logradouro}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label htmlFor="numero" className="block text-blue font-medium">
                      Número
                    </label>
                    <input
                      id="numero"
                      name="numero"
                      type="text"
                      value={formValuesClients.numero}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <label htmlFor="estado" className="block text-blue font-medium">
                      Estado (sigla)
                    </label>
                    <input
                      id="estado"
                      name="estado"
                      type="text"
                      value={formValuesClients.estado}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <label htmlFor="bairro" className="block text-blue font-medium">
                      Bairro
                    </label>
                    <input
                      id="bairro"
                      name="bairro"
                      type="text"
                      value={formValuesClients.bairro}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled}
                    />
                  </div>
                  <div>
                    <label htmlFor="cidade" className="block text-blue font-medium">
                      Cidade
                    </label>
                    <input
                      id="cidade"
                      name="cidade"
                      type="text"
                      value={formValuesClients.cidade}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled}
                    />
                  </div>
                </div>
              </div>


              <br></br>

              {/* Total */}
              <div className="border border-gray-400 p-2 rounded mt-2 bg-gray-100">
                <h3 className="text-blue font-medium text-xl mr-2">Total</h3>
                <div style={{ height: "16px" }}></div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="produtos" className="block text-blue font-medium">
                      Produtos
                    </label>
                    <input id="produtos" name="produtos" type="text" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                  <div>
                    <label htmlFor="servicos" className="block text-blue font-medium">
                      Serviços
                    </label>
                    <input id="servicos" name="servicos" type="text" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                  <div>
                    <label htmlFor="desconto" className="block text-blue font-medium">
                      Desconto
                    </label>
                    <input id="desconto" name="desconto" type="text" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                  <div>
                    <label htmlFor="vl_total" className="block text-blue font-medium">
                      Valor Total
                    </label>
                    <input id="vl_total" name="vl_total" type="text" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                </div>
              </div>

              <br></br>

              {/* Pagamentos */}
              <div className="border border-gray-400 p-2 rounded mt-2 bg-gray-100">
                <h3 className="text-blue font-medium text-xl mr-2">Pagamentos</h3>
                <div style={{ height: "16px" }}></div>
                <div style={{ height: "4px" }}></div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="pagamento" className="block text-blue font-medium">
                      Forma de Pagamento
                    </label>
                    <select id="pagamento" name="pagamento" className="w-full border border-gray-400 pl-1 rounded-sm h-8">
                      <option value="dinheiro">Dinheiro</option>
                      <option value="credito">Crédito</option>
                      <option value="debito">Débito</option>
                      <option value="pix">PIX</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="parcela" className="block text-blue font-medium">
                      Parcela
                    </label>
                    <input id="parcela" name="parcela" type="number" className="w-full border border-gray-400 pl-1 rounded-sm h-8" />
                  </div>
                  <div>
                    <label htmlFor="juros" className="block text-blue font-medium">
                      Juros
                    </label>
                    <input id="juros" name="juros" type="number" className="w-full border border-gray-400 pl-1 rounded-sm h-8" placeholder="R$" />
                  </div>
                  <div>
                    <label htmlFor="dt_parcela" className="block text-blue font-medium">
                      Data da Parcela
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="dt_parcela"
                        name="dt_parcela"
                        type="date"
                        disabled
                        className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                      />
                      <button
                        className="bg-red-200 rounded p-2 flex items-center justify-center"
                        onClick={() => setVisible(true)}
                        style={{
                          padding: "0.1rem 0.05rem",
                        }}
                      >
                        <FaTimes className="text-red text-2xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <br></br>

              {/* Observações */}
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label htmlFor="nf-compra" className="block text-blue font-medium">
                    Obervações Gerais:
                  </label>
                  <textarea id="obervacoes_gerais" name="obervacoes_gerais" className="w-full border border-gray-400 pl-1 rounded-sm h-32"></textarea>
                </div>
                <div>
                  <label htmlFor="nf-compra" className="block text-blue font-medium">
                    Obervações Gerais:
                  </label>
                  <textarea id="obervacoes_internas" name="obervacoes_internas" className="w-full border border-gray-400 pl-1 rounded-sm h-32" ></textarea>
                </div>
              </div>
            </div>


            <div className="flex justify-between items-center  mt-16">
              <div className="grid grid-cols-3 gap-3 w-full">
                <Button
                  label="Sair Sem Salvar"
                  className="text-white"
                  icon="pi pi-times"
                  style={{
                    backgroundColor: "#dc3545",
                    border: "1px solid #dc3545",
                    padding: "0.75rem 2rem",  // Tamanho aumentado
                    fontSize: "16px",  // Tamanho aumentado
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => closeModal()}
                />
                {!isEditing && (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={handleSaveReturn}
                      disabled={itemCreateReturnDisabled}
                      style={{
                        backgroundColor: "#007bff",
                        border: "1px solid #007bff",
                        padding: "0.75rem 2rem",  // Tamanho aumentado
                        fontSize: "16px",  // Tamanho aumentado
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                    <Button
                      label="Salvar e Adicionar Outro"
                      className="text-white"
                      icon="pi pi-check"
                      onClick={handleSave}
                      disabled={itemCreateDisabled}
                      style={{
                        backgroundColor: "#28a745",
                        border: "1px solid #28a745",
                        padding: "0.75rem 2rem",  // Tamanho aumentado
                        fontSize: "16px",  // Tamanho aumentado
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                  </>
                )}

                {isEditing && (
                  <Button
                    label="Salvar"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={handleSaveEdit}
                    disabled={itemEditDisabled}
                    style={{
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                )}
              </div>
            </div>
          </Dialog>

          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">
                  Orçamentos
                </h2>
              </div>
              {permissions?.insercao === "SIM" && (
                <div>
                  <button
                    className="bg-green200 rounded mr-3"
                    onClick={() => setVisible(true)}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "2.5rem" }}
                      className="text-white text-center"
                    />
                  </button>
                </div>
              )}
            </div>
            <div
              className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col"
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
                value={filteredOrcamentos.slice(first, first + rows)}
                paginator={true}
                rows={rows}
                rowsPerPageOptions={[5, 10]}
                onPage={(e) => {
                  setFirst(e.first);
                  setRows(e.rows);
                }}
                tableStyle={{
                  borderCollapse: "collapse",
                  width: "100%",
                }}
                className="w-full"
                responsiveLayout="scroll"
              >
                <Column
                  field="cod_orcamento"
                  header="Código"
                  style={{
                    width: "10%",
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
                  field="cod_cliente"
                  header="Cliente"
                  style={{
                    width: "20%",
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
                  field="valor_venda"
                  header="Valor"
                  style={{
                    width: "10%",
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
                  field="situação" // Esse campo precisará ser adicionado na interface
                  header="Situação"
                  style={{
                    width: "10%",
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
                  field="prazo"
                  header="Prazo"
                  style={{
                    width: "15%",
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
                    const date = new Date(rowData.prazo);
                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(date);

                    return <span>{formattedDate}</span>;
                  }}
                />
                <Column
                  field="dtCadastro"
                  header="DT Cadastro"
                  style={{
                    width: "20%",
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
                    const date = new Date(rowData.dtCadastro);
                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    }).format(date);

                    return <span>{formattedDate}</span>;
                  }}
                />

                {permissions?.edicao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(rowData)}
                          className="bg-yellow p-1 rounded"
                        >
                          <MdOutlineModeEditOutline className="text-white text-2xl" />
                        </button>
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
                        <button
                          onClick={() => openDialog(rowData.cod_orcamento)}
                          className="bg-red text-black p-1 rounded"
                        >
                          <FaTrash className="text-white text-2xl" />
                        </button>
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
        </div>
      </SidebarLayout>
      <Footer />
    </>
  );
};

export default OrcamentosPage;
