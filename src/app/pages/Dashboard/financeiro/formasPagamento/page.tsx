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
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";

export interface FormasPagamento {
  cod_forma_pagamento: number;
  nome?: string;
  descricao?: string;
  situacao?: 'Ativo' | 'Inativo';
  cod_conta_bancaria?: number;
  max_parcelas?: number;
  intervalo_parcelas?: number;
  cod_modalidade?: number;
}

export interface ContasBancarias {
  cod_conta_bancaria: number;
  nome?: string;
  saldo?: number;
  dt_saldo?: Date | string;
  situacao?: 'Ativo' | 'Inativo';
  dt_cadastro?: Date | string;
}

export interface Modalidade {
  cod_modalidade: number;
  descricao?: string;
}


const FormasPagamentoPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Financeiro");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");

  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] = useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const [FormasPagamento, setFormasPagamento] = useState<FormasPagamento[]>([]);
  const fetchFormasPagamento = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/formasPagamento",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setFormasPagamento(response.data.formas_pagamento);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar Formas de Pagamento:", error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchFormasPagamento();
    }
  }, [token]);


  const [modalidades, setModalidades] = useState<Modalidade[]>([]);
  const fetchModalidades = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/modalidades", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setModalidades(response.data.modalidades);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar modalidades:", error);
    }
  };
  useEffect(() => {
    if (token) {
      fetchModalidades();
    }
  }, [token]);


  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredFormasPagamento = FormasPagamento.filter((FormasPagamento) => {
    // Apenas ATIVO aparecem
    if (FormasPagamento.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(FormasPagamento).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const [formValues, setFormValues] = useState<FormasPagamento>({
    cod_forma_pagamento: 0,
    nome: "",
    descricao: "",
    situacao: "Ativo",
    cod_conta_bancaria: undefined,
    max_parcelas: 0,
    intervalo_parcelas: 0,
    cod_modalidade: 0,
  });



  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [FormasPagamentoIdToDelete, setFormasPagamentoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedFormasPagamento, setSelectedFormasPagamento] = useState<FormasPagamento | null>(null);


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_forma_pagamento: 0,
      nome: "",
      descricao: "",
      situacao: "Ativo",
      cod_conta_bancaria: 0,
      max_parcelas: 0,
      intervalo_parcelas: 0,
      cod_modalidade: 0,
    });
  };

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "descricao",
        "cod_conta_bancaria",
        "max_parcelas",
        "intervalo_parcelas",
        "cod_modalidade",
      ];

      // Verifica se algum campo obrigatório está vazio
      const emptyFields = requiredFields.filter((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (emptyFields.length > 0) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info(`Os seguintes campos são obrigatórios: ${emptyFields.join(", ")}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const formaEncontrada = FormasPagamento.find((item) => item.nome === formValues.nome);
      const situacaoInativo = formaEncontrada?.situacao === "Inativo";

      if (formaEncontrada && !situacaoInativo) {
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

      if (formaEncontrada && situacaoInativo) {
        await handleSaveEdit(formaEncontrada.cod_conta_bancaria);
        fetchFormasPagamento();
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
        process.env.NEXT_PUBLIC_API_URL + "/api/formasPagamento/register",
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
        fetchFormasPagamento();
        toast.success("Forma de Pagamento salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Forma de Pagamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Forma de Pagamento:", error);
    }
  };


  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (FormasPagamento: FormasPagamento, visualizar: boolean) => {
    setVisualizar(visualizar);

    console.log("Editando Forma de Pagamento:", FormasPagamento);
    setFormValues((prev) => ({
      ...prev,
      cod_conta_bancaria: FormasPagamento.cod_conta_bancaria,
      nome: FormasPagamento.nome,
      cod_forma_pagamento: FormasPagamento.cod_forma_pagamento,
      descricao: FormasPagamento.descricao,
      situacao: FormasPagamento.situacao,
      max_parcelas: FormasPagamento.max_parcelas,
      intervalo_parcelas: FormasPagamento.intervalo_parcelas,
      cod_modalidade: FormasPagamento.cod_modalidade,
    }));
    setSelectedFormasPagamento(FormasPagamento);
    setIsEditing(true);
    setVisible(true);
  };

  const handleSaveEdit = async (cod_forma_pagamento: any) => {
    setItemEditDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "descricao",
        "cod_conta_bancaria",
        "max_parcelas",
        "intervalo_parcelas",
        "cod_modalidade",
      ];

      // Verifica se algum campo obrigatório está vazio
      const emptyFields = requiredFields.filter((field) => {
        const value = formValues[field as keyof typeof formValues];
        return value === "" || value === null || value === undefined;
      });

      if (emptyFields.length > 0) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info(`Os seguintes campos são obrigatórios: ${emptyFields.join(", ")}`, {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/formasPagamento/edit/${cod_forma_pagamento ?? formValues.cod_forma_pagamento}`,
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
        fetchFormasPagamento();
        toast.success("Forma de Pagamento salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Forma de Pagamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Forma de Pagamento:", error);
    }
  };

  const handleCancelar = async () => {
    if (FormasPagamentoIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/formasPagamento/cancel/${FormasPagamentoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchFormasPagamento(); // Aqui é necessário chamar a função que irá atualizar a lista de Forma de Pagamento
        setModalDeleteVisible(false);
        toast.success("Forma de Pagamento cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Forma de Pagamento.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar Forma de Pagamento:", error);
      toast.error("Erro ao cancelar Forma de Pagamento. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const openDialog = (id: number) => {
    setFormasPagamentoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setFormasPagamentoIdToDelete(null);
  };

  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: (name.startsWith("cod_") || name.startsWith("max_") || name.startsWith("intervalo_")) ? Number(value) : value, // converte para número se for um campo cod_
    }));
  };



  const [saldo, setSaldo] = useState(0.0);
  const [saldoInput, setSaldoInput] = useState(saldo.toFixed(2));

  const [contasBancarias, setContasBancarias] = useState<ContasBancarias[]>([]);
  const fetchContasBancarias = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/contasBancarias",
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
            <p>Tem certeza que deseja cancelar este Forma de Pagamento?</p>
          </Dialog>

          {/* MODAL PRINCIPAL */}
          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Forma de Pagamento" : "Editar Forma de Pagamento") : "Nova Forma de Pagamento"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            style={{ width: "50vw" }}
            onHide={() => closeModal()}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
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

            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div>
                <label htmlFor="max_parcelas" className="block text-blue font-medium">
                  N° Max Parcelas
                </label>
                <input
                  type="text"
                  id="max_parcelas"
                  name="max_parcelas"
                  disabled={visualizando}
                  value={formValues.max_parcelas}
                  onChange={handleInputChange}
                  className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                />
              </div>

              <div>
                <label htmlFor="intervalo_parcelas" className="block text-blue font-medium">
                  Intervalo de Parcelas
                </label>
                <input
                  type="number"
                  id="intervalo_parcelas"
                  name="intervalo_parcelas"
                  disabled={visualizando}
                  value={formValues.intervalo_parcelas}
                  onChange={handleInputChange}
                  min={1}
                  className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                />

              </div>
            </div>

            <div className={`${visualizando ? 'visualizando' : ''}
            p-fluid grid-cols-2 grid gap-2 mt-2`}>
              <div>
                <label htmlFor="cod_conta_bancaria" className="block text-blue font-medium">
                  Conta Bancária
                </label>
                <select
                  id="cod_conta_bancaria"
                  name="cod_conta_bancaria"
                  value={formValues.cod_conta_bancaria ?? ""}
                  onChange={handleInputChange}
                  className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  disabled={loading || visualizando}
                >
                  <option value="" disabled>
                    Selecione
                  </option>

                  {contasBancarias.map((conta) => (
                    <option key={conta.cod_conta_bancaria} value={conta.cod_conta_bancaria}>
                      {conta.nome ? conta.nome : `Conta ${conta.cod_conta_bancaria}`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="cod_modalidade" className="block text-blue font-medium">
                  Modalidade
                </label>
                <select
                  id="cod_modalidade"
                  name="cod_modalidade"
                  value={formValues.cod_modalidade || ""}
                  onChange={handleInputChange}
                  className="w-full pl-1 rounded-sm h-8 border-[#D9D9D9]"
                  disabled={loading || visualizando}
                >
                  <option value="" disabled>
                    Selecione
                  </option>
                  {modalidades?.map((modalidade) => (
                    <option key={modalidade.cod_modalidade} value={modalidade.cod_modalidade}>
                      {modalidade.descricao}
                    </option>
                  ))}
                </select>
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
                    onClick={() => handleSaveEdit(selectedFormasPagamento ? selectedFormasPagamento.cod_forma_pagamento : formValues.cod_forma_pagamento)}
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
          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className=" text-blue text-2xl font-extrabold mb-3 pl-3 mt-1
">
                  Formas de Pagamento
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
                value={filteredFormasPagamento.slice(first, first + rows)}
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
                  field="cod_conta_bancaria"
                  header="Conta Bancária"
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
                  field="max_parcelas"
                  header="N° Max Parcelas"
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
                  field="intervalo_parcelas"
                  header="Intervalo Parcelas"
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
                    const data = rowData.dt_cadastro;
                    if (!data) return <span>—</span>; // ou qualquer fallback

                    const date = new Date(data);
                    if (isNaN(date.getTime())) return <span>Data inválida</span>;

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
                        <CancelButton onClick={() => openDialog(rowData.cod_forma_pagamento)} />
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

export default FormasPagamentoPage;
