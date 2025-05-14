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
import type { GrupoTributacao, RegraGrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { fetchGruposTributacao } from "@/services/faturamento/gruposTributacao";
import { TipoRegraTributaria } from "@/services/faturamento/gruposTributacao";
import { FaPlus } from "react-icons/fa";
import { MultiSelect } from "primereact/multiselect";
import {
  salvarRegraGrupoTributacao,
  validarCamposObrigatorios,
  verificarDuplicidade,
  fetchRegraGrupoTributacao
} from "@/services/faturamento/regraGrupoTributacaoService";


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


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_grupo_tributacao: 0,
      nome: "",
      descricao: "",
    });
  };

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
  };

  const handleSaveEdit = async (cod_grupo_tributacao: any) => {

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/gruposTributacao/edit/${cod_grupo_tributacao}`,
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
        fetchGruposTributacao(token);
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
        process.env.NEXT_PUBLIC_API_URL + "/api/gruposTributacao/register",
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
        fetchGruposTributacao(token);
        toast.success("Grupo de Tributação salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Grupo de Tributação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Grupo de Tributação:", error);
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

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/gruposTributacao/register",
        { ...formValues, regras: selectedRegraGrupoTributacao },
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
        fetchGruposTributacao(token);
        toast.success("Grupo de Tributação salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Grupo de Tributaçãos.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Grupo de Tributaçãos:", error);
    }
  };

  useEffect(() => {
    fetchGruposTributacao(token).then(setGruposTributacao);
  }, [token]);


  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (gruposTributacao: GrupoTributacao, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(gruposTributacao);
    setSelectedGrupoTributacao(gruposTributacao);
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/gruposTributacao/cancel/${gruposTributacaoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchGruposTributacao(token); // Aqui é necessário chamar a função que irá atualizar a lista de grupos de operacao
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
    try {
      const isEmptyField = validarCamposObrigatorios(formValuesRegraGrupoTributacao);

      if (isEmptyField) {
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const regraExistente = verificarDuplicidade(formValuesRegraGrupoTributacao, RegraGrupoTributacao);
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
      const response = await salvarRegraGrupoTributacao(formValuesRegraGrupoTributacao, token);

      if (response.status >= 200 && response.status < 300) {
        clearInputsRegras();
        const novasRegras = await fetchRegraGrupoTributacao(token);
        setRegraGrupoTributacao(novasRegras);
        toast.success("Regra de Grupo de Tributação salvo com sucesso!", {
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
  const filteredRegraGrupoTributacao = RegraGrupoTributacao.filter((regra) => {
    // // Apenas ATIVO aparecem
    // if (grupoTributacao.situacao !== 'Ativo') {
    //   return false;
    // }

    // Lógica de busca
    return Object.values(regra).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });



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
            header={isEditing ? (visualizando ? "Visualizando Grupo de Tributação" : "Editar Grupo de Tributação") : "Novo Grupo de Tributação"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
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
                    Regras
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedRegraGrupoTributacao}
                    onChange={(e) => setSelectedRegraGrupoTributacao(e.value)}
                    options={RegraGrupoTributacao}
                    optionLabel="observacoes"
                    filter
                    placeholder="Selecione os regras"
                    maxSelectedLabels={3}
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
                <div className="grid grid-cols-3 gap-2 pb-2 pt-2">
                  <div>
                    <label htmlFor="tipo" className="block text-blue font-medium pl-[2px]">
                      Tipo
                    </label>
                    <select
                      id="tipo"
                      name="tipo"
                      disabled={visualizando}
                      value={formValuesRegraGrupoTributacao.tipo}
                      onChange={(e) =>
                        setFormValuesRegraGrupoTributacao((prev) => ({
                          ...prev,
                          tipo: e.target.value as TipoRegraTributaria,
                        }))
                      }
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    ><option value="">Selecione</option>
                      {Object.values(TipoRegraTributaria).map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="aliquota" className="block text-blue font-medium pl-[2px]">
                      Alíquota
                    </label>
                    <input
                      id="aliquota"
                      name="aliquota"
                      type="number"
                      disabled={visualizando}
                      value={formValuesRegraGrupoTributacao.aliquota}
                      maxLength={255}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      onChange={(e) => {
                        setFormValuesRegraGrupoTributacao((prevValues) => ({
                          ...prevValues,
                          aliquota: parseFloat(e.target.value),
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label htmlFor="cst_csosn" className="block text-blue font-medium pl-[1px]">
                      Código de Situação Tributária
                    </label>
                    <input
                      id="cst_csosn"
                      name="cst_csosn"
                      disabled={visualizando}
                      value={formValuesRegraGrupoTributacao.cst_csosn}
                      maxLength={255}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
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
                    <button
                      className={`ml-2 bg-green-200 border border-green-700 rounded-2xl p-1 hover:bg-green-300 duration-50 hover:scale-125 flex items-center justify-center h-8 ${visualizando ? 'hidden' : ''
                        }`}
                      disabled={visualizando}
                      onClick={handleSaveRegraGrupoTributacao}
                    >
                      <FaPlus className="text-green-700 text-xl" />
                    </button>

                  </div>
                </div>
              </div>

              <div className="pt-2">
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
