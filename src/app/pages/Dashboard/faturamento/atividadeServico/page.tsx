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
import { MultiSelect } from "primereact/multiselect";
import { Establishment, fetchEstabilishments } from "@/services/controls/estabilishment";
import type { AtividadesServicos } from "@/services/faturamento/atividadesServicos";
import { fetchAtividadesServicos } from "@/services/faturamento/atividadesServicos";
import { fetchGruposTributacao, GrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { Cfop, fetchCfops } from "@/services/faturamento/cfops";


const AtividadesServicos: React.FC = () => {
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
  const [atividadesServicosIdToDelete, setAtividadesServicosIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [atividadesServicos, setAtividadesServicos] = useState<AtividadesServicos[]>([]);
  const [selectedAtividadesServicos, setSelectedAtividadesServicos] = useState<AtividadesServicos[]>([]);

  const [formValues, setFormValues] = useState<AtividadesServicos>({
    cod_atividade_servico: 0,
    cod_tributacao: 0,
    cnae: "",
    descricao: "",
    iss: 0,
    cofins: 0,
    pis: 0,
    csll: 0,
    ir: 0,
    inss: 0,
    desconta_imp_tot: "",
    desconta_ded_tot: "",
    servico_const_civil: "",
    situacao: "Ativo",
    estabelecimentos: []
  });



  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_atividade_servico: 0,
      cod_tributacao: 0,
      cnae: "",
      descricao: "",
      iss: 0,
      cofins: 0,
      pis: 0,
      csll: 0,
      ir: 0,
      inss: 0,
      desconta_imp_tot: "",
      desconta_ded_tot: "",
      servico_const_civil: "",
      situacao: "Ativo",
      estabelecimentos: []
    });
    setSelectedEstablishments([]);
  };


  const handleSaveEdit = async (cod_atividade_servico: any) => {
    try {
      const requiredFields = [
        "cod_tributacao",
        "cnae",
        "descricao",
        "iss",
        "cofins",
        "pis",
        "csll",
        "ir",
        "inss",
        "desconta_imp_tot",
        "desconta_ded_tot",
        "servico_const_civil",
      ];

      const verificarCamposObrigatorios = (dados: AtividadesServicos): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof AtividadesServicos];

          if (valor === "" || valor === null || valor === undefined) {
            return campo; // Retorna o primeiro campo inválido
          }

        }
        return null; // Todos os campos estão válidos
      };
      const campoFaltando = verificarCamposObrigatorios(formValues);

      if (campoFaltando) {
        toast.info(`O campo obrigatório "${campoFaltando}" não foi preenchido.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      } else if (selectedEstablishments == null) {
        toast.info(`Selecione pelo menos um estabelecimento.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/atividadesServicos/edit/${cod_atividade_servico}`,
        { ...formValues, estabelecimentos: selectedEstablishments },
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
        const novasAtividades = await fetchAtividadesServicos(token);
        setAtividadesServicos(novasAtividades);
        toast.success("Atividade de Serviço editada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao editar Atividade de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao editar Atividade de Serviço:", error);
    }
  };


  const [rowData, setRowData] = useState<AtividadesServicos[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = [
        "cod_tributacao",
        "cnae",
        "descricao",
        "iss",
        "cofins",
        "pis",
        "csll",
        "ir",
        "inss",
        "desconta_imp_tot",
        "desconta_ded_tot",
        "servico_const_civil",
      ];


      const verificarCamposObrigatorios = (dados: AtividadesServicos): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof AtividadesServicos];

          if (valor === "" || valor === null || valor === undefined) {
            return campo; // Retorna o primeiro campo inválido
          }

        }
        return null; // Todos os campos estão válidos
      };
      const campoFaltando = verificarCamposObrigatorios(formValues);

      if (campoFaltando) {
        toast.info(`O campo obrigatório "${campoFaltando}" não foi preenchido.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const atividadeEncontrada = atividadesServicos.find(
        (item) => item.descricao === formValues.descricao
      );
      const situacaoInativo = atividadeEncontrada?.situacao === "Inativo";

      if (atividadeEncontrada && !situacaoInativo) {
        toast.info("Essa descricao já existe no banco de dados, escolha outra!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      if (atividadeEncontrada && situacaoInativo) {
        await handleSaveEdit(atividadeEncontrada.cod_atividade_servico);
        const novasAtividades = await fetchAtividadesServicos(token);
        setAtividadesServicos(novasAtividades);
        clearInputs();
        setVisible(fecharTela);
        toast.info("Essa atividade com essa descrição já existia, portanto foi reativada com os novos dados.", {
          position: "top-right",
          autoClose: 8000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }


      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/atividadesServicos/register`,
        { ...formValues, estabelecimentos: selectedEstablishments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Atividade de Serviço salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        const novasAtividades = await fetchAtividadesServicos(token);
        setAtividadesServicos(novasAtividades);
        clearInputs();
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar Atividade de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar Atividade de Serviço:", error);
      toast.error("Erro interno ao tentar salvar.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };



  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (atividadesServicos: any, visualizar: boolean) => {
    console.log(atividadesServicos)
    setVisualizar(visualizar);

    setFormValues(atividadesServicos);
    // Filtra os estabelecimentos com base no cod_estabel
    const selectedEstablishmentsWithNames = atividadesServicos.db_estabelecimentos_atividades.map(({ cod_estabel }: any) =>
      establishments.find((estab) => estab.cod_estabelecimento === cod_estabel)
    )
      .filter(Boolean); // Remove valores undefined (caso algum código não tenha correspondência)

    setSelectedEstablishments(selectedEstablishmentsWithNames);
    setSelectedAtividadesServicos([atividadesServicos]);
    setIsEditing(true);
    setVisible(true);
  };




  // useEffect para carregar dados
  useEffect(() => {
    const carregarNatureza = async () => {
      const natureza = await fetchAtividadesServicos(token);
      setAtividadesServicos(natureza);
    };

    carregarNatureza();
  }, [token]);

  const filteredAtividadesServicos = atividadesServicos.filter((atividadesServicos) => {
    // Apenas ATIVO aparecem
    if (atividadesServicos.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(atividadesServicos).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const openDialog = (id: number) => {
    setAtividadesServicosIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setAtividadesServicosIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (atividadesServicosIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/atividadesServicos/cancel/${atividadesServicosIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const novasAtividades = await fetchAtividadesServicos(token);
        setAtividadesServicos(novasAtividades);
        setModalDeleteVisible(false);
        toast.success("Atividade de Serviço cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Atividade de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar Atividade de Serviço:", error);
      toast.error("Erro ao cancelar Atividade de Serviço. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };


  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
  useEffect(() => {
    const carregarEstabs = async () => {
      const estabs = await fetchEstabilishments(token);
      setEstablishments(estabs);
    };

    carregarEstabs();
  }, [token]);


  const [gruposTributacao, setGruposTributacao] = useState<GrupoTributacao[]>([]);
  const [selectedGruposTributacao, setSelectedGruposTributacao] = useState<GrupoTributacao[]>([]);
  useEffect(() => {
    const carregarGrupos = async () => {
      const grupos = await fetchGruposTributacao(token);
      setGruposTributacao(grupos);
    };

    carregarGrupos();
  }, [token]);


  const [cfops, setCfops] = useState<Cfop[]>([]);
  const [selectedCfops, setSelectedCfops] = useState<Cfop[]>([]);

  // useEffect para carregar os CFOPs
  useEffect(() => {
    const carregarCfops = async () => {
      const data = await fetchCfops(token);
      setCfops(data);
    };

    carregarCfops();
  }, [token]);



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
            <p>Tem certeza que deseja cancelar este Atividade de Serviço?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Atividade de Serviço" : "Editar Atividade de Serviço") : "Nova Atividade de Serviço"}
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
              <div className="grid gap-2 grid-cols-3">
                <div className="">
                  <label htmlFor="cod_atividade_servico" className="block text-blue font-medium">
                    Código do Serviço
                  </label>
                  <input
                    type="text"
                    id="cod_atividade_servico"
                    name="cod_atividade_servico"
                    disabled
                    value={formValues.cod_atividade_servico ?? 0}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label htmlFor="cod_tributacao" className="block text-blue font-medium">
                    Código de Tributação
                  </label>
                  <input
                    type="number"
                    id="cod_tributacao"
                    name="cod_tributacao"
                    disabled={visualizando}
                    value={formValues.cod_tributacao}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="cnae" className="block text-blue font-medium">
                    CNAE
                  </label>
                  <input
                    type="number"
                    id="cnae"
                    name="cnae"
                    disabled={visualizando}
                    value={formValues.cnae}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid gap-2">
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

              <div className="grid gap-2 grid-cols-3">
                <div>
                  <label htmlFor="iss" className="block text-blue font-medium">
                    %ISS
                  </label>
                  <input
                    type="number"
                    id="iss"
                    name="iss"
                    disabled={visualizando}
                    value={formValues.iss}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="cofins" className="block text-blue font-medium">
                    %COFINS
                  </label>
                  <input
                    type="number"
                    id="cofins"
                    name="cofins"
                    disabled={visualizando}
                    value={formValues.cofins}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="pis" className="block text-blue font-medium">
                    PIS
                  </label>
                  <input
                    type="number"
                    id="pis"
                    name="pis"
                    disabled={visualizando}
                    value={formValues.pis}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid gap-2 grid-cols-3">
                <div>
                  <label htmlFor="csll" className="block text-blue font-medium">
                    %CSLL
                  </label>
                  <input
                    type="number"
                    id="csll"
                    name="csll"
                    disabled={visualizando}
                    value={formValues.csll}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="ir" className="block text-blue font-medium">
                    %IR
                  </label>
                  <input
                    type="number"
                    id="ir"
                    name="ir"
                    disabled={visualizando}
                    value={formValues.ir}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="inss" className="block text-blue font-medium">
                    %INSS
                  </label>
                  <input
                    type="number"
                    id="inss"
                    name="inss"
                    disabled={visualizando}
                    value={formValues.inss}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid gap-2 grid-cols-2">
                <div className="">
                  <label htmlFor="estabelecimento" className="block text-blue font-medium">
                    Estabelecimento
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedEstablishments}
                    onChange={(e) => { setSelectedEstablishments(e.value); console.log(selectedEstablishments) }}
                    options={establishments}
                    optionLabel="nome"
                    filter
                    placeholder="Selecione"
                    maxSelectedLabels={3}
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>
                <div>
                  <label htmlFor="desconta_imp_tot" className="block text-blue font-medium">
                    Desconta Impostos do Total
                  </label>
                  <select
                    id="desconta_imp_tot"
                    name="desconta_imp_tot"
                    disabled={visualizando}
                    value={formValues.desconta_imp_tot || "default"}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

              </div>

              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label htmlFor="servico_const_civil" className="block text-blue font-medium">
                    Serviços de Construção Civil
                  </label>
                  <select
                    id="servico_const_civil"
                    name="servico_const_civil"
                    disabled={visualizando}
                    value={formValues.servico_const_civil || "default"}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="desconta_ded_tot" className="block text-blue font-medium">
                    Desconta Deduções do Total
                  </label>
                  <select
                    id="desconta_ded_tot"
                    name="desconta_ded_tot"
                    disabled={visualizando}
                    value={formValues.desconta_ded_tot || "default"}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
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
                    onClick={() => handleSaveEdit(formValues.cod_atividade_servico)}
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
                  Atividade de Serviço
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
                value={filteredAtividadesServicos.slice(first, first + rows)}
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
                  field="cod_atividade_servico"
                  header="Código de Serviço"
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
                  field="cod_tributacao"
                  header="Código de Tributação"
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
                  field="cnae"
                  header="CNAE"
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
                        <CancelButton onClick={() => openDialog(rowData.cod_atividade_servico)} />
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

export default AtividadesServicos;
