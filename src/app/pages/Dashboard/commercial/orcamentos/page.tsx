"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import { MdVisibility } from "react-icons/md";
import { FaTimes, FaPlus, FaBan } from "react-icons/fa";
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
import { truncate } from "fs";



interface Transportadora {
  cod_transportadora: number;
  nome: string;
}

interface Pagamento {
  nome: string | number | readonly string[] | undefined;
  formaPagamento: any;
  id: number;
  cod_forma_pagamento?: number; // Adicionado caso precise da chave primária
  parcela?: number;
  valorParcela?: number;
  juros?: number;
  data_parcela?: string;
  tipo_juros?: "Percentual" | "Reais";
}

interface Formas {
  cod_forma_pagamento?: number; // Adicionado caso precise da chave primária
  nome?: string;
  descricao?: string;
  situacao?: string;
}

interface User {
  cod_usuario: number;
  nome: string;
  usuario: string;
  email: string;
  situacao: string;
  nomeGrupo?: string;
  cod_grupo: number;
  dbs_estabelecimentos_usuario?: {
    cod_estabel_usuario: number;
    cod_usuario: number;
    cod_estabel: number;
  }
}

interface Orcamento {
  cod_orcamento: number;
  cod_responsavel: number;
  cod_cliente: number;
  canal_venda: string;
  data_venda: string;
  prazo: string;
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
  valor_total: number;
  situacao?: string;
  dbs_pagamentos_orcamento: any[];
  dbs_produtos_orcamento: any[];
  dbs_servicos_orcamento: any[];
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
  dbs_servicos: any;
  id: number;
  cod_servico: number;
  nome?: string;
  descricao?: string;
  valor_venda?: string;
  valor_custo?: string;
  comissao?: string;
  quantidade?: number;
  dtCadastro?: string;
  descontoUnitProdtipo?: string;
  descontoProd?: number;
  valor_desconto?: number;
  valor_total?: string;
  tipo_juros?: "Percentual" | "Reais";
  tipo_desconto?: "Percentual" | "Reais";
  valor_unitario?: string;
}

//mesma coisa que ITENS
interface Produto {
  id: number; // Novo campo id
  cod_item: string;
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
//cod_produto, cod_orcamento, quantidade, valor_unitario, desconto


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
  const [searchField, setSearchField] = useState("cod_cliente");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [orcamentoIdToDelete, setOrcamentoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isEditingProd, setIsEditingProd] = useState<boolean>(false);
  const [isEditingServ, setIsEditingServ] = useState<boolean>(false);

  // #region TRANSPORTADORAS
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);

  const fetchTransportadoras = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:9009/api/transportadoras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.transportadoras);
      setTransportadoras(response.data.transportadoras);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar transportadoras:", error);
    }
  };
  // #endregion




  // #region RESPONSAVEL
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const responseUsers = await axios.get("http://localhost:9009/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseGroup = await axios.get("http://localhost:9009/api/groupPermission/groups", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const usersWithGroupName = responseUsers.data.users.map((user: { cod_grupo: any; }) => {
        const matchingGroup = responseGroup.data.groups.find(
          (group: { cod_grupo: any; }) => parseInt(group.cod_grupo) === parseInt(user.cod_grupo)
        );

        return {
          ...user,
          nomeGrupo: matchingGroup ? matchingGroup.nome : "",
        };
      });

      //console.log("useerr", usersWithGroupName); 
      setUsers(usersWithGroupName);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar usuários:", error);
    }
  };
  // #endregion 




  // #region CLIENTES
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

  const [clientInfo, setClientInfo] = useState({
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

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = clients.find(
      (client) => client.cod_cliente === Number(e.target.value)
    );

    setSelectedClient(selected || null); // Atualiza o estado de selectedClient

    if (selected) {
      setIsDisabled(true);
      setUsarEndereco("usar");
      setClientInfo({
        cod_cliente: selected.cod_cliente || 0,
        nome: selected.nome || "",
        logradouro: selected.logradouro || "",
        cidade: selected.cidade || "",
        bairro: selected.bairro || "",
        estado: selected.estado || "",
        complemento: selected.complemento || "",
        numero: String(selected.numero || ""),  // Certifique-se de que o número seja uma string
        cep: selected.cep || "",
        email: selected.email || "",
        telefone: selected.telefone || "",
        celular: selected.celular || "",
        situacao: selected.situacao || "",
        tipo: selected.tipo || "",
      });
      // Atualizando formValuesClients corretamente com os dados do cliente
      setFormValuesClients((prevValues) => ({
        ...prevValues,
        logradouro: selected.logradouro || '',
        cidade: selected.cidade || '',
        bairro: selected.bairro || '',
        estado: selected.estado || '',
        complemento: selected.complemento || '',
        numero: String(selected.numero || ''),  // Garanta que seja uma string, se necessário
        cep: selected.cep || '',
      }));

      // Atualizando formValues com o cod_cliente e os dados do cliente
      setFormValues((prevValues) => ({
        ...prevValues,
        cod_cliente: selected.cod_cliente,
        logradouro: selected.logradouro || '',
        cidade: selected.cidade || '',
        bairro: selected.bairro || '',
        estado: selected.estado || '',
        complemento: selected.complemento || '',
        numero: selected.numero ? Number(selected.numero) : 0,  // Convertendo para number
        cep: selected.cep || '',
      }));
    }
  };
  // #endregion




  // #region CENTROS-DE-CUSTO
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<CentroCusto | null>(null);
  const [formValuesCentroCusto, setFormValuesCentroCusto] = useState<CentroCusto>({
    cod_centro_custo: 0,
    nome: "",
    descricao: "",
  });
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
  // #endregion



  // #region PRODUTOS  
  const [produtos, setProd] = useState<Produto[]>([]);
  const [produtosSelecionados, setProdSelecionados] = useState<Produto[]>([]);
  const [selectedProd, setSelectedProd] = useState<Produto | null>(null);
  const [formValuesProd, setFormValuesProd] = useState<Produto>({
    id: 0, // Inicializando com um id padrão (pode ser 0 ou um valor único)
    cod_item: "",
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
      alert("Após selecionar um produto, insira a quantidade.");
      return;
    }
    // Garante que tenha um produto e quantidade antes de adicionar

    const novoProduto: Produto = {
      id: Date.now(),  // Usando Date.now() para criar um identificador único
      cod_item: selectedProd.cod_item,
      descricao: selectedProd.descricao,
      valor_venda: selectedProd.valor_venda,
      quantidade: quantidadeProd,
      descontoUnitProdtipo: descontoUnitProd,
      descontoProd: descontoProd,
      valor_total: valorTotalProd.toString(),
      tipo_juros: "Percentual",
      cod_produto: selectedProd.cod_item,
      desconto: 0,
      valor_custo: selectedProd.valor_custo,
      valor_unitario: selectedProd.valor_venda,
      valor_desconto: Number(descontoProd) || 0,
      tipo_desconto: "Percentual",
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
      cod_item: "",
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

  const [totalProdutosSomados, setTotalProdutosSomados] = useState(0);

  useEffect(() => {
    const total = produtosSelecionados.reduce((acc, produto) => acc + parseFloat(produto.valor_total || "0"), 0);
    setTotalProdutosSomados(total);
  }, [produtosSelecionados]); // Executa toda vez que produtosSelecionados mudar


  //autopreenchimento de campos ao selecionar algo PRODUTOS
  useEffect(() => {
    if (selectedProd) {
      console.log('selectedProd mudou:', selectedProd);
      setFormValuesProd((prevValues) => ({
        ...prevValues,
        cod_item: selectedProd.cod_item || '',
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



  // #endregion






  // #region SERVIÇOS
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [totalServicosSomados, setTotalServicosSomados] = useState(0);

  useEffect(() => {
    const total = servicosSelecionados.reduce((acc, servico) => acc + parseFloat(servico.valor_total || "0"), 0);
    setTotalServicosSomados(total);
  }, [servicosSelecionados]); // Executa toda vez que servicosSelecionados mudar


  const [servicos, setServicos] = useState<Servico[]>([]);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [formValuesServico, setFormValuesServico] = useState<Servico>({
    cod_servico: 0,
    id: 0,
    quantidade: 0,
    nome: "",
    descricao: "",
    valor_custo: "",
    valor_venda: "",
    comissao: "",
    valor_desconto: 0,
    descontoProd: 0,
    valor_unitario: "",
    tipo_juros: "Percentual",
    tipo_desconto: "Percentual",
    valor_total: "",
    dbs_servicos: [],
  });
  const [quantidadeServ, setQuantidadeServ] = useState(1);
  const [descontoServ, setDescontoServ] = useState(0);
  const [descontoUnit, setDescontoUnit] = useState('Percentual'); // '%' ou 'R$'
  const [valorTotalServ, setValorTotalServ] = useState(0);
  //serviços-handles
  const handleQuantidadeServChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setQuantidadeServ(value);
  };
  const handleDescontoServChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(",", "."); // Permite digitação com vírgula e converte para ponto
    let numericValue = Number(value);

    const maxValue = descontoUnit === "Percentual" ? 100 : quantidadeServ * Number(selectedServico?.valor_venda ?? 0);

    if (numericValue > maxValue) {
      numericValue = maxValue; // Limita ao máximo permitido
    } else if (numericValue < 0 || isNaN(numericValue)) {
      numericValue = 0; // Evita valores negativos ou inválidos
    }

    setDescontoServ(numericValue);
  };


  const handleDescontoUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "%" ? "Percentual" : "Reais";
    setDescontoUnit(newValue);
  };


  const handleAdicionarServico = () => {
    if (!selectedServico || !quantidadeServ) {
      alert("Após selecionar um serviço, insira a quantidade.");
      return;
    }
    // Garante que tenha um serviço e quantidade antes de adicionar

    const novoServico: Servico = {
      id: Date.now(),  // Usando Date.now() para criar um identificador único
      cod_servico: selectedServico.cod_servico,
      nome: selectedServico.nome,  // Usando o campo nome da interface
      descricao: selectedServico.descricao,
      valor_venda: selectedServico.valor_venda,
      quantidade: quantidadeServ,
      descontoUnitProdtipo: descontoUnit,
      valor_desconto: formValuesServico.valor_desconto ? Number(formValuesServico.valor_desconto) : 0,
      descontoProd: descontoServ,
      valor_total: valorTotalServ.toString(),
      tipo_juros: "Percentual",
      tipo_desconto: "Percentual",
      valor_unitario: selectedServico.valor_venda,
      dbs_servicos: selectedServico.dbs_servicos,
    };

    // Adiciona o novo serviço à lista de serviços selecionados
    setServicosSelecionados((prev) => [...prev, novoServico]);

    // Reseta os estados para permitir a seleção de um novo serviço
    setSelectedServico(null); // Permite escolher um novo serviço
    setQuantidadeServ(0);
    setDescontoServ(0);
    setDescontoUnit('%');
    setValorTotalServ(0);

    // Reseta os valores do formValuesServico
    setFormValuesServico({
      id: 0,
      cod_servico: 0,
      nome: "",
      descricao: "",
      valor_venda: "",
      valor_custo: "",
      comissao: "",
      dbs_servicos: [],
    });
  };


  const handleRemoveLinhaServico = (id: number) => {
    setServicosSelecionados((prev) => prev.filter(servico => servico.id !== id));
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
  const handleSaveReturnServicos = async (fecharTela: boolean) => {
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
        setVisibleServ(fecharTela);
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
      if (descontoUnit === 'Percentual') {
        total -= total * (descontoServ / 100);
      } else {
        total -= descontoServ;
      }
      setValorTotalServ(parseFloat(total.toFixed(2)));
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
  // #endregion






  // #region TOTAL
  const [descontoTotal, setDescontoTotal] = useState(0);
  const [descontoUnitTotal, setDescontoUnitTotal] = useState('%');
  const [produtosTotal, setProdutosTotal] = useState(0);
  const [servicosTotal, setServicosTotal] = useState(0);
  const [frete, setFrete] = useState(0.0);
  const [valorTotalTotal, setValorTotalTotal] = useState(0);

  useEffect(() => {
    let total = totalProdutosSomados + totalServicosSomados + frete;

    // Aplicando o desconto, se houver
    if (descontoUnitTotal === '%') {
      total = total - (total * (descontoTotal / 100));
    } else if (descontoUnitTotal === 'R$') {
      total = total - descontoTotal;
    }

    setValorTotalTotal(total);
  }, [totalProdutosSomados, totalServicosSomados, frete, descontoTotal, descontoUnitTotal]); // Executa sempre que algum desses valores mudar



  // useEffect(() => {
  //   calcularTotal();
  // }, [produtosTotal,
  //   servicosTotal,
  //   descontoTotal,
  //   descontoUnitTotal,
  //   produtosSelecionados,
  //   servicosSelecionados,
  //   frete
  // ]);



  const handleDescontoTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(",", "."); // Permite digitação com vírgula e converte para ponto
    let numericValue = Number(value);

    const maxValue = descontoUnitTotal === "%" ? 100 : (totalProdutosSomados + totalServicosSomados);

    if (numericValue > maxValue) {
      numericValue = maxValue; // Limita ao máximo permitido
    } else if (numericValue < 0 || isNaN(numericValue)) {
      numericValue = 0; // Evita valores negativos ou inválidos
    }

    setDescontoTotal(numericValue);
  };


  const handleDescontoUnitTotalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDescontoUnitTotal(e.target.value);
  };

  const handleProdutosTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setProdutosTotal(value);
  };

  const handleServicosTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setServicosTotal(value);
  };

  // #endregion



  // #region PAGAMENTOS
  const [formasPagamento, setFormasPagamento] = useState<Formas[]>([]);
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento[]>([]);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<Pagamento | null>(null);
  const [parcela, setParcela] = useState<number>(0);
  const [valorParcela, setvalorParcela] = useState<number>(0);
  const [juros, setJuros] = useState<number>(0);
  const [data_parcela, setDataParcela] = useState<string>("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1); // Novo estado para quantidade de parcelas
  const [restanteAserPago, setRestanteAserPago] = useState(valorTotalTotal);
  const [totalPagamentos, setTotalPagamentos] = useState(0);


  const fetchFormasPagamento = async () => {
    try {
      const response = await axios.get(
        "http://localhost:9009/api/formas_pagamento",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.forma_pagamento);
      setFormasPagamento(response.data.forma_pagamento);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao buscar formas de pagamento:", error);
    }
  };

  const handleRemovePagamento = (id: number) => {
    setPagamentos((prev) => {
      // Remove o pagamento com base no ID
      const novaLista = prev.filter((pagamento) => pagamento.id !== id);

      // Recalcula as parcelas para manter a sequência correta
      return novaLista.map((pagamento, index) => ({
        ...pagamento,
        parcela: index + 1, // Atualiza a parcela com base na nova posição
      }));
    });
  };

  const handleAdicionarPagamento = () => {
    if (!selectedFormaPagamento || !data_parcela) {
      alert("Prencha a forma de pagamento, o valor e a data de pagamento");
      return;
    }
    const novoPagamento: Pagamento = {
      id: Date.now(),
      cod_forma_pagamento: selectedFormaPagamento.cod_forma_pagamento,
      nome: selectedFormaPagamento.nome,
      formaPagamento: selectedFormaPagamento,
      parcela: pagamentos.length + 1, // Garante que a parcela seja sempre sequencial
      valorParcela,
      juros,
      tipo_juros: "Percentual",
      data_parcela,
    };

    setPagamentos((prev) => [...prev, novoPagamento]);

    setSelectedFormaPagamento(null);
    setJuros(0);
    setDataParcela("");
    setvalorParcela(0);
  };

  const handleAdicionarMultiplasParcelas = () => {
    if (!selectedFormaPagamento || !data_parcela || quantidadeParcelas < 1) return;

    const novasParcelas: Pagamento[] = Array.from({ length: quantidadeParcelas }, (_, i) => {
      const dataInicial = new Date(data_parcela + 'T00:00:00');
      const dataParcelaAtual = new Date(dataInicial);
      dataParcelaAtual.setMonth(dataInicial.getMonth() + i);

      return {
        id: Date.now() + i, // Garantindo IDs únicos
        cod_forma_pagamento: selectedFormaPagamento.cod_forma_pagamento,
        nome: selectedFormaPagamento.nome,
        formaPagamento: selectedFormaPagamento,
        parcela: pagamentos.length + i + 1, // Sequencial baseado no número de parcelas já existe no banco de dadosntes
        valorParcela,
        juros,
        tipo_juros: "Percentual",
        data_parcela: dataParcelaAtual.toISOString().split('T')[0], // Formatando para "yyyy-MM-dd"
      };
    });


    setPagamentos((prev) => [...prev, ...novasParcelas]);
    setSelectedFormaPagamento(null);
    setvalorParcela(0);
    setJuros(0);
    setDataParcela("");
    setQuantidadeParcelas(1); // Reseta a quantidade de parcelas para 1 após adicionar
  };

  useEffect(() => {
    setParcela(pagamentos.length > 0 ? pagamentos[pagamentos.length - 1].parcela! + 1 : 1);
  }, [pagamentos]);

  useEffect(() => {
    const totalPago = pagamentos.reduce((acc, pagamento) => acc + (pagamento.valorParcela ?? 0), 0);
    setRestanteAserPago(valorTotalTotal - totalPago);
  }, [pagamentos, valorTotalTotal]);

  useEffect(() => {
    const totalComJuros = pagamentos.reduce((acc, pagamento) => {
      const valorParcela = pagamento.valorParcela ?? 0; // Garantir que valorParcela não seja undefined
      const juros = pagamento.juros ?? 0; // Garantir que juros não seja undefined
      const valorComJuros = valorParcela * (1 + juros / 100);
      return acc + valorComJuros;
    }, 0);

    setTotalPagamentos(totalComJuros);
  }, [pagamentos]);





  // #endregion


  // #region ORÇAMENTOS
  const [canaisVenda, setCanaisVenda] = useState<string[]>([]);
  const [selectedCanal, setSelectedCanal] = useState<string>('');
  const fetchCanaisVenda = async () => {
    try {
      const response = await axios.get('http://localhost:9009/api/orcamentos/canais-venda');
      setCanaisVenda(response.data.canaisVenda);
      console.log(response.data.canaisVenda);
    } catch (error) {
      console.error('Erro ao buscar canais de venda:', error);
    }
  };

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    if (orcamento.situacao !== 'Pendente') {
      return false;
    }

    switch (searchField) {
      case "cod_usuario":
        return (
          (orcamento.cod_responsavel &&
            orcamento.cod_responsavel.toString().includes(search)) || ""
        );
      case "cod_orcamento":
        return (
          (orcamento.cod_orcamento &&
            orcamento.cod_orcamento.toString().includes(search)) || ""
        );
      case "situacao":
        return (
          (orcamento.situacao &&
            orcamento.situacao.toLowerCase().includes(search.toLowerCase())) || ""
        );
      default:
        return (
          (orcamento.cod_cliente &&
            orcamento.cod_cliente.toString().includes(search)) || ""
        );
    }
  });

  const [selectedOrcamento, setSelectedOrcamento] = useState<Orcamento | null>(null);


  const [formValues, setFormValues] = useState<Orcamento>({
    cod_orcamento: 0,
    cod_responsavel: selectedUser?.cod_usuario || 0,
    cod_cliente: selectedClient?.cod_cliente || 0,
    canal_venda: "",
    data_venda: "",
    prazo: "",
    cod_centro_custo: 0,
    frota: "",
    nf_compra: "",
    cod_transportadora: selectedTransportadora?.cod_transportadora || 0,
    frete: 0,
    endereco_cliente: "Sim",
    logradouro: formValuesClients?.logradouro || "",
    cidade: "",
    bairro: "",
    estado: "",
    complemento: "",
    numero: 0,
    cep: "",
    observacoes_gerais: "",
    observacoes_internas: "",
    desconto_total: 0.0,
    valor_total: 0.0,
    situacao: "Pendente",
    dbs_pagamentos_orcamento: [],
    dbs_produtos_orcamento: [],
    dbs_servicos_orcamento: [],
  });
  useEffect(() => {
    console.log("FormValues atualizado:", formValues);
  }, [formValues]);


  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      valor_total: totalPagamentos || 0,
    }));
  }, [totalPagamentos]);




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

      // Tras somente os orçamentos que NÃO têm situacao "Cancelado"      
      setOrcamentos(response.data.orcamentos);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar orçamentos:", error);
    }
  };
  // #endregion




  // #region FROTAS
  const [modalFrotasVisible, setModalFrotasVisible] = useState(false);

  // #endregion





  // #region USEEFFECT
  useEffect(() => {
    fetchTransportadoras();
    fetchUsers();
    fetchOrcamentos();
    fetchClients();
    fetchCentrosCusto();
    fetchServicos();
    fetchProd();
    fetchCanaisVenda();
    fetchFormasPagamento();
  }, [token]);
  // #endregion




  // #region FUNÇÕES INPUTS
  const clearInputs = () => {
    setFormValues({
      cod_orcamento: 0,
      cod_responsavel: 0,
      cod_cliente: 0,
      canal_venda: "",
      data_venda: "",
      prazo: "",
      cod_centro_custo: 0,
      frota: "",
      nf_compra: "",
      cod_transportadora: 0,
      frete: 0,
      endereco_cliente: "naoUsar",
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
      valor_total: 0.0,
      dbs_pagamentos_orcamento: [],
      dbs_produtos_orcamento: [],
      dbs_servicos_orcamento: [],
    });
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
    setSelectedClient(null);
    setSelectedUser(null);
    setSelectedTransportadora(null);
    setSelectedCentroCusto(null);
    setSelectedServico(null);
    setProdSelecionados([]);
    setServicosSelecionados([]);
    setPagamentos([]);
    setFrete(0);
  };
  const clearInputsProd = () => {
    setFormValues({
      cod_orcamento: 0,
      cod_responsavel: 0,
      cod_cliente: 0,
      canal_venda: "",
      data_venda: "",
      prazo: "",
      cod_centro_custo: 0,
      frota: "",
      nf_compra: "",
      cod_transportadora: 0,
      frete: 0,
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
      valor_total: 0.0,
      dbs_pagamentos_orcamento: [],
      dbs_produtos_orcamento: [],
      dbs_servicos_orcamento: [],
    });
  };
  const clearInputsServ = () => {
    setFormValues({
      cod_orcamento: 0,
      cod_responsavel: 0,
      cod_cliente: 0,
      canal_venda: "",
      data_venda: "",
      prazo: "",
      cod_centro_custo: 0,
      frota: "",
      nf_compra: "",
      cod_transportadora: 0,
      frete: 0,
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
      desconto_total: 0,
      valor_total: 0,
      dbs_pagamentos_orcamento: [],
      dbs_produtos_orcamento: [],
      dbs_servicos_orcamento: [],
    });
  };

  const openDialog = (id: number) => {
    setOrcamentoIdToDelete(id);
    setModalDeleteVisible(true);
  };
  const closeDialog = () => {
    setModalDeleteVisible(false);
    setOrcamentoIdToDelete(null);
  };
  // #endregion




  // #region FUNÇÕES BOTÕES
  const handleSaveEdit = async () => {
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

      const isEmptyField = requiredFields.some((field) =>
        Object.prototype.hasOwnProperty.call(formValues, field) &&
        (formValues[field as keyof typeof formValues] === "" ||
          formValues[field as keyof typeof formValues] === null ||
          formValues[field as keyof typeof formValues] === undefined)
      );

      if (isEmptyField) {
        setItemEditDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Função para formatar a data no formato yyyy-MM-dd
      const formatDate = (date?: string | Date) => {
        if (!date) return "";
        const formattedDate = new Date(date);

        // Verifica se a data é válida antes de formatar
        if (isNaN(formattedDate.getTime())) return "";

        return formattedDate.toISOString().split("T")[0]; // Retorna no formato YYYY-MM-DD
      };

      const updatedFormValues = {
        ...formValues,
        data_venda: formatDate(formValues.data_venda),
        prazo: formatDate(formValues.prazo),
        produtos: produtosSelecionados.map((produto) => ({
          ...produto,
          valor_venda: produto.valor_unitario
        })),
        servicos: servicosSelecionados.map((servico) => ({
          ...servico,
          valor_venda: servico.valor_unitario
        })),
        parcelas: pagamentos.map((parcela) => ({
          ...parcela,
          data_parcela: formatDate(parcela.data_parcela)
        })),
        situacao: "Pendente",
      };

      const response = await axios.put(
        `http://localhost:9009/api/orcamentos/edit/${selectedOrcamento?.cod_orcamento}`,
        updatedFormValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        setIsEditing(false);
        setItemEditDisabled(false);
        setLoading(false);
        clearInputs();
        fetchOrcamentos();
        toast.success("Orçamento atualizado com sucesso!", {
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
    } catch (error: any) {
      setItemEditDisabled(false);
      setLoading(false);

      console.error("Erro ao salvar orçamento:", error);

      const errorMessage = error.response?.data?.message || "Erro ao salvar orçamento.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
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

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      // Função para formatar datas corretamente antes do envio
      const formatDate = (date?: string) => {
        if (!date) return "";
        const formattedDate = new Date(date);
        return isNaN(formattedDate.getTime()) ? "" : formattedDate.toISOString().split("T")[0];
      };

      const updatedFormValues = {
        ...formValues,
        data_venda: formatDate(formValues.data_venda),
        prazo: formatDate(formValues.prazo),
        situacao: "Pendente",
        parcelas: pagamentos.map((parcela) => ({
          ...parcela,
          data_parcela: formatDate(parcela.data_parcela),
        })),
        produtos: produtosSelecionados,
        servicos: servicosSelecionados,
      };

      // Lista de campos obrigatórios
      const requiredFields = [
        "cod_responsavel",
        "cod_cliente",
        "canal_venda",
        "data_venda",
        "prazo",
        "cod_centro_custo",
        "nf_compra",
        "cod_transportadora",
        "frete",
        "endereco_cliente",
        "valor_total",
        "situacao",
        "parcelas",
        "produtos",
        "servicos",
      ];

      // Encontrar o primeiro campo obrigatório vazio
      const missingField = requiredFields.find((field) => {
        const value = updatedFormValues[field as keyof typeof updatedFormValues];
        return value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
      });

      if (missingField) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info(`Por favor, preencha o campo: ${missingField.replace("_", " ")}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.post(
        "http://localhost:9009/api/orcamentos/register",
        updatedFormValues,
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
        setVisible(fecharTela);
      } else {
        throw new Error("Erro ao salvar orçamento.");
      }
    } catch (error: any) {
      setItemCreateReturnDisabled(false);
      setLoading(false);

      console.error("Erro ao salvar orçamento:", error);

      const errorMessage = error.response?.data?.message || "Erro ao salvar orçamento.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };
  useEffect(() => {
    console.log("Produtos selecionados atualizados:", produtosSelecionados);
  }, [produtosSelecionados]);

  useEffect(() => {
    console.log("Serviços selecionados atualizados:", servicosSelecionados);
  }, [servicosSelecionados]);

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (orcamento: Orcamento, visualizar: boolean) => {
    setVisualizar(visualizar)
    console.log("Orçamento recebido para edição:", orcamento);

    console.log("Produtos recebidos:", orcamento.dbs_produtos_orcamento);
    console.log("Serviços recebidos:", orcamento.dbs_servicos_orcamento);
    console.log("Pagamentos recebidos:", orcamento.dbs_pagamentos_orcamento);


    setFormValues(orcamento);
    setSelectedOrcamento(orcamento);

    // Atualiza os selects com os valores corretos
    setSelectedClient(clients.find(c => c.cod_cliente === orcamento.cod_cliente) || null);
    setSelectedUser(users.find(u => u.cod_usuario === orcamento.cod_responsavel) || null);
    setSelectedTransportadora(transportadoras.find(t => t.cod_transportadora === orcamento.cod_transportadora) || null);
    setSelectedCentroCusto(centrosCusto.find(cc => cc.cod_centro_custo === orcamento.cod_centro_custo) || null);

    setProdSelecionados(orcamento.dbs_produtos_orcamento ? orcamento.dbs_produtos_orcamento.map((produto) => ({ ...produto, id: produto.cod_prod_orcamento })) : []);
    setServicosSelecionados(orcamento.dbs_servicos_orcamento ? orcamento.dbs_servicos_orcamento.map((servico) => ({ ...servico, id: servico.cod_serv_orcamento })) : []);
    setPagamentos(orcamento.dbs_pagamentos_orcamento ? orcamento.dbs_pagamentos_orcamento.map((pagamento) => ({ ...pagamento, id: pagamento.cod_pag_orcamento })) : []);

    setIsEditing(true);
    setVisible(true); // Abre o modal
  };


  const handleCancelar = async () => {
    if (orcamentoIdToDelete === null) return;

    try {
      const response = await axios.put(
        `http://localhost:9009/api/orcamentos/cancel/${orcamentoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchOrcamentos();
        setModalDeleteVisible(false);
        toast.success("Orçamento cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar orçamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao cancelar orçamento:", error);
    }
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
  // #endregion



  // #region FUNÇÕES HANDLES
  const handleChangeCanal = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCanal(e.target.value);
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
    const selected = produtos.find((produto) => produto.cod_item == e.target.value);
    setSelectedProd(selected || null);
    console.log('Produto encontrado:', selected);

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

  // #endregion

  // #region ENDEREÇO

  const handleCepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove qualquer caractere não numérico
    const numericValue = value.replace(/[^0-9]/g, '');

    // Formata o CEP com o formato 'XXXXX-XXX'
    const formattedValue = numericValue.replace(
      /(\d{5})(\d{0,3})/,
      (match, p1, p2) => `${p1}-${p2}`
    );

    // Atualiza o estado com o valor formatado
    setFormValuesClients({
      ...formValuesClients,
      [name]: formattedValue, // Atualiza o campo de CEP com a formatação
    });
  };

  const handleCepKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (!/[0-9]/.test(char)) {
      e.preventDefault(); // Bloqueia a inserção de caracteres não numéricos
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Atualiza o estado de forma correta
    setFormValuesClients((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };


  const [usarEndereco, setUsarEndereco] = useState("naoUsar");
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;


    if (value === "usar") {
      setIsDisabled(true);
      setUsarEndereco("usar");

      // Se o cliente já estiver selecionado, restaura os dados de endereço
      setFormValues((prevValues) => ({
        ...prevValues,
        endereco_cliente: "Sim",
        logradouro: clientInfo.logradouro || "",
        cidade: clientInfo.cidade || "",
        bairro: clientInfo.bairro || "",
        estado: clientInfo.estado || "",
        complemento: clientInfo.complemento || "",
        numero: Number(clientInfo.numero) || 0,
        cep: clientInfo.cep || "",
      }));
      //SE VOLTAR PARA A OPÇÃO SIM, PREENCHE OS CAMPOS DENOVO
      setFormValuesClients({
        cod_cliente: clientInfo.cod_cliente || 0,
        nome: clientInfo.nome || "",
        logradouro: clientInfo.logradouro || "",
        cidade: clientInfo.cidade || "",
        bairro: clientInfo.bairro || "",
        estado: clientInfo.estado || "",
        complemento: clientInfo.complemento || "",
        numero: clientInfo.numero || "",
        cep: clientInfo.cep || "",
        email: clientInfo.email || "",
        telefone: clientInfo.telefone || "",
        celular: clientInfo.celular || "",
        situacao: clientInfo.situacao || "",
        tipo: clientInfo.tipo || "",
      });

    } else {
      setIsDisabled(false);
      setUsarEndereco("naoUsar");
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

      setFormValues((prevValues) => ({
        ...prevValues,
        endereco_cliente: "Não",
        logradouro: "",
        cidade: "",
        bairro: "",
        estado: "",
        complemento: "",
        numero: 0,
        cep: "",
      }));
    }
  };

  useEffect(() => {
    if (usarEndereco === "usar" && clientInfo.cod_cliente !== 0) {
      setFormValues((prevValues) => ({
        ...prevValues,
        endereco_cliente: "Sim",
        logradouro: clientInfo.logradouro || "",
        cidade: clientInfo.cidade || "",
        bairro: clientInfo.bairro || "",
        estado: clientInfo.estado || "",
        complemento: clientInfo.complemento || "",
        numero: Number(clientInfo.numero) || 0,
        cep: clientInfo.cep || "",
      }));

      setFormValuesClients({
        cod_cliente: clientInfo.cod_cliente || 0,
        nome: clientInfo.nome || "",
        logradouro: clientInfo.logradouro || "",
        cidade: clientInfo.cidade || "",
        bairro: clientInfo.bairro || "",
        estado: clientInfo.estado || "",
        complemento: clientInfo.complemento || "",
        numero: clientInfo.numero || "",
        cep: clientInfo.cep || "",
        email: clientInfo.email || "",
        telefone: clientInfo.telefone || "",
        celular: clientInfo.celular || "",
        situacao: clientInfo.situacao || "",
        tipo: clientInfo.tipo || "",
      });
    }
  }, [clientInfo, usarEndereco]); // Quando clientInfo ou usarEndereco mudar, o efeito será executado

  // #endregion






  // #region FUNÇÕES MODAIS
  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisualizar(false);
    setVisible(false);
  };
  const closeModalProd = () => {
    clearInputsProd();
    setVisibleProd(false);
  };
  const closeModalServ = () => {
    clearInputsServ();
    setVisibleServ(false);
  };
  // #endregion




  // #region FUNÇÕES INPUTS
  // numérico
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

  // #region alfabético
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
  // #endregion
  // #endregion




  // #region RETURN
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

          {
            //#region MODAL DELEÇÃO
          }
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
            <p>Tem certeza que deseja cancelar este orçamento?</p>
          </Dialog>
          {
            //#endregion
          }


          {
            //#region MODAL PRODUTOS
          }
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
                      className="border border-gray-400 !bg-gray-400 pl-1 rounded-sm h-8 w-full !important"
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
              <div className="grid grid-cols-2 gap-3 w-full">
                {!visualizando && (
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
                )}

                {!isEditing && !visualizando && (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      // onClick={() => { handleSaveReturnProd(false) }}
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
                      // onClick={() => { handleSaveReturn(true) }}
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

                {isEditing && !visualizando && (
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
          {
            //#endregion
          }


          {
            //#region MODAL SERVIÇOS
          }
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
                      onClick={() => { handleSaveReturnServicos(false) }}
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
                      onClick={() => { handleSaveReturnServicos(false) }}
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
                  <><Button
                    label="Sair Sem Salvar"
                    className="text-white"
                    icon="pi pi-times"
                    style={{
                      backgroundColor: "#dc3545",
                      border: "1px solid #dc3545",
                      padding: "0.75rem 2rem", // Tamanho aumentado
                      fontSize: "16px", // Tamanho aumentado
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={() => closeModalServ()} />
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
                      }} /></>

                )}
              </div>
            </div>

          </Dialog>
          {
            //#endregion
          }

          {
            //#region MODAL FROTAS
          }
          <Dialog
            header="Modal Frotas"
            visible={modalFrotasVisible}
            style={{ width: "auto" }}
            onHide={closeDialog}
            footer={
              <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">

                <div className="flex justify-between">
                  <div>
                    <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">
                      Histórico de Garantias - Frota XXXXXXX
                    </h2>
                  </div>
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
                    rowClassName={(data) => 'hover:bg-gray-200'}

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
                    <Column
                      header="Cliente"
                      body={(rowData) => {
                        const cliente = clients.find((c) => c.cod_cliente === rowData.cod_cliente);
                        return cliente ? cliente.nome : "Não encontrado";
                      }}
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
                      field="dtCadastro"
                      header="DT Cadastro"
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
                      body={(rowData) => {
                        // Verifica se a data de dtCadastro está presente e é válida
                        if (rowData.dtCadastro) {
                          // Certifica-se de que rowData.dtCadastro é um número de timestamp (se for uma string ISO)
                          const date = new Date(rowData.dtCadastro);

                          // Verifica se a data é válida
                          if (!isNaN(date.getTime())) {
                            const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false, // Formato de 24 horas
                            }).format(date);
                            return <span>{formattedDate}</span>;
                          } else {
                            return <span>Data inválida</span>;
                          }
                        } else {
                          return <span>Sem data</span>;
                        }
                      }}
                    />

                    <Column
                      field="prazo"
                      header="Prazo"
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
                      body={(rowData) => {
                        if (!rowData.prazo) return "-"; // Se estiver vazio, exibe '-'

                        const [year, month, day] = rowData.prazo.split("T")[0].split("-");
                        return `${day}/${month}/${year}`;
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

                  </DataTable>
                </div>
              </div>
            }
          >
            <p>Tem certeza que deseja cancelar este orçamento?</p>
          </Dialog>
          {
            //#endregion
          }

          {
            //#region MODAL PRINCIPAL
          }
          <Dialog
            header={visualizando ? "Visualizando Orçamento" : (isEditing ? "Editar Orçamento" : "Novo Orçamento")}
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

              {
                // #region primeira linha
              }
              <div className="border border-white p-2 rounded">
                <div className="grid grid-cols-4 gap-2">

                  <div className="">
                    <label htmlFor="codigo" className="block text-blue font-medium">
                      Código
                    </label>
                    <input
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={formValues.cod_orcamento}
                      disabled
                      className="bg-gray-300 border border-gray-400 pl-1 rounded-sm  h-[31.7px] w-full cursor-not-allowed disabled:!bg-gray-300"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="clients" className="block text-blue font-medium">
                      Cliente
                    </label>
                    <select
                      id="clients"
                      name="clients"
                      value={selectedClient ? selectedClient.cod_cliente : ""}
                      onChange={handleClientChange}
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


                  <div>
                    <label htmlFor="responsavel" className="block text-blue font-medium mb-1">
                      Vendedor/Responsável
                    </label>
                    <select
                      id="responsavel"
                      name="responsavel"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      value={selectedUser?.cod_usuario || ""}
                      disabled={visualizando}
                      onChange={(e) => {
                        const user = users.find((u) => u.cod_usuario === parseInt(e.target.value));
                        setSelectedUser(user || null);
                        // Atualizando formValues com o valor de cod_responsavel
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          cod_responsavel: user?.cod_usuario || 0, // Garantir que cod_responsavel seja atualizado
                        }));
                      }}
                    >
                      <option value='' disabled selected>
                        Selecione
                      </option>
                      {users.map((user) => (
                        <option key={user.cod_usuario} value={user.cod_usuario}>
                          {user.nome}
                        </option>
                      ))}
                    </select>
                  </div>


                </div>
                {
                  //#endregion
                }

                <br></br>

                {
                  // #region segunda linha
                }
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="canal_venda" className="block text-blue font-medium">
                      Canal de venda
                    </label>
                    <select
                      id="canal_venda"
                      name="canal_venda"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      value={formValues.canal_venda}
                      disabled={visualizando}
                      onChange={(e) => {
                        setFormValues((prev) => ({
                          ...prev,
                          canal_venda: e.target.value,
                        }));
                      }}
                    >
                      <option value="" disabled>
                        Selecione
                      </option>
                      {canaisVenda.map((canal) => (
                        <option key={canal} value={canal}>
                          {canal}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="data_venda" className="block text-blue font-medium">
                      Data de venda
                    </label>
                    <input
                      type="date"
                      id="data_venda"
                      name="data_venda"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      disabled={visualizando}
                      value={!isEditing ?
                        formValues.data_venda :
                        new Date(formValues.data_venda).toISOString().split("T")[0]}

                      onChange={(e) => {
                        const value = e.target.value;  // O valor já estará no formato correto
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          data_venda: value,  // Envia como string "yyyy-mm-dd"
                        }));
                      }}
                    />
                  </div>


                  <div>
                    <label htmlFor="prazo_entrega" className="block text-blue font-medium">
                      Prazo de entrega
                    </label>
                    <input
                      type="date"
                      id="prazo_entrega"
                      name="prazo_entrega"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      disabled={visualizando}
                      value={!isEditing ?
                        formValues.prazo :
                        (formValues.prazo ? new Date(formValues.prazo).toISOString().split("T")[0] : "")}


                      onChange={(e) => {
                        const value = e.target.value;  // O valor já estará no formato correto
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          prazo: value,  // Envia como string "yyyy-mm-dd"
                        }));
                      }}
                    />
                  </div>


                  <div>
                    <label htmlFor="centrosCusto" className="block text-blue font-medium">
                      Centro de Custo
                    </label>
                    <select
                      id="centrosCusto"
                      name="centrosCusto"
                      value={selectedCentroCusto ? selectedCentroCusto.cod_centro_custo : ''}
                      disabled={visualizando}
                      onChange={(e) => {
                        const selected = centrosCusto.find(
                          (est) => est.cod_centro_custo === Number(e.target.value)
                        );
                        setSelectedCentroCusto(selected || null);

                        if (selected) {
                          setFormValues((prevValues) => ({
                            ...prevValues,
                            cod_centro_custo: selected.cod_centro_custo,
                          }));
                        }
                      }}
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    >
                      <option value='' disabled selected>
                        Selecione
                      </option>
                      {centrosCusto.map((centro) => (
                        <option key={centro.cod_centro_custo} value={centro.cod_centro_custo}>
                          {centro.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
                {
                  //#endregion
                }
              </div>


              <br></br>

              {
                // #region produtos
              }
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-medium text-xl mr-2">Produtos</h3>
                  <button
                    className={`bg-green200 rounded-2xl transform transition-all duration-50 hidden hover:scale-150 hover:bg-green400 ${visualizando ? 'hidden' : ''}`}
                    onClick={() => setVisibleProd(true)}
                    disabled={visualizando}
                    style={{ padding: "0.1rem 0.1rem" }}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "2rem" }}
                      className="text-white text-center"
                    />
                  </button>

                </div>
                <div style={{ height: "16px" }}></div>

                {/* Linha principal (para entrada de dados) */}
                <div className="grid grid-cols-5 gap-2">
                  <div>
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
                    <label htmlFor="quantidadeProd" className="block text-blue font-medium">
                      Quantidade
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
                  <div>
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
                  <div>
                    <label htmlFor="descontoProd" className="block text-blue font-medium">
                      Desconto
                    </label>
                    <div className="relative">
                      <input
                        id="descontoProd"
                        name="descontoProd"
                        type="number"
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                        disabled={visualizando}
                        value={descontoProd}
                        onChange={handleDescontoProdChange}
                        step="0.01"
                        min={0}
                        max={descontoUnitProd === "Percentual" ? 100 : quantidadeProd * Number(selectedProd?.valor_venda ?? 0)}
                      />
                      <select
                        id="descontoUnitProd"
                        name="descontoUnitProd"
                        value={descontoUnitProd === "Percentual" ? "%prod" : "R$prod"} // Exibe % ou R$
                        disabled={visualizando}
                        onChange={handleDescontoUnitProdChange}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Impede a abertura do select padrão
                          setDescontoUnitProd((prev) => (prev === "Percentual" ? "Reais" : "Percentual"));
                        }}
                        className={`absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-50 px-1 ${visualizando ? 'hidden' : ''}`}

                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          background: "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)",
                          color: "black",
                          textAlign: "center",
                          border: "2px solid #6b7280",
                          borderRadius: "0",
                          paddingRight: "10px",
                          cursor: "pointer",
                          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #f5f5f5 30%, #c0c0c0 100%)";
                          e.currentTarget.style.borderColor = "#4b5563";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)";
                          e.currentTarget.style.borderColor = "#6b7280";
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        <option value="%prod">&nbsp;%</option>
                        <option value="R$prod">&nbsp;R$</option>
                      </select>
                    </div>
                  </div>



                  <div className="flex flex-col items-start gap-1">
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
                      <button
                        className={`bg-green-200 border border-green-700 rounded-2xl p-1 hover:bg-green-300 duration-50 hover:scale-125 flex items-center justify-center ml-2 h-8 ${visualizando ? 'hidden' : ''}`}
                        disabled={visualizando}
                        onClick={handleAdicionarLinha}
                      >
                        <FaPlus className="text-green-700 text-xl" />
                      </button>

                    </div>
                  </div>
                </div>

                <br></br>

                {/* Linhas adicionadas de produtos */}
                {produtosSelecionados.map((produto, index) => (
                  <div key={`${produto.cod_item}-${index}`} className="grid grid-cols-5 gap-2">
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ?
                          produto.descricao :
                          ('dbs_itens' in produto ? (produto as any).dbs_itens?.descricao : produto.descricao)
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.quantidade}
                        disabled
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ?
                          produto.valor_venda :
                          ('dbs_itens' in produto ? (produto as any).dbs_itens?.valor_venda : produto.valor_venda)
                        }
                        disabled
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? produto.descontoProd : produto.valor_desconto}
                        disabled
                      />
                      <select
                        className="absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-200 px-1"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          color: "gray",
                        }}
                        value={produto.descontoUnitProdtipo}
                        disabled
                      >
                        <option value="%prod">&nbsp;&nbsp;&nbsp;%</option>
                        <option value="R$prod">&nbsp;&nbsp;R$</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
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


              <br></br>

              {
                // #region serviços
              }
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-medium text-xl mr-2">Serviços</h3>
                  <button
                    className={`bg-green200 rounded-2xl transform transition-all hidden duration-50 hover:scale-150 hover:bg-green400 ${visualizando ? 'hidden' : ''}`}
                    onClick={() => setVisibleServ(true)}
                    disabled={visualizando}
                    style={{ padding: "0.1rem 0.1rem" }}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "2rem" }}
                      className="text-white text-center"
                    />
                  </button>

                </div>
                <div style={{ height: "16px" }}></div>

                {/* linha principal */}
                <div className="grid grid-cols-5 gap-2 items-center">
                  <div>
                    <label htmlFor="servico" className="block text-blue font-medium">
                      Serviço
                    </label>
                    <select
                      id="servico"
                      name="servico"
                      disabled={visualizando}
                      value={selectedServico ? selectedServico.cod_servico : ''}
                      onChange={handleServicoChange}
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                    >
                      <option
                        value=''
                        disabled
                        selected
                      >
                        Selecione
                      </option>
                      {servicos.map((servico) => (
                        <option key={servico.cod_servico} value={servico.cod_servico}>
                          {servico.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantidadeServ" className="block text-blue font-medium">
                      Quantidade
                    </label>
                    <input
                      id="quantidadeServ"
                      name="quantidadeServ"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                      disabled={visualizando}
                      value={quantidadeServ}
                      onChange={handleQuantidadeServChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="vl_unit_serv" className="block text-blue font-medium">
                      Valor Unitário
                    </label>
                    <input
                      id="vl_unit_serv"
                      name="vl_unit_serv"
                      type="text"
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                      value={new Intl.NumberFormat('pt-BR', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(Number(formValuesServico.valor_venda ? formValuesServico.valor_venda : 0))}
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="descontoServ" className="block text-blue font-medium">
                      Desconto
                    </label>
                    <div className="relative">
                      <input
                        id="descontoServ"
                        name="descontoServ"
                        type="number"
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                        value={descontoServ}
                        disabled={visualizando}
                        onChange={handleDescontoServChange}
                        step="0.01"
                        min={0}
                        max={descontoUnit === "Percentual" ? 100 : quantidadeServ * Number(selectedServico?.valor_venda ?? 0)}
                      />
                      <select
                        id="descontoUnit"
                        name="descontoUnit"
                        value={descontoUnit === "Percentual" ? "%" : "R$"}
                        disabled={visualizando}
                        onChange={handleDescontoUnitChange}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Evita abrir o select padrão

                          setDescontoUnit((prev) => (prev === "Percentual" ? "Reais" : "Percentual"));
                        }}
                        className={`absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-50 px-1 ${visualizando ? 'hidden' : ''}`}
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          background: "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)", // Gradiente mais suave e claro
                          color: "black", // Texto preto
                          textAlign: "center", // Alinha o texto centralizado
                          border: "2px solid #6b7280", // Borda cinza escuro e mais espessa
                          borderRadius: "0", // Borda quadrada
                          paddingRight: "10px", // Ajuste no padding direito
                          cursor: "pointer", // Indica que é clicável
                          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease", // Transição suave
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Sombra mais suave
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #f5f5f5 30%, #c0c0c0 100%)"; // Cor de fundo mais escura no hover
                          e.currentTarget.style.borderColor = "#4b5563"; // Borda mais clara
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Sombra mais forte no hover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)"; // Cor de fundo original
                          e.currentTarget.style.borderColor = "#6b7280"; // Borda original
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // Sombra suave original
                        }}
                      >
                        <option value="%">&nbsp;%</option>
                        <option value="R$">&nbsp;R$</option>
                      </select>
                    </div>
                  </div>


                  <div className="flex flex-col items-start gap-1 w-full">
                    <label htmlFor="vl_total_serv" className="block text-blue font-medium">
                      Valor Total
                    </label>
                    <div className="flex items-center w-full gap-2">
                      <input
                        id="vl_total_serv"
                        name="vl_total_serv"
                        type="text"
                        disabled
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                        value={`R$ ${new Intl.NumberFormat('pt-BR', {
                          style: 'decimal',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(Number(valorTotalServ ? valorTotalServ : 0))}`}
                      />
                      <button
                        className={`bg-green-200 border border-green-700 rounded-2xl hover:bg-green-400 duration-50 hover:scale-125 p-1 flex items-center justify-center h-8 w-8 ${visualizando ? 'hidden' : ''}`}
                        onClick={handleAdicionarServico}
                      >
                        <FaPlus className="text-green-700 text-xl" />
                      </button>

                    </div>
                  </div>

                </div>

                <br></br>

                {/* Linhas adicionadas de serviços */}
                {servicosSelecionados.map((servico) => (
                  <div key={servico.id} className="grid grid-cols-5 gap-2 items-center mt-2">
                    <div>
                      <input
                        type="text"
                        disabled
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? servico.nome : (servico.dbs_servicos?.descricao ?? servico.nome)}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        disabled
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={servico.quantidade}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        disabled
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing
                          ? servico.valor_venda
                          : (servico.dbs_servicos?.valor_venda ?? servico.valor_venda)
                        }

                      />
                    </div>
                    {/* <div>
                      <input
                        type="text"
                        disabled
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? servico.descontoProd : servico.valor_desconto}
                      />
                    </div> */}
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? servico.descontoProd : (servico.valor_desconto ? servico.valor_desconto : servico.descontoProd)}
                        disabled
                      />
                      <select
                        className="absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-200 px-1"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          color: "gray",
                        }}
                        value={servico.descontoUnitProdtipo}
                        disabled
                      >
                        <option value="%prod">&nbsp;&nbsp;&nbsp;%</option>
                        <option value="R$prod">&nbsp;&nbsp;R$</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={servico.valor_total}
                        disabled
                      />
                      <button
                        className={`bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center hover:scale-150 duration-50 transition-all ${visualizando ? 'hidden' : ''}`}
                        onClick={() => handleRemoveLinhaServico(servico.id)}
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



              <br></br>

              {
                // #region proxima linha
              }
              <div className="border border-white p-2 rounded">
                <div className="grid grid-cols-4 gap-2 ">
                  <div>
                    <label htmlFor="frota" className="block text-blue font-medium">
                      Frota
                    </label>
                    <input
                      id="frota"
                      name="frota"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      type="text"
                      value={formValues.frota} // Mantém o valor sincronizado com formValues
                      disabled={visualizando}
                      onChange={(e) => {
                        setFormValues((prev) => ({
                          ...prev,
                          frota: e.target.value, // Atualiza o valor de frota
                        }));
                      }}
                    />
                    <button
                      className={`bg-green-200 rounded-2xl p-1 transform transition-all duration-50 hover:scale-150 hover:bg-green-400 `}
                      onClick={() => { setModalFrotasVisible(true) }}
                    />

                  </div>

                  <div>
                    <label htmlFor="nf-compra" className="block text-blue font-medium">
                      NF-Compra
                    </label>
                    <input
                      type="text"
                      id="nf-compra"
                      name="nf-compra"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      disabled={visualizando}
                      value={formValues.nf_compra}
                      onChange={(e) => {
                        setFormValues((prev) => ({
                          ...prev,
                          nf_compra: e.target.value,
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="transportadora" className="block text-blue font-medium">
                      Transportadora:
                    </label>
                    <select
                      id="transportadora"
                      name="transportadora"
                      value={selectedTransportadora ? selectedTransportadora.cod_transportadora : ''}
                      disabled={visualizando}
                      onChange={(e) => {
                        const selected = transportadoras.find(
                          (est) => est.cod_transportadora === Number(e.target.value)
                        );
                        setSelectedTransportadora(selected || null);
                        if (selected) {
                          setFormValues((prevValues) => ({
                            ...prevValues,
                            cod_transportadora: selected.cod_transportadora, // Atualizando formValues com cod_transportadora
                          }));
                        }
                      }}
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    >
                      <option value='' disabled selected>
                        Selecione
                      </option>
                      {transportadoras.map((transportadora) => (
                        <option key={transportadora.cod_transportadora} value={transportadora.cod_transportadora}>
                          {transportadora.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="frete" className="block text-blue font-medium">
                      Frete
                    </label>
                    <input
                      id="frete"
                      name="frete"
                      type="number"
                      min={0}
                      defaultValue={0}
                      value={!isEditing ? frete : formValues.frete}
                      disabled={visualizando}
                      onChange={(e) => {
                        const newFrete = parseFloat(e.target.value) || 0;
                        setFrete(newFrete);
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          frete: newFrete,
                        }));
                      }}
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    />
                  </div>


                </div>
              </div>
              {
                //#endregion
              }

              <br></br>

              {
                // #region endereço de entrega
              }
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
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      onChange={handleSelectChange}
                      disabled={visualizando}
                      value={usarEndereco}
                    >
                      <option defaultValue="naoUsar">NÃO</option>
                      <option value="usar">SIM</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="CEP" className="block text-blue font-medium">
                      CEP
                    </label>
                    <input
                      id="CEP"
                      name="cep" // Alterado de "CEP" para "cep" para garantir que o nome do campo corresponda ao estado
                      type="text"
                      value={formValuesClients.cep || ""} // Garante que o valor seja atualizado corretamente
                      onChange={handleCepInputChange}
                      onKeyPress={handleCepKeyPress}
                      maxLength={9}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
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
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
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
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
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
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                      maxLength={2}
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
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
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
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                </div>
              </div>
              {
                //#endregion
              }


              <br></br>

              {
                // #region total
              }
              <div className="border border-gray-400 p-2 rounded mt-2 bg-gray-100">
                <h3 className="text-blue font-medium text-xl mr-2">Total</h3>
                <div style={{ height: "16px" }}></div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="produtos" className="block text-blue font-medium">
                      Produtos
                    </label>
                    <input
                      id="produtos"
                      name="produtos"
                      type="text"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      value={`R$ ${totalProdutosSomados.toLocaleString("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 })}`}
                      step="0.001"
                      disabled
                    />
                  </div>

                  <div>
                    <label htmlFor="servicos" className="block text-blue font-medium">
                      Serviços
                    </label>
                    <input
                      id="servicos"
                      name="servicos"
                      type="text"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      value={`R$ ${totalServicosSomados.toFixed(3)}`}
                      step="0.001"
                      disabled
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="descontoTotal" className="block text-blue font-medium">
                      Desconto
                    </label>
                    <div className="relative">
                      <input
                        id="descontoTotal"
                        name="descontoTotal"
                        type="number"
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                        disabled={visualizando}
                        value={descontoTotal}
                        onChange={handleDescontoTotalChange}
                        step="0.01"
                        min={0}
                        max={descontoUnitTotal == "%" ? 100 : (totalProdutosSomados + totalServicosSomados)}
                      />
                      <select
                        id="descontoUnitTotal"
                        name="descontoUnitTotal"
                        value={descontoUnitTotal}
                        disabled={visualizando}
                        onChange={handleDescontoUnitTotalChange}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Impede a abertura do select

                          const selectElement = e.currentTarget; // Obtém o próprio select
                          const nextValue = selectElement.value === "%" ? "R$" : "%"; // Alterna entre os valores

                          // Cria um evento de mudança manualmente
                          const event = new Event("change", { bubbles: true });
                          selectElement.value = nextValue; // Atualiza o valor
                          selectElement.dispatchEvent(event); // Dispara o evento de mudança
                        }}
                        className="absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-50 px-1"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          background: "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)", // Gradiente mais suave e claro
                          color: "black", // Texto preto
                          textAlign: "center", // Alinha o texto centralizado
                          border: "2px solid #6b7280", // Borda cinza escuro e mais espessa
                          borderRadius: "0", // Borda quadrada
                          paddingRight: "10px", // Ajuste no padding direito
                          cursor: "pointer", // Indica que é clicável
                          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease", // Transição suave
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)", // Sombra mais suave
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #f5f5f5 30%, #c0c0c0 100%)"; // Cor de fundo mais escura no hover
                          e.currentTarget.style.borderColor = "#4b5563"; // Borda mais clara
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Sombra mais forte no hover
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)"; // Cor de fundo original
                          e.currentTarget.style.borderColor = "#6b7280"; // Borda original
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)"; // Sombra suave original
                        }}
                      >
                        <option value="%">&nbsp;%</option>
                        <option value="R$">&nbsp;R$</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="vl_total_total" className="block text-blue font-medium">
                      Valor Total
                    </label>
                    <input
                      id="vl_total_total"
                      value={!isEditing
                        ? `R$ ${Number(valorTotalTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : `R$ ${(Number(valorTotalTotal) + Number(formValues.frete || 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      }

                      name="vl_total_total"
                      type="text"
                      className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      disabled // O valor total final não é editável
                    />
                  </div>
                </div>
              </div>
              {
                //#endregion
              }

              <br></br>

              {
                // #region pagamentos
              }
              <div className="border border-gray-400 p-2 rounded mt-2 bg-gray-100">
                <h3 className="text-blue font-medium text-xl mr-2">Pagamentos</h3>
                <div style={{ height: "16px" }}></div>
                <div className="grid grid-cols-6 gap-2">
                  <div>
                    <label htmlFor="restanteAserPago" className="block text-black font-small">Restante</label>
                    <input
                      id="restanteAserPago"
                      name="restanteAserPago"
                      type="number"
                      disabled
                      className={`w-full border ${visualizando ? '!bg-gray-300 !border-gray-400' : `${restanteAserPago < 0 ? '!bg-red50' : '!bg-gray-200'} pl-1 rounded-sm h-6 ${restanteAserPago < 0 ? 'border-red' : 'border-gray-400'}`}`}
                      value={!isEditing
                        ? restanteAserPago
                        : (Number(valorTotalTotal) + Number(formValues.frete || 0) - Number(totalPagamentos))
                      }
                    />
                    {/* <span>
                      R$ {!isEditing
                        ? Number(restanteAserPago).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                        : (Number(valorTotalTotal) + Number(formValues.frete || 0) - Number(totalPagamentos)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      }
                    </span> */}

                  </div>

                </div>
                <br></br>
                <div className="grid grid-cols-6 gap-2">
                  <div>
                    <label htmlFor="pagamento" className="block text-blue font-medium">
                      Forma
                    </label>
                    <select
                      id="pagamento"
                      name="pagamento"
                      className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      disabled={visualizando}
                      value={selectedFormaPagamento?.cod_forma_pagamento || ""}
                      onChange={(e) => {
                        const selected = formasPagamento.find(f => f.cod_forma_pagamento === Number(e.target.value));
                        if (selected) {
                          setSelectedFormaPagamento({
                            id: Date.now(),
                            nome: selected.nome,
                            cod_forma_pagamento: selected.cod_forma_pagamento,
                            formaPagamento: selected // Incluindo a formaPagamento completa
                          });
                        } else {
                          setSelectedFormaPagamento(null);
                        }
                      }}

                    >
                      <option value="">Selecione</option>
                      {formasPagamento.map((forma) => (
                        <option key={forma.cod_forma_pagamento} value={forma.cod_forma_pagamento}>
                          {forma.nome ?? "Sem Nome"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="parcela" className="block text-blue font-medium">Parcela</label>
                    <input
                      id="parcela"
                      name="parcela"
                      type="number"
                      className={`w-full border border-gray-400 pl-1 rounded-sm h-8 !bg-gray-200 ${visualizando ? 'hidden' : ''}`}
                      value={pagamentos.length > 0 ? (pagamentos[pagamentos.length - 1]?.parcela ?? 0) + 1 : 1}
                      disabled
                    />
                  </div>

                  <div>
                    <label htmlFor="valorParcela" className="block text-blue font-medium">Valor</label>
                    <input
                      id="valorParcela"
                      name="valorParcela"
                      type="number"
                      className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                      disabled={visualizando}
                      value={valorParcela}
                      onChange={(e) => setvalorParcela(Number(e.target.value))}
                    />
                  </div>


                  <div>
                    <label htmlFor="juros" className="block text-blue font-medium">Juros %</label>
                    <input
                      id="juros"
                      name="juros"
                      type="number"
                      className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                      placeholder="R$"
                      value={juros}
                      disabled={visualizando}
                      onChange={(e) => setJuros(Number(e.target.value))}
                      step="0.01"
                    />
                  </div>


                  <div className="col-span-2 flex flex-col items-start gap-1 w-full">
                    <label htmlFor="data_parcela" className="block text-blue font-medium">
                      Data da Parcela
                    </label>
                    <div className="flex items-center w-full gap-2">
                      <input
                        id="data_parcela"
                        name="data_parcela"
                        type="date"
                        className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                        disabled={visualizando}
                        value={data_parcela}
                        onChange={(e) => setDataParcela(e.target.value)}
                      />
                      <button
                        className={`bg-green-200 border border-green-700 hover:bg-green-400 hover:scale-125 transition-all rounded-2xl p-1 flex items-center justify-center h-8 ${visualizando ? 'hidden' : ''}`}
                        onClick={handleAdicionarPagamento}
                        disabled={visualizando}
                      >
                        <FaPlus className="text-green-700 text-xl" />
                      </button>

                    </div>
                    <div className={`flex ml-auto items-center gap-1 ${visualizando ? 'hidden' : ''}`}>
                      <label htmlFor="quantidadeParcelas" className="text-sm">Parcelas Rápido&nbsp;</label>
                      <input
                        type="number"
                        id="quantidadeParcelas"
                        value={quantidadeParcelas}
                        onChange={(e) => setQuantidadeParcelas(Number(e.target.value))}
                        min={1}
                        max={24}
                        className="w-10 h-6 text-center border border-gray-400 rounded-sm"
                      />
                      <button
                        onClick={handleAdicionarMultiplasParcelas}
                        className="bg-blue200 border border-blue500 hover:bg-blue400 hover:scale-125 transition-all duration-50 rounded-2xl p-1 flex items-center justify-center h-7 w-7 ml-[6px]"
                      >
                        <FaPlus className="text-gray-100 text-xl h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <br />

                {/* Pagamentos Adicionados */}
                {pagamentos.map((pagamento, index) => (
                  <div key={`${pagamento.id}-${index}`} className="grid grid-cols-6 gap-2 items-center mt-2">
                    <div> {/* Forma */}
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? pagamento.nome : pagamento.cod_forma_pagamento}
                        disabled
                        readOnly
                      />
                    </div>

                    <div> {/* Parcela */}
                      <input
                        type="number"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.parcela} // valor individual da parcela
                        disabled
                        readOnly
                      />
                    </div>

                    <div> {/* Valor */}
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.valorParcela ? pagamento.valorParcela * (1 + (pagamento.juros ? pagamento.juros / 100 : 0)) : 0}
                        disabled
                        readOnly
                      />
                    </div>

                    <div> {/* Juros */}
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.juros}
                        disabled
                        readOnly
                      />
                    </div>

                    {/* Data */}
                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={
                          pagamento.data_parcela
                            ? new Date(pagamento.data_parcela).toLocaleDateString("pt-BR")
                            : ""
                        }
                      // value={
                      //   pagamento.data_parcela
                      //     ? isEditing
                      //       ? new Date(pagamento.data_parcela).toISOString().split("T")[0] // Formato YYYY-MM-DD para inputs do tipo date
                      //       : new Date(pagamento.data_parcela).toLocaleDateString("pt-BR") // Formato DD/MM/YYYY para exibição
                      //     : ""
                      // }
                      />
                      <button
                        className={`bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center hover:scale-150 duration-50 transition-all ${visualizando ? 'hidden' : ''}`}
                        onClick={() => handleRemovePagamento(pagamento.id)}
                      >
                        <FaTimes className="text-red text-2xl" />
                      </button>

                    </div>
                  </div>
                ))}
                <div className="flex justify-end mt-5">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="totalPagamentos" className="text-blue text-[16px]">Total final</label>
                    <input
                      id="totalPagamentos"
                      name="totalPagamentos"
                      type="number"
                      className="w-25 h-6 border border-gray-400 pl-1 rounded-sm !bg-gray-200"
                      value={totalPagamentos}
                      readOnly
                    />
                  </div>
                </div>

              </div>

              {
                //#endregion
              }

              <br></br>

              {
                // #region oberservações
              }
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label htmlFor="obervacoes_gerais" className="block text-blue font-medium">
                    Observações Gerais:
                  </label>
                  <textarea
                    id="obervacoes_gerais"
                    name="obervacoes_gerais"
                    value={formValues.observacoes_gerais || ""}
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-32 ${visualizando ? 'bg-gray-300 border-gray-400' : ''}`}

                    onChange={(e) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        observacoes_gerais: e.target.value, // Atualiza o campo observacoes_gerais
                      }));
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="obervacoes_internas" className="block text-blue font-medium">
                    Observações Internas:
                  </label>
                  <textarea
                    id="obervacoes_internas"
                    name="obervacoes_internas"
                    value={formValues.observacoes_internas || ""}
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-32 ${visualizando ? 'bg-gray-300 border-gray-400' : ''}`}
                    onChange={(e) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        observacoes_internas: e.target.value, // Atualiza o campo observacoes_internas
                      }));
                    }}
                  />
                </div>

              </div>
              {
                //#endregion
              }
            </div>

            {
              // #region botoes
            }
            <div className="flex justify-between items-center  mt-16">
              <div className={`grid ${isEditing ? "grid-cols-2" : "grid-cols-3"} gap-3 w-full`}>
                {!visualizando && (
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
                )}

                {!isEditing && !visualizando && (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={() => { handleSaveReturn(false) }}
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
                      onClick={() => { handleSaveReturn(true) }}
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

                {isEditing && !visualizando && (
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
            {
              //#endregion
            }
          </Dialog>
          {
            //#endregion
          }


          {
            //#region TABELA
          }
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
                    className="bg-green200 rounded-3xl mr-3 transform transition-all duration-50 hover:scale-150 hover:bg-green400  "
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
                <div className="flex items-center">
                  <InputText
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder=""
                    className="p-inputtext-sm border rounded-md ml-1 text-black pl-1"
                    style={{ border: "1px solid #1B405D80" }}
                  />
                  <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    className="p-inputtext-sm border rounded-md h-7 w-13 text-black"
                    style={{ border: "1px solid #1B405D80" }}
                  >
                    <option value="cod_cliente">Código do Cliente</option>
                    <option value="cod_orcamento">Código do Orçamento</option>
                    <option value="situacao">Situação</option>
                  </select>

                </div>
              </div>
              <DataTable
                value={filteredOrcamentos.slice(first, first + rows)}
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
                className="w-full"
                responsiveLayout="scroll"
              >
                <Column
                  field="cod_orcamento"
                  header="Código"
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
                <Column
                  header="Cliente"
                  body={(rowData) => {
                    const cliente = clients.find((c) => c.cod_cliente === rowData.cod_cliente);
                    return cliente ? cliente.nome : "Não encontrado";
                  }}
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
                  header="Valor"
                  style={{
                    width: "5%",
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
                  body={(rowData) =>
                    rowData.valor_total
                      ? Number(rowData.valor_total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "R$ 0,00"
                  }

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
                  field="prazo"
                  header="Prazo"
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
                  body={(rowData) => {
                    if (!rowData.prazo) return "-"; // Se estiver vazio, exibe '-'

                    const [year, month, day] = rowData.prazo.split("T")[0].split("-");
                    return `${day}/${month}/${year}`;
                  }}
                />


                <Column
                  field="dtCadastro"
                  header="DT Cadastro"
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
                  body={(rowData) => {
                    // Verifica se a data de dtCadastro está presente e é válida
                    if (rowData.dtCadastro) {
                      // Certifica-se de que rowData.dtCadastro é um número de timestamp (se for uma string ISO)
                      const date = new Date(rowData.dtCadastro);

                      // Verifica se a data é válida
                      if (!isNaN(date.getTime())) {
                        const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false, // Formato de 24 horas
                        }).format(date);
                        return <span>{formattedDate}</span>;
                      } else {
                        return <span>Data inválida</span>;
                      }
                    } else {
                      return <span>Sem data</span>;
                    }
                  }}

                />


                <Column
                  header=""
                  body={(rowData) => (
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => handleEdit(rowData, true)}
                        className="hover:scale-125 hover:bg-blue400 p-2 bg-blue300 transform transition-all duration-50  rounded-2xl"
                        title="Visualizar"
                      >
                        <MdVisibility style={{ fontSize: "1.2rem" }} className="text-white text-2xl" />
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

                {permissions?.edicao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(rowData, false)}
                          className="hover:scale-125 hover:bg-yellow700 p-2 bg-yellow transform transition-all duration-50  rounded-2xl"
                          title="Editar"
                        >
                          <MdOutlineModeEditOutline style={{ fontSize: "1.2rem" }} className="text-white text-2xl" />
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
                          className="bg-red hover:bg-red600 hover:scale-125 p-2 transform transition-all duration-50  rounded-2xl"
                          title="Cancelar"
                        >
                          <FaBan style={{ fontSize: "1.2rem" }} className="text-white text-2xl" />
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
          {
            //#endregion
          }
        </div>
      </SidebarLayout>
      <Footer />
    </>
  );
};
// #endregion

export default OrcamentosPage;
