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
import { FaTrash } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";

interface Transportadora {
  cod_transportadora: number;
  nome: string;
  logradouro?: string;
  cidade?: string;
  bairro?: string;
  estado?: string;
  complemento?: string;
  numero?: number;
  cep?: string;
  tipo: string;
  responsavel: string;
  observacoes: string;
  email: string;
  celular: string;
  telefone: string;
  dtCadastro?: string;
  estabelecimento: number;
  situacao?: string;
}

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

const TransportadorasPage: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Comercial");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");
  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] =
    useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [transportadoras, setTransportadoras] = useState<Transportadora[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredTransportadoras = transportadoras.filter((transportadora) => {
    // Apenas ATIVO aparecem
    if (transportadora.situacao !== 'Ativo') {
      return false;
    }

    // Função de busca
    return Object.values(transportadora).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });


  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [transportadoraIdToDelete, setTransportadoraIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedTransportadora, setSelectedTransportadora] = useState<Transportadora | null>(null);
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstabilishment, setSelectedEstabilishment] = useState<Establishment | null>(null);
  const [formValues, setFormValues] = useState<Transportadora>({
    cod_transportadora: 0,
    nome: "",
    observacoes: "",
    tipo: "",
    telefone: "",
    celular: "",
    responsavel: "",
    email: "",
    logradouro: "",
    cidade: "",
    bairro: "",
    estado: "",
    complemento: "",
    numero: undefined,
    cep: "",
    // situacao: "",        
    estabelecimento: 0,
  });
  const [tipos, setTipos] = useState<string[]>([]);

  // Função para buscar os tipos
  const fetchTipos = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:9009/api/transportadoras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.tipos); // Verifique se o campo correto está sendo retornado
      setTipos(response.data.tipos); // Armazena os tipos retornados
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar tipos:", error);
    }
  };

  // Função para buscar transportadoras
  const fetchTransportadoras = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:9009/api/transportadoras", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRowData(response.data.transportadoras);
      setIsDataLoaded(true);
      setTransportadoras(response.data.transportadoras);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar transportadoras:", error);
    }
  };



  const [formValuesEstablishments, setFormValuesEstablishments] = useState<Establishment>({
    cod_estabelecimento: 0,
    nome: "",
    logradouro: "",
    cidade: "",
    bairro: "",
    estado: "",
    complemento: "",
    numero: 0,
    cep: "",
  });

  const clearInputs = () => {
    setFormValues({
      cod_transportadora: 0,
      nome: "",
      observacoes: "",
      tipo: "",
      telefone: "",
      celular: "",
      responsavel: "",
      email: "",
      logradouro: "",
      cidade: "",
      bairro: "",
      estado: "",
      complemento: "",
      numero: 0,
      cep: "",
      // situacao: "",        
      estabelecimento: 0,
    });
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleSaveEdit = async () => {
    setItemEditDisabled(true);
    setLoading(true);
    setIsEditing(false);
    try {
      const requiredFields = [
        "nome",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "cep",
        "email",
        "telefone",
        "celular",
        "situacao",
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

      const response = await axios.put(
        `http://localhost:9009/api/transportadoras/edit/${selectedTransportadora?.cod_transportadora}`,
        formValues,
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
        fetchTransportadoras();
        toast.success("Transportadora salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar transportadora.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar transportadora:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleSave = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "tipo",
        "telefone",
        "celular",
        "responsavel",
        "complemento",
        "email",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "numero",
        "cep",
        "cod_estabel",
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

      // Verifica se o código do estabelecimento é válido
      const estabelecimento = selectedEstabilishment?.cod_estabelecimento;
      if (!estabelecimento) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Por favor, selecione um estabelecimento válido.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Envia os dados para o backend
      const response = await axios.post(
        "http://localhost:9009/api/transportadoras/register",
        {
          ...formValues,
          dbs_estabelecimentos_transportadora: {
            create: {
              cod_estabel: estabelecimento, // Agora usando 'cod_estabel' para o relacionamento correto
              dbs_estabelecimentos: {
                connect: {
                  cod_estabelecimento: estabelecimento, // Conectando com o estabelecimento correto
                },
              },
            },
          },
        },
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
        fetchTransportadoras();
        toast.success("Transportadora salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar transportadora.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar transportadora:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------
  const [rowData, setRowData] = useState<Transportadora[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async () => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
    try {
      const requiredFields = [
        "nome",
        "tipo",
        "telefone",
        "celular",
        "responsavel",
        "complemento",
        "email",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "numero",
        "cep",
        "cod_estabel",
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

      // Verifica se o código do estabelecimento é válido
      const estabelecimento = selectedEstabilishment?.cod_estabelecimento;
      if (!estabelecimento) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Por favor, selecione um estabelecimento válido.", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }

      // Verificar se o "nome" já existe no storedRowData
      const nomeExists = rowData.some((item) => item.nome === formValues.nome);

      if (nomeExists) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Esse nome já existe, escolha outro", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>, // Usa o emoji de alerta
        });

        return;
      }

      // Envia os dados para o backend
      const response = await axios.post(
        "http://localhost:9009/api/transportadoras/register",
        {
          ...formValues,
          dbs_estabelecimentos_transportadora: {
            create: {
              cod_estabel: estabelecimento, // Agora usando 'cod_estabel' para o relacionamento correto
              dbs_estabelecimentos: {
                connect: {
                  cod_estabelecimento: estabelecimento, // Conectando com o estabelecimento correto
                },
              },
            },
          },
        },
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
        fetchTransportadoras();
        toast.success("Transportadora salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar transportadora.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar transportadora:", error);
    }
  };


  // ---------------------------------------------------------------------------------------------------------------

  const handleEdit = (transportadora: Transportadora) => {
    setFormValues(transportadora);
    setSelectedTransportadora(transportadora);
    setIsEditing(true);
    setVisible(true);
  };

  // ---------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    fetchTransportadoras();
    fetchEstabilishments();
    fetchTipos();
  }, [token]);


  const fetchEstabilishments = async () => {
    setLoading(true)
    try {

      const response = await axios.get("http://localhost:9009/api/estabilishment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data.estabelecimentos)
      setEstablishments(response.data.estabelecimentos);
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error("Erro ao carregar estabelecimentos:", error);
    }
  };

  // ---------------------------------------------------------------------------------------------------------------

  const openDialog = (id: number) => {
    setTransportadoraIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setTransportadoraIdToDelete(null);
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleCancelar = async () => {
    if (transportadoraIdToDelete === null) return;

    try {
      const response = await axios.put(
        `http://localhost:9009/api/transportadoras/cancel/${transportadoraIdToDelete}`,
        {}, // Enviar um corpo vazio, caso necessário para o endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchTransportadoras(); // Atualizar a lista de transportadoras
        setModalDeleteVisible(false);
        toast.success("Transportadora cancelada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar transportadora.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar transportadora:", error);
      toast.error("Erro ao cancelar transportadora. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (transportadoraIdToDelete === null) return;

    try {
      await axios.delete(
        `http://localhost:9009/api/transportadoras/${transportadoraIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Transportadora removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchTransportadoras();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir transportadora:", error);
      toast.error("Erro ao excluir transportadora. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Obtém o "name" e o valor do input
    const numericValue = value.replace(/[^0-9]/g, ''); // Permite apenas números
    setFormValues({
      ...formValues,
      [name]: Number(numericValue), // Atualiza dinamicamente o campo com base no "name"
    });
  };

  // ---------------------------------------------------------------------------------------------------------------  

  const handleNumericKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (!/[0-9]/.test(char)) {
      e.preventDefault();
    }
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleAlphabeticInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // Obtém o "name" e o valor do input
    const alphabeticValue = value.replace(/[\d]/g, ''); // Remove apenas números
    setFormValues({
      ...formValues,
      [name]: alphabeticValue, // Atualiza dinamicamente o campo com base no "name"
    });
  };

  // ---------------------------------------------------------------------------------------------------------------  

  const handleAlphabeticKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    // Permite qualquer caractere que não seja número
    if (/[\d]/.test(char)) {
      e.preventDefault(); // Bloqueia a inserção de números
    }
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleCepInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove qualquer caractere não numérico
    const numericValue = value.replace(/[^0-9]/g, '');

    // Formata o CEP com o formato 'XXXXX-XXX'
    const formattedValue = numericValue.replace(
      /(\d{5})(\d{0,3})/,
      (match, p1, p2) => `${p1}-${p2}`
    );

    setFormValues({
      ...formValues,
      [name]: formattedValue, // Atualiza o campo de CEP com a formatação
    });
  };

  // ---------------------------------------------------------------------------------------------------------------  

  const handleCepKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (!/[0-9]/.test(char)) {
      e.preventDefault(); // Bloqueia a inserção de caracteres não numéricos
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
            header="Confirmar Exclusão"
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
            <p>Tem certeza que deseja excluir esta transportadora?</p>
          </Dialog>

          <Dialog
            header={isEditing ? "Editar Transportadora" : "Nova Transportadora"}
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
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formValues.nome}
                    onChange={handleAlphabeticInputChange} // Não permite números
                    onKeyPress={handleAlphabeticKeyPress} // Bloqueia números
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="tipo" className="block text-blue font-medium">
                    Tipo
                  </label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formValues.tipo}
                    onChange={(e) =>
                      setFormValues({ ...formValues, tipo: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="">Selecione</option>
                    <option value="PessoaFisica">Pessoa Física</option>
                    <option value="PessoaJuridica">Pessoa Jurídica</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="telefone" className="block text-blue font-medium">
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={formValues.telefone}
                    onChange={handleNumericInputChange} // Permite apenas números
                    onKeyPress={handleNumericKeyPress} // Bloqueia teclas que não sejam números
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label htmlFor="celular" className="block text-blue font-medium">
                    Celular
                  </label>
                  <input
                    type="text"
                    id="celular"
                    name="celular"
                    value={formValues.celular}
                    onChange={handleNumericInputChange} // Permite apenas números
                    onKeyPress={handleNumericKeyPress} // Bloqueia teclas que não sejam números
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    maxLength={15}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="responsavel" className="block text-blue font-medium">
                    Responsável
                  </label>
                  <input
                    type="text"
                    id="responsavel"
                    name="responsavel"
                    value={formValues.responsavel}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-blue font-medium">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="complemento" className="block text-blue font-medium">
                    Complemento
                  </label>
                  <input
                    type="text"
                    id="complemento"
                    name="complemento"
                    value={formValues.complemento}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="estabelecimento" className="block text-blue font-medium">
                    Estabelecimento
                  </label>
                  <select
                    id="estabelecimento"
                    name="cod_estabel"
                    value={selectedEstabilishment ? selectedEstabilishment.cod_estabelecimento : ''}
                    onChange={(e) => {
                      const selected = establishments.find(
                        (est) => est.cod_estabelecimento === Number(e.target.value)
                      );
                      setSelectedEstabilishment(selected || null);
                      if (selected) {
                        setFormValuesEstablishments(selected); // Atualiza os dados do estabelecimento
                        setFormValues((prevValues) => ({
                          ...prevValues,
                          cod_estabel: selected.cod_estabelecimento, // Atualiza o campo de estabelecimento
                        }));
                      }
                    }}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="">Selecione</option>
                    {establishments.map((estabelecimento) => (
                      <option key={estabelecimento.cod_estabelecimento} value={estabelecimento.cod_estabelecimento}>
                        {estabelecimento.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label htmlFor="observacoes" className="block text-blue font-medium">
                    Observações
                  </label>
                  <input
                    type="text"
                    id="observacoes"
                    name="observacoes"
                    value={formValues.observacoes}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="cep" className="block text-blue font-medium">
                    CEP
                  </label>
                  <input
                    type="text"
                    id="cep"
                    name="cep"
                    value={formValues.cep}
                    onChange={handleCepInputChange} // Formata o CEP enquanto digita
                    onKeyPress={handleCepKeyPress} // Bloqueia qualquer caractere não numérico
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    maxLength={9} // Limita o campo ao comprimento máximo do CEP formatado (XXXXX-XXX)
                  />
                </div>
                <div>
                  <label htmlFor="logradouro" className="block text-blue font-medium">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    id="logradouro"
                    name="logradouro"
                    value={formValues.logradouro}
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
                    type="number"
                    id="numero"
                    name="numero"
                    value={formValues.numero}
                    onChange={handleNumericInputChange} // Não permite letras
                    onKeyPress={handleNumericKeyPress} // Bloqueia letras
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
                <div>
                  <label htmlFor="estado" className="block text-blue font-medium">
                    Estado (sigla)
                  </label>
                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    value={formValues.estado}
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
                    value={formValues.bairro}
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
                    value={formValues.cidade}
                    onChange={handleAlphabeticInputChange} // Não permite números
                    onKeyPress={handleAlphabeticKeyPress} // Bloqueia números
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>
            </div>


            <div className="flex justify-between items-center  mt-16">
              <div className="grid grid-cols-3 gap-3">
                <Button
                  label="Sair Sem Salvar"
                  className="text-white"
                  icon="pi pi-times"
                  style={{
                    backgroundColor: "#dc3545",
                    border: "1px solid #dc3545",
                    padding: "0.5rem 1.5rem",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                  }}
                  onClick={() => closeModal()}
                />
                {!isEditing && (
                  <>
                    <Button
                      label="Salvar e Voltar à Listagem"
                      className="text-white"
                      icon="pi pi-refresh"
                      onClick={handleSaveReturn}
                      disabled={itemCreateReturnDisabled}
                      style={{
                        backgroundColor: "#007bff",
                        border: "1px solid #007bff",
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                    <Button
                      label="Salvar e Adicionar Outro"
                      className="text-white"
                      icon="pi pi-check"
                      onClick={handleSave}
                      disabled={itemCreateDisabled}
                      style={{
                        backgroundColor: "#28a745",
                        border: "1px solid #28a745",
                        padding: "0.5rem 1.5rem",
                        fontSize: "14px",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                      }}
                    />
                  </>
                )}

                {isEditing && (
                  <Button
                    label="Salvar"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={handleSaveEdit}
                    disabled={itemEditDisabled}
                    style={{
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                    }}
                  />
                )}
              </div>
            </div>
          </Dialog>

          <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">
                  Transportadoras
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
                value={filteredTransportadoras.slice(first, first + rows)}
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
                  field="cod_transportadora"
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
                  field="observacoes"
                  header="Observações"
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
                  field="telefone"
                  header="Telefone"
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
                  field="celular"
                  header="Celular"
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
                  field="responsavel"
                  header="Responsável"
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
                  field="dtCadastro"
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
                    const date = new Date(rowData.dtCadastro);
                    const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    }).format(date);

                    return <span>{formattedDate}</span>;
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


                {permissions?.edicao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(rowData)}
                          className="hover:scale-125 hover:bg-yellow700 p-2 bg-yellow transform transition-all duration-50  rounded-2xl"
                        >
                          <MdOutlineModeEditOutline className="text-white text-2xl" />
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
                          onClick={() => openDialog(rowData.cod_transportadora)}
                          className="bg-red hover:bg-red600 hover:scale-125 p-2 transform transition-all duration-50  rounded-2xl"
                        >
                          <FaTrash className="text-white text-2xl" />
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

export default TransportadorasPage;
