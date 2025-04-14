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
import { FaBan } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";

export interface ContasBancarias {
  cod_conta_bancaria: number;
  nome?: string;
  saldo?: number;
  dt_saldo?: Date | string;
  situacao?: 'Ativo' | 'Inativo';
  dt_cadastro?: Date | string;
}

const ContasBancariasPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Financeiro");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");

  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] = useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const [contasBancarias, setContasBancarias] = useState<ContasBancarias[]>([]);
  const fetchContasBancarias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://api-birigui-teste.comviver.cloud/api/contasBancarias",
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

  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredContasBancarias = contasBancarias.filter((ContasBancarias) => {
    // Apenas ATIVO aparecem
    if (ContasBancarias.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(ContasBancarias).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const [formValues, setFormValues] = useState<ContasBancarias>({
    cod_conta_bancaria: 0,
    nome: "",
    saldo: 0,
    dt_saldo: "",
    situacao: undefined,
    dt_cadastro: undefined,
  });


  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [contasBancariasIdToDelete, setContasBancariasIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedContasBancarias, setSelectedContasBancarias] = useState<ContasBancarias | null>(null);


  const clearInputs = () => {
    setFormValues({
      cod_conta_bancaria: 0,
      nome: "",
      saldo: 0,
      dt_saldo: undefined,
      situacao: undefined,
      dt_cadastro: undefined,
    });
  };

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "saldo",
        "dt_saldo",
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

      const contaEncontrada = contasBancarias.find((item) => item.nome === formValues.nome);
      const situacaoInativo = contaEncontrada?.situacao === "Inativo";

      if (contaEncontrada && !situacaoInativo) {
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

      if (contaEncontrada && situacaoInativo) {
        await handleSaveEdit(contaEncontrada.cod_conta_bancaria);
        fetchContasBancarias();
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
        "https://api-birigui-teste.comviver.cloud/api/contasBancarias/register",
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
        fetchContasBancarias();
        toast.success("Conta bancária salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar contas bancárias.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar contas bancárias:", error);
    }
  };

  const handleEdit = (contasBancarias: ContasBancarias) => {
    console.log("Editando contas bancárias:", contasBancarias);
    setFormValues((prev) => ({
      ...prev,
      cod_conta_bancaria: contasBancarias.cod_conta_bancaria,
      nome: contasBancarias.nome,
      dt_saldo: contasBancarias.dt_saldo,
      saldo: contasBancarias.saldo,
      situacao: contasBancarias.situacao,
    }));
    setSaldoInput(contasBancarias.saldo?.toString() ?? "0.00");
    setSelectedContasBancarias(contasBancarias);
    setIsEditing(true);
    setVisible(true);
  };

  const handleSaveEdit = async (cod_conta_bancaria: any) => {
    setItemEditDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "saldo",
        "dt_saldo"
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
        `https://api-birigui-teste.comviver.cloud/api/contasBancarias/edit/${cod_conta_bancaria}`,
        { ...selectedContasBancarias, nome: formValues.nome, saldo: formValues.saldo, dt_saldo: formValues.dt_saldo },
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
        fetchContasBancarias();
        toast.success("Conta bancária salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Conta bancária.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Conta bancária:", error);
    }
  };

  const handleCancelar = async () => {
    if (contasBancariasIdToDelete === null) return;

    try {
      const response = await axios.put(
        `https://api-birigui-teste.comviver.cloud/api/contasBancarias/cancel/${contasBancariasIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchContasBancarias(); // Aqui é necessário chamar a função que irá atualizar a lista de Conta bancária
        setModalDeleteVisible(false);
        toast.success("Conta bancária cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Conta bancária.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir Conta bancária:", error);
      toast.error("Erro ao excluir Conta bancária. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const openDialog = (id: number) => {
    setContasBancariasIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setContasBancariasIdToDelete(null);
  };

  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const [saldo, setSaldo] = useState(0.0);
  const [saldoInput, setSaldoInput] = useState(saldo.toFixed(2));



  return (
    <>
      <SidebarLayout>
        <div className="flex justify-center">
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <BeatLoader
                color={color}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            </div>
          )}

          {/* MODAL DE CANCELAMENTO */}
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
            <p>Tem certeza que deseja cancelar este Conta bancária?</p>
          </Dialog>

          {/* MODAL PRINCIPAL */}
          <Dialog
            header={isEditing ? "Editar Conta bancária" : "Novo Conta bancária"}
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


              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="saldo" className="block text-blue font-medium">
                    Saldo
                  </label>
                  <input
                    type="text"
                    id="saldo"
                    name="saldo"
                    value={`R$ ${Number(formValues.saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/\D/g, ""); // Remove caracteres não numéricos
                      const numericValue = rawValue ? parseFloat(rawValue) / 100 : 0; // Divide por 100 para centavos
                      setFormValues({ ...formValues, saldo: numericValue });
                    }}
                    placeholder="R$ 0,00"
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                  <button
                    className="bg-green200 rounded-3xl mr-3 transform transition-all duration-50 hover:scale-150 hover:bg-green400 focus:outline-none"
                    onClick={() => console.log("FORMVALUES:", formValues)}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "2.5rem" }}
                      className="text-white text-center"
                    />
                  </button>
                </div>


                <div>
                  <label htmlFor="dt_saldo" className="block text-blue font-medium">
                    Data do Saldo
                  </label>
                  <input
                    type="date"
                    id="dt_saldo"
                    name="dt_saldo"
                    value={(formValues.dt_saldo ? new Date(formValues.dt_saldo).toISOString().split("T")[0] : "")}
                    onChange={(e) => {
                      const value = e.target.value;  // O valor já estará no formato correto
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        dt_saldo: value,  // Envia como string "yyyy-mm-dd"
                      }));
                    }}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>

              </div>

            </div>


            <div className="flex justify-between items-center mt-16 w-full">
              <div className={`grid gap-3 w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
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
                    onClick={() => handleSaveEdit(selectedContasBancarias ? selectedContasBancarias.cod_conta_bancaria : formValues.cod_conta_bancaria)}
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

          {/* TABELA */}
          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">
                  Contas Bancárias
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
                value={filteredContasBancarias.slice(first, first + rows)}
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
                  field="nome"
                  header="Nome"
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
                  field="saldo"
                  header="Saldo"
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
                    rowData.saldo
                      ? Number(rowData.saldo).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
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
                  field="dt_saldo"
                  header="DT Saldo"
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
                    const date = new Date(rowData.dt_saldo);
                    const formattedDate = date.toLocaleDateString('pt-BR', {
                      timeZone: 'UTC',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    });

                    return <span>{formattedDate}</span>;
                  }}

                />
                <Column
                  field="dt_cadastro"
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
                    const date = new Date(rowData.dt_cadastro);
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
                          onClick={() => openDialog(rowData.cod_conta_bancaria)}
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

export default ContasBancariasPage;
