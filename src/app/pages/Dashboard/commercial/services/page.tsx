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
import { FaTrash, FaBan } from "react-icons/fa";
import { MdOutlineModeEditOutline, MdVisibility } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";

interface Servico {
  cod_servico: number;
  nome: string;
  descricao?: string;
  valor_venda?: string;
  valor_custo?: string;
  comissao?: string;
  dtCadastro?: string;
  situacao?: string;
}

const ServicosPage: React.FC = () => {
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
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredServicos = servicos.filter((servico) => {
    // Apenas ATIVO aparecem
    if (servico.situacao !== 'Ativo') {
      return false;
    }

    // Função de busca
    return Object.values(servico).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [servicoIdToDelete, setServicoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedServico, setSelectedServico] = useState<Servico | null>(null);
  const [formValues, setFormValues] = useState<Servico>({
    cod_servico: 0,
    nome: "",
    descricao: "",
    valor_custo: "",
    valor_venda: "",
    comissao: "",
  });

  const clearInputs = () => {
    setFormValues({
      cod_servico: 0,
      nome: "",
      descricao: "",
      valor_custo: "",
      valor_venda: "",
      comissao: "",
    });
  };

  const handleSaveEdit = async (cod_servico: any) => {
    if (!cod_servico) {
      toast.error("Serviço não selecionado ou inválido. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setItemEditDisabled(true);
    setLoading(true);
    setIsEditing(false);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/servicos/edit/${cod_servico}`,
        { ...formValues, situacao: "Ativo" },
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
        fetchServicos();
        toast.success("Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar serviço:", error);
    }
  };


  const [rowData, setRowData] = useState<Servico[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);



  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = ["nome", "descricao", "valor_custo", "valor_venda", "comissao"];

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

      const servicoEncontrado = rowData.find((item) => item.nome === formValues.nome);
      const situacaoInativo = servicoEncontrado?.situacao === "Inativo";

      console.log("Servico encontrado:", servicoEncontrado);

      if (servicoEncontrado && !situacaoInativo) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Esse nome já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        return;
      }

      if (servicoEncontrado && situacaoInativo) {
        await handleSaveEdit(servicoEncontrado.cod_servico); // Passa o serviço diretamente
        fetchServicos();
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

      // Se o nome não existir, cadastra o serviço normalmente
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/servicos/register",
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
        setVisible(fecharTela);
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



  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (servico: Servico, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(servico);
    setSelectedServico(servico);
    setIsEditing(true);
    setVisible(true);
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/servicos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.servicos);
      setIsDataLoaded(true);
      setServicos(response.data.servicos);

      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar serviços:", error);
    }
  };

  const openDialog = (id: number) => {
    setServicoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setServicoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (servicoIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/servicos/cancel/${servicoIdToDelete}`,
        {}, // Enviar um corpo vazio, caso necessário para o endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchServicos(); // Atualizar a lista de serviços
        setModalDeleteVisible(false);
        toast.success("Serviço cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar serviço:", error);
      toast.error("Erro ao cancelar serviço. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (servicoIdToDelete === null) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/servicos/${servicoIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Serviço removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchServicos();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir serviço:", error);
      toast.error("Erro ao excluir serviço. Tente novamente.", {
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
                  onClick={handleCancelar}
                  className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all"
                />
              </div>
            }
          >
            <p>Tem certeza que deseja excluir este serviço?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Serviço" : "Editar Serviço") : "Novo Serviço"}
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
              <div className="grid grid-cols-1 gap-2">
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

              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="valor_custo" className="block text-blue font-medium">
                    Valor de Custo
                  </label>
                  <input
                    id="valor_custo"
                    name="valor_custo"
                    type="text"
                    disabled={visualizando}
                    value={`R$ ${Number(formValues.valor_custo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValues({ ...formValues, valor_custo: numericValue.toString() });
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
                    disabled={visualizando}
                    value={`R$ ${Number(formValues.valor_venda || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValues({ ...formValues, valor_venda: numericValue.toString() });
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
                    disabled={visualizando}
                    value={`${Number(formValues.comissao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para representar decimais
                      setFormValues({ ...formValues, comissao: numericValue.toString() });
                    }}
                    placeholder="0,00 %"
                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
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
                    value={formValues.descricao || ""}
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-24 `}

                    onChange={(e) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        descricao: e.target.value, // Atualiza o campo descricao
                      }));
                    }}
                  />
                </div>
              </div>
            </div>


            <div className="flex justify-between items-center mt-16 w-full">
              <div className={`${visualizando ? "hidden" : ""} grid gap-3 w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
                <Button
                  label="Sair Sem Salvar"
                  className="text-white"
                  icon="pi pi-times"
                  style={{
                    height: "50px",
                    backgroundColor: "#dc3545",
                    border: "1px solid #dc3545",
                    padding: "0.5rem 1.5rem",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                  onClick={() => closeModal()}
                />

                {!isEditing ? (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={() => { handleSaveReturn(false) }}
                      disabled={itemCreateReturnDisabled}
                      style={{
                        height: "50px",
                        backgroundColor: "#007bff",
                        border: "1px solid #007bff",
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    />
                    <Button
                      label="Salvar e Adicionar Outro"
                      className="text-white"
                      icon="pi pi-check"
                      onClick={() => { handleSaveReturn(true) }}
                      disabled={itemCreateDisabled}
                      style={{
                        height: "50px",
                        backgroundColor: "#28a745",
                        border: "1px solid #28a745",
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                      }}
                    />
                  </>
                ) : (
                  <Button
                    label="Salvar"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={() => { handleSaveEdit(formValues.cod_servico) }}
                    disabled={itemEditDisabled}
                    style={{
                      height: "50px",
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
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
                  Serviços
                </h2>
              </div>
              {permissions?.insercao === "SIM" && (
                <div>
                  <button
                    className="bg-green200 rounded-3xl mr-3 transform transition-all duration-50 hover:scale-150 hover:bg-green400 focus:outline-none"
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
                value={filteredServicos.slice(first, first + rows)}
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
                  field="cod_servico"
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
                  field="valor_custo"
                  header="Valor Custo"
                  body={(rowData) => {
                    return `R$ ${new Intl.NumberFormat('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(rowData.valor_custo)}`;
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
                  field="valor_venda"
                  header="Valor Venda"
                  body={(rowData) => {
                    return `R$ ${new Intl.NumberFormat('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(rowData.valor_venda)}`;
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
                  field="comissao"
                  header="Comissão"
                  body={(rowData) => {
                    return `R$ ${new Intl.NumberFormat('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(rowData.comissao)}`;
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
                  field="dtCadastro"
                  header="DT Cadastro"
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
                    const date = new Date(rowData.dtCadastro);
                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(date);

                    return <span>{formattedDate}</span>;
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
                        <CancelButton onClick={() => openDialog(rowData.cod_servico)} />
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

export default ServicosPage;
