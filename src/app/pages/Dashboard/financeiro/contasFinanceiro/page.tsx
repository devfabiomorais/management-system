"use client";
import React, { ChangeEvent, useEffect, useState, Suspense, CSSProperties } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";
import { IoAddCircleOutline } from "react-icons/io5";
import { FaTrash, FaBan, FaPlus, FaTimes } from "react-icons/fa";
import { MdOutlineModeEditOutline, MdVisibility } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import { useSearchParams } from "next/navigation";
import { BsFillCircleFill, BsFunnel } from "react-icons/bs";
import { GiFunnel } from "react-icons/gi";
import ClientsPage from "../../commercial/clients/page";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";
import FilterButton from "@/app/components/Buttons/FilterButton";

export interface ContasBancarias {
  cod_conta_bancaria: number;
  nome?: string;
  saldo?: number;
  dt_saldo?: Date | string;
  situacao?: 'Ativo' | 'Inativo';
  dt_cadastro?: Date | string;
}

interface Fornecedor {
  cod_fornecedor: number;
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

interface Transportadora {
  cod_transportadora: number;
  nome: string;
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
}

interface ContaFinanceiro {
  cod_conta: number;
  tipo_conta?: "pagar" | "receber";
  cod_fornecedor?: number;
  cod_transportadora?: number;
  cod_cliente?: number;
  descricao?: string;
  dt_vencimento?: Date;
  cod_centro_custo?: number;
  cod_conta_bancaria?: number;
  cod_plano_conta?: number;
  pagamento_quitado?: string;
  dt_compensacao?: Date;
  nfe?: string;
  nfse?: string;
  valor_bruto?: number;
  valor_final?: number;
  tipo_juros?: string;
  tipo_desconto?: string;
  desconto?: number;
  juros?: number;
  situacao?: string;
  pagamentos?: [];
}


interface Pagamento {
  nome: string | number | readonly string[] | undefined;
  formaPagamento: any;
  id: number;
  cod_forma_pagamento?: number;
  parcela?: number;
  valor_parcela?: number;
  juros?: number;
  dt_parcela?: string;
  tipo_juros?: "PERCENTUAL" | "REAL";
}

interface Formas {
  cod_forma_pagamento?: number; // Adicionado caso precise da chave primária
  nome?: string;
  descricao?: string;
  situacao?: string;
}

interface CentroCusto {
  situacao: any;
  cod_centro_custo: number;
  nome: string;
  descricao?: string;
}

interface PlanoContas {
  cod_plano_conta: number;
  descricao?: string;
  classificacao?: string;
  cod_plano_conta_mae?: number;
  cod_grupo_dre?: number;
  situacao?: string;
}

const ContasFinanceiroPage: React.FC = () => {
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

  const searchParams = useSearchParams();
  const tipoDaURL = searchParams.get("tipo"); // 'aPagar' ou 'aReceber'
  const [tipo, setTipo] = useState<"aPagar" | "aReceber" | null>(null);
  useEffect(() => {
    if (tipoDaURL === "aPagar" || tipoDaURL === "aReceber") {
      setTipo(tipoDaURL);
    }
  }, [tipoDaURL]);

  //#region contas bancarias
  const [contasBancarias, setContasBancarias] = useState<ContasBancarias[]>([]);
  const fetchContasBancarias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/contasBancarias",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setContasBancarias(response.data.contasBancarias);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar contas bancárias:", error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchContasBancarias();
    }
  }, [token]);
  //#endregion

  const [contasFinanceiro, setContasFinanceiro] = useState<ContaFinanceiro[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const fetchContasFinanceiro = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contasFinanceiro`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.contasFinanceiro);
      setIsDataLoaded(true);
      setContasFinanceiro(response.data.contasFinanceiro);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar conta financeiras:", error);
    }
  };

  //#region fornecedores
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const fetchFornecedores = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/fornecedores",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data.fornecedores);
      setFornecedores(response.data.fornecedores);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar fornecedores:", error);
    }
  };
  //#endregion

  //#region clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
  //#endregion

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

  //#region plano-contas
  const [selectedPlanoContas, setSelectedPlanoContas] = useState<PlanoContas | null>(null);
  const [planoContas, setPlanoContas] = useState<PlanoContas[]>([]);
  const [formValuesPlanoContas, setFormValuesPlanoContas] = useState<PlanoContas>({
    cod_plano_conta: 0,
    descricao: "",
    classificacao: "",
    cod_plano_conta_mae: 0,
    cod_grupo_dre: 0,
    situacao: "",
  });
  const fetchPlanoContas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/planoContas",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPlanoContas(response.data.planoContas);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar plano de contas:", error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchPlanoContas();
      fetchTransportadoras();
      fetchFornecedores();
      fetchClients();
    }
  }, [token]);
  //#endregion

  //#region centro custo
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<CentroCusto | null>(null);
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
      console.error("Erro ao carregar conta financeiras:", error);
    }
  };
  useEffect(() => {
    fetchCentrosCusto();
  }, []);
  //#endregion


  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [contaFinanceiroIdToDelete, setContaFinanceiroIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedContaFinanceiro, setSelectedContaFinanceiro] = useState<ContaFinanceiro | null>(null);
  const [formValues, setFormValues] = useState<ContaFinanceiro>({
    cod_conta: 0,
    tipo_conta: undefined,
    cod_fornecedor: 0,
    cod_transportadora: 0,
    cod_cliente: 0,
    descricao: "",
    dt_vencimento: undefined,
    cod_centro_custo: 0,
    cod_conta_bancaria: 0,
    cod_plano_conta: 0,
    pagamento_quitado: "",
    dt_compensacao: undefined,
    nfe: "",
    nfse: "",
    valor_bruto: 0,
    valor_final: 0,
    tipo_juros: "PERCENTUAL",
    tipo_desconto: "PERCENTUAL",
    desconto: 0,
    juros: 0,
    situacao: "",
    pagamentos: [],
  });

  const [entidade, setEntidade] = useState("");

  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_conta: 0,
      tipo_conta: undefined,
      cod_fornecedor: 0,
      cod_transportadora: 0,
      cod_cliente: 0,
      descricao: "",
      dt_vencimento: undefined,
      cod_centro_custo: 0,
      cod_conta_bancaria: undefined,
      cod_plano_conta: 0,
      pagamento_quitado: "default",
      dt_compensacao: undefined,
      nfe: "",
      nfse: "",
      valor_bruto: 0,
      valor_final: 0,
      tipo_juros: "",
      tipo_desconto: "",
      desconto: 0,
      juros: 0,
      situacao: "",
      pagamentos: [],
    });
    setEntidade("default");
    setSelectedPlanoContas(null);
    setSelectedCentroCusto(null);
    setRestanteAserPago(0);
    setValorBruto(0);
    setValorBrutoInput("0.00");
    setPagamentos([]);
  };

  const handleSaveEdit = async (cod_conta: any) => {

    try {
      const requiredFields = [
        "descricao",
        "dt_vencimento",
        "cod_conta",
        "cod_conta_bancaria",
        "cod_plano_conta",
        "pagamento_quitado",
        "dt_compensacao",
        "nfe",
        "valor_bruto",
        "valor_final",
      ];

      // Dicionário de rótulos amigáveis
      const fieldLabels: { [key: string]: string } = {
        cod_conta: "Código da Conta",
        descricao: "Descrição",
        dt_vencimento: "Data de Vencimento",
        cod_centro_custo: "Centro de Custo",
        cod_conta_bancaria: "Conta Bancária",
        cod_plano_conta: "Plano de Conta",
        pagamento_quitado: "Pagamento Quitado",
        dt_compensacao: "Data de Compensação",
        nfe: "NFe",
        valor_bruto: "Valor Bruto",
        valor_final: "Valor Final",
        desconto: "Desconto",
        juros: "Juros",
      };

      const emptyField = requiredFields.find((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (emptyField) {
        const fieldName = fieldLabels[emptyField] || emptyField;
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info(`O campo "${fieldName}" deve ser preenchido!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemEditDisabled(false);
        setLoading(false);
        setIsEditing(true);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contasFinanceiro/edit`,
        { ...formValues, pagamentos: pagamentos },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        setItemEditDisabled(true);
        setLoading(true);

        clearInputs();
        fetchContasFinanceiro();
        toast.success("Conta financeira salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        setIsEditing(true);
        toast.error("Erro ao salvar conta financeira.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      setIsEditing(true);
      console.error("Erro ao salvar conta financeira:", error);
    }
  };

  const handleSave = async () => {
    setItemCreateDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "descricao",
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
        process.env.NEXT_PUBLIC_API_URL + "/api/contasFinanceiro/register",
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
        fetchContasFinanceiro();
        toast.success("Conta financeira salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar conta financeira.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar conta financeira:", error);
    }
  };

  const [rowData, setRowData] = useState<ContaFinanceiro[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "cod_fornecedor",
        "cod_transportadora",
        "cod_cliente",
        "descricao",
        "dt_vencimento",
        "cod_conta",
        "cod_conta_bancaria",
        "cod_plano_conta",
        "pagamento_quitado",
        "dt_compensacao",
        "nfe",
        "valor_bruto",
        "valor_final",
      ];

      // Dicionário de rótulos amigáveis
      const fieldLabels: { [key: string]: string } = {
        cod_conta: "Código da Conta",
        descricao: "Descrição",
        dt_vencimento: "Data de Vencimento",
        cod_centro_custo: "Centro de Custo",
        cod_conta_bancaria: "Conta Bancária",
        cod_plano_conta: "Plano de Conta",
        pagamento_quitado: "Pagamento Quitado",
        dt_compensacao: "Data de Compensação",
        nfe: "NFe",
        valor_bruto: "Valor Bruto",
        valor_final: "Valor Final"
      };

      const emptyField = requiredFields.find((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (emptyField) {
        const fieldName = fieldLabels[emptyField] || emptyField;
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info(`O campo "${fieldName}" deve ser preenchido!`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }


      const contaEncontrada = rowData.find((item) => item.descricao === formValues.descricao);
      const situacaoInativo = contaEncontrada?.situacao === "Inativo";

      if (contaEncontrada && !situacaoInativo) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Essa descricao já existe no banco de dados, escolha outra!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>, // Usa o emoji de alerta
        });
        return;
      }

      if (contaEncontrada && situacaoInativo) {
        await handleSaveEdit(contaEncontrada.cod_conta);
        fetchContasFinanceiro();
        setItemCreateReturnDisabled(false);
        setLoading(false);
        clearInputs();
        setVisible(fecharTela);
        toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
          position: "top-right",
          autoClose: 10000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>,
        });
        return;
      }

      const tipoConta = tipo === "aPagar" ? "PAGAR" : "RECEBER";
      const updatedFormValues = {
        ...formValues,
        tipo_conta: tipoConta,
        tipo_juros: jurosUnit,
        tipo_desconto: descontoUnit,
      };

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/contasFinanceiro/register",
        {
          ...updatedFormValues,
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
        fetchContasFinanceiro();
        toast.success("Conta financeira salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar conta financeiras.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar conta financeiras:", error);
    }
  };

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (contasFinanceiro: ContaFinanceiro, visualizar: boolean) => {
    setVisualizar(visualizar);

    console.log("contasFinanceiro", contasFinanceiro);

    contasFinanceiro.cod_cliente ? setEntidade("cliente")
      : (contasFinanceiro.cod_fornecedor ? setEntidade("fornecedor")
        : contasFinanceiro.cod_transportadora ? setEntidade("transportadora")
          : setEntidade("default"));

    setSelectedCentroCusto(
      contasFinanceiro.cod_centro_custo !== undefined
        ? centrosCusto.find(c => c.cod_centro_custo === contasFinanceiro.cod_centro_custo) ?? null
        : null
    );

    setSelectedPlanoContas(
      contasFinanceiro.cod_plano_conta !== undefined
        ? planoContas.find(p => p.cod_plano_conta === contasFinanceiro.cod_plano_conta) ?? null
        : null
    );

    setValorBrutoInput((Number(contasFinanceiro.valor_bruto ?? 0)).toFixed(2));

    setjuros(contasFinanceiro.juros ?? 0);
    setjurosUnit(contasFinanceiro.tipo_juros ?? "PERCENTUAL");
    setdesconto(contasFinanceiro.desconto ?? 0);
    setdescontoUnit(contasFinanceiro.tipo_desconto ?? "PERCENTUAL");

    setPagamentos((contasFinanceiro as any).db_pagamentos_contas ?? []);


    setFormValues(contasFinanceiro);
    setSelectedContaFinanceiro(contasFinanceiro);
    setIsEditing(true);
    setVisible(true);
  };

  useEffect(() => {
    fetchContasFinanceiro();
    fetchFormasPagamento();
  }, []);



  const openDialog = (id: number) => {
    setContaFinanceiroIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setContaFinanceiroIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (!contaFinanceiroIdToDelete) {
      toast.error("Erro ao cancelar conta financeira. ID vazio.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contasFinanceiro/cancel/${contaFinanceiroIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchContasFinanceiro();
        setModalDeleteVisible(false);
        toast.success("Conta financeira cancelada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar conta financeira.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir conta financeira:", error);
      toast.error("Erro ao excluir conta financeira. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (contaFinanceiroIdToDelete === null) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contasFinanceiro/${contaFinanceiroIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Conta financeira removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchContasFinanceiro();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir conta financeira:", error);
      toast.error("Erro ao excluir conta financeira. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };



  //#region PAGAMENTOS
  const [juros, setjuros] = useState<number>(0);
  const [jurosUnit, setjurosUnit] = useState('PERCENTUAL'); // '%' ou 'R$'

  const handlejurosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(",", "."); // Permite digitação com vírgula e converte para ponto
    let numericValue = Number(value);

    setjuros(numericValue);
    setFormValues((prev) => ({
      ...prev,
      juros: numericValue,
    }));
  };


  const handlejurosUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "%juros" ? "PERCENTUAL" : "REAL";
    setjurosUnit(newValue);
    setFormValues((prev) => ({
      ...prev,
      tipo_juros: newValue,
    }));
  };



  const [desconto, setdesconto] = useState<number>(0);
  const [descontoUnit, setdescontoUnit] = useState('PERCENTUAL'); // '%' ou 'R$'

  const handledescontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(",", "."); // Permite digitação com vírgula e converte para ponto
    let numericValue = Number(value);

    const maxValue = descontoUnit === "PERCENTUAL" ? 100 : Number(formValues.valor_bruto);

    if (numericValue > maxValue) {
      numericValue = maxValue; // Limita ao máximo permitido
    } else if (numericValue < 0 || isNaN(numericValue)) {
      numericValue = 0; // Evita valores negativos ou inválidos
    }

    setdesconto(numericValue);
    setFormValues((prev) => ({
      ...prev,
      desconto: numericValue,
    }));
  };


  const handledescontoUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value === "%prod" ? "PERCENTUAL" : "REAL";
    setdescontoUnit(newValue);
    setFormValues((prev) => ({
      ...prev,
      tipo_desconto: newValue,
    }));
  };


  const [valorTotalTotal, setValorTotalTotal] = useState(0);

  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<Pagamento | null>(null);
  const [formasPagamento, setFormasPagamento] = useState<Formas[]>([]);
  const [valor_parcela, setvalor_parcela] = useState<number>(0);
  const [valor_parcelaInput, setvalor_parcelaInput] = useState(`R$ ${valor_parcela.toFixed(2).replace('.', ',')}`); // Estado inicial com "R$"
  const [jurosParcela, setJurosParcela] = useState<number>(0);
  const [dt_parcela, setDataParcela] = useState<string>("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1); // Novo estado para quantidade de parcelas
  const [parcela, setParcela] = useState<number>(0);


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
    if (!selectedFormaPagamento || !dt_parcela) {
      alert("Prencha a forma de pagamento, o valor e a data de pagamento");
      return;
    }
    const novoPagamento: Pagamento = {
      id: Date.now(),
      cod_forma_pagamento: selectedFormaPagamento.cod_forma_pagamento,
      nome: selectedFormaPagamento.nome,
      formaPagamento: selectedFormaPagamento,
      parcela: pagamentos.length + 1, // Garante que a parcela seja sempre sequencial
      valor_parcela: valor_parcela * 100,
      juros: jurosParcela,
      tipo_juros: "PERCENTUAL",
      dt_parcela,
    };

    setPagamentos((prev) => [...prev, novoPagamento]);
    console.log(pagamentos);

    setSelectedFormaPagamento(null);
    setJurosParcela(0);
    setDataParcela("");
    setvalor_parcela(0);
    setvalor_parcelaInput("");
  };

  const handleAdicionarMultiplasParcelas = () => {
    if (!selectedFormaPagamento || !dt_parcela || quantidadeParcelas < 1) return;


    const novasParcelas: Pagamento[] = Array.from({ length: quantidadeParcelas }, (_, i) => {
      const dataInicial = new Date(dt_parcela + 'T00:00:00');
      const dataParcelaAtual = new Date(dataInicial);
      dataParcelaAtual.setMonth(dataInicial.getMonth() + i);

      setSelectedFormaPagamento(null);
      setJurosParcela(0);
      setDataParcela("");
      setvalor_parcela(0);
      setvalor_parcelaInput("");

      return {
        id: Date.now() + i, // Garantindo IDs únicos
        cod_forma_pagamento: selectedFormaPagamento.cod_forma_pagamento,
        nome: selectedFormaPagamento.nome,
        formaPagamento: selectedFormaPagamento,
        parcela: pagamentos.length + i + 1, // Sequencial baseado no número de parcelas já existe no banco de dadosntes
        valor_parcela: valor_parcela * 100,
        juros,
        tipo_juros: "PERCENTUAL",
        dt_parcela: dataParcelaAtual.toISOString().split('T')[0], // Formatando para "yyyy-MM-dd"
      };
    });


    setPagamentos((prev) => [...prev, ...novasParcelas]);
    setSelectedFormaPagamento(null);
    setvalor_parcela(0);
    setJurosParcela(0);
    setDataParcela("");
    setQuantidadeParcelas(1); // Reseta a quantidade de parcelas para 1 após adicionar
  };

  useEffect(() => {
    setParcela(pagamentos.length > 0 ? pagamentos[pagamentos.length - 1].parcela! + 1 : 1);
  }, [pagamentos]);

  useEffect(() => {
    const totalPago = pagamentos.reduce((acc, pagamento) => acc + (pagamento.valor_parcela ?? 0), 0);
    setRestanteAserPago(((formValues.valor_final ?? 0) * 100) - totalPago);
  }, [pagamentos, formValues.valor_final]);

  useEffect(() => {
    const totalComJuros = pagamentos.reduce((acc, pagamento) => {
      const valor_parcela = pagamento.valor_parcela ?? 0; // Garantir que valor_parcela não seja undefined
      const jurosDaParcela = pagamento.juros ?? 0; // Garantir que juros não seja undefined
      const valorComJuros = valor_parcela * (1 + jurosDaParcela / 100); // tudo em centavos

      return acc + valorComJuros;
    }, 0);

    setTotalPagamentos(totalComJuros);
  }, [pagamentos]);
  //#endregion

  const [restanteAserPago, setRestanteAserPago] = useState(formValues.valor_final ?? 0);

  useEffect(() => {
    const valorBruto = Number(formValues.valor_bruto) || 0;

    const valorJuros = jurosUnit === 'PERCENTUAL'
      ? valorBruto * (Number(juros) || 0) / 100
      : Number(juros) || 0;

    const valorDesconto = descontoUnit === 'PERCENTUAL'
      ? valorBruto * (Number(desconto) || 0) / 100
      : Number(desconto) || 0;

    const valorFinal = valorBruto + valorJuros - valorDesconto;

    setFormValues(prev => ({
      ...prev,
      valor_final: parseFloat(valorFinal.toFixed(2)),
    }));
  }, [
    formValues.valor_bruto,
    juros,
    jurosUnit,
    desconto,
    descontoUnit
  ]);



  const [valorBruto, setValorBruto] = useState(0.0);
  const [valorBrutoInput, setValorBrutoInput] = useState(valorBruto.toFixed(2));


  //#region datatable
  const [linhaSelecionada, setLinhaSelecionada] = useState<ContaFinanceiro | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);


  const [headerBgColor, setHeaderBgColor] = useState("#D9D9D980"); // cor padrão
  const [fontColor, setFontColor] = useState("#1B405D"); // cor padrão
  const [tableStyle, setTableStyle] = useState<any>({}); // para forçar atualização de estilo

  const datatableColor = (): React.CSSProperties => {
    return {
      fontSize: "1.2rem",
      color: fontColor,
      fontWeight: "bold",
      border: "1px solid #ccc",
      textAlign: "center",
      backgroundColor: headerBgColor,
      verticalAlign: "middle",
      padding: "10px",
    };
  };

  // Usar useEffect para aplicar o estilo quando a cor mudar
  useEffect(() => {
    setTableStyle(datatableColor());
  }, [headerBgColor, fontColor]); // Dependência no headerBgColor

  //#endregion


  //#region filtros
  const [isVencidos, setIsVencidos] = useState(false);
  const [isVencemHoje, setIsVencemHoje] = useState(false);
  const [isAVencer, setIsAVencer] = useState(false);
  const [isPagos, setIsPagos] = useState(false);

  //VENCIDOS--------------------------------
  const applyVencidosFilter = () => {
    setIsVencidos((prev) => {
      const novoEstado = !prev;

      // Atualiza a cor de acordo com o estado do filtro
      if (!novoEstado) {
        setHeaderBgColor(""); // reseta a cor quando desativa o filtro 
        setFontColor(""); // reseta a cor quando desativa o filtro 
      } else {
        setHeaderBgColor("#c01526"); // reseta a cor quando desativa o filtro 
        setFontColor("#FFFFFF");
      }

      return novoEstado;
    });
    // Desativa os outros filtros (opcional)
    setIsVencemHoje(false);
    setIsAVencer(false);
    setIsPagos(false);
  };

  const somatoriaVencidos = contasFinanceiro
    .filter((conta) => {
      const vencimento = conta.dt_vencimento;
      // Filtro de vencidos baseado no tipo
      if (tipo === "aPagar") {
        return vencimento && new Date(vencimento) < new Date() && conta.tipo_conta?.toUpperCase() === "PAGAR"; // Se tipo for "aPagar", filtra por "PAGAR"
      } else if (tipo === "aReceber") {
        return vencimento && new Date(vencimento) < new Date() && conta.tipo_conta?.toUpperCase() === "RECEBER"; // Se tipo for "aReceber", filtra por "RECEBER"
      }
      return false; // Retorna falso se tipo não for nem "aPagar" nem "aReceber"
    })
    .reduce((acc, conta) => acc + (Number(conta.valor_final) || 0), 0); // Converte para número

  // Formatar o resultado com ponto para milhar e vírgula para o decimal
  const somatoriaFormatadaVencidos = somatoriaVencidos
    .toFixed(2) // Garante que sempre tenha 2 casas decimais
    .replace('.', ',') // Substitui o ponto por vírgula
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona ponto como separador de milhar
  //--------------------------------


  //VENCEM HOJE--------------------------------
  const applyVencemHojeFilter = () => {
    setIsVencemHoje((prev) => {
      const novoEstado = !prev;

      if (!novoEstado) {
        setHeaderBgColor("");
        setFontColor("");
      } else {
        setHeaderBgColor("#ff9e00"); // reseta a cor quando desativa o filtro 
        setFontColor("#FFFFFF");
      }

      return novoEstado;
    });

    setIsVencidos(false);
    setIsAVencer(false);
    setIsPagos(false);
  };
  const somatoriaVencemHoje = contasFinanceiro
    .filter((conta) => {
      const vencimento = conta.dt_vencimento;

      if (!vencimento) return false;

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const vencimentoDate = new Date(vencimento);
      vencimentoDate.setDate(vencimentoDate.getDate() + 1); // Corrige fuso
      vencimentoDate.setHours(0, 0, 0, 0);

      // Verifica se o vencimento é hoje e aplica o filtro de tipo
      if (tipo === "aPagar") {
        return vencimentoDate.getTime() === hoje.getTime() && conta.tipo_conta?.toUpperCase() === "PAGAR"; // Se tipo for "aPagar", filtra por "PAGAR"
      } else if (tipo === "aReceber") {
        return vencimentoDate.getTime() === hoje.getTime() && conta.tipo_conta?.toUpperCase() === "RECEBER"; // Se tipo for "aReceber", filtra por "RECEBER"
      }
      return false; // Retorna falso se tipo não for nem "aPagar" nem "aReceber"
    })
    .reduce((acc, conta) => acc + (Number(conta.valor_final) || 0), 0); // Converte para número

  // Formatar o resultado com ponto para milhar e vírgula para o decimal
  const somatoriaFormatadaVencemHoje = somatoriaVencemHoje
    .toFixed(2)
    .replace('.', ',')
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  //--------------------------------



  //A VENCER--------------------------------
  const applyAVencerFilter = () => {
    setIsAVencer((prev) => {
      const novoEstado = !prev;

      if (!novoEstado) {
        setHeaderBgColor("");
        setFontColor("");
      } else {
        setHeaderBgColor("#06b6d4"); // reseta a cor quando desativa o filtro 
        setFontColor("#FFFFFF");
      }

      return novoEstado;
    });

    setIsVencidos(false);
    setIsVencemHoje(false);
    setIsPagos(false);
  };

  const somatoriaVaoVencer = contasFinanceiro
    .filter((conta) => {
      const vencimento = conta.dt_vencimento;

      if (!vencimento) return false; // Se a data de vencimento for undefined, ignora

      const hoje = new Date();
      const vencimentoDate = new Date(vencimento); // Garante que seja um objeto Date

      // Verifica se a data de vencimento é maior que a data de hoje
      if (tipo === "aPagar") {
        return vencimentoDate > hoje && conta.tipo_conta?.toUpperCase() === "PAGAR"; // Se tipo for "aPagar", filtra por "PAGAR"
      } else if (tipo === "aReceber") {
        return vencimentoDate > hoje && conta.tipo_conta?.toUpperCase() === "RECEBER"; // Se tipo for "aReceber", filtra por "RECEBER"
      }
      return false; // Retorna falso se tipo não for nem "aPagar" nem "aReceber"
    })
    .reduce((acc, conta) => acc + (Number(conta.valor_final) || 0), 0); // Converte para número

  // Formatar o resultado com ponto para milhar e vírgula para o decimal
  const somatoriaFormatadaAVencer = somatoriaVaoVencer
    .toFixed(2) // Garante que sempre tenha 2 casas decimais
    .replace('.', ',') // Substitui o ponto por vírgula
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona ponto como separador de milhar
  //--------------------------------

  //PAGOS--------------------------------
  const applyPagosFilter = () => {
    setIsPagos((prev) => {
      const novoEstado = !prev;

      if (novoEstado) {
        setHeaderBgColor("#16a34a");
        setFontColor("#FFFFFF");
      } else {
        setHeaderBgColor("");
        setFontColor("");
      }

      return novoEstado;
    });

    // Desativa os outros filtros 
    setIsVencidos(false);
    setIsVencemHoje(false);
    setIsAVencer(false);
  };
  const somatoriaPagos = contasFinanceiro
    .filter((conta) => {
      // Filtra contas com pagamento quitado
      const isPago = String(conta.pagamento_quitado).toLowerCase() === "sim";

      if (tipo === "aPagar") {
        // Se tipo for "aPagar", filtra as contas "PAGAR"
        return isPago && conta.tipo_conta?.toUpperCase() === "PAGAR";
      } else if (tipo === "aReceber") {
        // Se tipo for "aReceber", filtra as contas "RECEBER"
        return isPago && conta.tipo_conta?.toUpperCase() === "RECEBER";
      }
      return false; // Retorna falso se tipo não for nem "aPagar" nem "aReceber"
    })
    .reduce((acc, conta) => acc + (Number(conta.valor_final) || 0), 0); // Converte para número

  // Formatar o resultado com ponto para milhar e vírgula para o decimal
  const somatoriaFormatadaPagos = somatoriaPagos
    .toFixed(2) // Garante que sempre tenha 2 casas decimais
    .replace('.', ',') // Substitui o ponto por vírgula
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona ponto como separador de milhar
  //--------------------------------

  //TOTAL--------------------------------
  const somatoriaTotal = contasFinanceiro
    .filter((conta) => {
      if (tipo === "aPagar") {
        // Se tipo for "aPagar", filtra as contas "PAGAR"
        return conta.tipo_conta?.toUpperCase() === "PAGAR";
      } else if (tipo === "aReceber") {
        // Se tipo for "aReceber", filtra as contas "RECEBER"
        return conta.tipo_conta?.toUpperCase() === "RECEBER";
      }
      return true; // Se tipo for null ou outro valor, retorna todas as contas
    })
    .reduce((acc, conta) => acc + (Number(conta.valor_final) || 0), 0); // Converte para número

  // Formatar o resultado com ponto para milhar e vírgula para o decimal
  const somatoriaFormatadaTotal = somatoriaTotal
    .toFixed(2) // Garante que sempre tenha 2 casas decimais
    .replace('.', ',') // Substitui o ponto por vírgula
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // Adiciona ponto como separador de milhar

  //--------------------------------

  const [openedFiltros, setOpenedFiltros] = useState(false);

  //botao filtros ---------------------------------
  const [dataInicial, setDataInicial] = useState<string>("");
  const [dataFinalFiltro, setDataFinalFiltro] = useState<string>("");
  const [planoContasFiltro, setPlanoContasFiltro] = useState<string>("");
  const [formaPagamentoFiltro, setFormaPagamentoFiltro] = useState<number | "">("");
  const [centroCustoFiltro, setCentroCustoFiltro] = useState("");
  const [contaBancariaFiltro, setContaBancariaFiltro] = useState("");
  const [situacaoFiltro, setSituacaoFiltro] = useState("");
  const [notaFiscalFiltro, setNotaFiscalFiltro] = useState("");
  const [valorTotalInicialFiltro, setValorTotalInicialFiltro] = useState("");
  const [valorTotalFinalFiltro, setValorTotalFinalFiltro] = useState("");
  const [descricaoFiltro, setDescricaoFiltro] = useState("");
  const [entidadeFiltro, setEntidadeFiltro] = useState("");
  const [entidadeNomeFiltro, setEntidadeNomeFiltro] = useState("");

  // Função para limpar os filtros
  const clearFilters = () => {
    setDataInicial("");
    setDataFinalFiltro("");
    setPlanoContasFiltro("");
    setFormaPagamentoFiltro("");
    setCentroCustoFiltro("");
    setContaBancariaFiltro("");
    setSituacaoFiltro("");
    setNotaFiscalFiltro("");
    setValorTotalInicialFiltro("");
    setValorTotalFinalFiltro("");
    setDescricaoFiltro("");
    setEntidadeFiltro("");
    setEntidadeNomeFiltro("");
  };

  //--------------------------------------------------


  const filteredContasFinanceiro = contasFinanceiro.filter((contaFinanceiro) => {

    if (contaFinanceiro.situacao !== "Ativo") {
      return false;
    }


    const searchFilter = Object.values(contaFinanceiro).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const vencimento = contaFinanceiro.dt_vencimento
      ? new Date(contaFinanceiro.dt_vencimento)
      : null;

    // Corrige o fuso adicionando 1 dia (se precisar)
    if (vencimento) {
      vencimento.setDate(vencimento.getDate() + 1);
      vencimento.setHours(0, 0, 0, 0);
    }


    const vencidoFilter =
      !isVencidos || (vencimento && vencimento < hoje);

    const vencemHojeFilter =
      !isVencemHoje || (vencimento && vencimento.getTime() === hoje.getTime());

    const aVencerFilter =
      !isAVencer || (vencimento && vencimento > hoje);

    const pagosFilter =
      !isPagos || String(contaFinanceiro.pagamento_quitado).toLowerCase() === "sim";

    const dataInicialFilter =
      !dataInicial ||
      (vencimento && vencimento >= new Date(dataInicial + "T00:00:00"));

    const dataFinalFilter =
      !dataFinalFiltro ||
      (vencimento && vencimento <= new Date(dataFinalFiltro + "T23:59:59"));

    const planoContasFilter =
      !planoContasFiltro ||
      (contaFinanceiro.cod_plano_conta &&
        contaFinanceiro.cod_plano_conta
          .toString()
          .includes(planoContasFiltro)) ||
      ((contaFinanceiro as any).db_plano_contas?.descricao &&
        (contaFinanceiro as any).db_plano_contas.descricao
          .toLowerCase()
          .includes(planoContasFiltro.toLowerCase()));

    const formaPagamentoFilter =
      !formaPagamentoFiltro ||
      (contaFinanceiro as any).db_pagamentos_contas?.some(
        (p: any) => p.cod_forma_pagamento === formaPagamentoFiltro
      );

    const centroCustoFilter =
      centroCustoFiltro.trim() === "" ||
      (() => {
        const termo = centroCustoFiltro.trim().toLowerCase();
        const codigoDigitado = Number(termo);

        const matchDireto = !isNaN(codigoDigitado) &&
          contaFinanceiro.cod_centro_custo === codigoDigitado;

        const matchPorNome = centrosCusto.some(
          (c) =>
            c.cod_centro_custo === contaFinanceiro.cod_centro_custo &&
            (c.nome?.toLowerCase() ?? "").includes(termo)
        );

        return matchDireto || matchPorNome;
      })();

    const contaBancariaFilter =
      contaBancariaFiltro.trim() === "" ||
      (() => {
        const termo = contaBancariaFiltro.trim().toLowerCase();
        const codigoDigitado = Number(termo);

        const matchDireto = !isNaN(codigoDigitado) &&
          contaFinanceiro.cod_conta_bancaria === codigoDigitado;

        const matchPorNome = contasBancarias.some(
          (c) =>
            c.cod_conta_bancaria === contaFinanceiro.cod_conta_bancaria &&
            (c.nome?.toLowerCase() ?? "").includes(termo)
        );

        return matchDireto || matchPorNome;
      })();

    const situacaoFilter =
      situacaoFiltro === "" || contaFinanceiro.situacao === situacaoFiltro;

    const notaFiscalFilter =
      notaFiscalFiltro === "" || contaFinanceiro.nfe?.includes(notaFiscalFiltro);

    const valorTotal = Number(contaFinanceiro.valor_final);
    const valorInicialOK = !valorTotalInicialFiltro || valorTotal >= Number(valorTotalInicialFiltro);
    const valorFinalOK = !valorTotalFinalFiltro || valorTotal <= Number(valorTotalFinalFiltro);
    const valorTotalFilter = valorInicialOK && valorFinalOK;

    const descricaoFilter = !descricaoFiltro || contaFinanceiro.descricao?.toLowerCase().includes(descricaoFiltro.toLowerCase());

    const entidadeFilter =
      entidadeFiltro === "" ||
      (entidadeFiltro === "cliente" && contaFinanceiro.cod_cliente !== null) ||
      (entidadeFiltro === "transportadora" && contaFinanceiro.cod_transportadora !== null) ||
      (entidadeFiltro === "fornecedor" && contaFinanceiro.cod_fornecedor !== null);

    const nomeEntidade = (() => {
      if (contaFinanceiro.cod_cliente) {
        const cliente = clients.find(c => c.cod_cliente === contaFinanceiro.cod_cliente);
        return cliente?.nome ?? "";
      }
      if (contaFinanceiro.cod_transportadora) {
        const transportadora = transportadoras.find(t => t.cod_transportadora === contaFinanceiro.cod_transportadora);
        return transportadora?.nome ?? "";
      }
      if (contaFinanceiro.cod_fornecedor) {
        const fornecedor = fornecedores.find(f => f.cod_fornecedor === contaFinanceiro.cod_fornecedor);
        return fornecedor?.nome ?? "";
      }
      return "";
    })();

    const entidadeNomeFilter =
      entidadeNomeFiltro.trim() === "" ||
      nomeEntidade.toLowerCase().includes(entidadeNomeFiltro.toLowerCase());

    const tipoContaFilter =
      tipoDaURL !== "aReceber" || contaFinanceiro.tipo_conta?.toUpperCase() === "RECEBER";


    return (
      searchFilter &&
      vencidoFilter &&
      vencemHojeFilter &&
      aVencerFilter &&
      pagosFilter &&
      dataInicialFilter &&
      dataFinalFilter &&
      planoContasFilter &&
      formaPagamentoFilter &&
      centroCustoFilter &&
      contaBancariaFilter &&
      situacaoFilter &&
      notaFiscalFilter &&
      valorTotalFilter &&
      descricaoFilter &&
      entidadeFilter &&
      entidadeNomeFilter &&
      tipoContaFilter
    );
  });

  //#endregion




  //#region RETURN
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
            <p>Tem certeza que deseja cancelar este conta financeira?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Conta" : "Editar Conta") : "Nova Conta"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            className={"w-[1300px]"}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Código
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    disabled
                    value={formValues.cod_conta}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] !bg-gray-300 pl-1 rounded-sm h-8 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="entidade" className="block text-blue font-medium">
                    Entidade
                  </label>
                  <select
                    id="entidade"
                    name="entidade"
                    disabled={visualizando}
                    value={entidade ?? "default"}
                    onChange={(e) => setEntidade(e.target.value)}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>
                      Selecione
                    </option>
                    <option value="cliente">Cliente</option>
                    <option value="fornecedor">Fornecedor</option>
                    <option value="transportadora">Transportadora</option>
                  </select>
                </div>


                <div
                  className="col-span-2"
                  hidden={!["fornecedor", "cliente", "transportadora"].includes(entidade)}
                >
                  <label htmlFor="entidadeSelecionada" className="block text-blue font-medium">
                    {entidade.charAt(0).toUpperCase() + entidade.slice(1)}
                  </label>
                  <select
                    id="entidadeSelecionada"
                    name="entidadeSelecionada"
                    disabled={visualizando}
                    value={
                      (entidade === "fornecedor" && !formValues.cod_fornecedor) ||
                        (entidade === "cliente" && !formValues.cod_cliente) ||
                        (entidade === "transportadora" && !formValues.cod_transportadora)
                        ? "default"
                        : entidade === "fornecedor"
                          ? formValues.cod_fornecedor
                          : entidade === "cliente"
                            ? formValues.cod_cliente
                            : entidade === "transportadora"
                              ? formValues.cod_transportadora
                              : "default"
                    }
                    onChange={(e) => {
                      const selectedValue = Number(e.target.value);

                      setFormValues((prev) => ({
                        ...prev,
                        ...(entidade === "fornecedor" && { cod_fornecedor: selectedValue }),
                        ...(entidade === "cliente" && { cod_cliente: selectedValue }),
                        ...(entidade === "transportadora" && { cod_transportadora: selectedValue }),
                      }));
                    }}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>
                      Selecione
                    </option>

                    {(
                      entidade === "fornecedor"
                        ? fornecedores
                        : entidade === "cliente"
                          ? clients
                          : entidade === "transportadora"
                            ? transportadoras
                            : []
                    )
                      .filter((item: any) => item.situacao?.toLowerCase() === "ativo")
                      .map((item: any) => {
                        const codigo =
                          entidade === "fornecedor"
                            ? item.cod_fornecedor
                            : entidade === "cliente"
                              ? item.cod_cliente
                              : entidade === "transportadora"
                                ? item.cod_transportadora
                                : "";

                        return (
                          <option key={codigo} value={codigo}>
                            {item.nome}
                          </option>
                        );
                      })}
                  </select>

                </div>

              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-3">
                  <label htmlFor="descricao" className="block text-blue font-medium">
                    Descrição
                  </label>
                  <input
                    type="text"
                    id="descricao"
                    name="descricao"
                    disabled={visualizando}
                    value={formValues.descricao}
                    onChange={handleInputChange}
                    className="w-full h-8 border border-[#D9D9D9] pl-1 rounded-sm"
                  />
                </div>
                <div>
                  <label htmlFor="dt_vencimento" className="block text-blue font-medium">
                    Vencimento
                  </label>
                  <input
                    type="date"
                    id="dt_vencimento"
                    name="dt_vencimento"
                    disabled={visualizando}
                    value={
                      formValues.dt_vencimento
                        ? new Date(formValues.dt_vencimento).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    className="w-full h-8 border border-[#D9D9D9] pl-1 rounded-sm"
                  />

                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="centrosCusto" className="block text-blue font-medium">
                    Centro de Custo
                  </label>
                  <select
                    id="centrosCusto"
                    name="centrosCusto"
                    value={selectedCentroCusto ? selectedCentroCusto.cod_centro_custo : 'default'}
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
                    <option value='default' disabled selected>
                      Selecione
                    </option>
                    {centrosCusto
                      .filter((centro) => centro.situacao?.toLowerCase() === "ativo")
                      .map((centro) => (
                        <option key={centro.cod_centro_custo} value={centro.cod_centro_custo}>
                          {centro.nome}
                        </option>
                      ))}

                  </select>
                </div>
                <div>
                  <label htmlFor="cod_conta_bancaria" className="block text-blue font-medium">
                    Conta Bancária
                  </label>
                  <select
                    id="cod_conta_bancaria"
                    name="cod_conta_bancaria"
                    disabled={visualizando}
                    value={formValues.cod_conta_bancaria ?? "default"}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cod_conta_bancaria: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>
                      Selecione
                    </option>

                    {contasBancarias
                      .filter((conta) => conta.situacao?.toLowerCase() === "ativo")
                      .map((conta) => (
                        <option key={conta.cod_conta_bancaria} value={conta.cod_conta_bancaria}>
                          {conta.nome}
                        </option>
                      ))}
                  </select>
                </div>


                <div>
                  <label htmlFor="cod_plano_conta" className="block text-blue font-medium">
                    Plano de Contas
                  </label>
                  <select
                    id="cod_plano_conta"
                    name="cod_plano_conta"
                    value={selectedPlanoContas ? selectedPlanoContas.cod_plano_conta : 'default'}
                    disabled={visualizando}
                    onChange={(e) => {
                      const selected = planoContas.find(
                        (est) => est.cod_plano_conta === Number(e.target.value)
                      );
                      setSelectedPlanoContas(selected || null);

                      if (selected) {
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          cod_plano_conta: selected.cod_plano_conta,
                        }));
                      }
                    }}
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                  >
                    <option value='default' disabled selected>
                      Selecione
                    </option>
                    {planoContas.map((plano) => (
                      <option key={plano.cod_plano_conta} value={plano.cod_plano_conta}>
                        {plano.descricao}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="pagamento_quitado" className="block text-blue font-medium">
                    Pagamento Quitado
                  </label>
                  <select
                    id="pagamento_quitado"
                    name="pagamento_quitado"
                    disabled={visualizando}
                    value={formValues.pagamento_quitado}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        pagamento_quitado: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>
                      Selecione
                    </option>
                    <option value="SIM">SIM</option>
                    <option value="NÃO">NÃO</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="dt_compensacao" className="block text-blue font-medium">
                    Data de Compensação
                  </label>
                  <input
                    type="date"
                    id="dt_compensacao"
                    name="dt_compensacao"
                    disabled={visualizando}
                    value={
                      formValues.dt_compensacao
                        ? new Date(formValues.dt_compensacao).toISOString().split("T")[0]
                        : ""
                    }
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="nfe" className="block text-blue font-medium">
                    Nota Fiscal
                  </label>
                  <input
                    type="text"
                    id="nfe"
                    name="nfe"
                    disabled={visualizando}
                    value={formValues.nfe}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="valor_bruto" className="block text-blue font-medium">
                    Valor Bruto
                  </label>
                  <input
                    id="valor_bruto"
                    name="valor_bruto"
                    type="text"
                    value={valorBrutoInput}
                    disabled={visualizando}
                    onChange={(e) => {
                      // Remove o "R$" inicial e caracteres não numéricos para facilitar a digitação
                      const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      setValorBrutoInput(`R$ ${rawValue.replace('.', ',')}`); // Adiciona "R$" novamente enquanto o usuário digita
                    }}
                    onBlur={(e) => {
                      // Remove o "R$" e formata o valor final
                      const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      const numericValue = parseFloat(rawValue) || 0;

                      // Atualiza os valores principais
                      setValorBruto(numericValue);
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        valor_bruto: numericValue,
                      }));

                      // Formata o valor final com "R$" para exibição
                      setValorBrutoInput(`R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
                    }}
                    style={{
                      textAlign: 'left',
                    }}
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                  />
                </div>

                <div>
                  <label htmlFor="juros" className="block text-blue font-medium">
                    Juros
                  </label>
                  <div className="relative">
                    <input
                      id="juros"
                      name="juros"
                      type="number"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                      disabled={visualizando}
                      value={juros}
                      onChange={handlejurosChange}
                      step="0.01"
                      min={0}
                    />
                    <select
                      id="jurosUnit"
                      name="jurosUnit"
                      value={jurosUnit === "PERCENTUAL" ? "%juros" : "R$juros"} // Exibe % ou R$
                      disabled={visualizando}
                      onChange={handlejurosUnitChange}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Impede a abertura do select padrão
                        setjurosUnit((prev) => (prev === "PERCENTUAL" ? "REAL" : "PERCENTUAL"));
                        console.log("jurosUnit", jurosUnit);
                      }}
                      className={`absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-50 px-1 `}

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
                      <option value="%juros">&nbsp;%</option>
                      <option value="R$juros">&nbsp;R$</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="desconto" className="block text-blue font-medium">
                    Desconto
                  </label>
                  <div className="relative">
                    <input
                      id="desconto"
                      name="desconto"
                      type="number"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                      disabled={visualizando}
                      value={desconto}
                      onChange={handledescontoChange}
                      step="0.01"
                      min={0}
                      max={descontoUnit === "PERCENTUAL" ? 100 : formValues.valor_bruto}
                    />
                    <select
                      id="descontoUnit"
                      name="descontoUnit"
                      value={descontoUnit === "PERCENTUAL" ? "%prod" : "R$prod"} // Exibe % ou R$
                      disabled={visualizando}
                      onChange={handledescontoUnitChange}
                      onMouseDown={(e) => {
                        e.preventDefault(); // Impede a abertura do select padrão
                        setdescontoUnit((prev) => (prev === "PERCENTUAL" ? "REAL" : "PERCENTUAL"));
                      }}
                      className={`absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-50 px-1  `}

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
                <div>
                  <label htmlFor="valor_final" className="block text-blue font-medium">
                    Valor Final
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      id="valor_final"
                      name="valor_final"
                      type="text"
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 `}

                      value={`R$ ${new Intl.NumberFormat('pt-BR', {
                        style: 'decimal',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      }).format(Number(formValues.valor_final))}`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-gray-400 p-2 rounded mt-4 bg-gray-50">
              <h3 className="text-blue font-medium text-xl mr-2">Pagamentos</h3>
              <div style={{ height: "16px" }}></div>
              <div className="grid grid-cols-6 gap-2">
                <div className={`${visualizando ? 'hidden' : ''}`}>
                  <label htmlFor="restanteAserPago" className="block text-black font-small">Restante</label>
                  <input
                    id="restanteAserPago"
                    name="restanteAserPago"
                    type="text"
                    disabled
                    className={`w-full border ${visualizando ? '!bg-gray-300 !border-gray-400' : `${restanteAserPago < 0 ? '!bg-red50' : '!bg-gray-200'} pl-1 rounded-sm h-6 ${restanteAserPago < 0 ? 'border-red' : 'border-gray-400'}`}`}
                    value={(restanteAserPago / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

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
                  <label htmlFor="valor_parcela" className="block text-blue font-medium">Valor</label>
                  <input
                    id="valor_parcela"
                    name="valor_parcela"
                    type="text" // Alterado para "text" para permitir formatação
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                    disabled={visualizando}
                    value={valor_parcelaInput}
                    onChange={(e) => {
                      // Remove o "R$" inicial e caracteres não numéricos para facilitar a digitação
                      const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      setvalor_parcelaInput(`R$ ${rawValue.replace('.', ',')}`); // Adiciona "R$" novamente enquanto o usuário digita
                    }}
                    onBlur={(e) => {
                      // Remove o "R$" e formata o valor final
                      const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                      const numericValue = parseFloat(rawValue) || 0;

                      // Atualiza os valores principais
                      setvalor_parcela(numericValue);

                      // Formata o valor final com "R$" para exibição
                      setvalor_parcelaInput(`R$ ${numericValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
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
                    value={jurosParcela}
                    disabled={visualizando}
                    onChange={(e) => setJurosParcela(Number(e.target.value))}
                    step="0.01"
                  />
                </div>


                <div className="col-span-2 flex flex-col items-start gap-1 w-full">
                  <label htmlFor="dt_parcela" className="block text-blue font-medium">
                    Data da Parcela
                  </label>
                  <div className="flex items-center w-full gap-2">
                    <input
                      id="dt_parcela"
                      name="dt_parcela"
                      type="date"
                      className={`w-full border border-gray-400 pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}
                      disabled={visualizando}
                      value={dt_parcela}
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

              {/* Pagamentos Parcelas Adicionadas */}
              {pagamentos.map((pagamento, index) => (
                <div key={`${pagamento.id}-${index}`} className="grid grid-cols-6 gap-2 items-center mt-2">
                  <div> {/* Forma */}
                    <input
                      type="text"
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                      // @ts-ignore
                      value={pagamento?.db_formas_pagamento?.nome || ''}
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
                        new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format((pagamento as any).valor_parcela / ((!visualizando || !isEditing) ? 100 : 1))
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
                        pagamento.dt_parcela
                          ? new Date(pagamento.dt_parcela).toLocaleDateString("pt-BR")
                          : ""
                      }
                    // value={
                    //   pagamento.dt_parcela
                    //     ? isEditing
                    //       ? new Date(pagamento.dt_parcela).toISOString().split("T")[0] // Formato YYYY-MM-DD para inputs do tipo date
                    //       : new Date(pagamento.dt_parcela).toLocaleDateString("pt-BR") // Formato DD/MM/YYYY para exibição
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
                    type="text"
                    className="w-25 h-6 border border-gray-400 pl-1 rounded-sm !bg-gray-200"
                    value={
                      totalPagamentos
                        ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(totalPagamentos / ((!visualizando || !isEditing) ? 100 : 1))

                        : 'R$ 0,00'
                    }


                    readOnly
                  />
                </div>
              </div>

            </div>


            <div className="flex justify-between items-center mt-12 w-full">
              <div className={`${visualizando ? "hidden" : ""} h-[50px] grid gap-3 w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
                <Button
                  label="Sair Sem Salvar"
                  className="text-white ml-9 transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50"
                  icon="pi pi-times"
                  style={{
                    backgroundColor: '#dc3545',
                    border: '1px solid #dc3545',
                    padding: '0.5rem 1.5rem',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '70%',
                  }}
                  onClick={() => closeModal()}
                />

                {!isEditing ? (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white ml-9 transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50"
                      icon="pi pi-refresh"
                      onClick={() => handleSaveReturn(false)}
                      disabled={itemCreateReturnDisabled}
                      style={{
                        backgroundColor: '#007bff',
                        border: '1px solid #007bff',
                        padding: '0.5rem 1.5rem',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '70%',
                      }}
                    />
                    <Button
                      label="Salvar e Adicionar Outro"
                      className="text-white ml-9 transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50"
                      disabled={itemCreateDisabled}
                      icon="pi pi-check"
                      onClick={() => handleSaveReturn(true)}
                      style={{
                        backgroundColor: '#28a745',
                        border: '1px solid #28a745',
                        padding: '0.5rem 1.5rem',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '70%',
                      }}
                    />
                  </>
                ) : (
                  <Button
                    label="Salvar"
                    className="text-white ml-9 transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50"
                    icon="pi pi-check"
                    onClick={() => handleSaveEdit(formValues.cod_conta)}
                    disabled={itemEditDisabled}
                    style={{
                      backgroundColor: '#28a745',
                      border: '1px solid #28a745',
                      padding: '0.5rem 1.5rem',
                      fontSize: '16px',
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
                  {tipo === "aPagar" ? "Contas a Pagar" : "Contas a Receber"}
                </h2>
              </div>
              {permissions?.insercao === permissions?.insercao && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <FilterButton onClick={() => (!openedFiltros ? setOpenedFiltros(true) : setOpenedFiltros(false))} title="Filtros" />
                    </div>
                    <div>
                      <RegisterButton onClick={() => { clearInputs(); setOpenedFiltros(false); setVisible(true); }} title="Cadastrar" />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="bg-white rounded-lg p-6 pt-2 shadow-md w-full flex flex-col mt-2"
              style={{ height: "95%" }}
            >
              {/* Aba superior com Filtros */}
              <div
                className={`
                          bg-white
                          border-4
                          border-blue300
                          transition-transform 
                          duration-300 
                          z-[9999] 
                          p-5               
                          rounded-2xl
                          ${openedFiltros ? "" : "hidden"}
                        `}
              >
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <h2 className="text-blue text-xl font-extrabold mb-3">
                      Filtros
                    </h2>

                  </div>
                  <div className="flex items-center justify-end col-span-3">
                    <Button
                      label="Limpar"
                      className="text-white w-[120px] h-[30px] !bg-pink400 border-pink800 transition-all duration-50 hover:!bg-pink600 active:scale-90 focus:outline-none"
                      icon="pi pi-eraser"
                      onClick={() => {
                        clearFilters();
                      }}
                      style={{
                        backgroundColor: "#dc3545",
                        border: "1px solid #dc3545",
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                  </div>
                </div>
                {/* Filtros */}
                <div className="grid grid-cols-5 gap-4 w-full">
                  <div>
                    <label htmlFor="dataInicial" className="block text-blue font-medium">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      id="dataInicial"
                      value={dataInicial}
                      onChange={(e) => setDataInicial(e.target.value)}
                      className="w-full border border-[#D9D9D9] bg-gray-100 pl-2 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="dataFinalFiltro" className="block text-blue font-medium">
                      Data Final
                    </label>
                    <input
                      type="date"
                      id="dataFinalFiltro"
                      value={dataFinalFiltro}
                      onChange={(e) => setDataFinalFiltro(e.target.value)}
                      className="w-full border border-[#D9D9D9] bg-gray-100 pl-2 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="planoContasFiltro" className="block text-blue font-medium">
                      Plano de Contas
                    </label>
                    <input
                      type="text"
                      id="planoContasFiltro"
                      value={planoContasFiltro}
                      onChange={(e) => setPlanoContasFiltro(e.target.value)}
                      className="w-full border border-[#D9D9D9] bg-gray-100 pl-2 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="formaPagamentoFiltro" className="block text-blue font-medium">
                      Forma de Pagamento
                    </label>
                    <select
                      id="formaPagamentoFiltro"
                      name="formaPagamentoFiltro"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={formaPagamentoFiltro}
                      onChange={(e) => setFormaPagamentoFiltro(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">Todas as formas</option>
                      {formasPagamento.map((forma) => (
                        <option key={forma.cod_forma_pagamento} value={forma.cod_forma_pagamento}>
                          {forma.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="centroCusto" className="block text-blue font-medium">
                      Centro de Custo
                    </label>
                    <input
                      type="text"
                      value={centroCustoFiltro}
                      onChange={(e) => setCentroCustoFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 w-full mt-4">
                  <div>
                    <label htmlFor="contaBancaria" className="block text-blue font-medium">
                      Conta Bancária
                    </label>
                    <input
                      type="text"
                      value={contaBancariaFiltro}
                      onChange={(e) => setContaBancariaFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="situacao" className="block text-blue font-medium">
                      Situação
                    </label>
                    <select
                      value={situacaoFiltro}
                      onChange={(e) => setSituacaoFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    >
                      <option value="">Todas as Situações</option>
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>

                  </div>
                  <div>
                    <label htmlFor="notaFiscal" className="block text-blue font-medium">
                      Nota Fiscal
                    </label>
                    <input
                      type="text"
                      value={notaFiscalFiltro}
                      onChange={(e) => setNotaFiscalFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    />

                  </div>
                  <div>
                    <label htmlFor="valorTotalInicial" className="block text-blue font-medium">
                      Valor Total Inicial
                    </label>
                    <input
                      type="number"
                      value={valorTotalInicialFiltro}
                      onChange={(e) => setValorTotalInicialFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="valorTotalFinal" className="block text-blue font-medium">
                      Valor Total Final
                    </label>
                    <input
                      type="number"
                      value={valorTotalFinalFiltro}
                      onChange={(e) => setValorTotalFinalFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full mt-4">
                  <div>
                    <label htmlFor="descricao" className="block text-blue font-medium">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={descricaoFiltro}
                      onChange={(e) => setDescricaoFiltro(e.target.value)}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label htmlFor="entidade" className="block text-blue font-medium">
                      Entidade
                    </label>
                    <select
                      id="entidade"
                      name="entidade"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={entidadeFiltro}
                      onChange={(e) => setEntidadeFiltro(e.target.value)}
                    >
                      <option value="">Todos</option>
                      <option value="cliente">Cliente</option>
                      <option value="transportadora">Transportadora</option>
                      <option value="fornecedor">Fornecedor</option>
                    </select>

                  </div>
                  <div>
                    <label htmlFor="nomeEntidade" className="block text-blue font-medium">
                      Nome da entidade
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8"
                      value={entidadeNomeFiltro}
                      onChange={(e) => setEntidadeNomeFiltro(e.target.value)}
                    />

                  </div>
                </div>
              </div>


              <div className="grid grid-cols-5 gap-3 w-full mb-4 mt-2 pt-2">
                {/* Vencidos */}
                <div
                  onClick={applyVencidosFilter}
                  className={`bg-white text-black shadow-black rounded-md hover:scale-105 shadow-md flex flex-col items-center transition-all transform duration-150 relative z-10 hover:z-50 hover:bg-gray-100 active:scale-90 active:shadow-md active:shadow-black active:duration-0 cursor-pointer 
                    ${isVencidos ? "scale-90 hover:scale-90 hover:shadow-lg hover:shadow-black shadow-xl shadow-black" : ""}`}
                >
                  <h2 className="text-sm font-semibold bg-red600 text-white w-full text-center rounded-t-md py-1">
                    Vencidos
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ {somatoriaFormatadaVencidos}</span>
                </div>



                {/* Vencem hoje */}
                <div onClick={applyVencemHojeFilter}
                  className={`bg-white text-black shadow-black rounded-md hover:scale-105 shadow-md flex flex-col items-center transition-all transform duration-150 relative z-10 hover:z-50 hover:bg-gray-100 active:scale-90 active:shadow-md active:shadow-black active:duration-0 cursor-pointer 
                    ${isVencemHoje ? "scale-90 hover:scale-90 hover:shadow-lg hover:shadow-black shadow-xl shadow-black" : ""}`}
                >
                  <h2 className="text-sm font-semibold bg-yellow700 text-white w-full text-center rounded-t-md py-1">
                    Vencem hoje
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ {somatoriaFormatadaVencemHoje}</span>
                </div>

                {/* A vencer */}
                <div onClick={applyAVencerFilter}
                  className={`bg-white text-black shadow-black rounded-md hover:scale-105 shadow-md flex flex-col items-center transition-all transform duration-150 relative z-10 hover:z-50 hover:bg-gray-100 active:scale-90 active:shadow-md active:shadow-black active:duration-0 cursor-pointer 
                    ${isAVencer ? "scale-90 hover:scale-90 hover:shadow-lg hover:shadow-black shadow-xl shadow-black" : ""}`}
                >
                  <h2 className="text-sm font-semibold bg-cyan-500 text-white w-full text-center rounded-t-md py-1">
                    A vencer
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ {somatoriaFormatadaAVencer}</span>
                </div>

                {/* Pagos */}
                <div
                  onClick={applyPagosFilter}
                  className={`bg-white text-black shadow-black rounded-md hover:scale-105 shadow-md flex flex-col items-center transition-all transform duration-150 relative z-10 hover:z-50 hover:bg-gray-100 active:scale-90 active:shadow-md active:shadow-black active:duration-0 cursor-pointer 
                    ${isPagos ? "scale-90 hover:scale-90 hover:shadow-lg hover:shadow-black shadow-xl shadow-black" : ""}`}
                >
                  <h2 className="text-sm font-semibold bg-green-600 text-white w-full text-center rounded-t-md py-1">
                    Pagos
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ {somatoriaFormatadaPagos}</span>
                </div>

                {/* Total */}
                <div className="bg-white text-black  shadow-black rounded-md shadow-md flex flex-col items-center relative">
                  <h2 className="text-sm font-semibold bg-black text-white w-full text-center rounded-t-md py-1">
                    Total
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ {somatoriaFormatadaTotal}</span>
                </div>
              </div>

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
                value={filteredContasFinanceiro.slice(first, first + rows)}
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
                  field="descricao"
                  header="Descrição"
                  style={{
                    width: "5%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={datatableColor()}
                />
                <Column
                  field="cod_cliente"
                  header="Entidade"
                  body={(rowData) => {
                    if (rowData.cod_cliente) {
                      const cliente = clients.find(c => c.cod_cliente === rowData.cod_cliente);
                      return cliente?.nome ?? 'Cliente não encontrado';
                    }

                    if (rowData.cod_transportadora) {
                      const transportadora = transportadoras.find(t => t.cod_transportadora === rowData.cod_transportadora);
                      return transportadora?.nome ?? 'Transportadora não encontrada';
                    }

                    if (rowData.cod_fornecedor) {
                      const fornecedor = fornecedores.find(f => f.cod_fornecedor === rowData.cod_fornecedor);
                      return fornecedor?.nome ?? 'Fornecedor não encontrado';
                    }

                    return '—';
                  }}
                  style={{
                    width: "5%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={datatableColor()}
                />
                <Column
                  field="valor_final"
                  header="Pagamento"
                  body={(rowData) => {
                    return `R$ ${new Intl.NumberFormat('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(rowData.valor_final)}`;
                  }}
                  style={{
                    width: "1%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={datatableColor()}
                />
                <Column
                  field="dt_vencimento"
                  header="Data"
                  style={{
                    width: "2%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={datatableColor()}
                  body={(rowData) => {
                    const date = new Date(rowData.dt_vencimento);
                    date.setDate(date.getDate() + 1); // Corrige o fuso manualmente

                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }).format(date);

                    return <span>{formattedDate}</span>;
                  }}

                />


                <Column
                  field="valor_final"
                  header="Valor"
                  style={{
                    width: "2%",
                    textAlign: "center",
                    border: "1px solid #ccc",
                  }}
                  headerStyle={datatableColor()}
                  body={(rowData) =>
                    rowData.valor_final
                      ? Number(rowData.valor_final).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "R$ 0,00"
                  }
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
                        <EditButton onClick={() => { handleEdit(rowData, false); setOpenedFiltros(false) }} />
                      </div>
                    )}
                    className="text-black"
                    style={{
                      width: "0%",
                      textAlign: "center",
                      border: "1px solid #ccc",
                    }}
                    headerStyle={datatableColor()}
                  />
                )}
                {permissions?.delecao === permissions?.delecao && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <CancelButton onClick={() => openDialog(rowData.cod_conta)} />
                      </div>
                    )}
                    className="text-black"
                    style={{
                      width: "0%",
                      textAlign: "center",
                      border: "1px solid #ccc",
                    }}
                    headerStyle={datatableColor()}
                  />
                )}
              </DataTable>

              <Dialog
                header="Detalhes da Conta Financeira selecionada:"
                visible={mostrarModal}
                style={{ width: '40vw' }}
                onHide={() => setMostrarModal(false)}
                modal
              >
                {linhaSelecionada && (
                  <div className="space-y-3">
                    <p><strong>Descrição:</strong> {linhaSelecionada.descricao}</p>

                    <p><strong>Entidade:</strong> {
                      linhaSelecionada.cod_cliente
                        ? `${clients.find(c => c.cod_cliente === linhaSelecionada.cod_cliente)?.nome ?? 'Cliente não encontrado'} (cliente)`
                        : linhaSelecionada.cod_transportadora
                          ? `${transportadoras.find(t => t.cod_transportadora === linhaSelecionada.cod_transportadora)?.nome ?? 'Transportadora não encontrada'} (transportadora)`
                          : linhaSelecionada.cod_fornecedor
                            ? `${fornecedores.find(f => f.cod_fornecedor === linhaSelecionada.cod_fornecedor)?.nome ?? 'Fornecedor não encontrado'} (fornecedor)`
                            : '—'
                    }</p>


                    <p><strong>Valor Final:</strong> R$ {Number(linhaSelecionada.valor_final).toFixed(2)}</p>
                    <p><strong>Data de Compensação:</strong> {linhaSelecionada.dt_compensacao ? new Date(linhaSelecionada.dt_compensacao).toLocaleDateString() : '—'}</p>
                  </div>
                )}
              </Dialog>

            </div>
          </div>
        </div>
      </SidebarLayout>
      <Footer />
    </>
  );
};
//#endregion

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
      <ContasFinanceiroPage />
    </Suspense>
  );
}
