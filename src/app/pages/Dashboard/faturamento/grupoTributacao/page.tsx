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
import type { EstadoBackend, EstadoRegraGrupo, GrupoTributacao, RegraGrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { fetchGruposTributacao } from "@/services/faturamento/gruposTributacao";
import { TipoRegraTributaria } from "@/services/faturamento/gruposTributacao";
import { FaEye, FaEyeDropper, FaEyeSlash, FaPlus, FaSearch, FaTimes } from "react-icons/fa";
import { MultiSelect } from "primereact/multiselect";
import {
  salvarRegraGrupoTributacao,
  verificarDuplicidade,
  fetchRegraGrupoTributacao
} from "@/services/faturamento/regraGrupoTributacaoService";
import AddButton from "@/app/components/Buttons/AddButton";
import { FaEyeLowVision } from "react-icons/fa6";


const GrupoTributacao: React.FC = () => {
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

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [gruposTributacaoIdToDelete, setGrupoTributacaoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  //GRUPOS TRIBUTACAO
  const [gruposTributacao, setGruposTributacao] = useState<GrupoTributacao[]>([]);
  const [selectedGrupoTributacao, setSelectedGrupoTributacao] = useState<GrupoTributacao | null>(null);
  useEffect(() => {
    const carregarGrupos = async () => {
      const grupos = await fetchGruposTributacao(token);
      setGruposTributacao(grupos);
    };

    carregarGrupos();
  }, [token]);

  const [formValues, setFormValues] = useState<GrupoTributacao>({
    cod_grupo_tributacao: 0,
    nome: "",
    descricao: "",
  });

  //REGRAS TRIBUTACAO
  const [RegraGrupoTributacaoAdicionadas, setRegraGrupoTributacaoAdicionadas] = useState<RegraGrupoTributacao[]>([]);
  const [RegraGrupoTributacao, setRegraGrupoTributacao] = useState<RegraGrupoTributacao[]>([]);
  const [selectedRegraGrupoTributacao, setSelectedRegraGrupoTributacao] = useState<RegraGrupoTributacao[]>([]);
  useEffect(() => {
    const carregarRegraGrupoTributacao = async () => {
      const regras = await fetchRegraGrupoTributacao(token);
      setRegraGrupoTributacao(regras);
    };

    carregarRegraGrupoTributacao();
  }, [token]);


  const [formValuesRegraGrupoTributacao, setFormValuesRegraGrupoTributacao] = useState<RegraGrupoTributacao>({
    cod_regra_grupo: null,
    cod_grupo_tributacao: 0,
    tipo: undefined,
    aliquota: 0,
    cst_csosn: "",
    observacoes: "",
    grupo: undefined,
    estados: [],
  });



  const clearInputsRegras = () => {
    setFormValuesRegraGrupoTributacao({
      cod_regra_grupo: null,
      cod_grupo_tributacao: 0,
      tipo: undefined,
      aliquota: 0,
      cst_csosn: "",
      observacoes: "",
      grupo: undefined,
      estados: [],
    });
    setMostrarEstados(false);
  };

  const clearInputs = () => {
    setVisualizar(false)
    setSelectedRegraGrupoTributacao([]);
    setRegraGrupoTributacaoAdicionadas([]);
    setEstadosSelecionados([]);
    setFormValues({
      cod_grupo_tributacao: 0,
      nome: "",
      descricao: "",
    });
    clearInputsRegras();
  };

  const handleSaveEdit = async (cod_grupo_tributacao: any) => {
    try {
      const requiredFields = ["nome", "descricao"];

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

      if (!Array.isArray(RegraGrupoTributacaoAdicionadas) || RegraGrupoTributacaoAdicionadas.length === 0) {
        setItemEditDisabled(false);
        setLoading(false);
        toast.info("Adicione pelo menos uma regra!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const payload = {
        ...formValues,
        regras: RegraGrupoTributacaoAdicionadas.map((regra) => ({
          ...regra,
          estados: regra.estados.map((estado) => ({
            uf: siglasEstados[estado.cod_estado], // Só o campo uf com a sigla
          })),
        })),
      };


      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gruposTributacao/edit/${cod_grupo_tributacao}`,
        payload,
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
        const novosGrupos = await fetchGruposTributacao(token);
        setGruposTributacao(novosGrupos);
        toast.success("Grupo de Tributação salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Grupo de Tributação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Grupo de Tributação:", error);
      toast.error("Erro inesperado ao salvar.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };



  const [rowData, setRowData] = useState<GrupoTributacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
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
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const GRUPOEncontrado = rowData.find((item) => item.nome === formValues.nome);
      const situacaoInativo = GRUPOEncontrado?.situacao === "Inativo";

      if (GRUPOEncontrado && !situacaoInativo) {
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

      if (GRUPOEncontrado && situacaoInativo) {
        await handleSaveEdit(GRUPOEncontrado.cod_grupo_tributacao);
        const novosGrupos = await fetchGruposTributacao(token);
        setGruposTributacao(novosGrupos);
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


      const payload = {
        ...formValues,
        regras: RegraGrupoTributacaoAdicionadas.map((regra) => ({
          ...regra,
          estados: regra.estados.map((estado) => siglasEstados[estado.cod_estado])
        }))
      };

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/gruposTributacao/register",
        payload,
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
        const novosGrupos = await fetchGruposTributacao(token);
        setGruposTributacao(novosGrupos);
        toast.success("Grupo de Tributação salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Grupo de Tributação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Grupo de Tributação:", error);
    }
  };

  useEffect(() => {
    fetchGruposTributacao(token).then(setGruposTributacao);
  }, [token]);


  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (gruposTributacao: GrupoTributacao, visualizar: boolean) => {
    console.log("Grupo de Tributação:", gruposTributacao);
    setVisualizar(visualizar);


    setFormValues(gruposTributacao);

    setSelectedGrupoTributacao(gruposTributacao);

    // Mapeia as regras para o formato usado no estado
    const regrasFormatadas = (gruposTributacao.regras || []).map((regra, index) => ({
      id: Date.now() + index,
      tipo: regra.tipo,
      aliquota: regra.aliquota,
      cst_csosn: regra.cst_csosn,
      observacoes: regra.observacoes || "",
      estados: regra.tipo === "Estados"
        ? (regra.estados ?? []).map((estado: any) => {
          // Busca o código do estado pela sigla 'uf' vinda do backend
          const codEstado = Object.entries(siglasEstados)
            .find(([cod, sigla]) => sigla === estado.uf)?.[0];

          if (!codEstado) {
            // Se não encontrou a sigla, retorna fallback com nome = uf
            return { cod_estado: 0, nome: estado.uf };
          }

          // Agora busca o estado completo pelo código encontrado (convertido para número)
          const estadoCompleto = estadosBrasil.find(e => e.cod_estado === Number(codEstado));

          return estadoCompleto || { cod_estado: Number(codEstado), nome: estado.uf };
        })
        : [],
    }));


    setSelectedRegraGrupoTributacao(regrasFormatadas);
    setRegraGrupoTributacaoAdicionadas(regrasFormatadas);

    setIsEditing(true);
    setVisible(true);
  };


  const openDialog = (id: number) => {
    setGrupoTributacaoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setGrupoTributacaoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (gruposTributacaoIdToDelete === null) return;

    try {
      const response = await axios.put(
        process.env.NEXT_PUBLIC_API_URL + `/api/gruposTributacao/cancel/${gruposTributacaoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const novosGrupos = await fetchGruposTributacao(token);
        setGruposTributacao(novosGrupos);
        setModalDeleteVisible(false);
        toast.success("Grupo de Tributação cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Grupo de Tributação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir Grupo de Tributação:", error);
      toast.error("Erro ao excluir Grupo de Tributação. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (gruposTributacaoIdToDelete === null) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/gruposTributacao/${gruposTributacaoIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Grupo de Tributação removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchGruposTributacao(token);
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir Grupo de Tributação:", error);
      toast.error("Erro ao excluir Grupo de Tributação. Tente novamente.", {
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

  const filteredGruposTributacao = gruposTributacao.filter((grupoTributacao) => {
    // Apenas ATIVO aparecem
    if (grupoTributacao.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(grupoTributacao).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });


  const handleSaveRegraGrupoTributacao = async () => {

    setFormValuesRegraGrupoTributacao((prevValues) => ({
      ...prevValues,
      estados: estadosSelecionados.map((estado, index) => ({
        cod_estado: estado.cod_estado,
        nome: estado.nome,
      })),
    }));

    try {
      const requiredFields = mostrarEstados
        ? ["tipo", "observacoes", "estados"]
        : ["tipo", "aliquota", "cst_csosn", "observacoes"];

      // Se aliquota ou cst_csosn forem vazios, seta como "0"
      const valoresCorrigidos = {
        ...formValuesRegraGrupoTributacao,
        aliquota: formValuesRegraGrupoTributacao.aliquota || 0,
        cst_csosn: formValuesRegraGrupoTributacao.cst_csosn || "0",
      };

      // Valida os campos obrigatórios restantes
      const camposInvalidos = requiredFields.some((field) => {
        const value = valoresCorrigidos[field as keyof typeof valoresCorrigidos];
        return value === "" || value === null || value === undefined;
      });

      if (camposInvalidos) {
        toast.warn("Preencha os campos 'tipo' e 'observações'!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const regraExistente = verificarDuplicidade(
        { ...valoresCorrigidos, cod_regra_grupo: valoresCorrigidos.cod_regra_grupo ?? null },
        RegraGrupoTributacao
      );
      const situacaoInativo = regraExistente?.situacao === "Inativo";

      if (regraExistente && !situacaoInativo) {
        toast.info("Esse nome já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        return;
      }

      if (regraExistente && situacaoInativo) {
        await handleSaveEdit(regraExistente.cod_grupo_tributacao);
        const novasRegras = await fetchRegraGrupoTributacao(token);
        setRegraGrupoTributacao(novasRegras);
        toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
          position: "top-right",
          autoClose: 10000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>,
        });
        return;
      }

      if (!token) {
        throw new Error("Token is required");
      }

      const response = await salvarRegraGrupoTributacao(
        { ...valoresCorrigidos, cod_regra_grupo: valoresCorrigidos.cod_regra_grupo ?? null },
        token);

      if (response.status >= 200 && response.status < 300) {
        clearInputsRegras();
        const novasRegras = await fetchRegraGrupoTributacao(token);
        setRegraGrupoTributacao(novasRegras);
        toast.success("Regra de Grupo de Tributação salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao salvar Regra de Grupo de Tributação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar Regra de Grupo de Tributação:", error);
    }
  };


  const [firstRegras, setFirstRegras] = useState(0);
  const [rowsRegras, setRowsRegras] = useState(10);
  const filteredRegraGrupoTributacao = selectedRegraGrupoTributacao.filter(
    (regra) =>
      Object.values(regra).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
  );



  const [mostrarEstados, setMostrarEstados] = useState(false);
  const [estadosSelecionados, setEstadosSelecionados] = useState<EstadoRegraGrupo[]>([]);
  const estadosBrasil = [
    { cod_estado: 12, nome: 'Acre' },
    { cod_estado: 27, nome: 'Alagoas' },
    { cod_estado: 16, nome: 'Amapá' },
    { cod_estado: 13, nome: 'Amazonas' },
    { cod_estado: 29, nome: 'Bahia' },
    { cod_estado: 23, nome: 'Ceará' },
    { cod_estado: 53, nome: 'Distrito Federal' },
    { cod_estado: 32, nome: 'Espírito Santo' },
    { cod_estado: 52, nome: 'Goiás' },
    { cod_estado: 21, nome: 'Maranhão' },
    { cod_estado: 51, nome: 'Mato Grosso' },
    { cod_estado: 50, nome: 'Mato Grosso do Sul' },
    { cod_estado: 31, nome: 'Minas Gerais' },
    { cod_estado: 15, nome: 'Pará' },
    { cod_estado: 25, nome: 'Paraíba' },
    { cod_estado: 41, nome: 'Paraná' },
    { cod_estado: 26, nome: 'Pernambuco' },
    { cod_estado: 22, nome: 'Piauí' },
    { cod_estado: 33, nome: 'Rio de Janeiro' },
    { cod_estado: 24, nome: 'Rio Grande do Norte' },
    { cod_estado: 43, nome: 'Rio Grande do Sul' },
    { cod_estado: 11, nome: 'Rondônia' },
    { cod_estado: 14, nome: 'Roraima' },
    { cod_estado: 42, nome: 'Santa Catarina' },
    { cod_estado: 35, nome: 'São Paulo' },
    { cod_estado: 28, nome: 'Sergipe' },
    { cod_estado: 17, nome: 'Tocantins' },
  ];
  const siglasEstados: { [key: number]: string } = {
    12: "AC", 27: "AL", 16: "AP", 13: "AM", 29: "BA", 23: "CE",
    53: "DF", 32: "ES", 52: "GO", 21: "MA", 51: "MT", 50: "MS",
    31: "MG", 15: "PA", 25: "PB", 41: "PR", 26: "PE", 22: "PI",
    33: "RJ", 24: "RN", 43: "RS", 11: "RO", 14: "RR", 42: "SC",
    35: "SP", 28: "SE", 17: "TO",
  };



  const handleRemoveLinhaRegra = (id: number) => {
    setRegraGrupoTributacaoAdicionadas((prev) => prev.filter((regra) => regra.id !== id));
  };
  const handleAdicionarLinhaRegra = () => {
    if (!formValuesRegraGrupoTributacao.tipo) {
      toast.info("Após selecionar um tipo, insira as demais informações.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const novaRegra: RegraGrupoTributacao = {
      id: Date.now(),  // Usando Date.now() para criar um identificador único numérico      
      tipo: formValuesRegraGrupoTributacao.tipo ?? undefined,
      aliquota: formValuesRegraGrupoTributacao.aliquota ?? 0,
      cst_csosn: formValuesRegraGrupoTributacao.cst_csosn ?? "0",
      observacoes: formValuesRegraGrupoTributacao.observacoes ?? "",
      estados: estadosSelecionados ?? [],
    };

    // Adiciona o novo produto à lista de selecionados
    setRegraGrupoTributacaoAdicionadas((prev) => [...prev, novaRegra]);

    // Reseta os estados para permitir a seleção de um novo produto    
    clearInputsRegras();
  };


  const [visualizarRegras, setVisualizarRegras] = useState(false);

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
            <p>Tem certeza que deseja cancelar este Grupo de Tributação?</p>
          </Dialog>

          <Dialog
            header={
              isEditing
                ? visualizando
                  ? "Visualizando Grupo de Tributação"
                  : "Editar Grupo de Tributação"
                : "Novo Grupo de Tributação"
            }
            visible={visible}
            style={{ width: '60%', height: '100vh', overflow: 'hidden' }}
            contentStyle={{ height: 'calc(100% - 60px)', overflowY: 'auto' }} // ajusta rolagem interna
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={closeModal}
          >

            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    disabled={visualizando}
                    value={formValues.nome}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div className="">
                  <label htmlFor="regras" className="block text-blue font-medium">
                    Usar regras já cadastradas
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedRegraGrupoTributacao}
                    onChange={(e) => {
                      const novasSelecionadas = e.value;

                      setSelectedRegraGrupoTributacao(novasSelecionadas);

                      setRegraGrupoTributacaoAdicionadas((prev) => {
                        const novas = novasSelecionadas
                          .filter((nova: any) =>
                            !prev.some((existente) => existente.cod_regra_grupo === nova.cod_regra_grupo)
                          )
                          .map((regra: any) => {
                            if (regra.tipo === "Estados" && regra.estados) {
                              const estadosFormatados = regra.estados.map((estado: any) => {
                                const codEstado = parseInt(
                                  Object.keys(siglasEstados).find((cod) => siglasEstados[parseInt(cod)] === estado.uf) || "0"
                                );
                                const estadoCompleto = estadosBrasil.find((e) => e.cod_estado === codEstado);
                                return estadoCompleto || { cod_estado: 0, nome: estado.uf };
                              });

                              return {
                                ...regra,
                                estados: estadosFormatados,
                              };
                            }

                            return regra;
                          });

                        return [...prev, ...novas];
                      });
                    }}

                    options={RegraGrupoTributacao}
                    optionLabel="observacoes"
                    filter
                    placeholder="Selecione os regras"
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label htmlFor="descricao" className="block text-blue font-medium">
                    Descrição
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    disabled={visualizando}
                    value={formValues.descricao}
                    maxLength={255}
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-24 `}
                    onChange={(e) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        descricao: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <h2 className="text-blue font-bold text-lg mb-2">Adicionar Regras de Grupo de Tributação</h2>
                <div className="grid grid-cols-3 gap-2 pb-2 pt-2">
                  <div>
                    <label htmlFor="tipo" className="block text-blue font-medium pl-[2px]">
                      Tipo
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      disabled={visualizando}
                      value={formValuesRegraGrupoTributacao.tipo ?? "default"}
                      onChange={(e) => {
                        const tipo = e.target.value as TipoRegraTributaria;
                        setFormValuesRegraGrupoTributacao((prev) => ({
                          ...prev,
                          tipo,
                        }));
                        setMostrarEstados(tipo === 'Estados');
                      }}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    >
                      <option value="default">Selecione</option>
                      {Object.values(TipoRegraTributaria).map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {mostrarEstados && (
                    <div className="col-span-2">
                      <label htmlFor="estados" className="ml-1 block text-blue font-medium">
                        Estados
                      </label>
                      <MultiSelect
                        id="estados"
                        disabled={visualizando}
                        value={estadosSelecionados}
                        onChange={(e) => setEstadosSelecionados(e.value)}
                        options={estadosBrasil}
                        optionLabel="nome"
                        filter
                        placeholder="Selecione os estados"
                        maxSelectedLabels={3}
                        className="w-full border text-black h-[35px] flex items-center"
                      />
                    </div>
                  )}


                  <div className={`${mostrarEstados ? 'hidden' : ''}`}>
                    <label htmlFor="aliquota" className="block text-blue font-medium pl-[2px]">
                      Alíquota
                    </label>
                    <input
                      id="aliquota"
                      name="aliquota"
                      type="number"
                      disabled={visualizando || mostrarEstados}
                      value={formValuesRegraGrupoTributacao.aliquota}
                      maxLength={255}
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8`}
                      onChange={(e) => {
                        setFormValuesRegraGrupoTributacao((prevValues) => ({
                          ...prevValues,
                          aliquota: parseFloat(e.target.value),
                        }));
                      }}
                    />
                  </div>

                  <div className={`${mostrarEstados ? 'hidden' : ''}`}>
                    <label htmlFor="cst_csosn" className="block text-blue font-medium pl-[1px]">
                      Código de Situação Tributária
                    </label>
                    <input
                      id="cst_csosn"
                      name="cst_csosn"
                      disabled={visualizando || mostrarEstados}
                      value={formValuesRegraGrupoTributacao.cst_csosn}
                      maxLength={255}
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8`}
                      onChange={(e) => {
                        setFormValuesRegraGrupoTributacao((prevValues) => ({
                          ...prevValues,
                          cst_csosn: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="justify-between pb-2">
                  <label htmlFor="observacoes" className="block text-blue font-medium pl-[1px]">
                    Observações
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      id="observacoes"
                      name="observacoes"
                      disabled={visualizando}
                      value={formValuesRegraGrupoTributacao.observacoes}
                      maxLength={255}
                      className="flex-1 border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      onChange={(e) => {
                        setFormValuesRegraGrupoTributacao((prevValues) => ({
                          ...prevValues,
                          observacoes: e.target.value,
                        }));
                      }}
                    />
                    <div className={`${visualizando ? 'hidden' : ''} ml-1 mr-1 scale-90 origin-right`}>
                      <AddButton onClick={handleAdicionarLinhaRegra} />
                    </div>
                  </div>
                </div>
                <br></br>
                {/* Linhas adicionadas de regras */}
                {RegraGrupoTributacaoAdicionadas.map((regra, index) => (
                  <div key={`${regra.cod_regra_grupo}-${index}`} className="grid grid-cols-4 gap-2">
                    <div className="">
                      <label className="block text-gray-500 font-medium pl-[1px]">
                        Tipo
                      </label>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={regra.tipo}
                        disabled
                      />
                    </div>

                    <div className={`${(regra.tipo === 'Estados') ? 'col-span-2' : ''}`}>
                      <label className="block text-gray-500 font-medium pl-[1px]">
                        {(regra.tipo === 'Estados') ? 'Estados' : 'Alíquota'}
                      </label>
                      <input
                        type="text"
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200`}
                        value={`${(regra.tipo === 'Estados') ? regra.estados.map((estado) => estado.nome).join(', ') : regra.aliquota}`}
                        disabled
                      />
                    </div>
                    {regra.tipo !== 'Estados' && (
                      <div>
                        <label className="block text-gray-500 font-medium pl-[1px]">
                          CST
                        </label>
                        <input
                          type="text"
                          className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                          value={regra.cst_csosn}
                          disabled
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-gray-500 font-medium pl-[1px]">
                        Observações
                      </label>
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                          value={regra.observacoes}
                          disabled
                        />
                        <button
                          className={`bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center hover:scale-150 duration-50 transition-all ${regra.id ?? 'hidden'} ${visualizando ? 'hidden' : ''}`}
                          onClick={() => handleRemoveLinhaRegra(regra.id ?? 0)}
                        >
                          <FaTimes className="text-red text-2xl" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="ml-1 mt-1 mb-1">
                <button
                  onClick={() => setVisualizarRegras(prev => !prev)}
                  className={`
                    mr-4 
                    flex 
                    items-center                     
                    bg-blue 
                    p-2 
                    rounded-full
                    transition-all 
                    duration-300 
                    w-10 
                    h-10
                    justify-center
                    active:bg-blue175
                    active:shadow-lg
                    active:shadow-blue175
                    overflow-hidden 
                    ${visualizando ? 'hidden' : ''}
                  `}
                  title={visualizarRegras ? "Ocultar Regras cadastradas" : "Visualizar Regras cadastradas"}
                >
                  {visualizarRegras ? (
                    <FaEye className="text-white text-2xl" />
                  ) : (
                    <FaEyeSlash className="text-white text-2xl" />
                  )}
                </button>

              </div>

              {visualizarRegras && (<div>
                <h2 className="block text-blue font-medium pl-[1px]">Regras cadastradas</h2>
                <DataTable
                  value={filteredRegraGrupoTributacao.slice(firstRegras, firstRegras + rowsRegras)}
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
                    field="tipo"
                    header="Tipo"
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
                    field="aliquota"
                    header="Alíquota"
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
                      const val = rowData.aliquota;
                      return val === 0 || val === "0" || val === null || val === undefined ? '-' : val;
                    }}
                  />

                  <Column
                    field="cst_csosn"
                    header="CST"
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
                      const val = rowData.cst_csosn;
                      return val === 0 || val === "0" || val === null || val === undefined || val === '' ? '-' : val;
                    }}
                  />

                  <Column
                    field="estados"
                    header="Estados"
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
                      // rowData.estados é um array de objetos, pegar só o uf
                      if (Array.isArray(rowData.estados)) {
                        return rowData.estados.map((estado: any) => estado.nome).join(', ');
                      }
                      return '';
                    }}
                  />
                  <Column
                    field="observacoes"
                    header="Observações"
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

                </DataTable>
              </div>
              )}
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
                    onClick={() => handleSaveEdit(formValues.cod_grupo_tributacao)}
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
                  Grupo de Tributação
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
                value={filteredGruposTributacao.slice(first, first + rows)}
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
                  field="usuario_cadastro"
                  header="Usuário Cadastro"
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
                  field="dt_cadastro"
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
                    if (rowData.dt_cadastro) {
                      const date = new Date(rowData.dt_cadastro);

                      if (!isNaN(date.getTime())) {
                        // Formatar apenas DD/MM/AAAA no fuso horário de Brasília
                        const formattedDate = date.toLocaleDateString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
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
                        <CancelButton onClick={() => openDialog(rowData.cod_grupo_tributacao)} />
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

export default GrupoTributacao;
