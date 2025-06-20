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
import { Item } from "../itens/page";
import { Dropdown } from "primereact/dropdown";
import { Localizacao } from "../localizacoes/page";

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

export interface LocalItem {
  cod_local_item: number;
  cod_item?: number;
  cod_un?: number;
  cod_localizacao?: number;
  cod_usuario?: number;
  dt_hr_criacao?: Date;
  situacao?: string;
}


const LocaisItensPage: React.FC = () => {
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
  const [locaisItens, setLocaisItens] = useState<LocalItem[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredLocaisItens = locaisItens.filter((localItem) => {
    // Apenas ATIVO aparecem
    if (localItem.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(localItem).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const [selectedLocalizacao, setSelectedLocalizacao] = useState<Localizacao | null>(null);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);

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

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [itens, setItens] = useState<Item[]>([]);

  const fetchItens = async () => {
    setLoading(true)
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/itens", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRowData(response.data.items);
      setIsDataLoaded(true);
      setItens(response.data.items);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Erro ao carregar itens:", error);
    }
  };

  useEffect(() => {
    fetchItens();
  }, []);

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
  const [locaisItensIdToDelete, setLocalItemIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedLocalItem, setSelectedLocalItem] = useState<LocalItem | null>(null);
  const [formValues, setFormValues] = useState<LocalItem>({
    cod_local_item: 0,
    cod_item: undefined,
    cod_un: undefined,
    cod_localizacao: undefined,
    cod_usuario: undefined,
    dt_hr_criacao: undefined,
    situacao: '',
  });

  const clearInputs = () => {
    setVisualizar(false);
    setSelectedDepositos([]);
    setSelectedUnidadesDeMedida([]);
    setFormValues({
      cod_local_item: 0,
      cod_item: undefined,
      cod_un: undefined,
      cod_localizacao: undefined,
      cod_usuario: undefined,
      dt_hr_criacao: undefined,
      situacao: '',
    });
    setCodColuna(null);
    setCodRua(null);
    setCodNivel(null);
    setSelectedLocalizacao(null);
    setSelectedItem(null);
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

  useEffect(() => {
    if (selectedItem) {
      const unidade = unidadesDeMedida.find(
        (un) => typeof selectedItem.cod_un === "number" && un.cod_un === selectedItem.cod_un
      );
      setSelectedUnidadesDeMedida(unidade ? [unidade] : []);
    } else {
      setSelectedUnidadesDeMedida([]);
    }
  }, [selectedItem, unidadesDeMedida]);

  const fetchLocaisItens = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/locaisItens",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.locaisItens);
      setIsDataLoaded(true);
      setLocaisItens(response.data.locaisItens);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar locaisItens:", error);
    }
  };
  useEffect(() => {
    fetchLocaisItens();
  }, []);


  const [rowData, setRowData] = useState<LocalItem[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveEdit = async (cod_local_item: any, fecharTela: boolean = true) => {
    setItemEditDisabled(true);
    setLoading(true);

    try {
      if (!selectedLocalizacao) {
        toast.info("Você deve selecionar uma localização!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemEditDisabled(false);
        setLoading(false);
        return;
      }

      const cod_item = selectedItem?.cod_item;
      const cod_localizacao = selectedLocalizacao?.cod_localizacao;
      const cod_un = selectedUnidadesDeMedida[0]?.cod_un;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locaisItens/edit/${cod_local_item}`,
        { ...formValues, cod_item, cod_localizacao, cod_un },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        clearInputs();
        fetchLocaisItens();
        toast.success("Local do Item atualizado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setTimeout(() => {
          setIsEditing(false);
        }, 100);
      } else {
        toast.error("Erro ao atualizar local do item.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar local do item:", error);
      toast.error("Erro ao atualizar local do item.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setItemEditDisabled(false);
      setLoading(false);
    }
  };


  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {

      const localItemEncontrado = rowData.find(
        (item) => item.cod_local_item === formValues.cod_local_item
      );
      const situacaoInativo = localItemEncontrado?.situacao === "Inativo";

      if (localItemEncontrado && !situacaoInativo) {
        toast.info("Esse código de local do item já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      if (localItemEncontrado && situacaoInativo) {
        await handleSaveEdit(localItemEncontrado.cod_local_item);
        fetchLocaisItens();
        clearInputs();
        setVisible(fecharTela);
        toast.info("Esse local de item já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
          position: "top-right",
          autoClose: 10000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      if (!selectedLocalizacao) {
        toast.info("Você deve selecionar uma localização!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const cod_item = selectedItem?.cod_item;
      const cod_localizacao = selectedLocalizacao?.cod_localizacao;
      const cod_un = selectedUnidadesDeMedida[0]?.cod_un;

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/locaisItens/register",
        { ...formValues, cod_item, cod_localizacao, cod_un },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        clearInputs();
        fetchLocaisItens();
        toast.success("Local do Item salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar local do item.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar local do item:", error);
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (locaisItens: LocalItem, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(locaisItens);
    setSelectedLocalItem(locaisItens);
    setSelectedItem(itens.find(item => Number(item.cod_item) === Number(locaisItens.cod_item)) || null);
    setSelectedLocalizacao(localizacoes.find(localizacao => Number(localizacao.cod_localizacao) === Number(locaisItens.cod_localizacao)) || null);

    setIsEditing(true);
    setVisible(true);
  };


  const openDialog = (id: number) => {
    setLocalItemIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setLocalItemIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (locaisItensIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/locaisItens/cancel/${locaisItensIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchLocaisItens();
        setModalDeleteVisible(false);
        toast.success("Local do Item cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Local do Item.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir Local do Item:", error);
      toast.error("Erro ao excluir Local do Item. Tente novamente.", {
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

  const [codRua, setCodRua] = useState<string | null>(null);
  const [codColuna, setCodColuna] = useState<string | null>(null);
  const [codNivel, setCodNivel] = useState<string | null>(null);
  useEffect(() => {
    if (selectedLocalizacao) {
      setCodRua(selectedLocalizacao.cod_rua || '');
      setCodColuna(selectedLocalizacao.cod_coluna || '');
      setCodNivel(selectedLocalizacao.cod_nivel || '');
    } else {
      setCodRua('');
      setCodColuna('');
      setCodNivel('');
    }
  }, [selectedLocalizacao]);

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
            <p>Tem certeza que deseja cancelar este local de item?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Local do Item" : "Editar Local do Item") : "Novo Local do Item"}
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
                  <label htmlFor="item" className="block text-blue font-medium">
                    Item
                  </label>
                  <Dropdown
                    disabled={visualizando}
                    value={selectedItem}
                    onChange={(e) => { setSelectedItem(e.value); }}
                    options={itens}
                    filter
                    optionLabel="descricao"
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>
                <div>
                  <label htmlFor="un" className="block text-blue font-medium">
                    Unidade de Medida
                  </label>
                  <input
                    type="text"
                    disabled
                    readOnly
                    value={selectedUnidadesDeMedida && selectedUnidadesDeMedida[0]?.descricao ? selectedUnidadesDeMedida[0].descricao : ''}
                    className="w-full border text-black h-[35px] flex items-center px-2 cursor-not-allowed !bg-gray-200"
                  />

                </div>
                <div>
                  <label htmlFor="localizacao" className="block text-blue font-medium">
                    Localização
                  </label>
                  <Dropdown
                    disabled={visualizando}
                    value={selectedLocalizacao}
                    onChange={(e) => setSelectedLocalizacao(e.value)}
                    options={localizacoes}
                    optionLabel="cod_localizacao"
                    filter
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
                    disabled
                    readOnly
                    value={codRua ?? undefined}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200 cursor-not-allowed"
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
                    disabled
                    readOnly
                    value={codColuna ?? undefined}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200 cursor-not-allowed"
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
                    disabled
                    readOnly
                    value={codNivel ?? undefined}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200 cursor-not-allowed"
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
                      if (selectedLocalItem) {
                        handleSaveEdit(selectedLocalItem.cod_local_item);
                      } else {
                        handleSaveEdit(formValues.cod_local_item);
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
                  Locais dos Itens
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
                value={filteredLocaisItens.slice(first, first + rows)}
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
                  field=""
                  header="Cód. Item"
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
                    const item = itens.find(
                      (e) => e.cod_item === rowData.cod_item
                    );
                    return item?.cod_item || "-";
                  }}
                />
                <Column
                  field=""
                  header="Desccrição Item"
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
                    const item = itens.find(
                      (e) => e.cod_item === rowData.cod_item
                    );
                    return item?.descricao || "-";
                  }}
                />
                <Column
                  field="cod_deposito"
                  header="Depósito"
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
                  field="estabelecimento"
                  header="Estabelecimento"
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
                  body={(rowData) => rowData.db_localizacoes?.cod_rua || "-"}
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
                  body={(rowData) => rowData.db_localizacoes?.cod_coluna || "-"}
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
                  body={(rowData) => rowData.db_localizacoes?.cod_nivel || "-"}
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
                        <CancelButton onClick={() => { openDialog(rowData.cod_local_item); console.log(rowData.cod_local_item) }} />
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

export default LocaisItensPage;
