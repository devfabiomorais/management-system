"use client";
import React, { ChangeEvent, Suspense, useEffect, useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import { Dialog } from "primereact/dialog";
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
import { User } from "../../controls/users/page";
import { Deposito } from "../depositos/page";
import { Item } from "../itens/page";
import { Dropdown } from "primereact/dropdown";
import { Localizacao } from "../localizacoes/page";
import { useParams, useSearchParams } from 'next/navigation';
import { LocalItem } from "../locaisItens/page";

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

export interface Movimentacao {
  cod_movimentacao: number;
  cod_item: number;
  cod_un: number;
  cod_local_item: number;
  lote: string;
  quantidade: string;
  observacoes: string;
  tipo: string;
  cod_usuario: number;
  dt_hr_criacao: Date;
  situacao: string;
}


const MovimentacoesPage: React.FC = () => {
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
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const searchParams = useSearchParams();
  const tipoDaURL = searchParams.get("tipo");
  const [tipo, setTipo] = useState<"Entrada" | "Saida" | null>(null);
  useEffect(() => {
    if (tipoDaURL === "Entrada" || tipoDaURL === "Saida") {
      setTipo(tipoDaURL);
    }
  }, [tipoDaURL]);

  const filteredMovimentacoes = movimentacoes.filter((movimentacao) => {
    // Apenas ativos
    if (movimentacao.situacao !== 'Ativo') {
      return false;
    }

    // Apenas do tipo que veio na URL
    if (!tipoDaURL || movimentacao.tipo?.toLowerCase() !== tipoDaURL.toLowerCase()) {
      return false;
    }

    // Lógica de busca (search)
    return Object.values(movimentacao).some((value) =>
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

  const [locaisItens, setLocaisItens] = useState<LocalItem[]>([]);
  const [selectedLocalItem, setSelectedLocalItem] = useState<LocalItem | null>(null);

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
  const [movimentacaoIdToDelete, setMovimentacaoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<Movimentacao | null>(null);
  const [formValues, setFormValues] = useState<Movimentacao>({
    cod_movimentacao: 0,
    cod_item: 0,
    cod_un: 0,
    cod_local_item: 0,
    lote: "",
    quantidade: "",
    observacoes: "",
    tipo: "",
    cod_usuario: 0,
    dt_hr_criacao: new Date(),
    situacao: "",
  });

  const clearInputs = () => {
    setVisualizar(false);
    setSelectedDepositos([]);
    setSelectedUnidadesDeMedida([]);
    setFormValues({
      cod_movimentacao: 0,
      cod_item: 0,
      cod_un: 0,
      cod_local_item: 0,
      lote: "",
      quantidade: "",
      observacoes: "",
      tipo: "",
      cod_usuario: 0,
      dt_hr_criacao: new Date(),
      situacao: "",
    });
    setCodColuna(null);
    setCodRua(null);
    setCodNivel(null);
    setSelectedLocalizacao(null);
    setSelectedLocalItem(null);
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

  const fetchMovimentacoes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/movimentacoes",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.movimentacoes);
      setIsDataLoaded(true);
      setMovimentacoes(response.data.movimentacoes);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar movimentacoes:", error);
    }
  };
  useEffect(() => {
    fetchMovimentacoes();
  }, []);


  const [rowData, setRowData] = useState<Movimentacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveEdit = async (cod_movimentacao: any, fecharTela: boolean = true) => {
    setItemEditDisabled(true);
    setLoading(true);

    try {
      // Validações iguais ao cadastro
      if (!selectedItem) {
        toast.info("Você deve selecionar um item!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemEditDisabled(false);
        setLoading(false);
        return;
      }

      if (!selectedUnidadesDeMedida) {
        toast.info("Você deve selecionar uma unidade de medida!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemEditDisabled(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movimentacoes/edit/${cod_movimentacao}`,
        {
          cod_item: selectedItem?.cod_item,
          cod_un: selectedUnidadesDeMedida[0]?.cod_un,
          cod_local_item: selectedLocalItem?.cod_local_item,
          lote: formValues.lote,
          quantidade: formValues.quantidade,
          observacoes: formValues.observacoes,
          tipo: tipoDaURL === "Entrada" ? "Entrada" : "Saida",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        clearInputs();
        fetchMovimentacoes();
        toast.success("Movimentação atualizada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setTimeout(() => {
          setIsEditing(false);
        }, 100);
      } else {
        toast.error("Erro ao atualizar movimentação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar movimentação:", error);
      toast.error("Erro ao atualizar movimentação.", {
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
      if (tipoDaURL === 'Saida' && !formValues.observacoes) {
        toast.info("Você deve preencher o campo de observações!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }
      if (!selectedItem) {
        toast.info("Você deve selecionar um item!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }
      if (!selectedUnidadesDeMedida) {
        toast.info("Você deve selecionar uma unidade de medida!", {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/movimentacoes/register",
        {
          cod_item: selectedItem?.cod_item,
          cod_un: selectedUnidadesDeMedida[0]?.cod_un,
          cod_local_item: selectedLocalItem?.cod_local_item,
          lote: formValues.lote,
          quantidade: formValues.quantidade,
          observacoes: formValues.observacoes,
          tipo: tipoDaURL === "Entrada" ? "Entrada" : "Saida",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        clearInputs();
        fetchMovimentacoes();
        toast.success("Movimentação salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar movimentação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar movimentação:", error);
      toast.error("Erro ao salvar movimentação.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };

  const [codRua, setCodRua] = useState<string | null>(null);
  const [codColuna, setCodColuna] = useState<string | null>(null);
  const [codNivel, setCodNivel] = useState<string | null>(null);
  useEffect(() => {
    if (selectedLocalItem && localizacoes && localizacoes.length > 0) {
      // Acha a localização que bate com o cod_localizacao do selectedLocalItem
      const localizacaoEncontrada = localizacoes.find(
        (loc) => loc.cod_localizacao === selectedLocalItem.cod_localizacao
      );

      if (localizacaoEncontrada) {
        setCodRua(localizacaoEncontrada.cod_rua || '');
        setCodColuna(localizacaoEncontrada.cod_coluna || '');
        setCodNivel(localizacaoEncontrada.cod_nivel || '');
      } else {
        // Se não encontrou, zera
        setCodRua('');
        setCodColuna('');
        setCodNivel('');
      }
    } else {
      // Se não tem selectedLocalItem ou localizacoes, zera
      setCodRua('');
      setCodColuna('');
      setCodNivel('');
    }
  }, [selectedLocalItem, localizacoes]);

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (movimentacoes: Movimentacao, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(movimentacoes);
    setSelectedMovimentacao(movimentacoes);
    setSelectedItem(itens.find(item => Number(item.cod_item) === Number(movimentacoes.cod_item)) || null);
    // setSelectedLocalizacao(localizacoes.find(localizacao => Number(localizacao.cod_localizacao) === Number(movimentacoes.cod_localizacao)) || null);
    setSelectedLocalItem(locaisItens.find(localItem => Number(localItem.cod_local_item) === Number(movimentacoes.cod_local_item)) || null);
    setIsEditing(true);
    setVisible(true);
  };


  const openDialog = (id: number) => {
    setMovimentacaoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setMovimentacaoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (movimentacaoIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/movimentacoes/cancel/${movimentacaoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchMovimentacoes();
        setModalDeleteVisible(false);
        toast.success("Movimentação cancelada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar movimentação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir movimentação:", error);
      toast.error("Erro ao excluir movimentação. Tente novamente.", {
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
            <p>Tem certeza que deseja cancelar esta movimentação?</p>
          </Dialog>

          <Dialog
            header={
              isEditing
                ? visualizando
                  ? `Visualizando Movimentação de ${tipoDaURL === "Entrada" ? "Entrada" : "Saída"}`
                  : `Editar Movimentação de ${tipoDaURL === "Entrada" ? "Entrada" : "Saída"}`
                : `Nova Movimentação de ${tipoDaURL === "Entrada" ? "Entrada" : "Saída"}`
            }
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
                  <label htmlFor="localItem" className="block text-blue font-medium">
                    Local do Item
                  </label>
                  <Dropdown
                    disabled={visualizando}
                    value={selectedLocalItem}
                    onChange={(e) => setSelectedLocalItem(e.value)}
                    options={locaisItens}
                    optionLabel="cod_local_item"
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

              <div className="grid gap-2 grid-cols-3">
                <div>
                  <label htmlFor="lote" className="block text-blue font-medium">
                    Lote
                  </label>
                  <input
                    type="text"
                    id="lote"
                    name="lote"
                    disabled={visualizando}
                    value={formValues.lote ?? ''}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="quantidade" className="block text-blue font-medium">
                    Quantidade
                  </label>
                  <input
                    type="text"
                    id="quantidade"
                    name="quantidade"
                    disabled={visualizando}
                    value={formValues.quantidade ?? ''}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div >
                <label htmlFor="obervacoes" className="block text-blue font-medium">
                  Observações
                </label>
                <textarea
                  id="observacoes"
                  name="observacoes"
                  disabled={visualizando}
                  value={formValues.observacoes}
                  onChange={(e) => setFormValues(prev => ({ ...prev, observacoes: e.target.value }))} // atualiza enquanto digita
                  onBlur={() => setFormValues(prev => ({ ...prev, observacoes: formValues.observacoes }))} // pode até remover se não faz nada extra
                  className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24"
                />
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
                      if (selectedMovimentacao) {
                        handleSaveEdit(selectedMovimentacao.cod_local_item);
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
                <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3 mt-1">
                  Movimentações de {tipo === 'Entrada' ? 'Entrada' : 'Saida'}
                </h2>

              </div>
              {permissions?.insercao === permissions?.insercao && (
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
                value={filteredMovimentacoes.slice(first, first + rows)}
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
                  field="lote"
                  header="Lote"
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
                  field="quantidade"
                  header="Quantidade"
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
                  body={(rowData) => {
                    const localItem = locaisItens.find(item => item.cod_local_item === rowData.cod_local_item);
                    const localizacao = localItem ? localizacoes.find(loc => loc.cod_localizacao === localItem.cod_localizacao) : null;
                    return localizacao?.cod_rua || "-";
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
                  body={(rowData) => {
                    const localItem = locaisItens.find(item => item.cod_local_item === rowData.cod_local_item);
                    const localizacao = localItem ? localizacoes.find(loc => loc.cod_localizacao === localItem.cod_localizacao) : null;
                    return localizacao?.cod_coluna || "-";
                  }}
                />
                <Column
                  field=""
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
                  body={(rowData) => {
                    const localItem = locaisItens.find(item => item.cod_local_item === rowData.cod_local_item);
                    const localizacao = localItem ? localizacoes.find(loc => loc.cod_localizacao === localItem.cod_localizacao) : null;
                    return localizacao?.cod_nivel || "??";
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
                    const usuario = users.find((u) => u.cod_usuario === rowData.cod_usuario);
                    return usuario?.nome || "-";
                  }}
                />
                <Column
                  field="dt_hr_criacao"
                  header="DT Cadastro"
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

              </DataTable>
            </div>
          </div>
        </div>
      </SidebarLayout>
      <Footer />
    </>
  );
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
          <img src="/loading.gif" alt="Carregando..." style={{ width: 100, height: 100 }} />
        </div>
      }
    >
      <MovimentacoesPage />
    </Suspense>
  );
}
