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
import { Deposito } from "../depositos/page";

interface UnidadeDeMedida {
  cod_un: number;
  descricao: string;
  un: string;
  situacao?: string;
}

interface Establishment {
  cod_deposito: number;
  nome: string;
  cep: string;
  logradouro: string;
  numero: number;
  bairro: string;
  cidade: string;
  complemento: string;
  estado: string;
}

export interface Localizacao {
  cod_localizacao?: number;
  cod_deposito?: string;
  capacidade?: number;
  cod_un?: number;
  cod_rua?: string;
  cod_coluna?: string;
  cod_nivel?: string;
  cod_usuario?: number;
  dt_hr_criacao?: Date;
  situacao?: string;
}


const LocalizacoesPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Estoque");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");
  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] =
    useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredLocalizacoes = localizacoes.filter((localizacao) => {
    // Apenas ATIVO aparecem
    if (localizacao.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(localizacao).some((value) =>
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
  const [localizacoesIdToDelete, setLocalizacaoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedLocalizacao, setSelectedLocalizacao] = useState<Localizacao | null>(null);
  const [formValues, setFormValues] = useState<Localizacao>({
    cod_localizacao: undefined,
    cod_deposito: '',
    capacidade: undefined,
    cod_un: undefined,
    cod_rua: '',
    cod_coluna: '',
    cod_nivel: '',
    cod_usuario: undefined,
    dt_hr_criacao: undefined,
    situacao: '',
  });

  const clearInputs = () => {
    setVisualizar(false);
    setSelectedDepositos([]);
    setSelectedUnidadesDeMedida([]);
    setFormValues({
      cod_localizacao: undefined,
      cod_deposito: '',
      capacidade: undefined,
      cod_un: undefined,
      cod_rua: '',
      cod_coluna: '',
      cod_nivel: '',
      cod_usuario: undefined,
      dt_hr_criacao: undefined,
      situacao: '',
    });
  };

  const [depositos, setDepositos] = useState<Deposito[]>([]);
  const [selectedDepositos, setSelectedDepositos] = useState<Deposito[]>([]);

  const fetchDepositos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/depositos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ativos = response.data.depositos.filter(
        (deposito: any) => deposito.situacao === "Ativo"
      );

      setDepositos(ativos);
    } catch (error) {
      console.error("Erro ao carregar depositos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepositos();
  }, [token]);

  const [unidadesDeMedida, setUnidadesDeMedida] = useState<UnidadeDeMedida[]>([]);
  const [selectedUnidadesDeMedida, setSelectedUnidadesDeMedida] = useState<UnidadeDeMedida[]>([]);

  const fetchUnidadesDeMedida = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/unMedida", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ativos = response.data.units.filter(
        (un: any) => un.situacao === "Ativo"
      );

      setUnidadesDeMedida(ativos);
    } catch (error) {
      console.error("Erro ao carregar unidades de medida:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidadesDeMedida();
  }, [token]);

  const fetchLocalizacoes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/localizacoes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.localizacoes);
      setIsDataLoaded(true);
      setLocalizacoes(response.data.localizacoes);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar localizacoes:", error);
    }
  };
  useEffect(() => {
    fetchLocalizacoes();
  }, []);


  const [rowData, setRowData] = useState<Localizacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveEdit = async (cod_localizacao: any) => {
    setItemEditDisabled(true);
    setLoading(true);

    try {
      const requiredFields: { key: keyof typeof formValues; label: string }[] = [
        { key: "capacidade", label: "Capacidade" },
        { key: "cod_rua", label: "Rua" },
        { key: "cod_coluna", label: "Coluna" },
        { key: "cod_nivel", label: "Nível" },
      ];

      const missingField = requiredFields.find(({ key }) => {
        const value = formValues[key];
        return value === "" || value === null || value === undefined;
      });

      if (missingField) {
        toast.info(`O campo "${missingField.label}" deve ser preenchido!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const cod_deposito = selectedDepositos[0]?.cod_deposito;
      const cod_un = selectedUnidadesDeMedida[0]?.cod_un;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/localizacoes/edit/${cod_localizacao}`,
        { ...formValues, cod_deposito, cod_un },
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
        fetchLocalizacoes();
        toast.success("Localização salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar localizacao.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar localizacao:", error);
    }
  };

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields: { key: keyof typeof formValues; label: string }[] = [
        { key: "capacidade", label: "Capacidade" },
        { key: "cod_rua", label: "Rua" },
        { key: "cod_coluna", label: "Coluna" },
        { key: "cod_nivel", label: "Nível" },
      ];

      const missingField = requiredFields.find(({ key }) => {
        const value = formValues[key];
        return value === "" || value === null || value === undefined;
      });

      if (missingField) {
        toast.info(`O campo "${missingField.label}" deve ser preenchido!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const centroEncontrado = rowData.find(
        (item) => item.cod_localizacao === formValues.cod_localizacao
      );
      const situacaoInativo = centroEncontrado?.situacao === "Inativo";

      if (centroEncontrado && !situacaoInativo) {
        toast.info("Esse código de localização já existe no banco de dados, escolha outro!", {
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
        await handleSaveEdit(centroEncontrado.cod_localizacao);
        fetchLocalizacoes();
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

      if (!selectedDepositos || selectedDepositos.length === 0) {
        toast.info("Você deve selecionar um deposito!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const cod_deposito = selectedDepositos[0]?.cod_deposito;
      const cod_un = selectedUnidadesDeMedida[0]?.cod_un;

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/localizacoes/register",
        { ...formValues, cod_deposito, cod_un },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        clearInputs();
        fetchLocalizacoes();
        toast.success("Localização salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar localizações.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar localizações:", error);
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (localizacoes: Localizacao, visualizar: boolean) => {
    setVisualizar(visualizar);
    setFormValues(localizacoes);
    const deposito = depositos.find((e) => e.cod_deposito === localizacoes.cod_deposito);
    setSelectedDepositos(deposito ? [deposito] : []);
    setSelectedLocalizacao(localizacoes);
    setIsEditing(true);
    setVisible(true);
  };


  const openDialog = (id: number) => {
    setLocalizacaoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setLocalizacaoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (localizacoesIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/localizacoes/cancel/${localizacoesIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchLocalizacoes(); // Aqui é necessário chamar a função que irá atualizar a lista de localizacoes
        setModalDeleteVisible(false);
        toast.success("Localização cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar localizacao.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir localizacao:", error);
      toast.error("Erro ao excluir localizacao. Tente novamente.", {
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
            <p>Tem certeza que deseja cancelar este localizacao?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Localização" : "Editar Localização") : "Novo Localização"}
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

              <div className="grid gap-2 grid-cols-3">
                <div>
                  <label htmlFor="deposito" className="block text-blue font-medium">
                    Localização
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedDepositos}
                    onChange={(e) => setSelectedDepositos(e.value)}
                    options={depositos}
                    optionLabel="descricao"
                    filter
                    placeholder="Selecione o Localização"
                    maxSelectedLabels={2}
                    selectionLimit={1}
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>
                <div>
                  <label htmlFor="capacidade" className="block text-blue font-medium">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    id="capacidade"
                    name="capacidade"
                    disabled={visualizando}
                    value={formValues.capacidade}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="un" className="block text-blue font-medium">
                    Unidade de Medida
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedUnidadesDeMedida}
                    onChange={(e) => setSelectedUnidadesDeMedida(e.value)}
                    options={unidadesDeMedida}
                    optionLabel="descricao"
                    filter
                    placeholder="Selecione a un de medida"
                    maxSelectedLabels={2}
                    selectionLimit={1}
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>
              </div>

              <div className="grid gap-2 grid-cols-3">
                <div>
                  <label htmlFor="cod_rua" className="block text-blue font-medium">
                    Rua
                  </label>
                  <input
                    type="text"
                    id="cod_rua"
                    name="cod_rua"
                    disabled={visualizando}
                    value={formValues.cod_rua}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="cod_coluna" className="block text-blue font-medium">
                    Coluna
                  </label>
                  <input
                    type="text"
                    id="cod_coluna"
                    name="cod_coluna"
                    disabled={visualizando}
                    value={formValues.cod_coluna}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="cod_nivel" className="block text-blue font-medium">
                    Nível
                  </label>
                  <input
                    type="text"
                    id="cod_nivel"
                    name="cod_nivel"
                    disabled={visualizando}
                    value={formValues.cod_nivel}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
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
                      if (selectedLocalizacao) {
                        handleSaveEdit(selectedLocalizacao.cod_localizacao);
                      } else {
                        handleSaveEdit(formValues.cod_localizacao);
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
                  Localizações
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
                value={filteredLocalizacoes.slice(first, first + rows)}
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
                  header="Localização"
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
                    const deposito = depositos.find(
                      (e) => e.cod_deposito === rowData.cod_deposito
                    );
                    return deposito?.descricao || "-";
                  }}
                />
                <Column
                  field="cod_rua"
                  header="Rua"
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
                  field="cod_coluna"
                  header="Coluna"
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
                  field="cod_nivel"
                  header="Nível"
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
                  field="capacidade"
                  header="Capacidade"
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
                  field="cod_un"
                  header="UN"
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
                    const un = unidadesDeMedida.find(
                      (e) => e.cod_un === rowData.cod_un
                    );
                    return un?.descricao || "-";
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
                        <CancelButton onClick={() => { openDialog(rowData.cod_localizacao); console.log(rowData.cod_localizacao) }} />
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

export default LocalizacoesPage;
