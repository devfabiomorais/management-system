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
import { MultiSelect } from "primereact/multiselect";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";

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
  estabelecimentos: [];
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
  const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
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
    estabelecimentos: [],
  });
  const [tipos, setTipos] = useState<string[]>([]);

  // Função para buscar os tipos
  const fetchTipos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/transportadoras", {
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
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/transportadoras", {
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



  const clearInputs = () => {
    setVisualizar(false)
    setSelectedEstablishments([]);
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
      estabelecimentos: [],
    });
  };

  // ---------------------------------------------------------------------------------------------------------------

  const handleSaveEdit = async (transportadora: any = selectedTransportadora) => {
    if (!transportadora?.cod_transportadora) {
      toast.error("Transportadora não selecionada ou inválida. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    setItemEditDisabled(true);
    setLoading(true);
    setIsEditing(false);

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/transportadoras/edit/${transportadora.cod_transportadora}`,
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
        fetchTransportadoras();
        toast.success("Transportadora salva com sucesso!", {
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
  const [rowData, setRowData] = useState<Transportadora[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = [
        "nome",
        "tipo",
        "telefone",
        "celular",
        "responsavel",
        "email",
        "logradouro",
        "cidade",
        "bairro",
        "estado",
        "numero",
        "cep",
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


      const transportadoraEncontrada = rowData.find((item) => item.nome === formValues.nome);
      const nomeExists = !!transportadoraEncontrada;
      const situacaoInativo = transportadoraEncontrada?.situacao === "Inativo";

      console.log("Transportadora encontrada:", transportadoraEncontrada);

      if (nomeExists && !situacaoInativo) {
        setItemCreateReturnDisabled(false);
        setLoading(false);
        toast.info("Esse nome já existe no banco de dados, escolha outro!", {
          position: "top-right",
          autoClose: 3000,
          progressStyle: { background: "yellow" },
          icon: <span>⚠️</span>,
        });
        return;
      }

      if (nomeExists && situacaoInativo && transportadoraEncontrada?.cod_transportadora) {
        await handleSaveEdit(transportadoraEncontrada);
        fetchTransportadoras();
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

      if (selectedEstablishments.length === 0) {
        toast.info("Você deve selecionar pelo menos um estabelecimento!", {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }


      const updatedFormValues = {
        ...formValues,
        estabelecimentos: selectedEstablishments,
      };


      // Se o nome não existir, cadastra a transportadora normalmente
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/transportadoras/register",
        updatedFormValues,
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
        setVisible(fecharTela);
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
  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (rowData: any, transportadora: Transportadora, visualizar: boolean) => {
    setVisualizar(visualizar);

    setFormValues(transportadora);
    setSelectedTransportadora(transportadora);
    setIsEditing(true);
    setVisible(true);

    // Filtra os estabelecimentos com base no cod_estabel
    const selectedEstablishmentsWithNames = rowData.dbs_estabelecimentos_transportadora.map(({ cod_estabel }: any) =>
      establishments.find((estab) => estab.cod_estabelecimento === cod_estabel)
    )
      .filter(Boolean); // Remove valores undefined (caso algum código não tenha correspondência)

    setSelectedEstablishments(selectedEstablishmentsWithNames);
  };

  // ---------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    fetchTransportadoras();
    fetchEstabilishments();
    fetchTipos();
  }, [token]);


  const fetchEstabilishments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const ativos = response.data.estabelecimentos.filter(
        (estab: any) => estab.situacao === "Ativo"
      );

      setEstablishments(ativos);
    } catch (error) {
      console.error("Erro ao carregar estabelecimentos:", error);
    } finally {
      setLoading(false);
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/transportadoras/cancel/${transportadoraIdToDelete}`,
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
        `${process.env.NEXT_PUBLIC_API_URL}/api/transportadoras/${transportadoraIdToDelete}`,
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
            header={isEditing ? (visualizando ? "Visualizando Transportadora" : "Editar Transportadora") : "Nova Transportadora"}
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

              <div className="grid gap-2">
                <div className="col-span-2">
                  <label htmlFor="nome" className="block text-blue font-medium">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    disabled={visualizando}
                    value={formValues.nome}
                    onChange={handleAlphabeticInputChange} // Não permite números
                    onKeyPress={handleAlphabeticKeyPress} // Bloqueia números
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
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
                      setFormValues({ ...formValues, tipo: e.target.value })
                    }
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  >
                    <option value="">Selecione</option>
                    <option value="PessoaFisica">Pessoa Física</option>
                    <option value="PessoaJuridica">Pessoa Jurídica</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="responsavel" className="block text-blue font-medium">
                    Responsável
                  </label>
                  <input
                    type="text"
                    id="responsavel"
                    name="responsavel"
                    disabled={visualizando}
                    value={formValues.responsavel}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>

                <div>
                  <label htmlFor="estabelecimento" className="block text-blue font-medium">
                    Estabelecimento
                  </label>
                  <MultiSelect
                    disabled={visualizando}
                    value={selectedEstablishments}
                    onChange={(e) => setSelectedEstablishments(e.value)}
                    options={establishments}
                    optionLabel="nome"
                    filter
                    placeholder="Selecione os Estabelecimentos"
                    maxSelectedLabels={3}
                    className="w-full border text-black h-[35px] flex items-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="celular" className="block text-blue font-medium">
                    Celular
                  </label>
                  <input
                    type="text"
                    id="celular"
                    name="celular"
                    disabled={visualizando}
                    value={formValues.celular}
                    onChange={handleCelularChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label htmlFor="telefone" className="block text-blue font-medium">
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
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div>
                  <label htmlFor="observacoes" className="block text-blue font-medium">
                    Observações
                  </label>
                  <textarea
                    id="obervacoes_gerais"
                    name="obervacoes_gerais"
                    disabled={visualizando}
                    value={formValues.observacoes || ""}
                    maxLength={255}
                    className={`w-full border border-gray-400 pl-1 rounded-sm h-24 `}

                    onChange={(e) => {
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        observacoes: e.target.value, // Atualiza o campo observacoes
                      }));
                    }}
                  />
                </div>
              </div>

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
                    maxLength={15}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
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
                    disabled={visualizando}
                    value={formValues.logradouro}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>

                <div>
                  <label htmlFor="numero" className="block text-blue font-medium">
                    Número
                  </label>
                  <input
                    type="number"
                    id="numero"
                    name="numero"
                    disabled={visualizando}
                    value={formValues.numero}
                    onChange={handleNumericInputChange} // Não permite letras
                    onKeyPress={handleNumericKeyPress} // Bloqueia letras
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">

                <div>
                  <label htmlFor="estado" className="block text-blue font-medium">
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
                  <label htmlFor="bairro" className="block text-blue font-medium">
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
                  <label htmlFor="cidade" className="block text-blue font-medium">
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


            <div className="flex justify-between items-center mt-16 w-full">
              <div className={`${visualizando ? "hidden" : ""} grid gap-3 w-full ${isEditing ? "grid-cols-2" : "grid-cols-3"}`}>
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
                      disabled={itemCreateReturnDisabled}
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
                      disabled={itemCreateDisabled}
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
                    onClick={() => { handleSaveEdit(formValues) }}
                    disabled={itemEditDisabled}
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
                )}
              </div>
            </div>

          </Dialog>

          <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
            <div className="flex justify-between">
              <div>
                <h2 className=" text-blue text-2xl font-extrabold mb-3 pl-3 mt-1
">
                  Transportadoras
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
                className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2"
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
                    const date = new Date(rowData.dtCadastro);
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
                  field="situacao"
                  header="Situação"
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
                  header=""
                  body={(rowData) => (
                    <div className="flex gap-2 justify-center">
                      <ViewButton onClick={() => handleEdit(rowData, rowData, true)} />
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
                        <EditButton onClick={() => handleEdit(rowData, rowData, false)} />
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
                        <CancelButton onClick={() => openDialog(rowData.cod_transportadora)} />
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
