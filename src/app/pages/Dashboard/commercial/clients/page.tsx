"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
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
import { FaBullseye } from "react-icons/fa6";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";

interface Client {
  cod_cliente: number;
  codigo?: number;
  nome: string;
  logradouro?: string;
  cidade?: string;
  bairro?: string;
  estado?: string;
  complemento?: string;
  numero?: string;
  cep?: string;
  tipo: string;
  situacao: string;
  email: string;
  celular: string;
  telefone: string;
  dtCadastro?: string;
  documento?: string;
  insc_estadual?: string;
  insc_municipal?: string;
}

const ClientsPage: React.FC = () => {
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
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);
  const filteredClients = clients.filter((client) => {
    // Verifica se a situação do cliente é "Ativo"
    if (client.situacao !== 'ATIVO') {
      return false;
    }

    // Função de busca para os valores dos campos
    return Object.values(client).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });


  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formValues, setFormValues] = useState<Client>({
    cod_cliente: 0,
    nome: "",
    logradouro: "",
    cidade: "",
    bairro: "",
    estado: "",
    complemento: "",
    numero: "",
    cep: "",
    email: "",
    telefone: "",
    celular: "",
    situacao: "",
    tipo: "",
    documento: "",
    insc_estadual: "",
    insc_municipal: "",
  });

  const [isValidEmail, setIsValidEmail] = useState(true);
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Formatação do email - aqui você pode implementar a formatação conforme necessário
    setFormValues({ ...formValues, email: value });
  };
  const handleEmailBlur = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValid = emailRegex.test(formValues.email);

    setIsValidEmail(isValid); // Atualiza a cor do input com base na validade
  };

  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_cliente: 0,
      nome: "",
      logradouro: "",
      cidade: "",
      bairro: "",
      estado: "",
      complemento: "",
      numero: "",
      cep: "",
      email: "",
      telefone: "",
      celular: "",
      situacao: "default",
      tipo: "default",
      documento: "",
      insc_estadual: "",
      insc_municipal: "",
    });
  };

  const handleSaveEdit = async () => {
    setItemEditDisabled(true);
    setLoading(true);

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
        "documento",
        "insc_estadual",
        "insc_municipal",
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/edit/${selectedClient?.cod_cliente}`,
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
        fetchClients();
        toast.success("Cliente salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar cliente.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar cliente:", error);
    }
  };


  const [rowData, setRowData] = useState<Client[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);
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
        "documento",
        "insc_estadual",
        "insc_municipal",
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

      // Buscar o cliente uma única vez
      const clienteEncontrado = rowData.find((cliente) => cliente.nome === formValues.nome);
      const situacaoInativo = clienteEncontrado?.situacao === "DESATIVADO";


      if (clienteEncontrado && !situacaoInativo) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Esse nome já existe, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>, // Usa o emoji de alerta
        });
        return;

      } else if (clienteEncontrado && situacaoInativo) {
        setSelectedClient(clienteEncontrado);
        handleSaveEdit();
        setItemCreateReturnDisabled(false);
        setLoading(false);
        clearInputs();
        fetchClients();
        setVisible(fecharTela);
        toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
          position: "top-right",
          autoClose: 10000,
          progressStyle: { background: "green" },
          icon: <span>♻️</span>, // Usa o emoji de alerta
        });

        return;
      }

      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/clients/register",
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
        fetchClients();
        toast.success("Cliente salvo com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(fecharTela);
      } else {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.error("Erro ao salvar cliente.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemCreateReturnDisabled(false);
      setLoading(false);
      console.error("Erro ao salvar cliente:", error);
    }
  };

  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (client: Client, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(client);
    setSelectedClient(client);
    setIsEditing(true);
    setVisible(true);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        process.env.NEXT_PUBLIC_API_URL + "/api/clients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRowData(response.data.clients);
      setIsDataLoaded(true);
      setClients(response.data.clients);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const openDialog = (id: number) => {
    setClientIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setClientIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (clientIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/cancel/${clientIdToDelete}`, // Supondo que o endpoint de cancelamento seja PUT
        {}, // Enviar um corpo vazio, caso necessário para o endpoint
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        fetchClients(); // Atualiza a lista de clientes
        setModalDeleteVisible(false);
        toast.success("Cliente cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar cliente.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar cliente:", error);
      toast.error("Erro ao cancelar cliente. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleDelete = async () => {
    if (clientIdToDelete === null) return;

    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/clients/${clientIdToDelete}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Cliente removido com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchClients();
      setModalDeleteVisible(false);
    } catch (error) {
      console.log("Erro ao excluir cliente:", error);
      toast.error("Erro ao excluir cliente. Tente novamente.", {
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

  const formatTelefoneFixo = (telefone: string) => {
    if (!telefone) return "";

    let value = telefone.replace(/\D/g, ""); // Remove tudo que não for número

    if (value.length === 10) {
      // Formato telefone fixo: (99) 9999-9999
      return value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return telefone; // Retorna como está se não tiver 10 dígitos
  };


  const formatCelular = (celular: string) => {
    if (!celular) return "";

    let value = celular.replace(/\D/g, ""); // Remove tudo que não for número
    let formattedValue = value;

    if (value.length === 11) {
      // Formato celular com 9 dígitos: (99) 9 9999-9999
      formattedValue = value.replace(/^(\d{2})(\d)(\d{4})(\d{4})$/, "($1) $2 $3-$4");
    } else if (value.length === 10) {
      // Formato telefone fixo com 8 dígitos: (99) 9999-9999
      formattedValue = value.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
    }

    return formattedValue;
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    let formattedValue = value;

    if (value.length > 2) {
      // Adiciona o DDD entre parênteses
      formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }

    if (value.length === 11) {
      // Formato para celular com 9 dígitos: (99) 9 9999-9999
      formattedValue = formattedValue.replace(/^(\(\d{2}\)) (\d)(\d{4})(\d{4})$/, "$1 $2 $3-$4");
    } else if (value.length >= 10) {
      // Formato para telefone fixo (8 dígitos após o DDD): (99) 9999-9999
      formattedValue = formattedValue.replace(/^(\(\d{2}\)) (\d{4})(\d{4})$/, "$1 $2-$3");
    }

    // Atualiza o estado com a versão formatada
    setFormValues((prevValues) => ({
      ...prevValues,
      celular: formattedValue,
    }));
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    let formattedValue = value;

    if (value.length > 2) {
      // Adiciona o DDD entre parênteses
      formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    }

    if (value.length === 11) {
      // Formato para celular com 9 dígitos: (99) 9 9999-9999
      formattedValue = formattedValue.replace(/^(\(\d{2}\)) (\d)(\d{4})(\d{4})$/, "$1 $2 $3-$4");
    } else if (value.length >= 10) {
      // Formato para telefone fixo (8 dígitos após o DDD): (99) 9999-9999
      formattedValue = formattedValue.replace(/^(\(\d{2}\)) (\d{4})(\d{4})$/, "$1 $2-$3");
    }

    // Atualiza o estado com a versão formatada
    setFormValues((prevValues) => ({
      ...prevValues,
      telefone: formattedValue,
    }));
  };


  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');

    // Formata o CEP como 'XXXXX-XXX'
    let formattedValue = numericValue;
    if (numericValue.length > 5) {
      formattedValue = `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
    }

    // Atualiza o estado do formulário
    setFormValues(prevValues => ({
      ...prevValues,
      [name]: formattedValue,
    }));

    // Se o CEP tiver 8 dígitos, faz a busca do endereço
    if (numericValue.length === 8) {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${numericValue}/json/`);

        if (!response.data.erro) {
          setFormValues(prevValues => ({
            ...prevValues,
            logradouro: response.data.logradouro || "",
            bairro: response.data.bairro || "",
            cidade: response.data.localidade || "",
            estado: response.data.uf || "",
          }));
        } else {
          alert("CEP não encontrado!");
          setFormValues(prevValues => ({
            ...prevValues,
            logradouro: "",
            bairro: "",
            cidade: "",
            estado: "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
      }
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

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
    let formattedValue = value;

    if (value.length <= 11) {
      // CPF: ###.###.###-##
      formattedValue = value
        .replace(/^(\d{3})(\d)/, "$1.$2")
        .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
    } else {
      // CNPJ: ##.###.###/####-##
      formattedValue = value
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
    }

    // Atualiza o estado com a versão formatada
    setFormValues((prevValues) => ({
      ...prevValues,
      documento: formattedValue,
    }));
  };



  const handleAlphabeticKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    // Permite qualquer caractere que não seja número
    if (/[\d]/.test(char)) {
      e.preventDefault(); // Bloqueia a inserção de números
    }
  };

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
            <p>Tem certeza que deseja excluir este cliente?</p>
          </Dialog>

          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Cliente" : "Editar Cliente") : "Novo Cliente"}
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
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formValues.nome}
                    disabled={visualizando} // Desabilita o campo se visualizando
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
                    disabled={visualizando}
                    value={formValues.tipo || "default"}
                    defaultValue={"default"}
                    onChange={(e) =>
                      setFormValues({ ...formValues, tipo: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default" disabled>Selecione</option>
                    <option value="Pessoa_F_sica">Pessoa Física</option>
                    <option value="Pessoa_Jur_dica">Pessoa Jurídica</option>
                    <option value="Estrangeiro">Pessoa Estrangeira</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="email" className="block text-blue font-medium">
                    E-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    disabled={visualizando}
                    value={formValues.email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur} // Chama a função de validação ao sair do campo
                    className={`w-full border pl-1 rounded-sm h-8 ${isValidEmail ? "border-[#D9D9D9]" : "border-red500"}`} // Altera a cor do border se o email for inválido
                    style={{ outline: "none" }}
                    placeholder="nome@empresa.com"
                  />
                  {!isValidEmail && <p className="text-red-500 text-sm mt-1">Por favor, insira um email válido.</p>} {/* Mensagem de erro */}
                </div>

                <div>
                  <label htmlFor="documento" className="block text-blue font-medium">
                    Documento
                  </label>
                  <input
                    type="text"
                    id="documento"
                    name="documento"
                    disabled={visualizando}
                    placeholder="CPF ou CNPJ"
                    value={formValues.documento}
                    onChange={handleDocumentChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    minLength={14}
                    maxLength={18}
                  />
                </div>

              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="insc_municipal" className="block text-blue font-medium">
                    Inscrição Municipal
                  </label>
                  <input
                    type="text"
                    id="insc_municipal"
                    name="insc_municipal"
                    disabled={visualizando}
                    value={formValues.insc_municipal}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    style={{ outline: "none" }}
                  />
                </div>

                <div>
                  <label htmlFor="insc_estadual" className="block text-blue font-medium">
                    Inscrição Estadual
                  </label>
                  <input
                    type="text"
                    id="insc_estadual"
                    name="insc_estadual"
                    disabled={visualizando}
                    value={formValues.insc_estadual}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    style={{ outline: "none" }}
                  />
                </div>

              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label
                    htmlFor="celular"
                    className="block text-blue font-medium"
                  >
                    Celular
                  </label>
                  <input
                    type="text"
                    id="celular"
                    disabled={visualizando}
                    name="celular"
                    value={formValues.celular}
                    onChange={handleCelularChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    maxLength={15}
                  />
                </div>
                <div>
                  <label
                    htmlFor="telefone"
                    className="block text-blue font-medium"
                  >
                    Telefone
                  </label>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    disabled={visualizando}
                    value={formValues.telefone}
                    onChange={handleTelefoneChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    maxLength={14}
                  />
                </div>

              </div>
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Endereço</h2>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="cep" className="block text-blue font-medium">
                      CEP
                    </label>
                    <input
                      type="text"
                      id="cep"
                      name="cep"
                      disabled={visualizando}
                      value={formValues.cep}
                      onChange={handleCepChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                      maxLength={15} // Limita o campo ao comprimento máximo do CEP formatado (XXXXX-XXX)
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="logradouro"
                      className="block text-blue font-medium"
                    >
                      Logradouro
                    </label>
                    <input
                      type="text"
                      id="logradouro"
                      name="logradouro"
                      disabled={visualizando}
                      value={formValues.logradouro}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="numero"
                      className="block text-blue font-medium"
                    >
                      Número
                    </label>
                    <input
                      type="text"
                      id="numero"
                      name="numero"
                      disabled={visualizando}
                      value={formValues.numero}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">

                  <div>
                    <label
                      htmlFor="estado"
                      className="block text-blue font-medium"
                    >
                      Estado
                    </label>
                    <input
                      type="text"
                      id="estado"
                      name="estado"
                      disabled={visualizando}
                      value={formValues.estado}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="bairro"
                      className="block text-blue font-medium"
                    >
                      Bairro
                    </label>
                    <input
                      type="text"
                      id="bairro"
                      name="bairro"
                      disabled={visualizando}
                      value={formValues.bairro}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="cidade"
                      className="block text-blue font-medium"
                    >
                      Cidade
                    </label>
                    <input
                      type="text"
                      id="cidade"
                      name="cidade"
                      disabled={visualizando}
                      value={formValues.cidade}
                      onChange={handleAlphabeticInputChange} // Não permite números
                      onKeyPress={handleAlphabeticKeyPress} // Bloqueia números
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
                      disabled={visualizando}
                      value={formValues.complemento}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>

                </div>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-1">
                <div>
                  <label
                    htmlFor="situacao"
                    className="block text-blue font-medium"
                  >
                    Situação
                  </label>
                  <select
                    id="situacao"
                    name="situacao"
                    disabled={visualizando}
                    value={formValues.situacao}
                    defaultValue={"default"}
                    onChange={(e) =>
                      setFormValues({ ...formValues, situacao: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="default">Selecione</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="DESATIVADO">Inativo</option>
                  </select>
                </div>
              </div>
            </div>

            <br></br>

            <div className={`${visualizando ? "hidden" : ""} grid gap-3 h-[50px] w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
              <Button
                label="Sair Sem Salvar"
                className="text-white"
                icon="pi pi-times"
                style={{
                  backgroundColor: "#dc3545",
                  border: "1px solid #dc3545",
                  padding: "0.5rem 3.2rem",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
                onClick={() => closeModal()}
              />

              {!isEditing ? (
                <>
                  <Button
                    label="Salvar e Voltar à Listagem"
                    className="text-white"
                    icon="pi pi-refresh"
                    onClick={() => { handleSaveReturn(false) }}
                    disabled={itemCreateReturnDisabled || !isValidEmail}
                    style={{
                      backgroundColor: "#007bff",
                      border: "1px solid #007bff",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  />
                  <Button
                    label="Salvar e Adicionar Outro"
                    className="text-white"
                    icon="pi pi-check"
                    onClick={() => { handleSaveReturn(true) }}
                    disabled={itemCreateDisabled || !isValidEmail}
                    style={{
                      backgroundColor: "#28a745",
                      border: "1px solid #28a745",
                      padding: "0.5rem 1.5rem",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "100%",
                    }}
                  />
                </>
              ) : (
                <Button
                  label="Salvar"
                  className="text-white"
                  icon="pi pi-check"
                  onClick={handleSaveEdit}
                  disabled={itemEditDisabled || !isValidEmail}
                  style={{
                    backgroundColor: "#28a745",
                    border: "1px solid #28a745",
                    padding: "0.5rem 5.5rem",
                    fontSize: "14px",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                />
              )}
            </div>


          </Dialog>

          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className=" text-blue text-2xl font-extrabold mb-3 pl-3 mt-1
">
                  Clientes
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
                value={filteredClients.slice(first, first + rows)}
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
                  field="cod_cliente"
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
                  header="Nome Completo"
                  style={{
                    width: "20%",
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
                  field="tipo"
                  header="Tipo"
                  style={{
                    width: "11%",
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
                  body={(rowData: {
                    tipo: "Pessoa_Jur_dica" | "Pessoa_F_sica" | "Estrangeiro";
                  }) => {
                    // Mapeia os valores do tipo para os valores legíveis
                    const tipoMap: Record<
                      "Pessoa_Jur_dica" | "Pessoa_F_sica" | "Estrangeiro",
                      string
                    > = {
                      Pessoa_Jur_dica: "Pessoa Jurídica",
                      Pessoa_F_sica: "Pessoa Física",
                      Estrangeiro: "Estrangeiro",
                    };

                    const tipoExibido = tipoMap[rowData.tipo] || rowData.tipo;

                    return <span>{tipoExibido}</span>;
                  }}
                />

                <Column
                  field="email"
                  header="E-mail"
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
                  field="celular"
                  header="Celular"
                  body={(rowData) => formatCelular(rowData.celular)}
                  style={{
                    width: "11%",
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
                  body={(rowData) => formatTelefoneFixo(rowData.telefone)}
                  style={{
                    width: "11%",
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
                  field="dt_hr_criacao"
                  header="DT Cadastro"
                  style={{
                    width: "12%",
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
                        <CancelButton onClick={() => openDialog(rowData.cod_cliente)} />
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

export default ClientsPage;
