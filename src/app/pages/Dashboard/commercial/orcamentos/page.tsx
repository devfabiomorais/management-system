"use client";
import React, { ChangeEvent, useEffect, useState, Suspense } from "react";
import { MdContentCopy, MdRequestQuote, MdVisibility } from "react-icons/md";
import { FaTimes, FaPlus, FaBan, FaRegCopy, FaRegBuilding, FaSuse } from "react-icons/fa";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaTrash, FaSearch } from "react-icons/fa";
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { useSearchParams, useRouter } from "next/navigation";
import { AiFillFilePdf } from "react-icons/ai";
import { GiCalculator } from "react-icons/gi";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";
import TransformButton from "@/app/components/Buttons/TransformButton";

interface PedidosVenda {
  cod_pedido_venda: number;
  cod_orcamento: number;
  cod_cliente: number;
  dt_hr_pedido: Date;
  cod_usuario_pedido: number;
  situacao: string;
  valor_total: number;
  cod_nota_fiscal: number;
  dbs_orcamentos: any[];
  dbs_clientes: any[];
  dbs_usuarios: any[];
}

interface ItemFamilia {
  cod_familia: number;
  descricao: string;
  nome: string;
}

interface Establishment {
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

interface ServicoCadastro {
  cod_servico: number;
  nome: string;
  descricao?: string;
  valor_venda?: string;
  valor_custo?: string;
  comissao?: string;
  dtCadastroServ?: string;
  situacao?: string;
}

interface Estruturas {
  cod_estrutura_orcamento: number;
  nome: string;
  descricao?: string;
  dt_hr_criacao: Date;
  cod_usuario_criado: number;
  situacao: string;
  dbs_produtos_estrutura_orcamento: any[];
  dbs_servicos_estrutura_orcamento: any[];
}

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
  garantia?: number;
  tipo_garantia?: string;
  dbs_estrutura_orcamento?: number;
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
  documento?: string;
  insc_estadual?: string;
  insc_municipal?: string;
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


const OrcamentosPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token, codUsuarioLogado } = useToken();
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



  // #region ESTRUTURAS 
  const [estruturaUtilizada, setEstruturaUtilizada] = useState<number>();
  const [modalUsarEstruturaVisible, setModalUsarEstruturaVisible] = useState(false);
  const handleModalUsarEstruturaClose = () => {
    setModalUsarEstruturaVisible(false); // Fecha o modal
  };

  const [selectedEstrutura, setSelectedEstrutura] = useState<Estruturas | null>(null);
  const [estruturaIDtoCancel, setEstruturaIdToCancel] = useState<number | null>(null);
  const [formValuesEstruturas, setFormValuesEstruturas] = useState<Estruturas>({
    cod_estrutura_orcamento: 0,
    nome: "",
    descricao: "",
    dt_hr_criacao: new Date(),
    cod_usuario_criado: codUsuarioLogado !== null ? codUsuarioLogado : 0, // Melhor leitura
    situacao: "",
    dbs_produtos_estrutura_orcamento: [],
    dbs_servicos_estrutura_orcamento: [],
  });

  useEffect(() => {
    if (codUsuarioLogado !== null) {
      setFormValuesEstruturas((prev) => ({
        ...prev,
        cod_usuario_criado: codUsuarioLogado, // Define o usuário logado
      }));
    }
  }, [codUsuarioLogado]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const tipo = searchParams.get('tipo'); // Pega o parâmetro da URL
  const [isEstrutura, setIsEstrutura] = useState(false);

  useEffect(() => {
    setIsEstrutura(tipo === "estrutura");
  }, [tipo]);


  const [estruturas, setEstruturas] = useState<Estruturas[]>([]);
  const fetchEstruturas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/estruturas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEstruturas(response.data.estruturas);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar estruturas:", error);
    }
  };


  const filteredEstruturas = estruturas.filter((estrutura) => {
    // Apenas ATIVO aparecem
    if (estrutura.situacao !== "Ativo") {
      return false;
    }

    // Função de busca
    return Object.values(estrutura).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  useEffect(() => {
    // Atualiza qualquer estado que dependa de estruturas ou
    // força a atualização de componentes ao alterar estados relacionados
    setFirst(0);  // Por exemplo, reinicia a paginação quando estruturas mudar
  }, [estruturas]);  // Esse useEffect roda sempre que `estruturas` for alterada


  const handleCancelarEstrutura = async () => {
    if (estruturaIDtoCancel === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/estruturas/cancel/${estruturaIDtoCancel}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchEstruturas(); // Atualizar a lista de estruturas
        setModalDeleteVisible(false);
        toast.success("Estrutura de orçamento cancelada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar estrutura de orçamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar estrutura de orçamento:", error);
      toast.error("Erro ao cancelar estrutura de orçamento. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleEditEstrutura = (estrutura: Estruturas, visualizar: boolean) => {
    setVisualizar(visualizar)
    console.log("Estrutura recebida para edição:", estrutura);

    console.log("Produtos recebidos:", estrutura.dbs_produtos_estrutura_orcamento);
    console.log("Serviços recebidos:", estrutura.dbs_servicos_estrutura_orcamento);


    setFormValuesEstruturas(estrutura);
    setSelectedEstrutura(estrutura);

    setProdSelecionados(estrutura.dbs_produtos_estrutura_orcamento ?
      estrutura.dbs_produtos_estrutura_orcamento.map((produto) => ({ ...produto, id: produto.cod_prod_estrutura }))
      : []);
    setServicosSelecionados(estrutura.dbs_servicos_estrutura_orcamento ?
      estrutura.dbs_servicos_estrutura_orcamento.map((servico) => ({ ...servico, id: servico.cod_serv_estrutura }))
      : []);

    if (isEstrutura) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
    setVisible(true); // Abre o modal
  };

  const handleUsarEstrutura = (estrutura: Estruturas) => {
    setModalUsarEstruturaVisible(false);

    setProdSelecionados(estrutura.dbs_produtos_estrutura_orcamento ?
      estrutura.dbs_produtos_estrutura_orcamento.map((produto) => ({ ...produto, id: produto.cod_prod_estrutura }))
      : []);
    setServicosSelecionados(estrutura.dbs_servicos_estrutura_orcamento ?
      estrutura.dbs_servicos_estrutura_orcamento.map((servico) => ({ ...servico, id: servico.cod_serv_estrutura }))
      : []);
    console.log(produtosSelecionados);
    console.log(servicosSelecionados);
    setIsEditing(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("tipo"); // Remove o parâmetro 'tipo'
    router.push(`/pages/Dashboard/commercial/orcamentos?${params.toString()}`, { scroll: false });

    setVisible(true); // Abre o modal
  };

  const handleSaveEditEstrutura = async () => {
    try {
      // Validação dos campos obrigatórios
      const requiredFields = ["nome", "descricao", "situacao"];

      const isEmptyField = requiredFields.some(
        (field) =>
          Object.prototype.hasOwnProperty.call(formValuesEstruturas, field) &&
          (formValuesEstruturas[field as keyof typeof formValuesEstruturas] === "" ||
            formValuesEstruturas[field as keyof typeof formValuesEstruturas] === null ||
            formValuesEstruturas[field as keyof typeof formValuesEstruturas] === undefined)
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

      const updatedFormValuesEditEstruturas = {
        ...formValuesEstruturas,
        produtos: produtosSelecionados.map((produto) => ({
          ...produto,
          valor_venda: produto.valor_unitario
        })),
        servicos: servicosSelecionados.map((servico) => ({
          ...servico,
          valor_venda: servico.valor_unitario
        })),
        situacao: "Ativo",
      };

      // Envio dos dados para a API
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/estruturas/edit/${formValuesEstruturas.cod_estrutura_orcamento}`,
        updatedFormValuesEditEstruturas,
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
        fetchEstruturas();
        toast.success("Estrutura de orçamento atualizada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar estrutura de orçamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error: any) {
      setItemEditDisabled(false);
      setLoading(false);

      console.error("Erro ao salvar estrutura de orçamento:", error);

      const errorMessage = error.response?.data?.message || "Erro ao salvar estrutura de orçamento.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // #endregion

  // #region PEDIDOS DE VENDA  
  const [pedidoIDtoCancel, setPedidoIdToCancel] = useState<number | null>(null);
  const [pedidosVenda, setPedidosVenda] = useState<PedidosVenda[]>([]);
  const [isPedido, setIsPedido] = useState(false);
  const [formValuesPedidosVenda, setFormValuesPedidosVenda] = useState<PedidosVenda>({
    cod_pedido_venda: 0,
    cod_orcamento: 0,
    cod_cliente: 0,
    dt_hr_pedido: new Date,
    cod_usuario_pedido: 0,
    situacao: "",
    valor_total: 0,
    cod_nota_fiscal: 0,
    dbs_orcamentos: [],
    dbs_clientes: [],
    dbs_usuarios: [],

  });

  useEffect(() => {
    setIsPedido(tipo === "pedido");
  }, [tipo]);

  const fetchPedidosVenda = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/pedidosvenda",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPedidosVenda(response.data.pedidos);

    } catch (error) {
      console.error("Erro ao carregar pedidos de venda:", error);
    }
  };

  const filteredPedidosVenda = pedidosVenda.filter((pedidos) => {
    // Cancelado nao aparece
    if (pedidos.situacao === "Cancelado") {
      return false;
    }

    // Função de busca
    return Object.values(pedidos).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleCancelarPedido = async () => {
    if (pedidoIDtoCancel === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/pedidosvenda/cancel/${pedidoIDtoCancel}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchPedidosVenda(); // Atualizar a lista de estruturas
        setModalDeleteVisible(false);
        toast.success("Pedido de venda cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar pedido de venda.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar pedido de venda:", error);
      toast.error("Erro ao cancelar pedido de venda. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleGerarPedidoVenda = async (codOrcamento?: number) => {
    const cod_orcamento = codOrcamento ?? formValues.cod_orcamento;

    try {
      const updatedFormValues = {
        cod_orcamento: formValues.cod_orcamento,
        cod_cliente: formValues.cod_cliente,
        valor_total: formValues.valor_total,
        cod_nota_fiscal: formValues.nf_compra
      };

      // Lista de campos obrigatórios
      const requiredFields = [
        "cod_cliente",
        "valor_total",
        "cod_nota_fiscal",
      ];

      // Encontrar o primeiro campo obrigatório vazio
      const missingField = requiredFields.find((field) => {
        const value = updatedFormValues[field as keyof typeof updatedFormValues];
        return value === "" || value === null || value === undefined;
      });

      if (missingField) {
        toast.info(`Faltou o campo: ${missingField.replace("_", " ")}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/pedidosvenda/register",
        updatedFormValues,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        handleSituacaoPedido_Gerado(selectedOrcamento ? selectedOrcamento.cod_orcamento : formValues.cod_orcamento);
        clearInputs();
        fetchPedidosVenda();
        toast.success("Pedido de venda gerado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        router.push("/pages/Dashboard/commercial/orcamentos?tipo=pedido")
      } else {
        throw new Error("Erro ao gerar pedido de venda.");
      }
    } catch (error: any) {

      console.error("Erro ao gerar pedido de venda:", error);

      const errorMessage = error.response?.data?.message || "Erro ao gerar pedido de venda.";
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleVisualizarPedidoVenda = async (cod_pedido_venda: number, cod_orcamento: number) => {
    if (!cod_orcamento || !cod_pedido_venda) {
      console.error("cod_orcamento ou cod_pedido_venda não recebido.");
      return;
    }
    const pedidoAserBuscado = pedidosVenda.find((pedido) => pedido.cod_pedido_venda === cod_pedido_venda);
    if (pedidoAserBuscado) {
      setFormValuesPedidosVenda(pedidoAserBuscado);
    } else {
      console.error("Pedido de venda não encontrado.");
    }

    const orcamentoAserBuscado = orcamentos.find((orcamento) => orcamento.cod_orcamento === cod_orcamento);
    if (orcamentoAserBuscado) {
      handleEdit(orcamentoAserBuscado, true);
    } else {
      console.error("Orçamento não encontrado.");
    }
  };



  // #endregion


  // #region TRANSPORTADORAS
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);

  const fetchTransportadoras = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/transportadoras", {
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
      const responseUsers = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const responseGroup = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/groupPermission/groups", {
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
    documento: "",
  });
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/clients",
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

    if (isEditing) {
      return
    } else {
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
        process.env.NEXT_PUBLIC_API_URL + "/api/centrosCusto",
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
  const [produtosCadastro, setProdutosCadastro] = useState<ProdutosCadastro[]>([]);
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
      toast.info("Após selecionar um produto, insira a quantidade.", {
        position: "top-right",
        autoClose: 3000,
      });
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
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/itens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.items);
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

  //produtos-cadastro  
  const [fileName, setFileName] = useState("");
  const [families, setFamilies] = useState<ItemFamilia[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
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
    fetchEstabilishments();
    fetchUnits();
    fetchFamilias();
  }, []);

  const fetchEstabilishments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.estabelecimentos)
      setEstablishments(response.data.estabelecimentos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar estabelecimentos:", error);
    }
  };

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

  // #endregion






  // #region SERVIÇOS
  const [servicosSelecionados, setServicosSelecionados] = useState<Servico[]>([]);
  const [totalServicosSomados, setTotalServicosSomados] = useState(0);

  useEffect(() => {
    const total = servicosSelecionados.reduce((acc, servico) => acc + parseFloat(servico.valor_total || "0"), 0);
    setTotalServicosSomados(total);
  }, [servicosSelecionados]); // Executa toda vez que servicosSelecionados mudar

  const [servicosCadastro, setServicosCadastro] = useState<ServicoCadastro[]>([]);
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
      toast.info("Após selecionar um serviço, insira a quantidade.", {
        position: "top-right",
        autoClose: 3000,
      });
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

  //serviços-cadastro  
  const [formValuesCadastroServicos, setFormValuesCadastroServicos] = useState<ServicoCadastro>({
    cod_servico: 0,
    nome: "",
    descricao: "",
    valor_custo: "",
    valor_venda: "",
    comissao: "",
  });

  const handleSaveEditServicos = async (servico: any = selectedServico) => {
    if (!servico?.cod_servico) {
      toast.error("Serviço não selecionado ou inválido. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/servicos/edit/${servico.cod_servico}`,
        { ...formValuesCadastroServicos, situacao: "Ativo", cod_servico: servico.cod_servico },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        //CLEAR INPUTS CADASTRO SERVIÇOS
        setFormValuesCadastroServicos({
          cod_servico: 0,
          nome: "",
          descricao: "",
          valor_custo: "",
          valor_venda: "",
          comissao: "",
        });
        fetchServicos();
        toast.success("Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisibleServ(false);
      } else {
        toast.error("Erro ao salvar serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar serviço:", error);
    }
  };

  const handleSaveReturnServicos = async (fecharTela: boolean) => {

    try {
      const requiredFields = [
        { key: "nome", label: "Nome" },
        { key: "descricao", label: "Descrição" },
        { key: "valor_custo", label: "Valor de Custo" },
        { key: "valor_venda", label: "Valor de Venda" },
        { key: "comissao", label: "Comissão" },
      ];

      const missingField = requiredFields.find(({ key }) => {
        const value = formValuesCadastroServicos[key as keyof typeof formValuesCadastroServicos];
        return value === "" || value === null || value === undefined;
      });

      if (missingField) {
        toast.info(`O campo que está faltando é: ${missingField.label}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }


      const servicoEncontrado = servicosCadastro.find((item) => item.nome === formValuesCadastroServicos.nome);
      const nomeExists = !!servicoEncontrado;
      const situacaoInativo = servicoEncontrado?.situacao === "Inativo";

      console.log("Servico encontrado:", servicoEncontrado);

      if (nomeExists && !situacaoInativo) {
        toast.info("Esse nome já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        return;
      }

      if (nomeExists && situacaoInativo && servicoEncontrado?.cod_servico) {
        await handleSaveEditServicos(servicoEncontrado); // Passa o serviço diretamente        
        fetchServicos();
        //CLEAR INPUTS CADASTRO SERVIÇOS
        setFormValuesCadastroServicos({
          cod_servico: 0,
          nome: "",
          descricao: "",
          valor_custo: "",
          valor_venda: "",
          comissao: "",
        });
        setVisibleServ(fecharTela);
        toast.info("Esse serviço estava inativo na base de dados, portanto foi reativado com os novos dados inseridos.", {
          position: "top-right",
          autoClose: 10000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>,
        });
        return;
      }

      // Se o nome não existir, cadastra o serviço normalmente
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/servicos/register",
        formValuesCadastroServicos,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchServicos();
        toast.success("Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        //CLEAR INPUTS CADASTRO SERVIÇOS
        setFormValuesCadastroServicos({
          cod_servico: 0,
          nome: "",
          descricao: "",
          valor_custo: "",
          valor_venda: "",
          comissao: "",
        });
        setVisibleServ(fecharTela);
      } else {
        toast.error("Erro ao salvar serviços.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
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
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/servicos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const servicosAtivos = response.data.servicos.filter(
        (servico: { situacao: string; }) => servico.situacao !== "Inativo"
      );

      console.log(servicosAtivos);
      setServicos(servicosAtivos);
      setServicosCadastro(servicosAtivos);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  // #endregion






  // #region TOTAL
  const [descontoTotal, setDescontoTotal] = useState(0);
  const [descontoUnitTotal, setDescontoUnitTotal] = useState('%');
  const [produtosTotal, setProdutosTotal] = useState(0);
  const [servicosTotal, setServicosTotal] = useState(0);
  const [frete, setFrete] = useState(0.0);
  const [freteInput, setFreteInput] = useState(frete.toFixed(2));
  const [valorTotalTotal, setValorTotalTotal] = useState(0);


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
  const [valorParcelaInput, setValorParcelaInput] = useState(`R$ ${valorParcela.toFixed(2).replace('.', ',')}`); // Estado inicial com "R$"
  const [juros, setJuros] = useState<number>(0);
  const [data_parcela, setDataParcela] = useState<string>("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1); // Novo estado para quantidade de parcelas
  const [restanteAserPago, setRestanteAserPago] = useState(valorTotalTotal);
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const [totalPagamentosSemJuros, setTotalPagamentosSemJuros] = useState(0);

  const fetchFormasPagamento = async () => {
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/formasPagamento",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.formas_pagamento);
      setFormasPagamento(response.data.formas_pagamento);
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
    if (!selectedFormaPagamento || !data_parcela || !valorParcela) {
      toast.warning("Preencha a forma de pagamento, valor e data da parcela!", {
        position: "top-center",
        autoClose: 3000,
      });
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
    setValorParcelaInput("");
  };

  const handleAdicionarMultiplasParcelas = () => {
    if (!selectedFormaPagamento || !data_parcela || quantidadeParcelas < 1) {
      toast.warning("Preencha a forma de pagamento, valor e data da parcela!", {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    const novasParcelas: Pagamento[] = Array.from({ length: quantidadeParcelas }, (_, i) => {
      const dataInicial = new Date(data_parcela + 'T00:00:00');
      const dataParcelaAtual = new Date(dataInicial);
      dataParcelaAtual.setMonth(dataInicial.getMonth() + i);

      setSelectedFormaPagamento(null);
      setJuros(0);
      setDataParcela("");
      setvalorParcela(0);
      setValorParcelaInput("");

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

  // #endregion


  // #region ORÇAMENTOS
  const [canaisVenda, setCanaisVenda] = useState<string[]>([]);
  const [selectedCanal, setSelectedCanal] = useState<string>('');
  const fetchCanaisVenda = async () => {
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + '/api/orcamentos/canais-venda');
      setCanaisVenda(response.data.canaisVenda);
      console.log(response.data.canaisVenda);
    } catch (error) {
      console.error('Erro ao buscar canais de venda:', error);
    }
  };

  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const filteredOrcamentos = orcamentos.filter((orcamento) => {
    if (orcamento.situacao !== 'Pendente' && orcamento.situacao !== 'Ativo') {
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


  const [filteredFrotas, setFilteredFrotas] = useState<Orcamento[]>([]);


  const getFilteredFrotas = (frota: string) => {
    return orcamentos.filter((orcamento) => {
      // Filtra apenas orçamentos com frota correspondente ao valor de frota
      return orcamento.frota && orcamento.frota.toString().includes(frota);
    });
  };

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
    garantia: 0,
    tipo_garantia: "dias",
    dbs_pagamentos_orcamento: [],
    dbs_produtos_orcamento: [],
    dbs_servicos_orcamento: [],
  });
  useEffect(() => {
  }, [formValues]);


  useEffect(() => {
    setFormValues((prevValues) => ({
      ...prevValues,
      valor_total: totalPagamentos || 0,
    }));
  }, [totalPagamentos]);




  const fetchOrcamentos = async (): Promise<any[]> => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/orcamentos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrcamentos(response.data.orcamentos);
      setLoading(false);
      return response.data.orcamentos; // <-- isso é essencial
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar orçamentos:", error);
      return []; // em caso de erro, retorna array vazio
    }
  };



  // #region PDF
  const [DOCformatado, setDOCformatado] = useState<string>('');

  const formattedDocumento = () => {
    let value = selectedClient?.documento || ""
      ? selectedClient?.documento?.replace(/\D/g, "") ?? ""
      : (formValuesClients.documento ?? "").replace(/\D/g, "");

    let formattedValue = value;

    if (value.length <= 11) {
      // CPF: ###.###.###-##
      formattedValue = value
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else if (value.length > 11) {
      // CNPJ: ##.###.###/####-##
      formattedValue = value
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }
    setDOCformatado(formattedValue); // Atualiza o estado com o valor formatado
  };
  useEffect(() => {
    formattedDocumento();  // Garante que a função seja chamada assim que o estado do "documento" mudar
  }, [selectedClient?.documento, formValuesClients.documento]);


  const gerarPDF = () => {
    const doc = new jsPDF();

    // Adicionar a logo
    const img = new Image();
    img.src = "/git-hub-logo.png"; // Certifique-se de ter essa imagem na pasta 'public'

    img.onload = function () {
      const totalPages = doc.internal.pages.length - 1;
      const finalY = doc.internal.pageSize.height - 5; // Posição padrão no final da página
      const maxHeight = doc.internal.pageSize.height; // Altura total da página
      const marginBottom = 10; // Margem inferior
      let yPosition = 40; // Começa abaixo do cabeçalho



      // Função para desenhar o cabeçalho em todas as páginas
      const createHeader = (doc: any, img: any) => {
        const padding = 5;
        const headerWidth = 210 - 2 * padding;
        const headerHeight = 30;

        doc.rect(padding, padding, headerWidth, headerHeight); // Fundo do cabeçalho

        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.01);
        doc.rect(padding, padding, headerWidth, headerHeight, 'S'); // Borda

        doc.addImage(img, "PNG", 5, 6, 30, 25); // Logo

        const leftX = 35;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("NOME DA EMPRESA", leftX, 10);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(`CNPJ: 99.999.999/9999-99`, leftX, 14);
        doc.text(`Endereço: R Exemplo, 999`, leftX, 19);
        doc.text(`CIDADE - CEP: 99999-999`, leftX, 24);

        const telefone = "(99) 9999-9999 / (99) 9 9999-9999";
        const email = "seuemail@dominio.com.br";
        const vendedor = `Vendedor: ${formValues.cod_responsavel}`;

        const margemDireita = 200;
        doc.text(telefone, margemDireita - doc.getTextWidth(telefone), 14);
        doc.text(email, margemDireita - doc.getTextWidth(email), 19);
        doc.text(vendedor, margemDireita - doc.getTextWidth(vendedor), 24);
      };

      // Chama o cabeçalho na primeira página
      createHeader(doc, img);

      //--------------------------------------------------------------------------------------------------------------------



      const padding = 5; // Definindo o padding (espaço) ao redor do retângulo
      const headerWidth = 210 - 2 * padding; // Largura do cabeçalho com padding
      const headerHeight = 30; // Altura do cabeçalho


      // #region orçamento
      // Definir a posição e dimensões do retângulo
      const textY = 45; // Posição vertical do texto
      const paddingY = 4; // Espaço acima e abaixo do texto
      const rectHeight = 7; // Altura do retângulo
      const rectWidth = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectX = padding; // Posição X do retângulo, ajustado para a margem da página

      // Desenhar o retângulo de fundo
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectX, textY - paddingY, rectWidth, rectHeight, "F"); // Retângulo preenchido

      // // Desenhar as bordas bem finas
      // doc.setDrawColor(0, 0, 0); // Cor da borda (preto)
      // doc.setLineWidth(0.01); // Linha bem fina
      // doc.rect(rectX, textY - paddingY, rectWidth, rectHeight, "S"); // Retângulo com bordas

      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto

      // Texto "ORÇAMENTO Nº" e data
      const orcamentoText = `${isPedido ? "PEDIDO Nº " + formValuesPedidosVenda.cod_pedido_venda : "ORÇAMENTO Nº " + formValues.cod_orcamento}`;
      const dataVendaText = new Date(formValues.data_venda).toLocaleDateString("pt-BR"); // dd/mm/aaaa

      // Calcular a largura do texto "ORÇAMENTO Nº"
      const orcamentoWidth = doc.getTextWidth(orcamentoText);

      // Calcular a posição centralizada do "ORÇAMENTO Nº" (alinhado no centro do retângulo)
      const orcamentoX = rectX + (rectWidth - orcamentoWidth) / 2; // Centraliza "ORÇAMENTO Nº"

      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY = textY + 1; // Ajustar o Y para um pouco abaixo

      // Adicionar "ORÇAMENTO Nº" centralizado
      doc.text(orcamentoText, orcamentoX, adjustedTextY);

      // Posicionar a data à extrema direita do retângulo
      const dataVendaWidth = doc.getTextWidth(dataVendaText); // Largura da data
      const dataVendaX = rectX + rectWidth - dataVendaWidth - 10; // Posição X da data à extrema direita, com espaçamento de 10

      // Adicionar a data à extrema direita
      doc.text(dataVendaText, dataVendaX + 9, adjustedTextY);
      //#endregion
      //-------------------------------------------------------------------------------------------------------------------------------------

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0); // Preto
      doc.text(`Canal de venda: ${formValues.canal_venda}`, 5, 55); // Alinhado à esquerda
      doc.text(`Estrutura utilizada: ${estruturaUtilizada}`, (doc.internal.pageSize.getWidth() - 5), 55, { align: "right" }); // Alinhado à direita

      // #region previsao de entrega
      // Definir a posição e dimensões do retângulo
      const textY2 = 65; // Posição vertical do texto
      const paddingY2 = 4; // Espaço acima e abaixo do texto
      const rectHeight2 = 7; // Altura do retângulo
      const rectWidth2 = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectX2 = padding; // Posição X do retângulo, ajustado para a margem da página

      // Desenhar o retângulo de fundo
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectX2, textY2 - paddingY2, rectWidth2, rectHeight2, "F"); // Retângulo preenchido

      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto

      // Texto "PREVISÃO DE ENTREGA"
      const previsaoEntregaText = `PREVISÃO DE ENTREGA: ${new Date(formValues.prazo).toLocaleDateString("pt-BR")}`;

      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2 = textY2 + 1; // Ajustar o Y para um pouco abaixo

      // Adicionar "PREVISÃO DE ENTREGA" à esquerda
      doc.text(previsaoEntregaText, rectX2 + 1, adjustedTextY2);
      //#endregion
      //-------------------------------------------------------------------------------------------------------------------------



      // #region frota
      // Definições do retângulo (tabela)
      const tableX = 5; // Posição X inicial
      const tableY = 70; // Posição Y inicial
      const tableWidth = 200; // Largura total da tabela
      const tableHeight = 7; // Altura da linha da tabela
      const column1Width = 20; // Largura da primeira coluna (FROTA)
      const column2Width = tableWidth - column1Width; // Largura da segunda coluna (valor)

      // Desenhar a borda da tabela
      doc.setDrawColor(220, 220, 220); // Cor preta
      doc.setLineWidth(0.1); // Linha bem fina
      doc.rect(tableX, tableY, tableWidth, tableHeight, "S"); // Retângulo total

      // Divisão entre colunas
      doc.line(tableX + column1Width, tableY, tableX + column1Width, tableY + tableHeight); // Linha vertical

      // Estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Preto

      // Adicionar o texto "FROTA" à esquerda
      doc.text("FROTA:", tableX + 1, tableY + 4.5);

      // Adicionar o valor da frota à direita
      doc.setFont("helvetica", "normal"); // Texto normal
      doc.text(`${formValues.frota}`, tableX + column1Width + 3, tableY + 4.5);
      // #endregion
      //--------------------------------------------------------------------------------------------------------------------



      // #region dados do cliente
      // Definir a posição e dimensões do retângulo
      const verticalDados = 85; // Posição vertical do texto
      const paddingDados = 4; // Espaço acima e abaixo do texto
      const heightDados = 7; // Altura do retângulo
      const widthDados = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectDados = padding; // Posição X do retângulo, ajustado para a margem da página

      // Desenhar o retângulo de fundo
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectDados, verticalDados - paddingDados, widthDados, heightDados, "F"); // Retângulo preenchido

      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto

      // Texto
      const dadosText = "DADOS DO CLIENTE";

      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2dados = verticalDados + 1; // Ajustar o Y para um pouco abaixo

      // Adicionar texto à esquerda
      doc.text(dadosText, rectX2 + 1, adjustedTextY2dados);


      //TABELA DADOS CLIENTE
      // Definições da tabela
      const tableXdados = 5; // Posição X inicial
      const tableYdados = 88.1; // Posição Y inicial
      const tabelaWidthdados = 210 - 2 * padding; // Largura total da tabela
      const rowHeight = 8; // Altura de cada linha
      const colWidth = tabelaWidthdados / 4; // Largura de cada coluna

      // Desenhar a borda da tabela
      doc.setDrawColor(220, 220, 220); // Cor preta
      doc.setLineWidth(0.1); // Linha bem fina
      doc.rect(tableXdados, tableYdados, tabelaWidthdados, rowHeight * 4, "S"); // Retângulo total

      // Linhas horizontais (divisão das linhas)
      for (let i = 1; i < 4; i++) {
        doc.line(tableXdados, tableYdados + rowHeight * i, tableXdados + tabelaWidthdados, tableYdados + rowHeight * i);
      }

      // Linhas verticais (divisão das colunas)
      for (let i = 1; i < 4; i++) {
        if (i === 1) {
          doc.line(tableXdados + colWidth * i - 18, tableYdados, tableXdados + colWidth * i - 18, tableYdados + rowHeight * 4);
        } else if (i === 3) {
          doc.line(tableXdados + colWidth * i - 16, tableYdados, tableXdados + colWidth * i - 16, tableYdados + rowHeight * 4);
        } else {
          doc.line(tableXdados + colWidth * i, tableYdados, tableXdados + colWidth * i, tableYdados + rowHeight * 4);
        }
      }


      // Dados da tabela
      const leftColumnBold = ["Razão social:", "CNPJ/CPF:", "CEP:", "Telefone:"];
      const leftColumnNormal = [
        selectedClient?.nome || "",
        DOCformatado ? DOCformatado : (selectedClient?.documento || ""),
        formValuesClients.cep || "",
        selectedClient?.telefone || ""
      ];

      const rightColumnBold = ["Nome fantasia:", "Endereço:", "Cidade/UF:", "E-mail:"];
      const rightColumnNormal = [
        selectedClient?.nome || "",
        formValuesClients.logradouro || "",
        `${formValuesClients.cidade || ""}/${formValuesClients.estado || ""}`,
        selectedClient?.email || ""
      ];

      // Adicionar textos
      for (let i = 0; i < 4; i++) {
        // Primeira coluna (bold)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(leftColumnBold[i], tableXdados + 1, tableYdados + rowHeight * i + 5);

        // Segunda coluna (normal)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(leftColumnNormal[i], tableXdados + colWidth - 16, tableYdados + rowHeight * i + 5);

        // Terceira coluna (bold)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(rightColumnBold[i], tableXdados + colWidth * 2 + 1, tableYdados + rowHeight * i + 5);

        // Quarta coluna (normal)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(rightColumnNormal[i], tableXdados + colWidth * 3 - 14, tableYdados + rowHeight * i + 5);
      }

      // #endregion
      //----------------------------------------------------------------------------------------------------------------------





      // #region produtos
      // Definir a posição e dimensões do retângulo
      const verticalProdutos = 130; // Posição vertical do texto
      const paddingProdutos = 4; // Espaço acima e abaixo do texto
      const heightProdutos = 7; // Altura do retângulo
      const widthProdutos = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectProdutos = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo      
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectProdutos, verticalProdutos - paddingProdutos, widthProdutos, heightProdutos, "F"); // Retângulo preenchido
      // Adicionar a borda
      doc.setDrawColor(220, 220, 220); // Cor da borda
      doc.setLineWidth(0.1); // Largura da borda
      doc.rect(rectProdutos, verticalProdutos - paddingProdutos, widthProdutos, heightProdutos, "S"); // Borda do retângulo
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      // Texto
      const produtosText = "PRODUTOS";
      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2produtos = verticalProdutos + 1; // Ajustar o Y para um pouco abaixo
      // Adicionar texto à esquerda
      doc.text(produtosText, rectX2 + 1, adjustedTextY2produtos);

      // Simulando produtos do orçamento
      const produtos = produtosSelecionados.map((produto) => {
        const quantidade = produto.quantidade ?? 0;
        const valorUnitario = Number(produto.valor_unitario) || 0;

        return [
          produto.cod_produto, // Código
          (produto as any).dbs_itens.descricao, // Descrição
          (produto as any).dbs_itens.cod_un, // Unidade de medida
          quantidade, // Quantidade
          `R$ ${valorUnitario.toFixed(2)}`, // Valor Unitário
          `R$ ${(quantidade * valorUnitario).toFixed(2)}` // Total
        ];
      });

      // Calcular o total de todos os produtos
      const totalProdutosPDF = produtosSelecionados.reduce((acc, produto) => {
        const quantidade = produto.quantidade ?? 0;
        const valorUnitario = Number(produto.valor_unitario) || 0;
        return acc + (quantidade * valorUnitario);
      }, 0);
      // Convertendo para formato monetário
      const totalProdutosPDFFormatted = `R$ ${totalProdutosPDF.toFixed(2)}`;

      // tabela de produtos
      const columnWidths = [15, 50, 18, 17, 50, 50]; // Exemplo de larguras de cada coluna
      const totalWidth = columnWidths.reduce((acc, width) => acc + width, 0); // Soma todas as larguras das colunas

      autoTable(doc, {
        startY: 133, // Começar a tabela após o cabeçalho
        didDrawPage: function (data) {
          createHeader(doc, img);
        },
        head: [["#", "NOME", "CÓD UN", "QTD", "VALOR UNITÁRIO", "SUBTOTAL"]],
        body: produtos,
        theme: "grid",
        styles: { fontSize: 10, textColor: [0, 0, 0] },
        headStyles: { fillColor: [220, 220, 220] },
        margin: { top: 40, left: 4.9 }, // Ajusta a posição da tabela horizontalmente
        columnStyles: {
          0: { cellWidth: columnWidths[0] },
          1: { cellWidth: columnWidths[1] },
          2: { cellWidth: columnWidths[2] },
          3: { cellWidth: columnWidths[3] },
          4: { cellWidth: columnWidths[4] },
          5: { cellWidth: columnWidths[5] },
        },
        tableLineColor: [220, 220, 220], // Cor das linhas (preto)
        tableLineWidth: 0.1, // Largura das linhas
        tableWidth: totalWidth, // Largura da tabela de linhas
        showHead: 'everyPage',
      });
      // Definir a posição e dimensões do retângulo
      const verticalTotalProd = (doc as any).lastAutoTable.finalY + 3; // Posição vertical do texto
      const paddingTotalProd = 4; // Espaço acima e abaixo do texto
      const heightTotalProd = 7; // Altura do retângulo
      const widthTotalProd = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectTotalProd = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo      
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectTotalProd, verticalTotalProd - paddingTotalProd, widthTotalProd, heightTotalProd, "F"); // Retângulo preenchido
      // Adicionar a borda
      doc.setDrawColor(220, 220, 220); // Cor da borda
      doc.setLineWidth(0.1); // Largura da borda
      doc.rect(rectTotalProd, verticalTotalProd - paddingTotalProd, widthTotalProd, heightTotalProd, "S"); // Borda do retângulo
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2totalProd = verticalTotalProd + 1; // Ajustar o Y para um pouco abaixo
      // Adicionar texto à direita
      doc.text("Total", rectTotalProd + 1, adjustedTextY2totalProd);
      doc.text(totalProdutosPDFFormatted, rectTotalProd + 151.5, adjustedTextY2totalProd);
      //#endregion
      //---------------------------------------------------------------------------------------------------------------------





      // #region serviços
      const verticalServicos = (doc as any).lastAutoTable.finalY + 15; // Posição vertical do texto
      const paddingServicos = 4; // Espaço acima e abaixo do texto
      const heightServicos = 7; // Altura do retângulo
      const widthServicos = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectServicos = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectServicos, verticalServicos - paddingServicos, widthServicos, heightServicos, "F"); // Retângulo preenchido
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      // Texto
      const servicosText = "SERVIÇOS";
      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2servicos = verticalServicos + 1; // Ajustar o Y para um pouco abaixo
      // Adicionar texto à esquerda
      doc.text(servicosText, rectServicos + 1, adjustedTextY2servicos);

      // Simulando serviços do orçamento
      const servicos = servicosSelecionados.map((servico) => {
        const quantidade = servico.quantidade ?? 0;
        const valorUnitario = Number(servico.valor_unitario) || 0;
        return [
          servico.cod_servico, // Código
          servico.dbs_servicos.nome ?? "sem nome",
          quantidade, // Quantidade
          `R$ ${valorUnitario.toFixed(2)}`, // Valor Unitário
          `R$ ${(quantidade * valorUnitario).toFixed(2)}` // Total
        ];
      });

      // Calcular o total de todos os serviços
      const totalServicosPDF = servicosSelecionados.reduce((acc, servico) => {
        const quantidade = servico.quantidade ?? 0;
        const valorUnitario = Number(servico.valor_unitario) || 0;
        return acc + (quantidade * valorUnitario);
      }, 0);
      // Convertendo para formato monetário
      const totalServicosPDFFormatted = `R$ ${totalServicosPDF.toFixed(2)}`;


      const tabelaServicos = async (y: any, doc: any, servicos: any) => {
        const columnWidthsServ = [15, 68, 18, 50, 49];
        const totalWidth = columnWidthsServ.reduce((acc, width) => acc + width, 0); // Soma todas as larguras das colunas


        autoTable(doc, {
          startY: y,
          didDrawPage: function (data) {
            createHeader(doc, img);
          },
          head: [["#", "NOME", "QTD", "VALOR UNITÁRIO", "SUBTOTAL"]],
          body: servicos,
          theme: "grid",
          styles: { fontSize: 10, textColor: [0, 0, 0] },
          headStyles: { fillColor: [220, 220, 220] },
          margin: { top: 40, left: 5 },
          columnStyles: {
            0: { cellWidth: columnWidthsServ[0] },
            1: { cellWidth: columnWidthsServ[1] },
            2: { cellWidth: columnWidthsServ[2] },
            3: { cellWidth: columnWidthsServ[3] },
            4: { cellWidth: columnWidthsServ[4] },
          },
          tableLineColor: [220, 220, 220], // Cor das linhas (preto)
          tableLineWidth: 0.1, // Largura das linhas
          tableWidth: totalWidth, // Largura da tabela de linhas
          showHead: "everyPage", // Exibe o cabeçalho em todas as páginas
        });
      };

      // Posição inicial para a tabela de serviços
      const startY = (doc as any).lastAutoTable.finalY + 18;

      if (startY >= finalY) {
        doc.addPage(); // Adiciona uma nova página
        tabelaServicos(40, doc, servicos); // Começa a tabela na posição desejada da nova página
      } else {
        tabelaServicos(startY, doc, servicos); // Continua na posição atual
      }




      // Definir a posição e dimensões do retângulo
      const verticalTotalServ = (doc as any).lastAutoTable.finalY + 3; // Posição vertical do texto
      const paddingTotalServ = 4; // Espaço acima e abaixo do texto
      const heightTotalServ = 7; // Altura do retângulo
      const widthTotalServ = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectTotalServ = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo      
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectTotalServ, verticalTotalServ - paddingTotalServ, widthTotalServ, heightTotalServ, "F"); // Retângulo preenchido
      // Adicionar a borda
      doc.setDrawColor(220, 220, 220); // Cor da borda
      doc.setLineWidth(0.1); // Largura da borda
      doc.rect(rectTotalServ, verticalTotalServ - paddingTotalServ, widthTotalServ, heightTotalServ, "S"); // Borda do retângulo
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2totalServ = verticalTotalServ + 1; // Ajustar o Y para um pouco abaixo
      // Adicionar texto à direita
      doc.text("Total", rectTotalServ + 1, adjustedTextY2totalServ);
      doc.text(totalServicosPDFFormatted, rectTotalServ + 152.5, adjustedTextY2totalServ);
      //#endregion
      //--------------------------------------------------------------------------------------------------------------------------------------------------------





      // #region TOTAL
      // Definir a posição e dimensões do retângulo
      const verticalTotalFinalProdutos = verticalTotalServ + 10; // Posição vertical do texto
      const paddingTotalFinalProdutos = 4; // Espaço acima e abaixo do texto
      const heightTotalFinalProdutos = 7; // Altura do retângulo
      const widthTotalFinalProdutos = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectTotalFinalProdutos = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo      
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectTotalFinalProdutos, verticalTotalFinalProdutos - paddingTotalFinalProdutos, widthTotalFinalProdutos, heightTotalFinalProdutos, "F"); // Retângulo preenchido
      // Adicionar a borda
      doc.setDrawColor(180, 180, 180); // Cor da borda
      doc.setLineWidth(0.1); // Largura da borda
      doc.rect(rectTotalFinalProdutos, verticalTotalFinalProdutos - paddingTotalFinalProdutos, widthTotalFinalProdutos, heightTotalFinalProdutos, "S"); // Borda do retângulo
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      const adjustedTextY2totalFinalProdutos = verticalTotalFinalProdutos + 1; // Ajustar o Y para um pouco abaixo
      // Definir o texto
      const totalTexto = `PRODUTOS: ${totalProdutosPDFFormatted}`;
      // Calcular a largura do texto dinamicamente
      const textWidth = doc.getTextWidth(totalTexto);
      // Definir a posição X para alinhar à direita
      const posX = 208 - textWidth - padding; // 210 é a largura da página A4 no formato retrato
      // Adicionar texto à extrema direita
      doc.text(totalTexto, posX, adjustedTextY2totalFinalProdutos);

      //TOTAL SERVIÇOS
      // Definir a posição e dimensões do retângulo
      const verticalTotalFinalServicos = verticalTotalFinalProdutos + 7; // Posição vertical do texto
      const paddingTotalFinalServicos = 4; // Espaço acima e abaixo do texto
      const heightTotalFinalServicos = 7; // Altura do retângulo
      const widthTotalFinalServicos = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectTotalFinalServicos = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo      
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectTotalFinalServicos, verticalTotalFinalServicos - paddingTotalFinalServicos, widthTotalFinalServicos, heightTotalFinalServicos, "F"); // Retângulo preenchido
      // Adicionar a borda
      doc.setDrawColor(180, 180, 180); // Cor da borda
      doc.setLineWidth(0.1); // Largura da borda
      doc.rect(rectTotalFinalServicos, verticalTotalFinalServicos - paddingTotalFinalServicos, widthTotalFinalServicos, heightTotalFinalServicos, "S"); // Borda do retângulo
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      const adjustedTextY2totalFinalServicos = verticalTotalFinalServicos + 1; // Ajustar o Y para um pouco abaixo
      // Definir o texto
      const totalTextoServicos = `SERVIÇOS: ${totalServicosPDFFormatted}`;
      // Calcular a largura do texto dinamicamente
      const textWidthServicos = doc.getTextWidth(totalTextoServicos);
      // Definir a posição X para alinhar à direita
      const posXServicos = 208 - textWidthServicos - padding; // 210 é a largura da página A4 no formato retrato
      // Adicionar texto à extrema direita
      doc.text(totalTextoServicos, posXServicos, adjustedTextY2totalFinalServicos);

      // TOTAL FRETE
      const verticalTotalFinalFrete = verticalTotalFinalServicos + 7; // Posição vertical do texto
      const paddingTotalFinalFrete = 4;
      const heightTotalFinalFrete = 7;
      const widthTotalFinalFrete = 210 - 2 * padding;
      const rectTotalFinalFrete = padding;

      // Retângulo de fundo
      doc.setFillColor(220, 220, 220);
      doc.rect(
        rectTotalFinalFrete,
        verticalTotalFinalFrete - paddingTotalFinalFrete,
        widthTotalFinalFrete,
        heightTotalFinalFrete,
        "F"
      );

      // Borda
      doc.setDrawColor(180, 180, 180);
      doc.setLineWidth(0.1);
      doc.rect(
        rectTotalFinalFrete,
        verticalTotalFinalFrete - paddingTotalFinalFrete,
        widthTotalFinalFrete,
        heightTotalFinalFrete,
        "S"
      );

      // Texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      const adjustedTextY2totalFrete = verticalTotalFinalFrete + 1;
      const totalTextoFrete = `FRETE: R$ ${Number(freteInput).toFixed(2)}`;
      const textWidthFrete = doc.getTextWidth(totalTextoFrete);
      const posXFrete = 208 - textWidthFrete - padding;
      doc.text(totalTextoFrete, posXFrete, adjustedTextY2totalFrete);


      //TOTAL GERAL
      // Definir a posição e dimensões do retângulo
      const verticalTotalFinal = verticalTotalFinalFrete + 7; // Posição vertical do texto
      const paddingTotalFinal = 4; // Espaço acima e abaixo do texto
      const heightTotalFinal = 7; // Altura do retângulo
      const widthTotalFinal = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectTotalFinal = padding; // Posição X do retângulo, ajustado para a margem da página
      // Desenhar o retângulo de fundo      
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectTotalFinal, verticalTotalFinal - paddingTotalFinal, widthTotalFinal, heightTotalFinal, "F"); // Retângulo preenchido
      // Adicionar a borda
      doc.setDrawColor(180, 180, 180); // Cor da borda
      doc.setLineWidth(0.1); // Largura da borda
      doc.rect(rectTotalFinal, verticalTotalFinal - paddingTotalFinal, widthTotalFinal, heightTotalFinal, "S"); // Borda do retângulo
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      const adjustedTextY2totalFinal = verticalTotalFinal + 1; // Ajustar o Y para um pouco abaixo
      // Definir o valor total somando produtos e serviços
      const totalGeral = totalProdutosPDF + totalServicosPDF + Number(freteInput);
      const totalTextoFinal = `TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`;
      // Calcular a largura do texto dinamicamente
      const textWidthFinal = doc.getTextWidth(totalTextoFinal);
      // Definir a posição X para alinhar à direita
      const posXFinal = 208 - textWidthFinal - padding; // 210 é a largura da página A4 no formato retrato
      // Adicionar texto à extrema direita
      doc.text(totalTextoFinal, posXFinal, adjustedTextY2totalFinal);
      //#endregion
      //------------------------------------------------------------------------------------------------------------------




      // #region observações
      const verticalObservacoes = verticalTotalFinal + 15; // Posição vertical do texto
      const paddingObservacoes = 4; // Espaço acima e abaixo do texto
      const heightObservacoes = 7; // Altura do retângulo
      const widthObservacoes = 210 - 2 * padding; // Largura do retângulo (com margens laterais)
      const rectObservacoes = padding; // Posição X do retângulo, ajustado para a margem da página

      // Desenhar o retângulo de fundo
      doc.setFillColor(220, 220, 220); // Cinza claro
      doc.rect(rectObservacoes, verticalObservacoes - paddingObservacoes, widthObservacoes, heightObservacoes, "F"); // Retângulo preenchido
      // Definir estilo do texto
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Preto
      // Texto
      const observacoesText = "OBSERVAÇÕES";
      // Ajuste para a posição vertical (ajustar um pouco para baixo)
      const adjustedTextY2observacoes = verticalObservacoes + 1; // Ajustar o Y para um pouco abaixo
      // Adicionar texto à esquerda
      doc.text(observacoesText, rectObservacoes + 1, adjustedTextY2observacoes);
      const Yobervacoes_gerais = adjustedTextY2observacoes + 7
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`${formValues.observacoes_gerais}`, 6, Yobervacoes_gerais);
      // #endregion



      // #region Rodapé
      const assinaturaY = Yobervacoes_gerais + 40; // Distância abaixo das observações
      if (assinaturaY > finalY) {
        doc.setPage(totalPages + 2);
      } else {
        // Garante que está na última página antes de desenhar      
        doc.setPage(totalPages + 1);
      }
      const adjustedFinalY = finalY - 10


      // Desenha a assinatura
      doc.setFontSize(10);
      doc.setLineWidth(0.1);
      doc.setDrawColor(0, 0, 0);
      doc.line(60, adjustedFinalY, 150, adjustedFinalY);
      doc.text("Assinatura do cliente", 105, adjustedFinalY + 5, { align: "center" });

      // Adiciona um retângulo ao redor da assinatura
      doc.setDrawColor(0, 0, 0);
      doc.setFillColor(255, 255, 255);
      doc.rect(30, adjustedFinalY - 10, 150, 20);
      // #endregion


      // Abrir o PDF em uma nova aba
      const pdfURL = doc.output("bloburl");
      window.open(pdfURL, "_blank");
    };
  };
  // #endregion









  // #region FROTAS
  const [modalFrotasVisible, setModalFrotasVisible] = useState(false);

  const handleModalClose = () => {
    setModalFrotasVisible(false); // Fecha o modal
  };

  const handleGarantiaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;

    // Garantir que o valor seja numérico e positivo
    const numericValue = Math.max(0, Number(value));

    setFormValues((prevValues) => ({
      ...prevValues,
      garantia: numericValue, // Atualiza o valor de garantia no estado
    }));
  };


  const handleTipoGarantiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setFormValues((prevValues) => ({
      ...prevValues,
      tipo_garantia: value, // Atualiza o valor de tipo_garantia no estado
    }));
  };

  const handleMouseDownSelect = (e: React.MouseEvent<HTMLSelectElement>) => {
    e.preventDefault(); // Impede a abertura do select

    const selectElement = e.currentTarget;
    let nextValue;

    // Alterna entre os três valores
    switch (selectElement.value) {
      case "dias":
        nextValue = "meses";
        break;
      case "meses":
        nextValue = "anos";
        break;
      case "anos":
        nextValue = "dias";
        break;
      default:
        nextValue = "dias"; // Valor padrão
        break;
    }

    // Atualiza o valor no estado diretamente
    setFormValues((prevValues) => ({
      ...prevValues,
      tipo_garantia: nextValue,
    }));

    // Atualiza o valor visualmente no select (não é necessário disparar evento)
    selectElement.value = nextValue;
  };



  // #endregion





  // #region USEEFFECT
  useEffect(() => {
    fetchTransportadoras();
    fetchUsers();
    fetchOrcamentos();
    fetchEstruturas();
    fetchPedidosVenda();
    fetchClients();
    fetchCentrosCusto();
    fetchServicos();
    fetchProd();
    fetchCanaisVenda();
    fetchFormasPagamento();
  }, [token]);

  useEffect(() => {
    // 1. Calcula o valor total (produtos + serviços + frete - desconto)
    let total = totalProdutosSomados + totalServicosSomados + frete;

    if (descontoUnitTotal === '%') {
      total = total - total * (descontoTotal / 100);
    } else if (descontoUnitTotal === 'R$') {
      total = total - descontoTotal;
    }

    setValorTotalTotal(total);

    // 2. Atualiza número da próxima parcela
    setParcela(
      pagamentos.length > 0
        ? pagamentos[pagamentos.length - 1].parcela! + 1
        : 1
    );

    // 3. Calcula o total com juros
    const totalComJuros = pagamentos.reduce((acc, pagamento) => {
      const valorParcela = pagamento.valorParcela ?? 0;
      const juros = pagamento.juros ?? 0;
      return acc + valorParcela * (1 + juros / 100);
    }, 0);
    setTotalPagamentos(totalComJuros);

    // 4. Calcula o total sem juros
    const totalSemJuros = pagamentos.reduce((acc, pagamento) => {
      const valorParcela = pagamento.valorParcela ?? 0;
      return acc + valorParcela;
    }, 0);
    setTotalPagamentosSemJuros(totalSemJuros);

    // 5. Calcula o restante a ser pago (considerando frete já incluso no total)
    const restante = total - totalSemJuros;
    setRestanteAserPago(restante);
  }, [
    totalProdutosSomados,
    totalServicosSomados,
    frete,
    descontoTotal,
    descontoUnitTotal,
    pagamentos,
  ]);



  // #endregion




  // #region FUNÇÕES INPUTS
  const clearInputs = () => {
    setVisualizar(false)
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
      garantia: 0,
      tipo_garantia: "",
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
      documento: "",
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
    setFreteInput("0.0");
    setValorTotalTotal(0);
    setFormValuesEstruturas((prev) => ({
      ...prev,
      nome: "",
      descricao: "",
    }));
  };
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


  const openDialog = (id: number) => {
    if (isEstrutura) {
      setEstruturaIdToCancel(id);
    } else if (isPedido) {
      setPedidoIdToCancel(id);
    } else {
      setOrcamentoIdToDelete(id);
    }
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setOrcamentoIdToDelete(null);
    setEstruturaIdToCancel(null);
    setPedidoIdToCancel(null);
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
        dbs_estrutura_orcamento: estruturaUtilizada,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/orcamentos/edit/${selectedOrcamento?.cod_orcamento}`,
        updatedFormValues,
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
        toast.success("Orçamento atualizado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
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


  const handleSaveReturn = async (fecharTela: boolean) => {

    if (Number(restanteAserPago) !== 0 && !isEstrutura) {
      console.log("Restante:", restanteAserPago);
      toast.info(`Não pode haver valor excedido nos pagamentos!`, {
        position: "top-right",
        autoClose: 4000,
        progressStyle: { background: "red" },
        icon: <span>❗</span>,
      });
      return;
    }

    if (!isEstrutura) {
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
          situacao: isPedido ? "Pedido_Gerado" : "Pendente",
          dbs_estrutura_orcamento: estruturaUtilizada,
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
          process.env.NEXT_PUBLIC_API_URL + "/api/orcamentos/register",
          updatedFormValues,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status >= 200 && response.status < 300) {
          const orcamentosAtualizados = await fetchOrcamentos();

          const orcamentoMaisNovo = orcamentosAtualizados.reduce((maisNovo, atual) =>
            atual.cod_orcamento > maisNovo.cod_orcamento ? atual : maisNovo
          );

          // Atualiza selectedOrcamento e formValues antes de gerar o pedido
          setSelectedOrcamento(orcamentoMaisNovo);
          setFormValues((prev) => ({
            ...prev,
            cod_orcamento: orcamentoMaisNovo.cod_orcamento,
          }));

          if (isPedido) {
            await handleGerarPedidoVenda(orcamentoMaisNovo.cod_orcamento);
          } else {
            setItemCreateReturnDisabled(false);
            setLoading(false);
            clearInputs();
            fetchOrcamentos();
            fetchPedidosVenda();
            toast.success("Orçamento salvo com sucesso!", {
              position: "top-right",
              autoClose: 3000,
            });
            setVisible(fecharTela);
          }
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
    }
    else {
      try {

        const updatedFormValuesEstruturas = {
          ...formValuesEstruturas,
          dbs_produtos_estrutura_orcamento: produtosSelecionados,
          dbs_servicos_estrutura_orcamento: servicosSelecionados,
        };

        const requiredFieldsEstruturas = [
          "nome",
          "descricao",
        ];

        const missingFieldEstruturas = requiredFieldsEstruturas.find((field) => {
          const value = updatedFormValuesEstruturas[field as keyof typeof updatedFormValuesEstruturas];
          return value === "" || value === null || value === undefined || (Array.isArray(value) && value.length === 0);
        });

        if (missingFieldEstruturas) {
          setItemCreateReturnDisabled(false);
          setLoading(false);
          toast.info(`Por favor, preencha o campo: ${missingFieldEstruturas.replace("_", " ")}`, {
            position: "top-right",
            autoClose: 3000,
          });
          return;
        }

        const response = await axios.post(
          process.env.NEXT_PUBLIC_API_URL + "/api/estruturas/register",
          updatedFormValuesEstruturas,
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
          fetchEstruturas();
          toast.success("Estrutura de orçamento salva com sucesso!", {
            position: "top-right",
            autoClose: 3000,
          });
          setVisible(fecharTela);
        } else {
          throw new Error("Erro ao salvar estrutura de orçamento.");
        }
      } catch (error: any) {
        setItemCreateReturnDisabled(false);
        setLoading(false);

        console.error("Erro ao salvar estrutura de orçamento:", error);

        const errorMessage = error.response?.data?.message || "Erro ao salvar estrutura de orçamento.";
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
        });
      }

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

    setVisualizar(visualizar);

    console.log("Orçamento recebido para edição:", orcamento);
    console.log("Produtos recebidos:", orcamento.dbs_produtos_orcamento);
    console.log("Serviços recebidos:", orcamento.dbs_servicos_orcamento);
    console.log("Pagamentos recebidos:", orcamento.dbs_pagamentos_orcamento);

    setFormValues(orcamento);
    setSelectedOrcamento(orcamento);
    console.log("Orçamento selecionado:", selectedOrcamento);
    setFreteInput(orcamento.frete.toString());


    // Atualiza os selects com os valores corretos
    setSelectedClient(clients.find(c => c.cod_cliente === orcamento.cod_cliente) || null);
    setFormValuesClients(prevValues => ({
      ...prevValues,
      cep: orcamento.cep ?? "",
      logradouro: orcamento.logradouro ?? "",
      numero: orcamento.numero != null ? orcamento.numero.toString() : "",
      estado: orcamento.estado ?? "",
      bairro: orcamento.bairro ?? "",
      cidade: orcamento.cidade ?? "",
    }));
    formattedDocumento();
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/orcamentos/cancel/${orcamentoIdToDelete}`,
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

  const handleSituacaoPedido_Gerado = async (cod_orcamento: number) => {
    if (cod_orcamento === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orcamentos/pedido_gerado/${cod_orcamento}`,
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
        toast.success(`${!isPedido ? "Situação mudou: pedido gerado!" : "Pedido Gerado com sucesso!"}`, {
          position: "top-right",
          autoClose: 3000,
        });

      } else {
        toast.error("Erro ao mudar para Pedido_Gerado.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao mudar para Pedido_Gerado:", error);
    }
  };

  const handleDelete = async () => {
    if (orcamentoIdToDelete === null) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orcamentos/${orcamentoIdToDelete}`,
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
    setFormValuesClients(prevValues => ({
      ...prevValues,
      [name]: formattedValue,
    }));

    // Se o CEP tiver 8 dígitos, faz a busca do endereço
    if (numericValue.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${numericValue}/json/`);

        if (!response.data.erro) {
          setFormValuesClients(prevValues => ({
            ...prevValues,
            cep: response.data.cep || "",
            logradouro: response.data.logradouro || "",
            bairro: response.data.bairro || "",
            cidade: response.data.localidade || "",
            estado: response.data.uf || "",
          }));
          setFormValues(prevValues => ({
            ...prevValues,
            cep: response.data.cep || "",
            logradouro: response.data.logradouro || "",
            bairro: response.data.bairro || "",
            cidade: response.data.localidade || "",
            estado: response.data.uf || "",
          }));
        } else {
          toast.info("CEP não encontrado!", {
            position: "top-center",
            autoClose: 3000,
            progressStyle: { background: "yellow" },
            icon: <span>⚠️</span>,
          });
          setFormValuesClients(prevValues => ({
            ...prevValues,
            logradouro: "",
            bairro: "",
            cidade: "",
            estado: "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
      }
    }
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

    setFormValues(prevValues => ({
      ...prevValues,
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
        endereco_cliente: "Nao",
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

  //autopreenchimento de campos ao selecionar algo CLIENTS
  useEffect(() => {
    if (selectedClient && (usarEndereco != "naoUsar")) {
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
  }, [selectedClient, usarEndereco]);




  const handleGerarContaAReceber = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {

      const tipoConta = tipo === "aPagar" ? "PAGAR" : "RECEBER";
      const nomeDoCliente = clients.find(cliente => cliente.cod_cliente === formValues.cod_cliente)?.nome || "Cliente Desconhecido";

      const numeroMaiorPedido = pedidosVenda.reduce((maior, pedido) => {
        return pedido.cod_pedido_venda > maior ? pedido.cod_pedido_venda : maior;
      }, 0);

      const payload = {
        ...formValues,
        tipo_conta: tipoConta,
        cod_fornecedor: null,
        cod_transportadora: formValues.cod_transportadora,
        cod_cliente: formValues.cod_cliente,
        descricao: `Pedido: ${numeroMaiorPedido} - ${nomeDoCliente}`,
        dt_vencimento: formValues.prazo,
        cod_centro_custo: formValues.cod_centro_custo,
        cod_conta_bancaria: 1,
        cod_plano_conta: 2.1,
        pagamento_quitado: "NÃO",
        dt_compensacao: null,
        nfe: formValues.nf_compra,
        nfse: null,
        valor_bruto: null,
        valor_final: formValues.valor_total,
        tipo_juros: null,
        tipo_desconto: null,
        desconto: formValues.desconto_total,
        juros: null
      };

      const pagamentos = selectedOrcamento?.dbs_pagamentos_orcamento.map((pagamento) => ({
        valor_parcela: pagamento.valorParcela,
        cod_forma_pagamento: pagamento.cod_forma_pagamento,
        parcela: pagamento.parcela,
        dt_parcela: pagamento.data_parcela ? new Date(pagamento.data_parcela).toISOString() : null,
        juros: pagamento.juros,
        tipo_juros: (pagamento.tipo_juros).toUpperCase(),
      })) || [];

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/contasFinanceiro/register",
        {
          ...payload,
          pagamentos: pagamentos,
        },
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
        toast.success("Contas a receber geradas com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao gerar contas a receber.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao gerar conta financeiras:", error);
    }
  };


  const handleGerarNFe = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {

      const payload = {
        numero_nf: formValues.cod_orcamento,
        serie: 0,
        cod_natureza_operacao: undefined,
        tipo: "Entrada",
        dt_emissao: selectedOrcamento?.data_venda,
        hr_emissao: Date.now(),
        dt_entrada_saida: Date.now(),
        hr_entrada_saida: Date.now(),
        finalidade_emissao: "NF-e normal",
        forma_emissao: "Emissão normal",
        destinacao_operacao: "Operação Interna",
        tipo_atendimento: selectedOrcamento?.canal_venda,
        cod_entidade: selectedOrcamento?.cod_cliente,
        tipo_en: "Cliente",
        cnpj_cpf_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.documento || "",
        razao_social_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.nome || "",
        tipo_contribuinte_ent: undefined,
        insc_estadual_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.insc_estadual || "",
        insc_municipal_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.insc_municipal || "",
        cep_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.cep || "",
        logradouro_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.logradouro || "",
        numero_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.numero || "",
        estado_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.estado || "",
        bairro_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.bairro || "",
        cidade_ent: clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente)?.cidade || "",
        cod_transportadora: selectedOrcamento?.cod_transportadora,
        //@ts-ignore
        cnpj_cpf_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.documento || "",
        razao_social_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.nome || "",
        tipo_contribuinte_transp: undefined,
        //@ts-ignore
        insc_estadual_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.insc_estadual || "",
        //@ts-ignore
        insc_municipal_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.insc_municipal || "",
        //@ts-ignore
        cep_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.cep || "",
        //@ts-ignore
        logradouro_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.logradouro || "",
        //@ts-ignore
        numero_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.numero || "",
        //@ts-ignore
        estado_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.estado || "",
        //@ts-ignore
        bairro_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.bairro || "",
        //@ts-ignore
        cidade_transp: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.cidade || "",
        //@ts-ignore
        estado_uf: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.estado_uf || "",
        placa_veiculo: undefined,
        //@ts-ignore
        reg_nac_trans_carga: transportadoras.find(transportadora => transportadora.cod_transportadora === selectedOrcamento?.cod_transportadora)?.reg_nac_trans_carga || "",
        modalidade: undefined,
        total_icms: undefined,
        total_pis: undefined,
        total_cofins: undefined,
        total_ipi: undefined,
        total_produtos: totalProdutosSomados,
        total_frete: selectedOrcamento?.frete,
        total_nf: selectedOrcamento?.valor_total,
        impostos_federais: undefined,
        impostos_estaduais: undefined,
        impostos_municipais: undefined,
        total_impostos: undefined,
        informacoes_complementares: selectedOrcamento?.observacoes_gerais,
        informacoes_fisco: selectedOrcamento?.observacoes_internas,
      };

      const produtos = selectedOrcamento?.dbs_produtos_orcamento.map((produto) => ({
        cod_item: produto.dbs_itens.cod_item,
        ncm: undefined,
        cfop: undefined,
        quantidade: produto.quantidade,
        valor_unitario: produto.valor_unitario,
        valor_total: produto.valor_total
      })) || [];

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsProdutos/register`,
        {
          ...payload,
          produtos: produtos
        },
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
        router.push("/pages/Dashboard/faturamento/notaFiscalProduto")
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

  const handleGerarNFSe = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const cliente = clients.find(cliente => cliente.cod_cliente === selectedOrcamento?.cod_cliente);

      const descricao_servico = servicosSelecionados
        .map(s => s.dbs_servicos.nome)
        .join(', ') + '.';

      const payload = {
        numero_rps: formValues.cod_orcamento,
        serie: 0,
        cod_natureza_operacao: null,
        dt_emissao: selectedOrcamento?.data_venda,
        hr_emissao: new Date().toISOString(),
        cod_entidade: selectedOrcamento?.cod_cliente,
        cnpj_cpf_ent: cliente?.documento || "",
        razao_social_ent: cliente?.nome || "",
        tipo_contribuinte_ent: null,
        insc_estadual_ent: cliente?.insc_estadual || "",
        insc_municipal_ent: cliente?.insc_municipal || "",
        cep_ent: cliente?.cep || "",
        logradouro_ent: cliente?.logradouro || "",
        numero_ent: cliente?.numero || "",
        estado_ent: cliente?.estado || "",
        bairro_ent: cliente?.bairro || "",
        cidade_ent: cliente?.cidade || "",

        descricao_servico: descricao_servico,

        total_icms: 0,
        aliquota_icms: 0,

        total_cofins: 0,
        aliquota_cofins: 0,

        total_pis: 0,
        aliquota_pis: 0,

        total_csll: 0,
        aliquota_csll: 0,

        total_ir: 0,
        aliquota_ir: 0,

        total_inss: 0,
        aliquota_inss: 0,

        observacoes: selectedOrcamento?.observacoes_gerais || "",
        informacoes_adicionais: selectedOrcamento?.observacoes_internas || "",

        descontar_impostos: "Não",

        total_nf: selectedOrcamento?.valor_total || 0,

        valor_servicos: Number(totalServicosSomados),
        valor_deducoes: 0,
        valor_iss: 0,
        aliquota: 0,

        descontos: 0,
        base_calculo: selectedOrcamento?.valor_total || 0,

        iss_retido: "Não",
        cod_atividade_servico: null
      };


      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/register`,
        payload,
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
        router.push("/pages/Dashboard/faturamento/notaFiscalServico");
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
                  onClick={
                    isEstrutura
                      ? handleCancelarEstrutura
                      : isPedido
                        ? handleCancelarPedido
                        : handleCancelar
                  }
                  className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all"
                />
              </div>
            }
          >
            <p>Tem certeza que deseja cancelar {isEstrutura
              ? "esta estrutura de orçamento"
              : isPedido
                ? "este pedido de venda"
                : "este orçamento"
            }?</p>
          </Dialog>
          {
            //#endregion
          }


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


          {
            //#region MODAL SERVIÇOS
          }
          <Dialog
            header={"Novo Serviço"}
            visible={visibleServ}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModalServ()}
          >
            <div className="p-fluid grid gap-2 mt-2">
              {/* Primeira Linha */}
              <div className="border border-white p-2 rounded">                <div>
                <label htmlFor="nome" className="block text-blue font-medium">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formValuesCadastroServicos.nome}
                  onChange={(e) =>
                    setFormValuesCadastroServicos((prevValues) => ({
                      ...prevValues,
                      nome: e.target.value,
                    }))
                  }
                  className="w-full border border-[#D9D9D9] rounded-sm h-8"
                />
              </div>
              </div>

              {/* Segunda Linha */}
              <div className="grid grid-cols-3 p-2 gap-2">
                <div>
                  <label htmlFor="valor_custo" className="block text-blue font-medium">
                    Valor de Custo
                  </label>
                  <input
                    id="valor_custo"
                    name="valor_custo"
                    type="text"
                    value={`R$ ${Number(formValuesCadastroServicos.valor_custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValuesCadastroServicos({ ...formValuesCadastroServicos, valor_custo: numericValue.toString() });
                    }}
                    placeholder="R$ 0,00"
                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
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
                    value={`R$ ${Number(formValuesCadastroServicos.valor_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValuesCadastroServicos({ ...formValuesCadastroServicos, valor_venda: numericValue.toString() });
                    }}
                    placeholder="R$ 0,00"
                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
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
                    value={`${Number(formValuesCadastroServicos.comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para representar decimais
                      setFormValuesCadastroServicos({ ...formValuesCadastroServicos, comissao: numericValue.toString() });
                    }}
                    placeholder="0,00 %"
                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>

              </div>

              <div className="p-2">
                <label htmlFor="descricao" className="block text-blue font-medium">
                  Descrição
                </label>
                <textarea
                  id="descricao"
                  name="descricao"
                  value={formValuesCadastroServicos.descricao}
                  onChange={(e) =>
                    setFormValuesCadastroServicos((prevValues) => ({
                      ...prevValues,
                      descricao: e.target.value,
                    }))
                  }
                  className="w-full border border-[#D9D9D9] pl-1 rounded-sm resize-y"
                  rows={4}
                  maxLength={255}
                />
              </div>

            </div>

            {/* Botões */}

            <div className="grid grid-cols-2 gap-3 p-2 w-full">

              {!isEditing && (
                <>
                  <Button
                    label="Salvar e Voltar à Listagem"
                    className="text-white"
                    icon="pi pi-refresh"
                    onClick={() => { handleSaveReturnServicos(false) }}
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
                    onClick={() => { handleSaveReturnServicos(true) }}
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

          {
            //#region MODAL FROTAS
          }
          <Dialog
            header={`Histórico de Garantias - Frota: ${formValues.frota}`}
            visible={modalFrotasVisible}
            onHide={handleModalClose}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            style={{ width: "50vw", maxHeight: "90vh", overflowY: "auto" }} // Added styles for scroll
            footer={

              <div className="w-full flex flex-col">
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
                  value={filteredFrotas.slice(first, first + rows)}
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
                    field="cod_orcamento"
                    header="Cód Orcto"
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
                  />

                  <Column
                    field="cod_orcamento"
                    header="Nr Pedido"
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
                  />

                  <Column
                    field="dtCadastro"
                    header="Data Pedido"
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
                      if (rowData.dtCadastro) {
                        const date = new Date(rowData.dtCadastro);

                        if (!isNaN(date.getTime())) {
                          // Ajustando para o fuso horário de Brasília
                          const formattedDate = date.toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false, // Formato 24h
                          });

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
                    header="Data Garantia"
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
                      if (rowData.data_venda && rowData.garantia && rowData.tipo_garantia) {
                        const dataVenda = new Date(rowData.data_venda);
                        const garantia = parseInt(rowData.garantia, 10);

                        if (!isNaN(dataVenda.getTime()) && !isNaN(garantia)) {
                          let dataGarantia = new Date(dataVenda);

                          switch (rowData.tipo_garantia) {
                            case "dias":
                              dataGarantia.setDate(dataGarantia.getDate() + garantia);
                              break;
                            case "meses":
                              dataGarantia.setMonth(dataGarantia.getMonth() + garantia);
                              break;
                            case "anos":
                              dataGarantia.setFullYear(dataGarantia.getFullYear() + garantia);
                              break;
                            default:
                              return <span>Tipo inválido</span>;
                          }

                          const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }).format(dataGarantia);

                          return <span>{formattedDate}</span>;
                        }
                      }
                      return <span>Sem data</span>;
                    }}
                  />

                  <Column
                    field="situacao"
                    header="Situação"
                    body={(rowData) => rowData.situacao.replace(/_/g, " ")} // Substitui "_" por espaço
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
                  />

                </DataTable>
              </div>

            }
          >
          </Dialog>
          {
            //#endregion
          }

          {
            //#region MODAL USAR ESTRUTURA
          }
          <Dialog
            header={`Usar Estrutura de Orçamento`}
            visible={modalUsarEstruturaVisible}
            onHide={handleModalUsarEstruturaClose}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            style={{ width: "50vw", maxHeight: "90vh", overflowY: "auto" }} // Added styles for scroll
            footer={

              <div className="w-full flex flex-col">
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
                  value={filteredEstruturas.slice(first, first + rows)}
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
                    field="cod_estrutura_orcamento"
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
                    field="nome"
                    header="Nome"
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
                  />
                  <Column
                    field="descricao"
                    header="Descrição"
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
                  />
                  <Column
                    field="situacao"
                    header="Situação"
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
                    field="dt_hr_criacao"
                    header="DT Cadastro"
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
                    body={(rowData) => {
                      // Verifica se a data de dt_hr_criacao está presente e é válida
                      if (rowData.dt_hr_criacao) {
                        // Certifica-se de que rowData.dt_hr_criacao é um número de timestamp (se for uma string ISO)
                        const date = new Date(rowData.dt_hr_criacao);

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
                          onClick={() => {
                            handleUsarEstrutura(rowData);
                            setEstruturaUtilizada(rowData.cod_estrutura_orcamento);
                          }}
                          className="hover:scale-125 hover:bg-green-700 p-2 bg-green-500 transform transition-all duration-50  rounded-2xl"
                          title="Usar para um criar um novo orçamento"
                        >
                          <FaSuse style={{ fontSize: "1.2rem" }} className="text-white text-2xl" />
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


                </DataTable>
              </div>

            }
          >
          </Dialog>
          {
            //#endregion
          }

          {
            //#region MODAL PRINCIPAL
          }
          <Dialog
            header={isEstrutura
              ? (visualizando ? "Visualizando Estrutura" : "Criar Estrutura de Orçamento")
              : (visualizando
                ? (isPedido ? "Visualizando Pedido de Venda" : "Visualizando Orçamento")
                : (isEditing ? "Editar Orçamento" : (isPedido ? "Novo Pedido de Venda" : "Novo Orçamento")))}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            style={{ width: "70vw", maxHeight: "90vh", overflowY: "auto" }} // Added styles for scroll
          >
            <br></br>
            {visualizando && (
              <div className={`${isEstrutura ? "hidden" : ""} flex gap-10 justify-center items-center`}>

                <button
                  className="!bg-red500 text-white rounded flex items-center gap-2 p-0 transition-all duration-50 hover:bg-red700 hover:scale-125"
                  onClick={gerarPDF}
                >
                  <div className="bg-red700 w-10 h-10 flex items-center justify-center rounded">
                    <AiFillFilePdf className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap">
                    {isPedido ? "PDF Pedido" : "PDF Orçamento"}&nbsp;&nbsp;
                  </span>
                </button>


                <button
                  className={`!bg-yellow500 text-white rounded flex items-center gap-2 p-0 transition-all duration-50 hover:bg-yellow-700 hover:scale-125 `}
                  onClick={() => {
                    setVisualizar(false);
                    setIsEditing(false);
                    setFrete(Number(freteInput));
                    setFormValues((prev) => ({
                      ...prev,
                      cod_orcamento: 0
                    }));
                  }}
                >
                  <div className="!bg-yellow700 w-10 h-10 flex items-center justify-center rounded">
                    <MdContentCopy className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap">
                    {isPedido ? "Copiar Pedido de Venda" : "Copiar Orçamento"}&nbsp;&nbsp;
                  </span>
                </button>



                <button
                  className={`!bg-green-600 text-white rounded flex items-center gap-2 p-0 transition-all duration-50 hover:bg-green-800 hover:scale-125 ${isPedido ? 'hidden' : ''}`}
                  onClick={async () => {
                    await handleGerarPedidoVenda();
                    handleGerarContaAReceber();
                  }}
                >
                  <div className="bg-green-800 w-10 h-10 flex items-center justify-center rounded">
                    <GiCalculator className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap">Gerar Pedido de Venda&nbsp;&nbsp;</span>
                </button>


                <button
                  className={`!bg-cyan-500 text-white rounded flex items-center gap-2 p-0 transition-all duration-50 hover:bg-cyan-800 hover:scale-125 ${!isPedido ? 'hidden' : ''}`}
                  onClick={() => {
                    handleGerarNFe();
                  }}
                >
                  <div className="bg-cyan-600 w-10 h-10 flex items-center justify-center rounded">
                    <GiCalculator className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap">Gerar NF-e&nbsp;&nbsp;</span>
                </button>

                <button
                  className={`!bg-cyan-500 text-white rounded flex items-center gap-2 p-0 transition-all duration-50 hover:bg-cyan-800 hover:scale-125 ${!isPedido ? 'hidden' : ''}`}
                  onClick={() => {
                    handleGerarNFSe();
                  }}
                >
                  <div className="bg-cyan-600 w-10 h-10 flex items-center justify-center rounded">
                    <GiCalculator className="text-white" style={{ fontSize: "24px" }} />
                  </div>
                  <span className="whitespace-nowrap">Gerar NFS-e&nbsp;&nbsp;</span>
                </button>


              </div>
            )}



            <div
              className={`${(visualizando && isEstrutura) ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>

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
                      value={!isEstrutura ? formValues.cod_orcamento : formValuesEstruturas.cod_estrutura_orcamento}
                      disabled
                      className="bg-gray-300 border border-gray-400 pl-1 rounded-sm  h-[31.7px] w-full cursor-not-allowed disabled:!bg-gray-300"
                    />
                  </div>
                  {!isEstrutura ? (
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
                  ) : (
                    <div className="col-start-2 col-span-3">
                      <label htmlFor="nome" className="block text-blue font-medium">
                        Nome
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                        disabled={visualizando}
                        value={formValuesEstruturas.nome}
                        onChange={(e) => {
                          setFormValuesEstruturas((prev) => ({
                            ...prev,
                            nome: e.target.value,
                          }));
                        }}
                      />
                    </div>
                  )}
                  {!isEstrutura && (
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
                          setFormValues((prevValues) => ({
                            ...prevValues,
                            cod_responsavel: user?.cod_usuario || 0,
                          }));
                        }}
                      >
                        <option value='' disabled selected>
                          Selecione
                        </option>
                        {users
                          .filter((user) => user.situacao !== "DESATIVADO") // Remove usuários desativados
                          .map((user) => (
                            <option key={user.cod_usuario} value={user.cod_usuario}>
                              {user.nome}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
                {
                  //#endregion
                }

                <br></br>

                {
                  // #region segunda linha
                }
                {!isEstrutura ? (
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
                        value={
                          !isEditing
                            ? formValues.data_venda
                            : formValues.data_venda
                              ? new Date(formValues.data_venda).toISOString().split("T")[0]
                              : "" // Se for undefined ou inválido, retorna uma string vazia
                        }


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
                ) : (
                  <div>
                    <label htmlFor="descricao" className="block text-blue font-medium">
                      Descrição:
                    </label>
                    <textarea
                      id="descricao"
                      name="descricao"
                      disabled={visualizando}
                      value={formValuesEstruturas.descricao}
                      maxLength={255}
                      className={`w-full border border-gray-400 pl-1 rounded-sm h-16 ${visualizando ? 'bg-gray-300 border-gray-400' : ''}`}

                      onChange={(e) => {
                        setFormValuesEstruturas((prevValues) => ({
                          ...prevValues,
                          descricao: e.target.value,
                        }));
                      }}
                    />
                  </div>
                )}
                {
                  //#endregion
                }
              </div>

              {
                // #region produtos
              }
              <button
                onClick={() => setModalUsarEstruturaVisible(true)}
                className={`mr-4 flex items-center bg-blue p-2 rounded-md transition-all duration-300 w-10 hover:w-[315px] overflow-hidden ${(visualizando || isEstrutura) ? 'hidden' : ''
                  }`}
                title="Visualizar estruturas"
              >
                <FaRegBuilding className="text-white text-2xl transition-all duration-300 flex-shrink-0" />
                <span className="ml-2 text-white  whitespace-nowrap">
                  Visualizar Estruturas de Orçamento
                </span>
              </button>
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-medium text-xl mr-2">Produtos</h3>
                  <button
                    className="bg-green200 rounded-2xl transform transition-all duration-50 hover:scale-150 hover:bg-green400"
                    onClick={() => setVisibleProd(true)}
                    disabled={visualizando}
                    style={{
                      padding: "0.1rem 0.1rem",
                      display: visualizando ? "none" : "block", // Controla visibilidade com display
                    }}
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
                          (produto.descricao ?? ('dbs_itens' in produto ? (produto as any).dbs_itens?.descricao : produto.descricao)) :
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
                          (produto.valor_venda ?? produto.valor_unitario) :
                          ('dbs_itens' in produto ? (produto as any).dbs_itens?.valor_venda : produto.valor_venda)
                        }
                        disabled
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? (produto.descontoProd ?? produto.valor_desconto) : produto.valor_desconto}
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
                        value={produto.descontoUnitProdtipo ?? produto.tipo_desconto}
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
                    className="bg-green200 rounded-2xl transform transition-all duration-50 hover:scale-150 hover:bg-green400"
                    onClick={() => setVisibleServ(true)}
                    disabled={visualizando}
                    style={{
                      padding: "0.1rem 0.1rem",
                      display: visualizando ? "none" : "block", // Controla visibilidade com display
                    }}
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
                        value={!isEditing ?
                          (servico.nome ?? (servico.dbs_servicos?.nome ?? servico.nome))
                          :
                          (servico.dbs_servicos?.descricao ?? servico.nome)}
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
                          ? (servico.valor_venda ?? servico.valor_unitario)
                          : (servico.dbs_servicos?.valor_venda ?? servico.valor_venda)
                        }

                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ?
                          (servico.descontoProd ?? (servico.valor_desconto ? servico.valor_desconto : servico.descontoProd))
                          :
                          (servico.valor_desconto ? servico.valor_desconto : servico.descontoProd)}
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
                        value={(servico.descontoUnitProdtipo ?? servico.tipo_desconto)}
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
              {!isEstrutura && (
                <div className="border border-white p-2 rounded">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative">
                      <label htmlFor="frota" className="block text-blue font-medium">
                        Frota
                      </label>
                      <div className="flex items-center">
                        <input
                          id="frota"
                          name="frota"
                          className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                          type="text"
                          value={formValues.frota}
                          disabled={visualizando}
                          onChange={(e) => {
                            setFormValues((prev) => ({
                              ...prev,
                              frota: e.target.value,
                            }));
                          }}
                        />
                        <button
                          className={`bg-green-200 rounded-2xl p-2 transform transition-all duration-50 hover:scale-125 hover:bg-green-400 ml-1 ${visualizando ? 'hidden' : ''}`}
                          onClick={() => {
                            const frotas = getFilteredFrotas(formValues.frota);
                            setFilteredFrotas(frotas);
                            setModalFrotasVisible(true);
                          }}
                        >
                          <FaSearch /> {/* Ícone de lupa */}
                        </button>
                      </div>
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
                        Transportadora
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
                              cod_transportadora: selected.cod_transportadora,
                            }));
                          }
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      >
                        <option value="" disabled>
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
                        type="text"
                        value={freteInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          // Remove o "R$" inicial e caracteres não numéricos para facilitar a digitação
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setFreteInput(`R$ ${rawValue.replace('.', ',')}`); // Adiciona "R$" novamente enquanto o usuário digita

                        }}
                        onBlur={(e) => {
                          // Remove o "R$" e formata o valor final
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          // Atualiza os valores principais
                          setFrete(numericValue);
                          setFormValues((prevValues) => ({
                            ...prevValues,
                            frete: numericValue,
                          }));

                          // Formata o valor final com "R$" para exibição
                          setFreteInput(`R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                        }}
                        style={{
                          textAlign: 'left', // Garante que o texto será alinhado à esquerda
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                      />
                    </div>
                  </div>
                </div>
              )}

              {
                //#endregion
              }

              <br></br>

              {
                // #region endereço de entrega
              }
              {!isEstrutura && (
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
              )}
              {
                //#endregion
              }


              <br></br>

              {
                // #region total
              }
              {!isEstrutura && (
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
                        value={`R$ ${Number(totalProdutosSomados).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}

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
                        value={`R$ ${Number(totalServicosSomados).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
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
              )}
              {
                //#endregion
              }

              <br></br>

              {
                // #region pagamentos
              }
              {!isEstrutura && (
                <div className="border border-gray-400 p-2 rounded mt-2 bg-gray-100">
                  <h3 className="text-blue font-medium text-xl mr-2">Pagamentos</h3>
                  <div style={{ height: "16px" }}></div>
                  <div className="grid grid-cols-6 gap-2">
                    <div hidden={restanteAserPago === 0}>
                      <label htmlFor="restanteAserPago" className="block text-black font-small">
                        {restanteAserPago < 0 ? "Excedido" : "Restante"}
                      </label>

                      <input
                        id="restanteAserPago"
                        name="restanteAserPago"
                        type="text"
                        disabled
                        className={`w-full border ${visualizando ? '!bg-gray-300 !border-gray-400' : `${restanteAserPago < 0 ? '!bg-red50' : '!bg-gray-200'} pl-1 rounded-sm h-6 ${restanteAserPago < 0 ? 'border-red' : 'border-gray-400'}`}`}
                        value={!isEditing
                          ? restanteAserPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                          : (Number(valorTotalTotal) + Number(formValues.frete || 0) - Number(totalPagamentosSemJuros)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        }
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
                        type="text" // Alterado para "text" para permitir formatação
                        className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                        disabled={visualizando}
                        value={valorParcelaInput}
                        onChange={(e) => {
                          // Remove o "R$" inicial e caracteres não numéricos para facilitar a digitação
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setValorParcelaInput(`R$ ${rawValue.replace('.', ',')}`); // Adiciona "R$" novamente enquanto o usuário digita
                        }}
                        onBlur={(e) => {
                          // Remove o "R$" e formata o valor final
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          // Atualiza os valores principais
                          setvalorParcela(numericValue);

                          // Formata o valor final com "R$" para exibição
                          setValorParcelaInput(`R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                        }}
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
                          className="bg-blue175 border border-blue500  hover:bg-blue200 hover:scale-125 transition-all duration-50 rounded-2xl p-1 flex items-center justify-center h-7 w-7 ml-[6px]"
                        >
                          <FaPlus className="text-blue400 text-xl h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <br />

                  {/* linhas adicionadas dePagamentos Parcelas Adicionadas */}
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
                          value={
                            pagamento.valorParcela
                              ? (pagamento.valorParcela * (1 + (pagamento.juros ? pagamento.juros / 100 : 0)))
                                .toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              : 'R$ 0,00'
                          }
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
                              ? new Date(pagamento.data_parcela).toLocaleDateString("pt-BR", {
                                timeZone: "UTC",
                              })
                              : ""
                          }
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
                        type="text"
                        className="w-25 h-6 border border-gray-400 pl-1 rounded-sm !bg-gray-200"
                        value={
                          totalPagamentos
                            ? `R$ ${Number(totalPagamentos).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                            : 'R$ 0,00'
                        }

                        readOnly
                      />
                    </div>
                  </div>

                </div>
              )}
              {
                //#endregion
              }

              {/* <br></br> */}
              {!isEstrutura && (
                <div className="flex items-center gap-2 grid-cols-4">
                  <div className="relative">
                    <label htmlFor="garantia" className="block text-blue font-medium">
                      Garantia
                    </label>
                    <div className="relative">
                      <input
                        id="garantia"
                        name="garantia"
                        type="number"
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                        disabled={visualizando}
                        value={formValues.garantia}
                        onChange={handleGarantiaChange} // Chama o handleGarantiaChange para o input
                        min={0}
                      />
                      <select
                        id="tipo_garantia"
                        name="tipo_garantia"
                        value={formValues.tipo_garantia}
                        disabled={visualizando}
                        onChange={handleTipoGarantiaChange} // Chama o handleTipoGarantiaChange para o select
                        onMouseDown={handleMouseDownSelect} // Alteração manual sem disparar um evento fake
                        className="absolute right-0 top-0 h-full w-[70px] border-l border-gray-400 !bg-gray-50 px-1"
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
                        <option value="dias">&nbsp;Dias</option>
                        <option value="meses">&nbsp;Meses</option>
                        <option value="anos">&nbsp;Anos</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <br></br>

              {
                // #region oberservações
              }
              {!isEstrutura && (
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
              )}
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
                      // onClick={() => console.log(codUsuarioLogado)}
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
                    onClick={() => (
                      isEstrutura
                        ?
                        handleSaveEditEstrutura()
                        :
                        handleSaveEdit())}
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
          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className=" text-blue text-2xl font-extrabold mb-3 pl-3 mt-1
">
                  {isEstrutura ? 'Estruturas de Orçamento' : (isPedido ? 'Pedidos de Venda' : 'Orçamentos')}
                </h2>

              </div>
              {permissions?.insercao === "SIM" && (
                <div className='mr-2'>
                  <RegisterButton onClick={() => { setVisible(true); }} title="Cadastrar" />
                </div>
              )}
            </div>

            {(!isEstrutura && !isPedido) ? (

              <div
                className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col mt-2"
                style={{ height: "95%" }}
              >

                <div className="mb-4 flex items-center justify-end">
                  <button
                    onClick={() => router.push("/pages/Dashboard/commercial/orcamentos?tipo=estrutura")}
                    className="mr-4 hover:scale-125 hover:bg-blue600 p-2 bg-blue transform transition-all duration-50 rounded-md"
                    title="Visualizar estruturas"
                  >
                    <FaRegBuilding style={{ fontSize: "1.2rem" }} className="text-white text-2xl" />
                  </button>
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
                  className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2"
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
                    body={(rowData) => {
                      if (rowData.dtCadastro) {
                        const date = new Date(rowData.dtCadastro);

                        if (!isNaN(date.getTime())) {
                          // Ajustando para o fuso horário de Brasília
                          const formattedDate = date.toLocaleString("pt-BR", {
                            timeZone: "America/Sao_Paulo",
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false, // Formato 24h
                          });

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
                        <ViewButton onClick={() => {
                          handleEdit(rowData, true);
                          setEstruturaUtilizada(rowData.cod_estrutura_orcamento);
                        }} />
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
                          <EditButton onClick={() => { handleEdit(rowData, false); setIsEditing(true) }} />
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
                          <CancelButton onClick={() => openDialog((!isEstrutura ? rowData.cod_orcamento : rowData.cod_estrutura_orcamento))} />
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

            ) : (!isPedido && isEstrutura) ? (

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
                  value={filteredEstruturas.slice(first, first + rows)}
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
                    field="cod_estrutura_orcamento"
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
                    field="nome"
                    header="Nome"
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
                  />
                  <Column
                    field="descricao"
                    header="Descrição"
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
                  />
                  <Column
                    field="situacao"
                    header="Situação"
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
                    field="dt_hr_criacao"
                    header="DT Cadastro"
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
                    body={(rowData) => {
                      // Verifica se a data de dt_hr_criacao está presente e é válida
                      if (rowData.dt_hr_criacao) {
                        // Certifica-se de que rowData.dt_hr_criacao é um número de timestamp (se for uma string ISO)
                        const date = new Date(rowData.dt_hr_criacao);

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
                        <ViewButton onClick={() => handleEditEstrutura(rowData, true)} />
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
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <TransformButton
                          onClick={() => {
                            handleUsarEstrutura(rowData);
                            setEstruturaUtilizada(rowData.cod_estrutura_orcamento);
                          }}
                          title="Usar esta estrutura para um novo orçamento"
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

                  {permissions?.edicao === "SIM" && (
                    <Column
                      header=""
                      body={(rowData) => (
                        <div className="flex gap-2 justify-center">
                          <EditButton onClick={() => handleEditEstrutura(rowData, false)} />
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
                          <CancelButton onClick={() => openDialog((!isEstrutura ? rowData.cod_orcamento : rowData.cod_estrutura_orcamento))} />
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

            ) : (

              <div
                className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col mt-2"
                style={{ height: "95%" }}
              >

                <div className="mb-4 flex items-center justify-end">
                  <button
                    onClick={() => router.push("/pages/Dashboard/commercial/orcamentos")}
                    className="mr-4 hover:scale-125 hover:bg-blue600 p-2 bg-blue transform transition-all duration-50 rounded-md"
                    title="Visualizar orçamentos"
                  >
                    <MdRequestQuote style={{ fontSize: "1.4rem" }} className="text-white text-2xl" />
                  </button>
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
                  value={filteredPedidosVenda.slice(first, first + rows)}
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
                    field="cod_pedido_venda"
                    header="Pedido"
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
                    field="cod_orcamento"
                    header="Orcto"
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
                    field=""
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
                      // Acessa o primeiro orçamento e verifica se tem prazo
                      const prazo = rowData.dbs_orcamentos?.prazo;
                      if (!prazo) {
                        return "-";
                      }
                      // Converte "2025-03-20T00:00:00.000Z" para "20/03/2025"
                      const [year, month, day] = prazo.split("T")[0].split("-");
                      return `${day}/${month}/${year}`;
                    }}
                  />

                  <Column
                    field="dt_hr_pedido"
                    header="DT Pedido"
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
                      // Verifica se a data de dt_hr_pedido está presente e é válida
                      if (rowData.dt_hr_pedido) {
                        // Certifica-se de que rowData.dt_hr_pedido é um número de timestamp (se for uma string ISO)
                        const date = new Date(rowData.dt_hr_pedido);

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
                          onClick={() => handleVisualizarPedidoVenda(rowData.cod_pedido_venda, rowData.cod_orcamento)}
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

                  {permissions?.delecao === "SIM" && (
                    <Column
                      header=""
                      body={(rowData) => (
                        <div className="flex gap-2 justify-center">
                          <CancelButton onClick={() => openDialog(isEstrutura
                            ? rowData.cod_estrutura_orcamento
                            : isPedido
                              ? rowData.cod_pedido_venda
                              : rowData.cod_orcamento)} />
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

            )
            }
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

// ESTE É O COMPONENTE PRINCIPAL (default)
export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <img src="/loading.gif" alt="Carregando..." style={{ width: 100, height: 100 }} />
        </div>
      }
    >
      <OrcamentosPage />
    </Suspense>
  );
}

