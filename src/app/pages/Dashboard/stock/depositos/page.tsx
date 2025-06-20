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
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";
import CancelButton from "@/app/components/Buttons/CancelButton";
import { MultiSelect } from "primereact/multiselect";
import { User } from "../../controls/users/page";

interface Establishment {
  cod_estabelecimento: number;
  nome: string;
  cep: string;
  logradouro: string;
  numero: number;
  bairro: string;
  cidade: string;
  complemento: string;
  estado: string;
}

export interface Deposito {
  id: string;
  cod_deposito: string;
  descricao?: string;
  cod_estabel?: number;
  tipo: string; // padrão: "Manutenção"
  cod_usuario?: number;
  dt_hr_criacao?: Date;
  situacao: string;
}


const DepositosPage: React.FC = () => {
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
  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredDepositos = depositos.filter((deposito) => {
    // Apenas ATIVO aparecem
    if (deposito.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(deposito).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });


  const [users, setUsers] = useState<User[]>([]);
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const responseUsers = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/users/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRowData(responseUsers.data.users);
      setIsDataLoaded(true);

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

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [depositosIdToDelete, setDepositoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedDeposito, setSelectedDeposito] = useState<Deposito | null>(null);
  const [formValues, setFormValues] = useState<Deposito>({
    id: "",
    cod_deposito: "",
    descricao: "",
    cod_estabel: undefined,
    tipo: "",
    cod_usuario: undefined,
    dt_hr_criacao: undefined,
    situacao: "",
  });

  const clearInputs = () => {
    setVisualizar(false);
    setSelectedEstablishments([]);
    setFormValues({
      id: "",
      cod_deposito: "",
      descricao: "",
      cod_estabel: undefined,
      tipo: "",
      cod_usuario: undefined,
      dt_hr_criacao: undefined,
      situacao: "",
    });
  };

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);

  const fetchEstabilishments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ativos = response.data.estabelecimentos.filter(
        (estab: any) => estab.situacao === "Ativo"
      );

      setEstablishments(ativos);
    } catch (error) {
      console.error("Erro ao carregar estabelecimentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEstabilishments();
  }, [token]);

  const fetchDepositos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/depositos",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.depositos);
      setIsDataLoaded(true);
      setDepositos(response.data.depositos);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar depositos:", error);
    }
  };
  useEffect(() => {
    fetchDepositos();
  }, []);


  const [rowData, setRowData] = useState<Deposito[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveEdit = async (cod_deposito: any) => {
    setItemEditDisabled(true);
    setLoading(true);

    try {
      const requiredFields = [
        "descricao",
        "cod_deposito",
        "tipo",
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

      const cod_estabel = selectedEstablishments[0]?.cod_estabelecimento;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/depositos/edit/${cod_deposito}`,
        { ...formValues, cod_deposito_old, cod_estabel },
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
        fetchDepositos();
        toast.success("Depósito salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar deposito.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar deposito:", error);
    }
  };

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = ["descricao", "cod_deposito", "tipo"];
      const isEmptyField = requiredFields.some((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (isEmptyField) {
        toast.info("Todos os campos devem ser preenchidos!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const centroEncontrado = rowData.find(
        (item) => item.cod_deposito === formValues.cod_deposito
      );
      const situacaoInativo = centroEncontrado?.situacao === "Inativo";

      if (centroEncontrado && !situacaoInativo) {
        toast.info("Esse código de depósito já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      if (centroEncontrado && situacaoInativo) {
        await handleSaveEdit(centroEncontrado.cod_deposito);
        fetchDepositos();
        clearInputs();
        setVisible(fecharTela);
        toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
          position: "top-right",
          autoClose: 10000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      if (!selectedEstablishments || selectedEstablishments.length === 0) {
        toast.info("Você deve selecionar um estabelecimento!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const cod_estabel = selectedEstablishments[0]?.cod_estabelecimento;

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/depositos/register",
        { ...formValues, cod_estabel },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        clearInputs();
        fetchDepositos();
        toast.success("Depósito salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar depósitos.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar depósitos:", error);
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };

  const [visualizando, setVisualizar] = useState<boolean>(false);
  const [cod_deposito_old, SETcod_deposito_old] = useState<string>("");

  const handleEdit = (depositos: Deposito, visualizar: boolean) => {
    setVisualizar(visualizar);
    SETcod_deposito_old(depositos.cod_deposito);
    setFormValues(depositos);
    const estabelecimento = establishments.find((e) => e.cod_estabelecimento === depositos.cod_estabel);
    setSelectedEstablishments(estabelecimento ? [estabelecimento] : []);
    setSelectedDeposito(depositos);
    setIsEditing(true);
    setVisible(true);
  };


  const openDialog = (id: number) => {
    setDepositoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setDepositoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (depositosIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/depositos/cancel/${depositosIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchDepositos(); // Aqui é necessário chamar a função que irá atualizar a lista de depositos
        setModalDeleteVisible(false);
        toast.success("Depósito cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar deposito.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir deposito:", error);
      toast.error("Erro ao excluir deposito. Tente novamente.", {
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
            <p>Tem certeza que deseja cancelar este deposito?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Depósito" : "Editar Depósito") : "Novo Depósito"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            style={{ width: "900px", maxWidth: "900px" }}
            onHide={() => closeModal()}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid gap-2">
                <div>
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
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="cod_deposito" className="block text-blue font-medium">
                    Código
                  </label>
                  <input
                    type="text"
                    id="cod_deposito"
                    name="cod_deposito"
                    disabled={visualizando}
                    value={formValues.cod_deposito}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="estabelecimento" className="block text-blue font-medium">
                    Estabelecimento
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedEstablishments}
                    onChange={(e) => setSelectedEstablishments(e.value)}
                    options={establishments}
                    optionLabel="nome"
                    filter
                    placeholder="Selecione o estabelecimento"
                    maxSelectedLabels={2}
                    selectionLimit={1}
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>
                <div>
                  <label htmlFor="tipo" className="block text-blue font-medium">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    disabled={visualizando}
                    value={formValues.tipo || "default"}
                    defaultValue={"default"}
                    onChange={(e) =>
                      setFormValues({ ...formValues, tipo: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>Selecione</option>
                    <option value="Manutenção">Manutenção</option>
                  </select>
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
                    onClick={() => {
                      if (selectedDeposito) {
                        handleSaveEdit(selectedDeposito.id);
                      }
                    }}
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
                  Depósitos
                </h2>
              </div>
              {permissions?.insercao == true && (
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
                value={filteredDepositos.slice(first, first + rows)}
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
                  field="cod_deposito"
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
                  field="descricao"
                  header="Descrição"
                  style={{
                    width: "3%",
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
                  field="cod_estabel"
                  header="Estabelecimento"
                  style={{
                    width: "3%",
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
                    const estabel = establishments.find(
                      (e) => e.cod_estabelecimento === rowData.cod_estabel
                    );
                    return estabel?.nome || "-";
                  }}
                />

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
                  field="cod_usuario"
                  header="Criador"
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
                    const usuario = users.find((u) => u.cod_usuario === rowData.cod_usuario);
                    return usuario?.nome || "-";
                  }}
                />

                <Column
                  field="dt_hr_criacao"
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
                    const date = new Date(rowData.dt_hr_criacao);
                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
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
                {permissions?.edicao == true && (
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
                {permissions?.delecao == true && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <CancelButton onClick={() => openDialog(rowData.id)} />
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

export default DepositosPage;
