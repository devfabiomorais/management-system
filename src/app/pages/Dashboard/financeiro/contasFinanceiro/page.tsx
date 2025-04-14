"use client";
import React, { ChangeEvent, useEffect, useState, Suspense } from "react";
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
import { MdOutlineModeEditOutline } from "react-icons/md";
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
  nome?: string;
  situacao?: string;
  pagamentos?: [];
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

interface CentroCusto {
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

  const [contasFinanceiro, setContasFinanceiro] = useState<ContaFinanceiro[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const fetchContasFinanceiro = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api-birigui-teste.comviver.cloud/api/contasFinanceiro",
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
      console.error("Erro ao carregar centro de custos:", error);
    }
  };
  const filteredContasFinanceiro = contasFinanceiro.filter((contaFinanceiro) => {
    // Apenas ATIVO aparecem
    // if (contaFinanceiro.situacao !== 'Ativo') {
    //   return false;
    // }

    // Lógica de busca
    return Object.values(contaFinanceiro).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

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
        "https://api-birigui-teste.comviver.cloud/api/planoContas",
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
    }
  }, [token]);
  //#endregion

  //#region centro custo
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
        "https://api-birigui-teste.comviver.cloud/api/centrosCusto",
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
  useEffect(() => {
    fetchCentrosCusto();
  }, []);
  //#endregion

  //#region PAGAMENTOS
  const [visualizando, setVisualizar] = useState<boolean>(false);
  const [valorTotalTotal, setValorTotalTotal] = useState(0);
  const [restanteAserPago, setRestanteAserPago] = useState(valorTotalTotal);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [totalPagamentos, setTotalPagamentos] = useState(0);
  const [selectedFormaPagamento, setSelectedFormaPagamento] = useState<Pagamento | null>(null);
  const [formasPagamento, setFormasPagamento] = useState<Formas[]>([]);
  const [valorParcela, setvalorParcela] = useState<number>(0);
  const [valorParcelaInput, setValorParcelaInput] = useState(`R$ ${valorParcela.toFixed(2).replace('.', ',')}`); // Estado inicial com "R$"
  const [juros, setJuros] = useState<number>(0);
  const [data_parcela, setDataParcela] = useState<string>("");
  const [quantidadeParcelas, setQuantidadeParcelas] = useState<number>(1); // Novo estado para quantidade de parcelas
  const [parcela, setParcela] = useState<number>(0);


  const fetchFormasPagamento = async () => {
    try {
      const response = await axios.get(
        "https://api-birigui-teste.comviver.cloud/api/formasPagamento",
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
    setValorParcelaInput("");
  };

  const handleAdicionarMultiplasParcelas = () => {
    if (!selectedFormaPagamento || !data_parcela || quantidadeParcelas < 1) return;


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
  //#endregion

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [contasFinanceiroIdToDelete, setContaFinanceiroIdToDelete] = useState<number | null>(null);
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
    tipo_juros: "",
    tipo_desconto: "",
    desconto: 0,
    juros: 0,
    nome: "",
    situacao: "",
    pagamentos: [],
  });

  const clearInputs = () => {
    setFormValues({
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
      tipo_juros: "",
      tipo_desconto: "",
      desconto: 0,
      juros: 0,
      nome: "",
      situacao: "",
      pagamentos: [],
    });
  };

  const handleSaveEdit = async (cod_centro_custo: any) => {
    setItemEditDisabled(true);
    setLoading(true);
    setIsEditing(false);
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
        setItemEditDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.put(
        `https://api-birigui-teste.comviver.cloud/api/contasFinanceiro/edit/${cod_centro_custo}`,
        { ...formValues },
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
        fetchContasFinanceiro();
        toast.success("Centro de custo salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar centro de custo.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar centro de custo:", error);
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
        "https://api-birigui-teste.comviver.cloud/api/contasFinanceiro/register",
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
        toast.success("Centro de custo salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar centro de custo.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar centro de custo:", error);
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
        "cod_centro_custo",
        "cod_conta_bancaria",
        "cod_plano_conta",
        "pagamento_quitado",
        "dt_compensacao",
        "nfe",
        "nfse",
        "valor_bruto",
        "valor_final",
        "tipo_juros",
        "tipo_desconto",
        "desconto",
        "juros",
        "nome",
        "situacao",
        "pagamentos",
      ];

      // Dicionário de rótulos amigáveis
      const fieldLabels: { [key: string]: string } = {
        cod_conta: "Código da Conta",
        cod_fornecedor: "Fornecedor",
        cod_transportadora: "Transportadora",
        cod_cliente: "Cliente",
        descricao: "Descrição",
        dt_vencimento: "Data de Vencimento",
        cod_centro_custo: "Centro de Custo",
        cod_conta_bancaria: "Conta Bancária",
        cod_plano_conta: "Plano de Conta",
        pagamento_quitado: "Pagamento Quitado",
        dt_compensacao: "Data de Compensação",
        nfe: "NFe",
        nfse: "NFSe",
        valor_bruto: "Valor Bruto",
        valor_final: "Valor Final",
        tipo_juros: "Tipo de Juros",
        tipo_desconto: "Tipo de Desconto",
        desconto: "Desconto",
        juros: "Juros",
        nome: "Nome",
        situacao: "Situação",
        pagamentos: "Pagamentos",
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


      const centroEncontrado = rowData.find((item) => item.nome === formValues.nome);
      const situacaoInativo = centroEncontrado?.situacao === "Inativo";

      if (centroEncontrado && !situacaoInativo) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Esse nome já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>, // Usa o emoji de alerta
        });
        return;
      }

      if (centroEncontrado && situacaoInativo) {
        await handleSaveEdit(centroEncontrado.cod_centro_custo);
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

      const response = await axios.post(
        "https://api-birigui-teste.comviver.cloud/api/contasFinanceiro/register",
        { formValues, tipo_conta: tipoConta },
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
        toast.success("Centro de custo salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar centro de custos.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar centro de custos:", error);
    }
  };

  const handleEdit = (contasFinanceiro: ContaFinanceiro) => {
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
    if (contasFinanceiroIdToDelete === null) return;

    try {
      const response = await axios.put(
        `https://api-birigui-teste.comviver.cloud/api/contasFinanceiro/cancel/${contasFinanceiroIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchContasFinanceiro(); // Aqui é necessário chamar a função que irá atualizar a lista de centros de custo
        setModalDeleteVisible(false);
        toast.success("Centro de custo cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar centro de custo.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir centro de custo:", error);
      toast.error("Erro ao excluir centro de custo. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (contasFinanceiroIdToDelete === null) return;

    try {
      await axios.delete(
        `https://api-birigui-teste.comviver.cloud/api/contasFinanceiro/${contasFinanceiroIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Centro de custo removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchContasFinanceiro();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir centro de custo:", error);
      toast.error("Erro ao excluir centro de custo. Tente novamente.", {
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

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Obtém o "name" e o valor do input
    const numericValue = value.replace(/[^0-9]/g, ''); // Permite apenas números
    setFormValues({
      ...formValues,
      [name]: numericValue, // Atualiza dinamicamente o campo com base no "name"
    });
  };


  const handleNumericKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  const handleAlphabeticInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Obtém o "name" e o valor do input
    const alphabeticValue = value.replace(/[\d]/g, ''); // Remove apenas números
    setFormValues({
      ...formValues,
      [name]: alphabeticValue, // Atualiza dinamicamente o campo com base no "name"
    });
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
            <p>Tem certeza que deseja cancelar este centro de custo?</p>
          </Dialog>

          <Dialog
            header={isEditing ? "Editar Conta" : "Nova Conta"}
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
            <div className="p-fluid grid gap-2 mt-2">
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
                    value={""}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] !bg-gray-300 pl-1 rounded-sm h-8 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Entidade
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={""}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div className="col-span-2">
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Fornececedor
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formValues.cod_fornecedor}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
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
                <div>
                  <label htmlFor="cod_conta_bancaria" className="block text-blue font-medium">
                    Conta Bancária
                  </label>
                  <input
                    type="text"
                    id="cod_conta_bancaria"
                    name="cod_conta_bancaria"
                    value={formValues.cod_conta_bancaria}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="cod_plano_conta" className="block text-blue font-medium">
                    Plano de Contas
                  </label>
                  <select
                    id="centrosCusto"
                    name="centrosCusto"
                    value={selectedPlanoContas ? selectedPlanoContas.cod_plano_conta : ''}
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
                    <option value='' disabled selected>
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
                  <input
                    type="text"
                    id="pagamento_quitado"
                    name="pagamento_quitado"
                    value={formValues.pagamento_quitado}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="dt_compensacao" className="block text-blue font-medium">
                    Data de Compensação
                  </label>
                  <input
                    type="date"
                    id="dt_compensacao"
                    name="dt_compensacao"
                    value={formValues.dt_compensacao ? formValues.dt_compensacao.toISOString().split('T')[0] : ""}
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
                    type="text"
                    id="valor_bruto"
                    name="valor_bruto"
                    value={formValues.valor_bruto}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="juros" className="block text-blue font-medium">
                    Juros
                  </label>
                  <input
                    type="text"
                    id="juros"
                    name="juros"
                    value={formValues.juros}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div >
                  <label htmlFor="desconto" className="block text-blue font-medium">
                    Desconto
                  </label>
                  <input
                    type="text"
                    id="desconto"
                    name="desconto"
                    value={formValues.desconto}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div >
                  <label htmlFor="valor_final" className="block text-blue font-medium">
                    Valor Final
                  </label>
                  <input
                    type="text"
                    id="valor_final"
                    name="valor_final"
                    value={formValues.valor_final}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-400 p-2 rounded mt-4 bg-gray-50">
              <h3 className="text-blue font-medium text-xl mr-2">Pagamentos</h3>
              <div style={{ height: "16px" }}></div>
              <div className="grid grid-cols-6 gap-2">
                <div>
                  <label htmlFor="restanteAserPago" className="block text-black font-small">Restante</label>
                  <input
                    id="restanteAserPago"
                    name="restanteAserPago"
                    type="text"
                    disabled
                    className={`w-full border ${visualizando ? '!bg-gray-300 !border-gray-400' : `${restanteAserPago < 0 ? '!bg-red50' : '!bg-gray-200'} pl-1 rounded-sm h-6 ${restanteAserPago < 0 ? 'border-red' : 'border-gray-400'}`}`}
                    value={!isEditing
                      ? restanteAserPago.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                      : (Number(valorTotalTotal)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
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

              {/* Pagamentos Parcelas Adicionados */}
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


            <div className="flex justify-between items-center mt-12 w-full">
              <div className={`h-[50px] grid gap-3 w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
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
                    onClick={() => handleSaveEdit(formValues.cod_centro_custo)}
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

          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">
                  {tipo === "aPagar" ? "Contas a Pagar" : "Contas a Receber"}
                </h2>
              </div>
              {permissions?.insercao === "SIM" && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <button
                        onClick={() => setVisible(true)}
                        className="relative group focus:outline-none transform transition-all duration-50 hover:scale-150 hover:bg-green400"
                      >
                        <div className="w-[40px] h-[40px] bg-blue300 rounded-full flex items-center justify-center">
                          <div className="w-[35px] h-[35px] bg-white rounded-full flex items-center justify-center">
                            <div className="w-[30px] h-[30px] bg-blue300 rounded-full flex items-center justify-center">
                              <GiFunnel className="text-white text-xl" />
                            </div>
                          </div>
                        </div>

                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Filtros
                        </span>
                      </button>
                    </div>
                    <div>
                      <button
                        className="group bg-green200 rounded-3xl mr-3 transform transition-all duration-50 hover:scale-150 hover:bg-green400 focus:outline-none"
                        onClick={() => setVisible(true)}
                      >
                        <IoAddCircleOutline
                          style={{ fontSize: "2.5rem" }}
                          className="text-white text-center" />

                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-sm text-white bg-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          Cadastro
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div
              className="bg-white rounded-lg p-8 pt-1 shadow-md w-full flex flex-col"
              style={{ height: "95%" }}
            >
              <div className="grid grid-cols-5 gap-3 w-full mb-4 mt-2">
                {/* Vencidos */}
                <div className="bg-white text-black rounded-md shadow flex flex-col items-center transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50">
                  <h2 className="text-sm font-semibold bg-red600 text-white w-full text-center rounded-t-md py-1">
                    Vencidos
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ 1.250,00</span>
                </div>

                {/* Vencem hoje */}
                <div className="bg-white text-black  rounded-md shadow flex flex-col items-center transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50">
                  <h2 className="text-sm font-semibold bg-yellow500 text-white w-full text-center rounded-t-md py-1">
                    Vencem hoje
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ 500,00</span>
                </div>

                {/* A vencer */}
                <div className="bg-white text-black  rounded-md shadow flex flex-col items-center transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50">
                  <h2 className="text-sm font-semibold bg-cyan-500 text-white w-full text-center rounded-t-md py-1">
                    A vencer
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ 2.000,00</span>
                </div>

                {/* Pagos */}
                <div className="bg-white text-black  rounded-md shadow flex flex-col items-center transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50">
                  <h2 className="text-sm font-semibold bg-green-600 text-white w-full text-center rounded-t-md py-1">
                    Pagos
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ 3.200,00</span>
                </div>

                {/* Total */}
                <div className="bg-white text-black  rounded-md shadow flex flex-col items-center transition-all transform duration-150 hover:scale-125 relative z-10 hover:z-50">
                  <h2 className="text-sm font-semibold bg-black text-white w-full text-center rounded-t-md py-1">
                    Total
                  </h2>
                  <span className="text-lg font-bold mt-2">R$ 6.950,00</span>
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
                className="w-full"
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
                  header="Entidade"
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
                />
                <Column
                  field="valor_final"
                  header="Pagamento"
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
                  field="dt_compensacao"
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
                    const date = new Date(rowData.dt_compensacao);
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
                    rowData.valor_final
                      ? Number(rowData.valor_final).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                      : "R$ 0,00"
                  }
                />
                {permissions?.edicao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(rowData)}
                          className="hover:scale-125 hover:bg-yellow700 p-2 bg-yellow transform transition-all duration-50  rounded-2xl"
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
                          onClick={() => openDialog(rowData.cod_centro_custo)}
                          className="bg-red hover:bg-red600 hover:scale-125 p-2 transform transition-all duration-50  rounded-2xl"
                        >
                          <FaBan style={{ fontSize: "1.2rem" }} className="text-white text-center" />
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
