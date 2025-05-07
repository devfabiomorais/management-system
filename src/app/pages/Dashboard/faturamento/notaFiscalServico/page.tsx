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
import { FaTrash, FaBan, FaPlus } from "react-icons/fa";
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

interface NotaFiscalServico {
  cod_natureza_operacao: number;
  nome: string;
  descricao?: string;
  situacao?: string;
}

const NotaFiscalServico: React.FC = () => {
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
  const [notasFiscaisServico, setNotasFiscaisServico] = useState<NotaFiscalServico[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);


  const filteredNotasFiscaisServico = notasFiscaisServico.filter((notaFiscalServico) => {
    // Apenas ATIVO aparecem
    if (notaFiscalServico.situacao !== 'Ativo') {
      return false;
    }

    // Lógica de busca
    return Object.values(notaFiscalServico).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });


  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [notasFiscaisServicoIdToDelete, setNotaFiscalServicoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedNotaFiscalServico, setSelectedNotaFiscalServico] = useState<NotaFiscalServico | null>(null);
  const [formValues, setFormValues] = useState<NotaFiscalServico>({
    cod_natureza_operacao: 0,
    nome: "",
    descricao: "",
  });

  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_natureza_operacao: 0,
      nome: "",
      descricao: "",
    });
  };

  const handleSaveEdit = async (cod_natureza_operacao: any) => {
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/notasFiscaisServico/edit/${cod_natureza_operacao}`,
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
        fetchNotasFiscaisServico();
        toast.success("Nota Fiscal de Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Nota Fiscal de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Nota Fiscal de Serviço:", error);
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
        process.env.NEXT_PUBLIC_API_URL + "/api/notasFiscaisServico/register",
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
        fetchNotasFiscaisServico();
        toast.success("Nota Fiscal de Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Nota Fiscal de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Nota Fiscal de Serviço:", error);
    }
  };

  const [rowData, setRowData] = useState<NotaFiscalServico[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
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

      const naturezaEncontrado = rowData.find((item) => item.nome === formValues.nome);
      const situacaoInativo = naturezaEncontrado?.situacao === "Inativo";

      if (naturezaEncontrado && !situacaoInativo) {
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

      if (naturezaEncontrado && situacaoInativo) {
        await handleSaveEdit(naturezaEncontrado.cod_natureza_operacao);
        fetchNotasFiscaisServico();
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
        process.env.NEXT_PUBLIC_API_URL + "/api/notasFiscaisServico/register",
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
        fetchNotasFiscaisServico();
        toast.success("Nota Fiscal de Serviço salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar Nota Fiscal de Serviços.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar Nota Fiscal de Serviços:", error);
    }
  };


  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (notasFiscaisServico: NotaFiscalServico, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(notasFiscaisServico);
    setSelectedNotaFiscalServico(notasFiscaisServico);
    setIsEditing(true);
    setVisible(true);
  };

  useEffect(() => {
    fetchNotasFiscaisServico();
  }, []);

  const fetchNotasFiscaisServico = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/notasFiscaisServico",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.notasFiscaisServico);
      setIsDataLoaded(true);
      setNotasFiscaisServico(response.data.notasFiscaisServico);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar Nota Fiscal de Serviços:", error);
    }
  };

  const openDialog = (id: number) => {
    setNotaFiscalServicoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setNotaFiscalServicoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (notasFiscaisServicoIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notasFiscaisServico/cancel/${notasFiscaisServicoIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchNotasFiscaisServico(); // Aqui é necessário chamar a função que irá atualizar a lista de naturezas de operacao
        setModalDeleteVisible(false);
        toast.success("Nota Fiscal de Serviço cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Nota Fiscal de Serviço.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao excluir Nota Fiscal de Serviço:", error);
      toast.error("Erro ao excluir Nota Fiscal de Serviço. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (notasFiscaisServicoIdToDelete === null) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notasFiscaisServico/${notasFiscaisServicoIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Nota Fiscal de Serviço removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchNotasFiscaisServico();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir Nota Fiscal de Serviço:", error);
      toast.error("Erro ao excluir Nota Fiscal de Serviço. Tente novamente.", {
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
            <p>Tem certeza que deseja cancelar este Nota Fiscal de Produto?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Nota Fiscal de Produto" : "Editar Nota Fiscal de Produto") : "Nova Nota Fiscal de Produto"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            style={{ width: "1100px" }}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="cod_nota_fiscal_produto" className="block text-blue font-medium">
                    Código
                  </label>
                  <input
                    type="text"
                    id="cod_nota_fiscal_produto"
                    name="cod_nota_fiscal_produto"
                    disabled={visualizando}
                    // value={formValues.cod_nota_fiscal_produto}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="serie" className="block text-blue font-medium">
                    Série
                  </label>
                  <input
                    type="text"
                    id="serie"
                    name="serie"
                    disabled={visualizando}
                    // value={formValues.serie}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="natureza" className="block text-blue font-medium">
                    Natureza da Operação
                  </label>
                  <input
                    type="text"
                    id="natureza"
                    name="natureza"
                    disabled={visualizando}
                    // value={formValues.natureza}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="tipo" className="block text-blue font-medium">
                    Tipo
                  </label>
                  <input
                    type="text"
                    id="tipo"
                    name="tipo"
                    disabled={visualizando}
                    // value={formValues.tipo}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="dt_emissao" className="block text-blue font-medium">
                    Data de Emissão
                  </label>
                  <input
                    type="text"
                    id="dt_emissao"
                    name="dt_emissao"
                    disabled={visualizando}
                    // value={formValues.dt_emissao}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="hr_emissao" className="block text-blue font-medium">
                    Hora de Emissão
                  </label>
                  <input
                    type="text"
                    id="hr_emissao"
                    name="hr_emissao"
                    disabled={visualizando}
                    // value={formValues.hr_emissao}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="dt_entrada_saida" className="block text-blue font-medium">
                    Data de Entrada/Saída
                  </label>
                  <input
                    type="text"
                    id="dt_entrada_saida"
                    name="dt_entrada_saida"
                    disabled={visualizando}
                    // value={formValues.dt_entrada_saida}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="hr_entrada_saida" className="block text-blue font-medium">
                    Hora de Entrada/Saída
                  </label>
                  <input
                    type="text"
                    id="hr_entrada_saida"
                    name="hr_entrada_saida"
                    disabled={visualizando}
                    // value={formValues.hr_entrada_saida}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label htmlFor="finalidade_emissao" className="block text-blue font-medium">
                    Finalidade de Emissão
                  </label>
                  <input
                    type="text"
                    id="finalidade_emissao"
                    name="finalidade_emissao"
                    disabled={visualizando}
                    // value={formValues.finalidade_emissao}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="forma_emissao" className="block text-blue font-medium">
                    Forma de Emissão
                  </label>
                  <input
                    type="text"
                    id="forma_emissao"
                    name="forma_emissao"
                    disabled={visualizando}
                    // value={formValues.forma_emissao}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="destinacao_operacao" className="block text-blue font-medium">
                    Destinação da Operação
                  </label>
                  <input
                    type="text"
                    id="destinacao_operacao"
                    name="destinacao_operacao"
                    disabled={visualizando}
                    // value={formValues.destinacao_operacao}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="tipo_atendimento" className="block text-blue font-medium">
                    Tipo de Atendimento
                  </label>
                  <input
                    type="text"
                    id="tipo_atendimento"
                    name="tipo_atendimento"
                    disabled={visualizando}
                    // value={formValues.tipo_atendimento}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="border border-gray-700 mt-2 mb-2 p-2 rounded bg-gray-100">
                <div className="grid">
                  <h3 className="text-blue pb-3 font-bold text-xl mr-2">Destinatário</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <label htmlFor="entidade" className="block text-blue font-medium">
                        Fornecedor/Cliente
                      </label>
                      <input
                        type="text"
                        id="entidade"
                        name="entidade"
                        disabled={visualizando}
                        // value={formValues.entidade}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="documento" className="block text-blue font-medium">
                        Documento (CNPJ/CPF)
                      </label>
                      <input
                        type="text"
                        id="documento"
                        name="documento"
                        disabled={visualizando}
                        // value={formValues.documento}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="razao_social" className="block text-blue font-medium">
                        Razão Social
                      </label>
                      <input
                        type="text"
                        id="razao_social"
                        name="razao_social"
                        disabled={visualizando}
                        // value={formValues.razao_social}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="tipo_contribuinte" className="block text-blue font-medium">
                        Tipo de Contribuinte
                      </label>
                      <input
                        type="text"
                        id="tipo_contribuinte"
                        name="tipo_contribuinte"
                        disabled={visualizando}
                        // value={formValues.tipo_contribuinte}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="inscricao_estadual" className="block text-blue font-medium">
                        Insc. Estadual
                      </label>
                      <input
                        type="text"
                        id="inscricao_estadual"
                        name="inscricao_estadual"
                        disabled={visualizando}
                        // value={formValues.inscricao_estadual}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="inscricao_municipal" className="block text-blue font-medium">
                        Inscrição Municipal
                      </label>
                      <input
                        type="text"
                        id="inscricao_municipal"
                        name="inscricao_municipal"
                        disabled={visualizando}
                        // value={formValues.inscricao_municipal}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="usar_endereco" className="block text-blue font-medium">
                        Usar Endereço
                      </label>
                      <input
                        type="text"
                        id="usar_endereco"
                        name="usar_endereco"
                        disabled={visualizando}
                        // value={formValues.usar_endereco}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="cep" className="block text-blue font-medium">
                        CEP
                      </label>
                      <input
                        type="text"
                        id="cep"
                        name="cep"
                        disabled={visualizando}
                        // value={formValues.cep}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="logradouro" className="block text-blue font-medium">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        id="logradouro"
                        name="logradouro"
                        disabled={visualizando}
                        // value={formValues.logradouro}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="numero" className="block text-blue font-medium">
                        Número
                      </label>
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        disabled={visualizando}
                        // value={formValues.numero}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="estado" className="block text-blue font-medium">
                        Estado
                      </label>
                      <input
                        type="text"
                        id="estado"
                        name="estado"
                        disabled={visualizando}
                        // value={formValues.estado}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="bairro" className="block text-blue font-medium">
                        Bairro
                      </label>
                      <input
                        type="text"
                        id="bairro"
                        name="bairro"
                        disabled={visualizando}
                        // value={formValues.bairro}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="cidade" className="block text-blue font-medium">
                        Cidade
                      </label>
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        disabled={visualizando}
                        // value={formValues.cidade}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {
                // #region produtos
              }
              <div className="border border-gray-700 p-2 rounded bg-gray-100">
                <div className="flex items-center">
                  <h3 className="text-blue font-bold text-xl mr-2">Produtos</h3>
                  <button
                    className="bg-green200 rounded-2xl transform transition-all duration-50 hover:scale-150 hover:bg-green400"
                    // onClick={() => setVisibleProd(true)}
                    disabled={visualizando}
                    style={{
                      padding: "0.1rem 0.1rem",
                      display: visualizando ? "none" : "block", // Controla visibilidade com display
                    }}
                  >
                    <IoAddCircleOutline
                      style={{ fontSize: "2rem" }}
                      className="text-white text-center"
                    />
                  </button>


                </div>
                <div style={{ height: "16px" }}></div>

                {/* Linha principal (para entrada de dados) */}
                <div className="grid grid-cols-5 gap-2">
                  <div>
                    <label htmlFor="produto" className="block text-blue font-medium">
                      Produto
                    </label>
                    <select
                      id="produto"
                      name="produto"
                      // value={selectedProd ? selectedProd.cod_item : ''}
                      disabled={visualizando}
                      // onChange={handleProdChange}
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    >
                      <option
                        value=''
                        disabled
                        selected
                      >
                        Selecione
                      </option>
                      {/* {produtos.map((produto) => (
                        <option key={produto.cod_item} value={produto.cod_item}>
                          {produto.descricao}
                        </option>
                      ))} */}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantidadeProd" className="block text-blue font-medium">
                      Quantidade
                    </label>
                    <input
                      id="quantidadeProd"
                      name="quantidadeProd"
                      type="number"
                      min="1"
                      defaultValue="1"
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      disabled={visualizando}
                    // value={quantidadeProd}
                    // onChange={handleQuantidadeProdChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="vl_unit_prod" className="block text-blue font-medium">
                      Valor Unitário
                    </label>
                    <input
                      id="vl_unit_prod"
                      name="vl_unit_prod"
                      type="text"
                      disabled
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    // value={new Intl.NumberFormat('pt-BR', {
                    //   style: 'decimal',
                    //   minimumFractionDigits: 2,
                    //   maximumFractionDigits: 2
                    // }).format(Number(formValuesProd.valor_venda ? formValuesProd.valor_venda : 0))}

                    />
                  </div>
                  <div>
                    <label htmlFor="descontoProd" className="block text-blue font-medium">
                      Desconto
                    </label>
                    <div className="relative">
                      <input
                        id="descontoProd"
                        name="descontoProd"
                        type="number"
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                        disabled={visualizando}
                        // value={descontoProd}
                        // onChange={handleDescontoProdChange}
                        step="0.01"
                        min={0}
                      // max={descontoUnitProd === "Percentual" ? 100 : quantidadeProd * Number(selectedProd?.valor_venda ?? 0)}
                      />
                      <select
                        id="descontoUnitProd"
                        name="descontoUnitProd"
                        // value={descontoUnitProd === "Percentual" ? "%prod" : "R$prod"} // Exibe % ou R$
                        disabled={visualizando}
                        // onChange={handleDescontoUnitProdChange}
                        // onMouseDown={(e) => {
                        //   e.preventDefault(); // Impede a abertura do select padrão
                        //   setDescontoUnitProd((prev) => (prev === "Percentual" ? "Reais" : "Percentual"));
                        // }}
                        className={`absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-50 px-1 ${visualizando ? 'hidden' : ''}`}

                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          background: "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)",
                          color: "black",
                          textAlign: "center",
                          border: "2px solid #6b7280",
                          borderRadius: "0",
                          paddingRight: "10px",
                          cursor: "pointer",
                          transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
                          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #f5f5f5 30%, #c0c0c0 100%)";
                          e.currentTarget.style.borderColor = "#4b5563";
                          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "linear-gradient(135deg, #fafafa 30%, #d3d3d3 100%)";
                          e.currentTarget.style.borderColor = "#6b7280";
                          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        <option value="%prod">&nbsp;%</option>
                        <option value="R$prod">&nbsp;R$</option>
                      </select>
                    </div>
                  </div>



                  <div className="flex flex-col items-start gap-1">
                    <label htmlFor="vl_total_prod" className="block text-blue font-medium">
                      Valor Total
                    </label>
                    <div className="flex items-center w-full">
                      <input
                        id="vl_total_prod"
                        name="vl_total_prod"
                        type="text"
                        disabled
                        className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                      // value={`R$ ${new Intl.NumberFormat('pt-BR', {
                      //   style: 'decimal',
                      //   minimumFractionDigits: 2,
                      //   maximumFractionDigits: 2
                      // }).format(Number(valorTotalProd ? valorTotalProd : 0))}`}
                      />
                      <button
                        className={`bg-green-200 border border-green-700 rounded-2xl p-1 hover:bg-green-300 duration-50 hover:scale-125 flex items-center justify-center ml-2 h-8 ${visualizando ? 'hidden' : ''}`}
                        disabled={visualizando}
                      // onClick={handleAdicionarLinha}
                      >
                        <FaPlus className="text-green-700 text-xl" />
                      </button>

                    </div>
                  </div>
                </div>

                <br></br>

                {/* Linhas adicionadas de produtos */}
                {/* {produtosSelecionados.map((produto, index) => (
                  <div key={`${produto.cod_item}-${index}`} className="grid grid-cols-5 gap-2">
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ?
                          (produto.descricao ?? ('dbs_itens' in produto ? (produto as any).dbs_itens?.descricao : produto.descricao)) :
                          ('dbs_itens' in produto ? (produto as any).dbs_itens?.descricao : produto.descricao)
                        }
                        disabled
                      />
                    </div>

                    <div>
                      <input
                        type="number"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.quantidade}
                        disabled
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ?
                          (produto.valor_venda ?? produto.valor_unitario) :
                          ('dbs_itens' in produto ? (produto as any).dbs_itens?.valor_venda : produto.valor_venda)
                        }
                        disabled
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={!isEditing ? (produto.descontoProd ?? produto.valor_desconto) : produto.valor_desconto}
                        disabled
                      />
                      <select
                        className="absolute right-0 top-0 h-full w-[50px] border-l border-gray-400 !bg-gray-200 px-1"
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          color: "gray",
                        }}
                        value={produto.descontoUnitProdtipo ?? produto.tipo_desconto}
                        disabled
                      >
                        <option value="%prod">&nbsp;&nbsp;&nbsp;%</option>
                        <option value="R$prod">&nbsp;&nbsp;R$</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200"
                        value={produto.valor_total}
                        disabled
                      />
                      <button
                        className={`bg-red-200 rounded p-2 flex h-[30px] w-[30px] items-center justify-center hover:scale-150 duration-50 transition-all ${visualizando ? 'hidden' : ''}`}
                        onClick={() => handleRemoveLinhaProd(produto.id)}
                      >
                        <FaTimes className="text-red text-2xl" />
                      </button>

                    </div>

                  </div>
                ))} */}

              </div>
              {
                //#endregion
              }

              <div className="border border-gray-700 mt-2 mb-2 p-2 rounded bg-gray-100">
                <div className="grid">
                  <h3 className="text-blue font-bold pb-3 text-xl mr-2">Transporte</h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-3">
                      <label htmlFor="transportadora" className="block text-blue font-medium">
                        Transportadora
                      </label>
                      <input
                        type="text"
                        id="transportadora"
                        name="transportadora"
                        disabled={visualizando}
                        // value={formValues.transportadora}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="documento" className="block text-blue font-medium">
                        Documento (CNPJ/CPF)
                      </label>
                      <input
                        type="text"
                        id="documento"
                        name="documento"
                        disabled={visualizando}
                        // value={formValues.documento}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="razao_social" className="block text-blue font-medium">
                        Razão Social
                      </label>
                      <input
                        type="text"
                        id="razao_social"
                        name="razao_social"
                        disabled={visualizando}
                        // value={formValues.razao_social}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="tipo_contribuinte" className="block text-blue font-medium">
                        Tipo de Contribuinte
                      </label>
                      <input
                        type="text"
                        id="tipo_contribuinte"
                        name="tipo_contribuinte"
                        disabled={visualizando}
                        // value={formValues.tipo_contribuinte}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="inscricao_estadual" className="block text-blue font-medium">
                        Insc. Estadual
                      </label>
                      <input
                        type="text"
                        id="inscricao_estadual"
                        name="inscricao_estadual"
                        disabled={visualizando}
                        // value={formValues.inscricao_estadual}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="inscricao_municipal" className="block text-blue font-medium">
                        Inscrição Municipal
                      </label>
                      <input
                        type="text"
                        id="inscricao_municipal"
                        name="inscricao_municipal"
                        disabled={visualizando}
                        // value={formValues.inscricao_municipal}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="usar_endereco" className="block text-blue font-medium">
                        Usar Endereço
                      </label>
                      <input
                        type="text"
                        id="usar_endereco"
                        name="usar_endereco"
                        disabled={visualizando}
                        // value={formValues.usar_endereco}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="cep" className="block text-blue font-medium">
                        CEP
                      </label>
                      <input
                        type="text"
                        id="cep"
                        name="cep"
                        disabled={visualizando}
                        // value={formValues.cep}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="logradouro" className="block text-blue font-medium">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        id="logradouro"
                        name="logradouro"
                        disabled={visualizando}
                        // value={formValues.logradouro}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="numero" className="block text-blue font-medium">
                        Número
                      </label>
                      <input
                        type="text"
                        id="numero"
                        name="numero"
                        disabled={visualizando}
                        // value={formValues.numero}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="estado" className="block text-blue font-medium">
                        Estado
                      </label>
                      <input
                        type="text"
                        id="estado"
                        name="estado"
                        disabled={visualizando}
                        // value={formValues.estado}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="bairro" className="block text-blue font-medium">
                        Bairro
                      </label>
                      <input
                        type="text"
                        id="bairro"
                        name="bairro"
                        disabled={visualizando}
                        // value={formValues.bairro}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="cidade" className="block text-blue font-medium">
                        Cidade
                      </label>
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        disabled={visualizando}
                        // value={formValues.cidade}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label htmlFor="uf_veiculo" className="block text-blue font-medium">
                        UF do Veículo
                      </label>
                      <input
                        type="text"
                        id="uf_veiculo"
                        name="uf_veiculo"
                        disabled={visualizando}
                        // value={formValues.uf_veiculo}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="placa_veiculo" className="block text-blue font-medium">
                        Placa Veículo
                      </label>
                      <input
                        type="text"
                        id="placa_veiculo"
                        name="placa_veiculo"
                        disabled={visualizando}
                        // value={formValues.placa_veiculo}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="reg_nac_trans_carge" className="block text-blue font-medium">
                        Reg. Nac. Trans. Carga
                      </label>
                      <input
                        type="text"
                        id="reg_nac_trans_carge"
                        name="reg_nac_trans_carge"
                        disabled={visualizando}
                        // value={formValues.reg_nac_trans_carge}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                    <div>
                      <label htmlFor="modalidade" className="block text-blue font-medium">
                        Modalidade
                      </label>
                      <input
                        type="text"
                        id="modalidade"
                        name="modalidade"
                        disabled={visualizando}
                        // value={formValues.modalidade}
                        onChange={handleInputChange}
                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      />
                    </div>
                  </div>
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
                  Nota Fiscal de Produto
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
                value={filteredNotasFiscaisServico.slice(first, first + rows)}
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
                  field="numero"
                  header="Número"
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
                  field="pedido"
                  header="Pedido"
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
                  field="data"
                  header="Data"
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
                    const data = rowData.data;
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
                  field="destinatario"
                  header="Destinatário"
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
                  field="natureza_operacao"
                  header="Natureza da Operação"
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
                  field="situacao"
                  header="Situação"
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
                  field="valor"
                  header="Valor"
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

export default NotaFiscalServico;
