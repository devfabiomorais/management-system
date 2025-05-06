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
import { MdOutlineModeEditOutline, MdVisibility } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import { unescape } from "querystring";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";

interface PlanoContas {
  cod_plano_conta: number;
  descricao?: string;
  classificacao?: string;
  cod_plano_conta_mae?: number;
  cod_grupo_dre?: number | null;
  situacao?: string;
}

interface GrupoDRE {
  cod_grupo_dre: number;
  descricao: string;
  cod_despesa: number;
  dbs_despesas: [];
  dbs_plano_contas: [];
}

const PlanoContasPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Financeiro");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");

  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] = useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const [planoContas, setPlanoContas] = useState<PlanoContas[]>([]);
  const fetchPlanoContas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/planoContas",
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

  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredPlanoContas = planoContas.filter((PlanoContas) => {
    // Apenas ATIVO aparecem
    if (PlanoContas.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(PlanoContas).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const [formValues, setFormValues] = useState<PlanoContas>({
    cod_plano_conta: 0,
    descricao: "",
    classificacao: "",
    cod_plano_conta_mae: 0,
    cod_grupo_dre: 0,
    situacao: "",
  });


  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [planoContasIdToDelete, setPlanoContasIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedPlanoContas, setSelectedPlanoContas] = useState<PlanoContas | null>(null);


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_plano_conta: 0,
      descricao: "",
      classificacao: "",
      cod_plano_conta_mae: 0,
      cod_grupo_dre: null,
      situacao: "",
    });
  };

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "cod_plano_conta_mae",
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

      const planoEncontrado = planoContas.find((item) => item.descricao === formValues.descricao);
      const situacaoInativo = planoEncontrado?.situacao === "Inativo";

      if (planoEncontrado && !situacaoInativo) {
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

      if (planoEncontrado && situacaoInativo) {
        await handleSaveEdit(planoEncontrado.cod_plano_conta);
        fetchPlanoContas();
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
        process.env.NEXT_PUBLIC_API_URL + "/api/planoContas/register",
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
        fetchPlanoContas();
        toast.success("Plano de conta salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar plano de contas.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar plano de contas:", error);
    }
  };

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (planoContas: PlanoContas, visualizar: boolean) => {
    setVisualizar(visualizar);

    console.log("Editando plano de contas:", planoContas);

    // Remover o último ".X" da classificação, se existir
    let classificacao = planoContas.classificacao ?? '';
    if (classificacao.includes('.')) {
      const lastDotIndex = classificacao.lastIndexOf('.');
      classificacao = classificacao.substring(0, lastDotIndex);
    }

    // Definir o estado
    setFormValues((prev) => ({
      ...prev,
      cod_plano_conta: planoContas.cod_plano_conta,
      descricao: planoContas.descricao,
      classificacao: planoContas.classificacao,
      cod_plano_conta_mae: parseFloat(planoContas.classificacao ?? '0'),
      cod_grupo_dre: planoContas.cod_grupo_dre,
    }));

    setSelectedPlanoContas(planoContas);
    setIsEditing(true);
    setVisible(true);
  };





  const handleSaveEdit = async (cod_plano_conta: any) => {
    setItemEditDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "descricao",
        "classificacao"
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/planoContas/edit/${cod_plano_conta}`,
        { ...selectedPlanoContas, descricao: formValues.descricao, classificacao: formValues.classificacao },
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
        fetchPlanoContas();
        toast.success("Plano de conta salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar plano de conta.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar plano de conta:", error);
    }
  };

  const handleCancelar = async () => {
    if (planoContasIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/planoContas/cancel/${planoContasIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchPlanoContas(); // Aqui é necessário chamar a função que irá atualizar a lista de plano de conta
        setModalDeleteVisible(false);
        toast.success("Plano de conta cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar plano de conta.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir plano de conta:", error);
      toast.error("Erro ao excluir plano de conta. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const openDialog = (id: number) => {
    setPlanoContasIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setPlanoContasIdToDelete(null);
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

  const [gruposDRE, setGruposDRE] = useState<GrupoDRE[]>([]);
  const fetchGruposDRE = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/gruposDRE", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGruposDRE(response.data.gruposDRE);
    } catch (error) {
      console.error("Erro ao carregar grupos DRE:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (token) {
      fetchGruposDRE();
    }
  }, [token]);


  const [selectedGrupoDRE, setSelectedGrupoDRE] = useState<GrupoDRE | undefined>(undefined);
  const handleGrupoDREChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = gruposDRE.find(
      (grupoDRE) => grupoDRE.cod_grupo_dre === Number(e.target.value)
    );

    setSelectedGrupoDRE(selected || undefined);

    if (selected) {
      setFormValues((prevValues) => ({
        ...prevValues,
        cod_grupo_dre: selected.cod_grupo_dre ?? undefined,
      }));
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
            <p>Tem certeza que deseja cancelar este plano de conta?</p>
          </Dialog>

          {/* MODAL PRINCIPAL */}
          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Plano de conta" : "Editar Plano de conta") : "Novo Plano de conta"}
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
                  <label htmlFor="cod_plano_conta_mae" className="block text-blue font-medium">
                    Conta Mãe
                  </label>
                  <select
                    id="cod_plano_conta_mae"
                    name="cod_plano_conta_mae"
                    value={formValues.cod_plano_conta_mae ?? "0"}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cod_plano_conta_mae: parseFloat(e.target.value),
                      }))
                    }
                    disabled={isEditing || visualizando}
                    className={`w-full pl-1 rounded-sm h-8 border-[#D9D9D9] ${isEditing ? ' bg-gray-100 pointer-events-none' : ''
                      }`}
                  >
                    <option value="0" disabled hidden>
                      Selecione
                    </option>
                    <option value="1">
                      1 - Pagamentos
                    </option>
                    <option value="1.1">&nbsp;&nbsp;1.1 - Despesas administrativas e comerciais</option>
                    <option value="1.2">&nbsp;&nbsp;1.2 - Despesas de produtos vendidos</option>
                    <option value="1.3">&nbsp;&nbsp;1.3 - Despesas financeiras</option>
                    <option value="1.4">&nbsp;&nbsp;1.4 - Investimentos</option>
                    <option value="1.5">&nbsp;&nbsp;1.5 - Outras despesas</option>
                    <option value="2">
                      2 - Recebimentos
                    </option>
                    <option value="2.1">&nbsp;&nbsp;2.1 - Receitas de vendas</option>
                    <option value="2.2">&nbsp;&nbsp;2.2 - Receitas financeiras</option>
                    <option value="2.3">&nbsp;&nbsp;2.3 - Outras receitas</option>
                  </select>
                </div>


                {[1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3].includes(formValues.cod_plano_conta_mae ?? 999) && (
                  <div>
                    <label htmlFor="cod_grupo_dre" className="block text-blue font-medium">
                      Grupo do DRE
                    </label>
                    <select
                      id="cod_grupo_dre"
                      name="cod_grupo_dre"
                      value={selectedGrupoDRE ? selectedGrupoDRE.cod_grupo_dre : "default"}
                      disabled={isEditing || visualizando}
                      onChange={handleGrupoDREChange}
                      className="w-full pl-1 rounded-sm h-8 border-[#D9D9D9]"
                    >
                      <option value="default" disabled>
                        Selecione
                      </option>

                      {/* Título antes de todos */}
                      <option disabled style={{ fontWeight: "bold", color: "#000000", fontSize: "1.2rem" }}>
                        Deduções
                      </option>

                      {gruposDRE.map((grupoDRE) => {
                        const tituloExtra: string | null = (() => {
                          if (grupoDRE.cod_grupo_dre === 4) return "Custos operacionais";
                          if (grupoDRE.cod_grupo_dre === 5) return "Despesas operacionais";
                          if (grupoDRE.cod_grupo_dre === 8) return "Despesas financeiras";
                          if (grupoDRE.cod_grupo_dre === 12) return "Outras despesas";
                          return null;
                        })();

                        return (
                          <React.Fragment key={grupoDRE.cod_grupo_dre}>
                            {tituloExtra && (
                              <option disabled style={{ fontWeight: "bold", color: "#000000", fontSize: "1.2rem" }}>
                                {tituloExtra}
                              </option>
                            )}
                            <option value={grupoDRE.cod_grupo_dre}>
                              &nbsp;&nbsp;(-)&nbsp;{grupoDRE.descricao}
                            </option>
                          </React.Fragment>
                        );
                      })}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col col-span-2">
                  <label htmlFor="descricao" className="block text-blue font-medium">
                    Nome
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
                    onClick={() => handleSaveEdit(selectedPlanoContas ? selectedPlanoContas.cod_plano_conta : formValues.cod_plano_conta)}
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
                  Plano de contas
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
                value={filteredPlanoContas.slice(first, first + rows)}
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
                  field="classificacao"
                  header="Classificação"
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
                />
                <Column
                  field="descricao"
                  header="Nome"
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
                  field="cod_plano_conta_mae"
                  header="Movimentação"
                  body={(rowData) => {
                    if (rowData.cod_plano_conta_mae === 1) return 'Pagamentos';
                    if (rowData.cod_plano_conta_mae === 2) return 'Recebimentos';
                  }}
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
                />

                <Column
                  field="cod_grupo_dre"
                  header="Grupo do DRE"
                  body={(rowData) => {
                    const grupo = gruposDRE.find((g) => g.cod_grupo_dre === rowData.cod_grupo_dre);
                    return grupo ? grupo.descricao : '-';
                  }}
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
                />

                <Column
                  field="situacao"
                  header="Situação"
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
                        <CancelButton onClick={() => openDialog(rowData.cod_plano_conta)} />
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

export default PlanoContasPage;
