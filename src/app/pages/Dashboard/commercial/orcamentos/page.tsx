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
  valor_total?: string;
}

//mesma coisa que ITENS
interface Produto {
  id: number; // Novo campo id
  cod_item: string;
  descricao: string;
  valor_venda?: string;
  valor_custo?: string;
  valor_total?: string;
  quantidade?: number;
  descontoUnitProdtipo?: string;
  descontoProd?: number;
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

  // #region TRANSPORTADORAS
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [formValuesTransportadoras, setFormValuesTransportadoras] = useState<Transportadora>({
    cod_transportadora: 0,
    nome: "",
  });
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




  // #region SERVIÇOS
  const calcularTotalServicos = () => {
    const total = servicosSelecionados.reduce((acc, servico) => acc + parseFloat(servico.valor_total || "0"), 0);
    return total;
  };

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
  });
  const [quantidadeServ, setQuantidadeServ] = useState(1);
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
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);

  const handleAdicionarServico = () => {
    if (!selectedServico || !quantidadeServ) return; // Garante que tenha um serviço e quantidade antes de adicionar

    const novoServico: Servico = {
      id: Date.now(),  // Usando Date.now() para criar um identificador único
      cod_servico: selectedServico.cod_servico,
      nome: selectedServico.nome,  // Usando o campo nome da interface
      descricao: selectedServico.descricao,
      valor_venda: selectedServico.valor_venda,
      quantidade: quantidadeServ,
      descontoUnitProdtipo: descontoUnit,
      descontoProd: descontoServ,
      valor_total: valorTotalServ.toString(),
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
  });
  const [quantidadeProd, setQuantidadeProd] = useState(1);
  const [descontoProd, setDescontoProd] = useState(0);
  const [descontoUnitProd, setDescontoUnitProd] = useState('%prod'); // '%' ou 'R$'
  const [valorTotalProd, setValorTotalProd] = useState(0);
  const [linhas, setLinhas] = useState<Produto[]>([]);
  //produtos-handles
  const handleRemoveLinhaProd = (id: number) => {
    setProdSelecionados((prev) => prev.filter((produto) => produto.id !== id));
  };
  const handleAdicionarLinha = () => {
    if (!selectedProd || !quantidadeProd) return; // Garante que tenha um produto e quantidade antes de adicionar

    const novoProduto: Produto = {
      id: Date.now(),  // Usando Date.now() para criar um identificador único
      cod_item: selectedProd.cod_item,
      descricao: selectedProd.descricao,
      valor_venda: selectedProd.valor_venda,
      quantidade: quantidadeProd,
      descontoUnitProdtipo: descontoUnitProd,
      descontoProd: descontoProd,
      valor_total: valorTotalProd.toString(),
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
    });
  };
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

  const calcularTotalProdutos = () => {
    const total = produtosSelecionados.reduce((acc, produto) => acc + parseFloat(produto.valor_total || "0"), 0);
    return total;
  };

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
  // #endregion




  // #region TOTAL
  const [descontoTotal, setDescontoTotal] = useState(0);
  const [descontoUnitTotal, setDescontoUnitTotal] = useState('%');
  const [produtosTotal, setProdutosTotal] = useState(0);
  const [servicosTotal, setServicosTotal] = useState(0);
  const [valorTotalTotal, setValorTotalTotal] = useState(0);
  const [frete, setFrete] = useState(0.0);

  const calcularTotal = () => {
    let totalProdutos = calcularTotalProdutos();
    let totalServicos = calcularTotalServicos();
    let total = totalProdutos + totalServicos + frete;

    // Aplicando o desconto, se houver
    if (descontoUnitTotal === '%') {
      total = total - (total * (descontoTotal / 100));
    } else if (descontoUnitTotal === 'R$') {
      total = total - descontoTotal;
    }

    setValorTotalTotal(total);
  };

  // Função para recalcular o valor total de produtos, serviços e descontos
  useEffect(() => {
    calcularTotal();
  }, [produtosTotal,
    servicosTotal,
    descontoTotal,
    descontoUnitTotal,
    produtosSelecionados,
    servicosSelecionados,
    frete
  ]);  // Dependências que devem disparar o cálculo



  const handleDescontoTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : Number(e.target.value);  // Se vazio, o valor é 0
    setDescontoTotal(value);
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

    const novasParcelas = Array.from({ length: quantidadeParcelas }, (_, i) => ({
      id: Date.now() + i, // Garantindo IDs únicos
      cod_forma_pagamento: selectedFormaPagamento.cod_forma_pagamento,
      nome: selectedFormaPagamento.nome,
      formaPagamento: selectedFormaPagamento,
      parcela: pagamentos.length + i + 1, // Sequencial baseado no número de parcelas já existentes
      valorParcela,
      juros,
      data_parcela,
    }));

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
  // #endregion




  // #region FUNÇÕES BOTÕES
  const handleSaveEdit = async () => {
    setItemEditDisabled(true);
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
  // #endregion





  // #region FUNÇÕES HANDLES
  const handleChangeCanal = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCanal(e.target.value);
  };

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
        id: selected.id || 0, // Adiciona o id do produto selecionado
        cod_item: selected.cod_item,
        descricao: selected.descricao || '',
        valor_venda: selected.valor_venda || '',
        valor_custo: selected.valor_custo || '',
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
  // #endregion




  // #region FUNÇÕES MODAIS
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
          {
            //#endregion
          }


          {
            //#region MODAL PRINCIPAL
          }
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

              {
                // #region primeira linha
              }
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
                      <option
                        value=''
                        disabled
                        selected
                      >
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
                      className="border border-gray-400 pl-1 rounded-sm h-8 w-full"
                      value={selectedUser?.cod_usuario || ""}
                      onChange={(e) => {
                        const user = users.find((u) => u.cod_usuario === parseInt(e.target.value));
                        setSelectedUser(user || null);
                      }}
                    >
                      <option value=''
                        disabled
                        selected
                      >
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
                    <select id="canal_venda" name="canal_venda" className="w-full border border-gray-400 pl-1 rounded-sm h-8">
                      <option
                        value=''
                        disabled
                        selected
                      >
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
                      <option
                        value=''
                        disabled
                        selected
                      >
                        Selecione
                      </option>
                      {centrosCusto.map((centrosCusto) => (
                        <option key={centrosCusto.cod_centro_custo} value={centrosCusto.cod_centro_custo}>
                          {centrosCusto.nome}
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

                {/* Linha principal (para entrada de dados) */}
                <div className="grid grid-cols-5 gap-2">
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
                    <label htmlFor="descontoProd" className="block text-blue font-medium">
                      Desconto
                    </label>
                    <div className="relative">
                      <input
                        id="descontoProd"
                        name="descontoProd"
                        type="text"
                        className="w-full border border-gray-400 pl-1 pr-10 rounded-sm h-8"
                        value={descontoProd}
                        onChange={handleDescontoProdChange}
                      />
                      <select
                        id="descontoUnitProd"
                        name="descontoUnitProd"
                        value={descontoUnitProd}
                        onChange={handleDescontoUnitProdChange}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Impede a abertura do select

                          const selectElement = e.currentTarget; // Obtém o próprio select
                          const nextValue = selectElement.value === "%prod" ? "R$prod" : "%prod"; // Alterna entre os valores

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
                        className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                        value={valorTotalProd}
                      />
                      <button
                        className="bg-green-200 border border-green-700 rounded p-1 flex items-center justify-center ml-2 h-8"
                        onClick={handleAdicionarLinha}
                      >
                        <FaPlus className="text-green-700 text-xl" />
                      </button>
                    </div>
                  </div>
                </div>

                <br></br>

                {/* Linhas adicionadas */}
                {produtosSelecionados.map((produto, index) => (
                  <div key={`${produto.cod_item}-${index}`} className="grid grid-cols-5 gap-2">
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.descricao}
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
                        value={produto.valor_venda}
                        disabled
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.descontoProd}
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
                        className="bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center"
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
                    className="bg-green200 rounded"
                    onClick={handleAdicionarServico} // Adiciona nova linha ao clicar
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

                {/* Linha principal (seleção de serviços) */}
                <div className="grid grid-cols-5 gap-2 items-center">
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
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
                      className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                      value={formValuesServico.valor_venda}
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
                        type="text"
                        className="w-full border border-gray-400 pl-1 pr-10 rounded-sm h-8"
                        value={descontoServ}
                        onChange={handleDescontoServChange}
                      />
                      <select
                        id="descontoUnit"
                        name="descontoUnit"
                        value={descontoUnit}
                        onChange={handleDescontoUnitChange}
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
                        className="w-full bg-gray-300 border border-gray-400 pl-1 rounded-sm h-8"
                        value={valorTotalServ}
                      />
                      <button
                        className="bg-green-200 border border-green-700 rounded p-1 flex items-center justify-center h-8 w-8"
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
                        value={servico.nome}
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
                        value={servico.valor_venda}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        disabled
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={servico.descontoProd}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={servico.valor_total}
                        disabled
                      />
                      <button
                        className="bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center"
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
                      Transportadora:
                    </label>
                    <select
                      id="transportadora"
                      name="transportadora"
                      value={selectedTransportadora ? selectedTransportadora.cod_transportadora : ''}
                      onChange={(e) => {
                        const selected = transportadoras.find(
                          (est) => est.cod_transportadora === Number(e.target.value)
                        );
                        setSelectedTransportadora(selected || null);
                        if (selected) {
                          setFormValuesTransportadoras(selected);
                          setFormValuesTransportadoras((prevValues) => ({
                            ...prevValues,
                            cod_transportadora: selected.cod_transportadora,
                          }));
                        }
                      }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    >
                      <option
                        value=''
                        disabled
                        selected
                      >
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
                      value={frete}
                      onChange={(e) => setFrete(parseFloat(e.target.value))}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={calcularTotalProdutos()}  // Passando o valor total calculado
                      disabled  // Tornando o input apenas leitura, já que é o valor total
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={calcularTotalServicos()}
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
                        type="text"
                        className="w-full border border-gray-400 pl-1 pr-10 rounded-sm h-8"
                        value={descontoTotal}
                        onChange={handleDescontoTotalChange}
                      />
                      <select
                        id="descontoUnitTotal"
                        name="descontoUnitTotal"
                        value={descontoUnitTotal}
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
                      value={valorTotalTotal}
                      name="vl_total_total"
                      type="text"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
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
                      className={`w-full border ${restanteAserPago < 0 ? '!bg-red50' : '!bg-gray-200'}  pl-1 rounded-sm h-6 ${restanteAserPago < 0 ? 'border-red' : 'border-gray-400'}`}
                      value={restanteAserPago}
                      disabled
                    />
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 !bg-gray-200"
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
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
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      placeholder="R$"
                      value={juros}
                      onChange={(e) => setJuros(Number(e.target.value))}
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
                        className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                        value={data_parcela}
                        onChange={(e) => setDataParcela(e.target.value)}
                      />
                      <button
                        className="bg-green-200 border border-green-700 rounded p-1 flex items-center justify-center h-8"
                        onClick={handleAdicionarPagamento}
                      >
                        <FaPlus className="text-green-700 text-xl" />
                      </button>
                    </div>
                    <div className="flex ml-auto items-center gap-1">
                      <label htmlFor="quantidadeParcelas" className="text-sm">Parcelas Rápido&nbsp;</label>
                      <input
                        type="number"
                        id="quantidadeParcelas"
                        value={quantidadeParcelas}
                        onChange={(e) => setQuantidadeParcelas(Number(e.target.value))}
                        min={1}
                        max={24}
                        className="w-10 h-5 text-center border border-gray-400 rounded-sm"
                      />
                      <button
                        onClick={handleAdicionarMultiplasParcelas}
                        className="bg-blue300 border border-blue500 rounded p-1 flex items-center justify-center h-5 w-7.5 ml-[4px]"
                      >
                        <FaPlus className="text-white text-xl h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <br />

                {/* Pagamentos Adicionados */}
                {pagamentos.map((pagamento, index) => (
                  <div key={`${pagamento.id}-${index}`} className="grid grid-cols-6 gap-2 items-center mt-2">
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.nome}
                        disabled
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.parcela} // valor individual da parcela
                        disabled
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.valorParcela}
                        disabled
                      />
                    </div>

                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.juros}
                        disabled
                      />
                    </div>

                    <div className="col-span-2 flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={pagamento.data_parcela
                          ? new Date(pagamento.data_parcela).toLocaleDateString("pt-BR")
                          : ""} // Exibe como DD/MM/AAAA, vazio caso não tenha data

                      />
                      <button
                        className="bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center"
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
                  <label htmlFor="nf-compra" className="block text-blue font-medium">
                    Obervações Gerais:
                  </label>
                  <textarea id="obervacoes_gerais" name="obervacoes_gerais" className="w-full border border-gray-400 pl-1 rounded-sm h-32"></textarea>
                </div>
                <div>
                  <label htmlFor="nf-compra" className="block text-blue font-medium">
                    Obervações Internas:
                  </label>
                  <textarea id="obervacoes_internas" name="obervacoes_internas" className="w-full border border-gray-400 pl-1 rounded-sm h-32" ></textarea>
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
