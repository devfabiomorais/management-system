"use client"
import React, { ChangeEvent, useEffect, useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from 'primereact/dialog';
import { IoAddCircleOutline } from "react-icons/io5";
import { Paginator } from "primereact/paginator";
import { FaBan, FaTrash } from "react-icons/fa";
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

interface Establishment {
    cod_estabelecimento: number;
    nome: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    complemento: string;
    estado: string;
    situacao?: string;
}

const EstablishmentsPage: React.FC = () => {
    const { groupCode } = useGroup();
    const { token } = useToken();
    const {
        permissions,
    } = useUserPermissions(groupCode ?? 0, "Controles");
    const [visible, setVisible] = useState(false);
    const [estabilishmentCreateDisabled, setEstabilishmentCreateDisabled] =
        useState(false);
    const [estabilishmentCreateReturnDisabled, setEstabilishmentCreateReturnDisabled] =
        useState(false);
    const [estabilishmentEditDisabled, setEstabilishmentEditDisabled] = useState(false);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [formValues, setFormValues] = useState<Establishment>({
        cod_estabelecimento: 0,
        nome: "",
        logradouro: "",
        cidade: "",
        bairro: "",
        estado: "",
        complemento: "",
        numero: "",
        cep: "",
    });
    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#B8D047");
    const [estabilishmentIdToDelete, setEstabilishmentIdToDelete] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedEstabilishment, setSelectedEstabilishment] = useState<Establishment | null>(null);
    const estados = [
        { sigla: "AC", nome: "Acre" },
        { sigla: "AL", nome: "Alagoas" },
        { sigla: "AP", nome: "Amapá" },
        { sigla: "AM", nome: "Amazonas" },
        { sigla: "BA", nome: "Bahia" },
        { sigla: "CE", nome: "Ceará" },
        { sigla: "DF", nome: "Distrito Federal" },
        { sigla: "ES", nome: "Espírito Santo" },
        { sigla: "GO", nome: "Goiás" },
        { sigla: "MA", nome: "Maranhão" },
        { sigla: "MT", nome: "Mato Grosso" },
        { sigla: "MS", nome: "Mato Grosso do Sul" },
        { sigla: "MG", nome: "Minas Gerais" },
        { sigla: "PA", nome: "Pará" },
        { sigla: "PB", nome: "Paraíba" },
        { sigla: "PR", nome: "Paraná" },
        { sigla: "PE", nome: "Pernambuco" },
        { sigla: "PI", nome: "Piauí" },
        { sigla: "RJ", nome: "Rio de Janeiro" },
        { sigla: "RN", nome: "Rio Grande do Norte" },
        { sigla: "RS", nome: "Rio Grande do Sul" },
        { sigla: "RO", nome: "Rondônia" },
        { sigla: "RR", nome: "Roraima" },
        { sigla: "SC", nome: "Santa Catarina" },
        { sigla: "SP", nome: "São Paulo" },
        { sigla: "SE", nome: "Sergipe" },
        { sigla: "TO", nome: "Tocantins" },
    ];
    const filteredEstablishments = establishments.filter((establishment) => {
        // Apenas ATIVO aparecem
        if (establishment.situacao !== 'Ativo') {
            return false;
        }

        // Função de busca
        return Object.values(establishment).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase())
        );
    });




    const clearInputs = () => {
        setVisualizar(false)
        setFormValues({
            cod_estabelecimento: 0,
            nome: "",
            logradouro: "",
            cidade: "",
            bairro: "",
            estado: "",
            complemento: "",
            numero: "",
            cep: "",
        })
    }

    const handleSaveEdit = async (cod_estabelecimento_recebido: any) => {
        if (!cod_estabelecimento_recebido) {
            console.log("cod_estabelecimento não recebido!")
            return
        }
        setLoading(true)

        try {
            const requiredFields = [
                "nome",
                "logradouro",
                "cidade",
                "numero",
                "bairro",
                "estado",
                "cep",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setEstabilishmentEditDisabled(true)
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/estabilishment/edit/${cod_estabelecimento_recebido}`,
                { ...formValues, situacao: "Ativo" },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            if (response.status >= 200 && response.status < 300) {
                setEstabilishmentEditDisabled(false)
                setLoading(false)
                clearInputs();
                fetchEstabilishments();
                toast.success("Estabelecimento salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
                setIsEditing(false);
            } else {
                setEstabilishmentEditDisabled(false)
                setLoading(false)
                toast.error("Erro ao salvar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setEstabilishmentEditDisabled(false)
            setLoading(false)
            console.error("Erro ao salvar estabelecimento:", error);
        }
    };

    const [rowData, setRowData] = useState<Establishment[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const handleSaveReturn = async (fecharModal: boolean) => {
        setEstabilishmentCreateReturnDisabled(true)
        setLoading(true)
        try {
            const requiredFields = [
                "nome",
                "logradouro",
                "cidade",
                "bairro",
                "numero",
                "estado",
                "cep",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setEstabilishmentCreateReturnDisabled(false)
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }


            const estabelecimentoEncontrado = rowData.find((estabel) => estabel.nome === formValues.nome);
            const situacaoInativo = estabelecimentoEncontrado?.situacao === "Inativo";

            if (estabelecimentoEncontrado && !situacaoInativo) {
                setEstabilishmentCreateReturnDisabled(false);
                setLoading(false);
                toast.info("Esse nome já existe no banco de dados, escolha outro!", {
                    position: "top-right",
                    autoClose: 3000,
                    progressStyle: { background: "yellow" },
                    icon: <span>⚠️</span>, // Usa o emoji de alerta
                });
                return;
            }

            if (estabelecimentoEncontrado && situacaoInativo) {
                await handleSaveEdit(estabelecimentoEncontrado.cod_estabelecimento); // Passa o serviço diretamente
                fetchEstabilishments();
                setEstabilishmentCreateReturnDisabled(false);
                setLoading(false);
                clearInputs();
                setVisible(fecharModal);
                toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
                    position: "top-right",
                    autoClose: 10000,
                    progressStyle: { background: "green" },
                    icon: <span>♻️</span>,
                });
                return;
            }

            const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment/register", formValues, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setEstabilishmentCreateReturnDisabled(false)
                setLoading(false)
                clearInputs();
                fetchEstabilishments();
                toast.success("Estabelecimento salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(fecharModal);
            } else {
                setEstabilishmentCreateReturnDisabled(false)
                setLoading(false)
                toast.error("Erro ao salvar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setEstabilishmentCreateReturnDisabled(false)
            setLoading(false)
            console.error("Erro ao salvar o estabelecimento:", error);
        }
    };

    const handleSave = async () => {
        setEstabilishmentCreateDisabled(true)
        setLoading(true)
        try {
            const requiredFields = [
                "nome",
                "logradouro",
                "cidade",
                "numero",
                "bairro",
                "estado",
                "cep",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setEstabilishmentCreateDisabled(false)
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment/register", formValues, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setEstabilishmentCreateDisabled(false)
                setLoading(false)
                clearInputs();
                fetchEstabilishments();
                toast.success("Estabelecimento salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setEstabilishmentCreateDisabled(false)
                setLoading(false)
                toast.error("Erro ao salvar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setEstabilishmentCreateDisabled(false)
            setLoading(false)
            console.error("Erro ao salvar o estabelecimento:", error);
        }
    };

    const [visualizando, setVisualizar] = useState<boolean>(false);

    const handleEdit = (estabelecimento: Establishment, visualizar: boolean) => {
        setVisualizar(visualizar);

        setFormValues(estabelecimento);
        setSelectedEstabilishment(estabelecimento);
        setIsEditing(true);
        setVisible(true);
    };


    useEffect(() => {
        fetchEstabilishments();
    }, []);

    const fetchEstabilishments = async () => {
        setLoading(true)
        try {

            const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/estabilishment", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRowData(response.data.estabelecimentos);
            setIsDataLoaded(true);
            setEstablishments(response.data.estabelecimentos);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error("Erro ao carregar clientes:", error);
        }
    };

    const openDialog = (estabelecimento: Establishment) => {
        setEstabilishmentIdToDelete(estabelecimento.cod_estabelecimento);
        setModalDeleteVisible(true);
    };

    const closeDialog = () => {
        setModalDeleteVisible(false);
        setEstabilishmentIdToDelete(null);
    };

    const handleCancelar = async () => {
        if (!estabilishmentIdToDelete) {
            console.log("estabilishmentIdToDelete está indefinido")
            return
        }

        try {
            const response = await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL}/api/estabilishment/cancel/${estabilishmentIdToDelete}`,
                {}, // Enviar um corpo vazio, caso necessário para o endpoint
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                fetchEstabilishments(); // Atualizar a lista de estabelecimentos
                setModalDeleteVisible(false);
                toast.success("Estabelecimento cancelado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                toast.error("Erro ao cancelar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.log("Erro ao cancelar estabelecimento:", error);
            toast.error("Erro ao cancelar estabelecimento. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };


    const handleDelete = async () => {
        if (estabilishmentIdToDelete === null) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/estabilishment/${estabilishmentIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Estabelecimento removido com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchEstabilishments();
            setModalDeleteVisible(false)
        } catch (error) {
            console.log("Erro ao excluir estabelecimento:", error);
            toast.error("Erro ao excluir estabelecimento. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
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

        // Atualiza o estado com o valor formatado
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


    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const closeModal = () => {
        clearInputs()
        setIsEditing(false)
        setVisible(false)
    }



    return (
        <><SidebarLayout>
            <div className="flex justify-center">

                {loading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <BeatLoader
                            color={color}
                            loading={loading}
                            size={30}
                            aria-label="Loading Spinner"
                            data-testid="loader" />
                    </div>
                )}


                <Dialog
                    header="Confirmar Exclusão"
                    visible={modalDeleteVisible}
                    style={{ width: "auto" }}
                    onHide={closeDialog}
                    footer={<div>
                        <Button
                            label="Não"
                            icon="pi pi-times"
                            onClick={closeDialog}
                            className="p-button-text bg-red text-white p-2 hover:bg-red700 transition-all" />
                        <Button
                            label="Sim"
                            icon="pi pi-check"
                            onClick={handleCancelar}
                            className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all" />
                    </div>}
                >
                    <p>Tem certeza que deseja excluir este estabelecimento?</p>
                </Dialog>

                <Dialog
                    header={isEditing ? (visualizando ? "Visualizando Estabelecimento" : "Editar Estabelecimento") : "Novo Estabelecimento"}
                    visible={visible}
                    headerStyle={{
                        backgroundColor: "#D9D9D9",
                        color: "#1B405D",
                        fontWeight: "bold",
                        padding: "0.8rem",
                        height: "3rem",
                    }}
                    className="w-[750px]"
                    onHide={() => closeModal()}
                >
                    <div
                        className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <label htmlFor="name" className="block text-blue font-medium">
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="nome"
                                    disabled={visualizando}
                                    value={formValues.nome}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
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
                                    placeholder="" />
                            </div>

                            <div>
                                <label htmlFor="street" className="block text-blue font-medium">
                                    Logradouro
                                </label>
                                <input
                                    type="text"
                                    id="street"
                                    name="logradouro"
                                    disabled={visualizando}
                                    value={formValues.logradouro}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>

                            <div>
                                <label htmlFor="number" className="block text-blue font-medium">
                                    Número
                                </label>
                                <input
                                    type="text"
                                    id="number"
                                    name="numero"
                                    value={formValues.numero}
                                    disabled={visualizando}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>


                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <div>
                                <label htmlFor="state" className="block text-blue font-medium">
                                    Estado
                                </label>
                                <select
                                    id="state"
                                    name="estado"
                                    value={formValues.estado}
                                    disabled={visualizando}
                                    onChange={(e) => setFormValues({ ...formValues, estado: e.target.value })}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                >
                                    <option value="">
                                        Selecione
                                    </option>
                                    {estados.map((estado) => (
                                        <option key={estado.sigla} value={estado.sigla}>
                                            {estado.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="city" className="block text-blue font-medium">
                                    Cidade
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="cidade"
                                    value={formValues.cidade}
                                    disabled={visualizando}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>

                            <div>
                                <label htmlFor="neighborHood" className="block text-blue font-medium">
                                    Bairro
                                </label>
                                <input
                                    type="text"
                                    id="neighborHood"
                                    name="bairro"
                                    disabled={visualizando}
                                    value={formValues.bairro}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>

                            <div>
                                <label htmlFor="complement" className="block text-blue font-medium">
                                    Complemento
                                </label>
                                <input
                                    type="text"
                                    id="complement"
                                    name="complemento"
                                    disabled={visualizando}
                                    value={formValues.complemento}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
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
                                        disabled={estabilishmentCreateReturnDisabled}
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
                                        disabled={estabilishmentCreateDisabled}
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
                                    onClick={() => handleSaveEdit(formValues.cod_estabelecimento)}
                                    disabled={estabilishmentEditDisabled}
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
">Estabelecimentos</h2>
                        </div>
                        {permissions?.insercao === permissions?.insercao && (
                            <div className="mr-2">
                                <RegisterButton onClick={() => { setVisible(true); }} title="Cadastrar" />
                            </div>
                        )}
                    </div>
                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col mt-2" style={{ height: "95%" }}>
                        <div className="mb-4 flex justify-end">
                            <p className="text-blue font-bold text-lg">Busca:</p>
                            <InputText
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder=""
                                className="p-inputtext-sm border rounded-md ml-1 text-black pl-1"
                                style={{ border: "1px solid #1B405D80", }} />
                        </div>
                        <DataTable
                            value={filteredEstablishments.slice(first, first + rows)}
                            paginator={true}
                            rows={rows}
                            rowsPerPageOptions={[5, 10]}
                            rowClassName={(data) => 'hover:bg-gray-200'}
                            onPage={(e) => {
                                setFirst(e.first);
                                setRows(e.rows);
                            }}
                            tableStyle={{
                                borderCollapse: 'collapse',
                                width: '100%',
                            }}
                            className="w-full tabela-limitada [&_td]:py-1 [&_td]:px-2"
                            responsiveLayout="scroll"
                        >
                            <Column field="cod_estabelecimento" header="Código" className="text-black"
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
                                }} />
                            <Column field="nome" header="Nome" className="text-black"
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
                                }} />
                            <Column field="cep" header="CEP" style={{
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
                                }} />
                            <Column field="logradouro" header="Logradouro" style={{
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
                                }} />
                            <Column field="numero" header="Número" style={{
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
                                }} />
                            <Column field="bairro" header="Bairro" style={{
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
                                }} />
                            <Column field="cidade" header="Cidade" style={{
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
                                }} />
                            <Column field="estado" header="UF" style={{
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
                                }} />
                            <Column field="situacao" header="Situação" style={{
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
                                }} />
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
                                    }} />
                            )}
                            {permissions?.delecao === permissions?.delecao && (
                                <Column
                                    header=""
                                    body={(rowData) => (
                                        <div className="flex gap-2 justify-center">
                                            <CancelButton onClick={() => openDialog(rowData)} />
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
                                    }} />
                            )}
                        </DataTable>

                        {/*<Paginator
        first={first}
        rows={rows}
        totalRecords={establishments.length}
        onPageChange={(e) => {
            setFirst(e.first);
            setRows(e.rows);
        }}
    />*/}
                    </div>
                </div>
            </div>
        </SidebarLayout><Footer /></>
    );
};

export default EstablishmentsPage;
