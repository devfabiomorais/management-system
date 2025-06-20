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
import type { NaturezaOperacao } from "@/services/faturamento/naturezaOperacao";
import { fetchNaturezaOperacao } from "@/services/faturamento/naturezaOperacao";
import { fetchGruposTributacao, GrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { Cfop, fetchCfops } from "@/services/faturamento/cfops";


const NaturezaOperacao: React.FC = () => {
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
  const [naturezasOperacao, setNaturezasOperacao] = useState<NaturezaOperacao[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);





  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [naturezasOperacaoIdToDelete, setNaturezaOperacaoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<NaturezaOperacao>({
    cod_natureza_operacao: 0,
    nome: "",
    padrao: "",
    tipo: "",
    finalidade_emissao: "",
    tipo_agendamento: "",
    consumidor_final: "",
    observacoes: "",
    cod_grupo_tributacao: 0,
    cod_cfop_interno: 0,
    cod_cfop_externo: 0,
    situacao: "Ativo",
    estabelecimentos: [],
  });


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_natureza_operacao: 0,
      nome: "",
      padrao: "",
      tipo: "",
      finalidade_emissao: "",
      tipo_agendamento: "",
      consumidor_final: "",
      observacoes: "",
      cod_grupo_tributacao: undefined,
      cod_cfop_interno: 0,
      cod_cfop_externo: 0,
      situacao: "Ativo",
      estabelecimentos: [],
    });
    setSelectedEstablishments([]);
  };


  const handleSaveEdit = async (cod_natureza_operacao: any) => {
    try {
      const requiredFields = [
        "nome",
        "padrao",
        "tipo",
        "finalidade_emissao",
        "tipo_agendamento",
        "consumidor_final",
        "observacoes",
        "cod_grupo_tributacao",
        "cod_cfop_interno",
        "cod_cfop_externo",
      ];

      const verificarCamposObrigatorios = (dados: NaturezaOperacao): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof NaturezaOperacao];

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
        `${process.env.NEXT_PUBLIC_API_URL}/api/naturezaOperacao/edit/${cod_natureza_operacao}`,
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
        const novasNaturezas = await fetchNaturezaOperacao(token);
        setNaturezaOperacao(novasNaturezas);
        toast.success("Natureza de Operação editada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao editar Natureza de Operação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao editar Natureza de Operação:", error);
    }
  };


  const [rowData, setRowData] = useState<NaturezaOperacao[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = [
        "nome",
        "padrao",
        "tipo",
        "finalidade_emissao",
        "tipo_agendamento",
        "consumidor_final",
        "observacoes",
        "cod_grupo_tributacao",
        "cod_cfop_interno",
        "cod_cfop_externo",
      ];

      const verificarCamposObrigatorios = (dados: NaturezaOperacao): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof NaturezaOperacao];

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

      const naturezaEncontrado = naturezaOperacao.find(
        (item) => item.nome === formValues.nome
      );
      const situacaoInativo = naturezaEncontrado?.situacao === "Inativo";

      if (naturezaEncontrado && !situacaoInativo) {
        toast.info("Esse nome já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      if (naturezaEncontrado && situacaoInativo) {
        await handleSaveEdit(naturezaEncontrado.cod_natureza_operacao);
        const novasNaturezas = await fetchNaturezaOperacao(token);
        setNaturezaOperacao(novasNaturezas);
        clearInputs();
        setVisible(fecharTela);
        toast.info("Esse nome já existia, portanto foi reativado com os novos dados.", {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/naturezaOperacao/register`,
        { ...formValues, estabelecimentos: selectedEstablishments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Natureza de Operação salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        const novasNaturezas = await fetchNaturezaOperacao(token);
        setNaturezaOperacao(novasNaturezas);
        clearInputs();
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar Natureza de Operação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar Natureza de Operação:", error);
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

  const handleEdit = (naturezasOperacao: any, visualizar: boolean) => {
    console.log(naturezasOperacao)
    setVisualizar(visualizar);

    setFormValues(naturezasOperacao);
    // Filtra os estabelecimentos com base no cod_estabel
    const selectedEstablishmentsWithNames = naturezasOperacao.db_estabelecimentos_natureza.map(({ cod_estabel }: any) =>
      establishments.find((estab) => estab.cod_estabelecimento === cod_estabel)
    )
      .filter(Boolean); // Remove valores undefined (caso algum código não tenha correspondência)

    setSelectedEstablishments(selectedEstablishmentsWithNames);
    setSelectedNaturezaOperacao([naturezasOperacao]);
    setIsEditing(true);
    setVisible(true);
  };


  const [naturezaOperacao, setNaturezaOperacao] = useState<NaturezaOperacao[]>([]);
  const [selectedNaturezaOperacao, setSelectedNaturezaOperacao] = useState<NaturezaOperacao[]>([]);

  // useEffect para carregar dados
  useEffect(() => {
    const carregarNatureza = async () => {
      const natureza = await fetchNaturezaOperacao(token);
      setNaturezaOperacao(natureza);
    };

    carregarNatureza();
  }, [token]);

  const filteredNaturezasOperacao = naturezaOperacao.filter((naturezaOperacao) => {
    // Apenas ATIVO aparecem
    if (naturezaOperacao.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(naturezaOperacao).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });

  const openDialog = (id: number) => {
    setNaturezaOperacaoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setNaturezaOperacaoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (naturezasOperacaoIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/naturezaOperacao/cancel/${naturezasOperacaoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const novasNaturezas = await fetchNaturezaOperacao(token);
        setNaturezaOperacao(novasNaturezas);
        setModalDeleteVisible(false);
        toast.success("Natureza de Operação cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Natureza de Operação.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar Natureza de Operação:", error);
      toast.error("Erro ao cancelar Natureza de Operação. Tente novamente.", {
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
            <p>Tem certeza que deseja cancelar este Natureza de Operação?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Natureza de Operação" : "Editar Natureza de Operação") : "Nova Natureza de Operação"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            style={{ position: 'fixed', width: '60rem' }}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid gap-2">
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
                  <label htmlFor="padrao" className="block text-blue font-medium">
                    Padrão
                  </label>
                  <select
                    id="padrao"
                    name="padrao"
                    disabled={visualizando}
                    value={formValues.padrao}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        padrao: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Venda">Venda</option>
                    <option value="Venda não contribuinte">Venda não contribuinte</option>
                    <option value="Venda contribuinte">Venda contribuinte</option>
                    <option value="Cupom Fiscal (NFC-e)">Cupom Fiscal (NFC-e)</option>
                    <option value="Compra">Compra</option>
                  </select>
                </div>


                <div>
                  <label htmlFor="tipo" className="block text-blue font-medium">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    disabled={visualizando}
                    value={formValues.tipo}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        tipo: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Entrada">Entrada</option>
                    <option value="Saida">Saída</option>
                  </select>
                </div>


                <div>
                  <label htmlFor="finalidade_emissao" className="block text-blue font-medium">
                    Finalidade de Emissão
                  </label>
                  <select
                    id="finalidade_emissao"
                    name="finalidade_emissao"
                    disabled={visualizando}
                    value={formValues.finalidade_emissao}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        finalidade_emissao: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="NF-e normal">NF-e normal</option>
                    <option value="NF-e complementar">NF-e complementar</option>
                    <option value="NF-e de ajuste">NF-e de ajuste</option>
                    <option value="Devolução de mercadoria">Devolução de mercadoria</option>
                  </select>
                </div>

              </div>

              <div className="grid grid-cols-3 gap-2">
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
                  <label htmlFor="consumidor_final" className="block text-blue font-medium">
                    Consumidor Final
                  </label>
                  <select
                    id="consumidor_final"
                    name="consumidor_final"
                    disabled={visualizando}
                    value={formValues.consumidor_final}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        consumidor_final: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>


                <div>
                  <label htmlFor="tipo_agendamento" className="block text-blue font-medium">
                    Tipo de Atendimento
                  </label>
                  <select
                    id="tipo_agendamento"
                    name="tipo_agendamento"
                    disabled={visualizando}
                    value={formValues.tipo_agendamento}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        tipo_agendamento: e.target.value,
                      }))
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Não se aplica">Não se aplica</option>
                    <option value="Operação presencial">Operação presencial</option>
                    <option value="Operação não presencial, pela internet">Operação não presencial, pela internet</option>
                    <option value="Operação não presencial, teleatendimento">Operação não presencial, teleatendimento</option>
                    <option value="Operação não presencial, outros">Operação não presencial, outros</option>
                  </select>
                </div>

              </div>

              <div>
                <div>
                  <label htmlFor="observacoes" className="block text-blue font-medium">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"
                    disabled={visualizando}
                    value={formValues.observacoes}
                    maxLength={255}
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-24 `}
                    onChange={(e) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        observacoes: e.target.value,
                      }));
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="">
                  <label htmlFor="grupoTributacao" className="block text-blue font-medium">
                    Grupo de Tributação
                  </label>
                  <select
                    id="grupoTributacao"
                    disabled={visualizando}
                    value={formValues.cod_grupo_tributacao || ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cod_grupo_tributacao: Number(e.target.value),
                      }))
                    }
                    className="w-full border text-black h-[35px] px-2 rounded"
                  >
                    <option value="">Selecione</option>
                    {gruposTributacao.map((grupo) => (
                      <option key={grupo.cod_grupo_tributacao} value={grupo.cod_grupo_tributacao}>
                        {grupo.nome}
                      </option>
                    ))}
                  </select>
                </div>




                <div>
                  <label htmlFor="cod_cfop_interno" className="block text-blue font-medium">
                    CFOP Interno
                  </label>
                  <select
                    id="cod_cfop_interno"
                    name="cod_cfop_interno"
                    disabled={visualizando}
                    value={formValues.cod_cfop_interno}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="">Selecione</option>
                    {cfops.map((cfop) => (
                      <option key={cfop.cod_cfop} value={cfop.cod_cfop}>
                        {cfop.cod_cfop} - {cfop.descricao}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cod_cfop_externo" className="block text-blue font-medium">
                    CFOP Interestadual
                  </label>
                  <select
                    id="cod_cfop_externo"
                    name="cod_cfop_externo"
                    disabled={visualizando}
                    value={formValues.cod_cfop_externo}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="">Selecione</option>
                    {cfops.map((cfop) => (
                      <option key={cfop.cod_cfop} value={cfop.cod_cfop}>
                        {cfop.cod_cfop} - {cfop.descricao}
                      </option>
                    ))}
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
                    onClick={() => handleSaveEdit(formValues.cod_natureza_operacao)}
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
                  Natureza de Operação
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
                value={filteredNaturezasOperacao.slice(first, first + rows)}
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
                  field="cod_grupo_tributacao"
                  header="Tributação"
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
                  field="padrao"
                  header="Padrão"
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
                  field="cod_cfop_interno"
                  header="CFOP Interno"
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
                {permissions?.edicao === permissions?.edicao && (
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
                {permissions?.delecao === permissions?.delecao && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <CancelButton onClick={() => openDialog(rowData.cod_natureza_operacao)} />
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

export default NaturezaOperacao;
