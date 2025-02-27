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

interface CentroCusto {
  cod_centro_custo: number;
  nome: string;
  descricao?: string;
}

const CentrosCustoPage: React.FC = () => {
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
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredCentrosCusto = centrosCusto.filter((centroCusto) =>
    Object.values(centroCusto).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [centrosCustoIdToDelete, setCentroCustoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCentroCusto, setSelectedCentroCusto] = useState<CentroCusto | null>(null);
  const [formValues, setFormValues] = useState<CentroCusto>({
    cod_centro_custo: 0,
    nome: "",
    descricao: "",
  });

  const clearInputs = () => {
    setFormValues({
      cod_centro_custo: 0,
      nome: "",
      descricao: "",
    });
  };

  const handleSaveEdit = async () => {
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
        `http://localhost:9009/api/centrosCusto/edit/${selectedCentroCusto?.cod_centro_custo}`,
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
        fetchCentrosCusto();
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
        "http://localhost:9009/api/centrosCusto/register",
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
        fetchCentrosCusto();
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

  const [rowData, setRowData] = useState<CentroCusto[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async () => {
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

      // Verificar se o "nome" já existe no storedRowData
      const nomeExists = rowData.some((item) => item.nome === formValues.nome);

      if (nomeExists) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Esse nome já existe, escolha outro", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>, // Usa o emoji de alerta
        });

        return;
      }

      const response = await axios.post(
        "http://localhost:9009/api/centrosCusto/register",
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
        fetchCentrosCusto();
        toast.success("Centro de custo salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
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

  const handleEdit = (centrosCusto: CentroCusto) => {
    setFormValues(centrosCusto);
    setSelectedCentroCusto(centrosCusto);
    setIsEditing(true);
    setVisible(true);
  };

  useEffect(() => {
    fetchCentrosCusto();
  }, []);

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
      setRowData(response.data.centrosCusto);
      setIsDataLoaded(true);
      setCentrosCusto(response.data.centrosCusto);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar centro de custos:", error);
    }
  };

  const openDialog = (id: number) => {
    setCentroCustoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setCentroCustoIdToDelete(null);
  };

  const handleDelete = async () => {
    if (centrosCustoIdToDelete === null) return;

    try {
      await axios.delete(
        `http://localhost:9009/api/centrosCusto/${centrosCustoIdToDelete}`,
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
      fetchCentrosCusto();
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
            <p>Tem certeza que deseja excluir este centro de custo?</p>
          </Dialog>

          <Dialog
            header={isEditing ? "Editar Centro de Custo" : "Novo Centro de Custo"}
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
            <div className="p-fluid grid gap-2 mt-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formValues.nome}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label htmlFor="descricao" className="block text-blue font-medium">
                    Descrição
                  </label>
                  <input
                    type="text"
                    id="descricao"
                    name="descricao"
                    value={formValues.descricao}
                    onChange={handleInputChange}
                    className="w-full h-20 border border-[#D9D9D9] pl-1 rounded-sm"
                  />
                </div>
              </div>
            </div>


            <div className="flex justify-between items-center  mt-16">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  label="Sair Sem Salvar"
                  className="text-white"
                  icon="pi pi-times"
                  style={{
                    backgroundColor: "#dc3545",
                    border: "1px solid #dc3545",
                    padding: "0.5rem 1.5rem",
                    fontSize: "14px",
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
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
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
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
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
                  Centro de Custo
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
                value={filteredCentrosCusto.slice(first, first + rows)}
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
                  field="cod_centro_custo"
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
                    width: "0.5%",
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
                    width: "0.5%",
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
                          onClick={() => openDialog(rowData.cod_centro_custo)}
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

export default CentrosCustoPage;
