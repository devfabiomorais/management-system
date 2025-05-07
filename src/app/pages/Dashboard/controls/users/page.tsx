"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { redirect } from "next/navigation";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from 'primereact/dialog';
import { MdOutlineModeEditOutline, MdVisibility } from "react-icons/md";
import { FaTrash, FaBan } from "react-icons/fa";
import { IoAddCircleOutline } from "react-icons/io5";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { MultiSelect } from "primereact/multiselect";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import { handleClientScriptLoad } from "next/script";
import CancelButton from "@/app/components/Buttons/CancelButton";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";

interface User {
    cod_usuario: number;
    nome: string;
    usuario: string;
    email: string;
    situacao: string;
    nomeGrupo?: string;
    cod_grupo: number;
    dbs_estabelecimentos_usuario?: {
        cod_estabel_usuario: number;
        cod_usuario: number;
        cod_estabel: number;
    }
}

export interface Establishment {
    cod_estabelecimento: number;
    nome: string;
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    complemento: string;
    estado: string;
}

interface Group {
    cod_estabel_usuario: number;
    cod_usuario: string;
    cod_grupo?: number;
    nome: string
    cod_estabel: string;
}

const UsersPage: React.FC = () => {
    const { groupCode } = useGroup();
    const { token } = useToken();
    const {
        permissions,
    } = useUserPermissions(groupCode ?? 0, "Controles");
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#B8D047");
    const [userCreateDisabled, setUserCreateDisabled] =
        useState(false);
    const [userCreateReturnDisabled, setUserCreateReturnDisabled] =
        useState(false);
    const [userEditDisabled, setUserEditDisabled] = useState(false);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [clientIdToDelete, setClientIdToDelete] = useState<number | null>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [groupPermissions, setGroupPermissions] = useState<Group[]>([]);
    const [selectedGroupPermissions, setSelectedGroupPermissions] = useState<Group>();
    const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [formValues, setFormValues] = useState<User>({
        cod_usuario: 0,
        nome: "",
        usuario: "",
        email: "",
        situacao: "",
        nomeGrupo: "",
        cod_grupo: 0
    });
    const [isValidEmail, setIsValidEmail] = useState(true); // Para controlar a cor do input

    // Função para lidar com a mudança no campo de email
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Formatação do email - aqui você pode implementar a formatação conforme necessário
        setFormValues({ ...formValues, email: value });
    };

    // Função para validar o email
    const handleEmailBlur = () => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const isValid = emailRegex.test(formValues.email);

        setIsValidEmail(isValid); // Atualiza a cor do input com base na validade
    };


    const [users, setUsers] = useState<User[]>([]);

    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [visible, setVisible] = useState(false);

    const clearInputs = () => {
        setVisualizar(false)
        setFormValues({
            cod_usuario: 0,
            nome: "",
            usuario: "",
            email: "",
            situacao: "",
            nomeGrupo: "",
            cod_grupo: 0,
        })
        setSelectedEstablishments([]);
        setSelectedGroupPermissions(undefined);
    }

    const filteredUsers = users.filter((user) => {
        // Apenas usuários ATIVOS aparecem
        if (user.situacao !== "ATIVO") {
            return false;
        }

        // Função de busca
        return Object.values(user).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase())
        );
    });



    const handleSaveEdit = async () => {
        setUserEditDisabled(true)
        setLoading(true)
        setIsEditing(false);
        try {
            let requiredFields: any[] = []
            if (isEditing) {
                requiredFields = [
                    "nome",
                    "email",
                    "usuario",
                    "situacao",
                ];
            } else {
                requiredFields = [
                    "nome",
                    "email",
                    "usuario",
                    "cod_grupo",
                    "situacao",
                ];
            }

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setUserEditDisabled(false)
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }
            console.log("cod", selectedUser)
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/edit/${selectedUser?.cod_usuario}`,
                { ...formValues, estabelecimentos: selectedEstablishments },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            if (response.status >= 200 && response.status < 300) {
                setUserEditDisabled(false)
                setLoading(false)
                clearInputs();
                fetchUsers();
                toast.success("Usuario salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
            } else {
                setUserEditDisabled(false)
                setLoading(false)
                toast.error("Erro ao salvar usuario.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setUserEditDisabled(false)
            setLoading(false)
            console.error("Erro ao salvar usuario:", error);
        }
    };

    const [visualizando, setVisualizar] = useState<boolean>(false);

    const handleEdit = async (rowData: any, users: User, visualizar: boolean) => {
        setVisualizar(visualizar);

        try {
            const groups = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/groupPermission/groups/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const selectedGroup = groups.data.groups.find(
                (group: Group) => group.cod_grupo === users.cod_grupo
            );

            // Filtra os estabelecimentos com base no cod_estabel
            const selectedEstablishmentsWithNames = rowData.dbs_estabelecimentos_usuario.map(({ cod_estabel }: any) =>
                establishments.find((estab) => estab.cod_estabelecimento === cod_estabel)
            )
                .filter(Boolean); // Remove valores undefined (caso algum código não tenha correspondência)

            setSelectedEstablishments(selectedEstablishmentsWithNames);

            setSelectedGroupPermissions(selectedGroup ? selectedGroup : {});

            setFormValues(users);
            setSelectedUser(users);

            setIsEditing(true);
            setVisible(true);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    const [rowData, setRowData] = useState<User[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const handleSaveReturn = async (fecharModal: boolean) => {
        setUserCreateReturnDisabled(true);
        setLoading(true);
        try {
            const requiredFields = [
                "nome",
                "email",
                "usuario",
                "cod_grupo",
                "situacao",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return Array.isArray(value) ? value.length === 0 : value === "" || value === null || value === undefined;
            });

            if (selectedEstablishments.length === 0) {
                toast.info("Você deve selecionar pelo menos um estabelecimento!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            if (isEmptyField) {
                setUserCreateReturnDisabled(false);
                setLoading(false);
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            // Verificar se o "nome" já existe no banco de dados no storedRowData
            const nomeExists = rowData.some((item) => item.usuario === formValues.usuario);

            if (nomeExists) {
                setUserCreateReturnDisabled(false);
                setLoading(false);
                toast.info("Esse login já existe no banco de dados, escolha outro!", {
                    position: "top-right",
                    autoClose: 3000,
                    progressStyle: { background: "yellow" },
                    icon: <span>⚠️</span>,
                });

                return;
            }

            // Verificar se o "email" já existe no banco de dados no storedRowData
            const emailExists = rowData.some((item) => item.email === formValues.email);

            if (emailExists) {
                setUserCreateReturnDisabled(false);
                setLoading(false);
                toast.info("Esse e-mail já está em uso, escolha outro!", {
                    position: "top-right",
                    autoClose: 3000,
                    progressStyle: { background: "yellow" },
                    icon: <span>⚠️</span>,
                });

                return;
            }


            const payload = {
                nome: formValues.nome,
                email: formValues.email,
                usuario: formValues.usuario,
                senha: "1234",
                cod_grupo: selectedGroupPermissions?.cod_grupo,
                situacao: formValues.situacao,
                estabelecimentos: selectedEstablishments,
            };

            const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/users/register", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status >= 200 && response.status < 300) {
                setLoading(true);
                setUserCreateReturnDisabled(true);
                const emailBody = `
Portal Birigui
                
Olá ${formValues.nome}, seja bem-vindo(a) ao Portal Birigui!

Sua senha padrão é: 1234

Acesse o portal <a href="https://birigui-teste.comviver.cloud/" style="color: #1e3a5f; text-decoration: none; font-weight: bold;">clicando aqui</a>

________________________
Copyright Grupo ComViver
`;

                // Enviar e-mail após salvar o usuário
                const emailPayload = {
                    to: formValues.email,  // E-mail do novo usuário
                    subject: "Bem-vindo ao sistema!",  // Assunto do e-mail
                    body: emailBody // Corpo do e-mail
                };

                // Chamar a API de envio de e-mail
                const emailResponse = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/email/send-email", emailPayload, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (emailResponse.status >= 200 && emailResponse.status < 300) {
                    toast.success("E-mail de boas-vindas enviado com sucesso!", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                } else {
                    toast.error("Erro ao enviar e-mail de boas-vindas.", {
                        position: "top-right",
                        autoClose: 3000,
                    });
                }

                setUserCreateReturnDisabled(false);
                setLoading(false);
                clearInputs();
                fetchUsers();
                toast.success("Usuário salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(fecharModal);
            } else {
                setUserCreateReturnDisabled(false);
                setLoading(false);
                toast.error("Erro ao salvar o usuário:" + response.data.msg, {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setUserCreateReturnDisabled(false);
            setLoading(false);
            console.error("Erro ao salvar usuário:", error);
            toast.error("Erro ao salvar o usuário", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setUserCreateReturnDisabled(false);
            setLoading(false);
        }
    };


    useEffect(() => {
        fetchUsers();
        fetchEstabilishments();
        fetchGroupPermissions();
    }, []);

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

    const fetchGroupPermissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/groupPermission/groups", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.groups)
            setGroupPermissions(response.data.groups);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Erro ao carregar grupos:", error);
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
                `${process.env.NEXT_PUBLIC_API_URL}/api/users/cancel/${clientIdToDelete}`,
                {}, // Enviar um corpo vazio, caso necessário para o endpoint
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                fetchUsers(); // Atualizar a lista de usuários
                setModalDeleteVisible(false);
                toast.success("Usuário cancelado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                toast.error("Erro ao cancelar usuário.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.error("Erro ao cancelar usuário:", error);
            toast.error("Erro ao cancelar usuário. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };


    const handleDelete = async () => {

        setLoading(true)
        try {
            const response = await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/users/edit/${clientIdToDelete}`, { situacao: "DESATIVADO" }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setLoading(false)
                clearInputs();
                fetchUsers();
                toast.success("Usuario salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                closeDialog()
            } else {
                setLoading(false)
                toast.error("Erro ao salvar usuario.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false)
            console.error("Erro ao salvar usuario:", error);
        }

        /*if (clientIdToDelete === null) return;

        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${clientIdToDelete}`);
            toast.success("Usuario removido com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchUsers();
            setModalDeleteVisible(false)
        } catch (error) {
            console.log("Erro ao excluir usuario:", error);
            toast.error("Erro ao excluir usuario. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }*/
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
        <SidebarLayout>
            <div className="flex justify-center">

                {loading && (
                    <div style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100vw",
                        height: "100vh",
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999
                    }}>
                        <img src="/logo-birigui-bgtransparent.png" alt="Carregando..." style={{ width: "150px", height: "150px" }} />
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
                    <p>Tem certeza que deseja desativar este usuário?</p>
                </Dialog>


                <Dialog
                    header={isEditing ? (visualizando ? "Visualizando Usuário" : "Editar Usuário") : "Novo Usuário"}
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
                        <div className="">
                            <label htmlFor="nome" className="block text-blue font-medium">
                                Nome Completo
                            </label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                disabled={visualizando}
                                value={formValues.nome}
                                onChange={handleInputChange}
                                className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                placeholder="" />
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
                            />
                            {!isValidEmail && <p className="text-red-500 text-sm mt-1">Por favor, insira um email válido.</p>} {/* Mensagem de erro */}
                        </div>

                        <div className="">
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


                        <div className="grid grid-cols-3 gap-2">
                            <div className="">
                                <label htmlFor="login" className="block text-blue  font-medium">
                                    Login
                                </label>
                                <input
                                    type="text"
                                    id="login"
                                    name="usuario"
                                    disabled={visualizando}
                                    value={formValues.usuario}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>
                            <div className="">
                                <label htmlFor="grupo" className="block text-blue  font-medium">
                                    Grupo de Permissões
                                </label>
                                <Dropdown
                                    disabled={visualizando}
                                    value={selectedGroupPermissions}
                                    onChange={(e) => setSelectedGroupPermissions(e.value)}
                                    options={groupPermissions}
                                    optionLabel="nome"
                                    filter
                                    className="w-full border border-[#D9D9D9] pl-2 rounded-sm h-8 flex items-center leading-[32px]" />
                            </div>

                            <div className="">
                                <label htmlFor="situacao" className="block text-blue  font-medium">
                                    Situação
                                </label>
                                <Dropdown
                                    disabled={visualizando}
                                    id="situacao"
                                    name="situacao"
                                    value={formValues.situacao}
                                    onChange={(e) => setFormValues({ ...formValues, situacao: e.value })}
                                    options={[
                                        { label: 'Ativo', value: 'ATIVO' },
                                        { label: 'Inativo', value: 'DESATIVADO' }
                                    ]}
                                    className="w-full border border-[#D9D9D9] pl-2 rounded-sm h-8 flex items-center leading-[32px]"
                                    style={{ backgroundColor: 'white', borderColor: '#D9D9D9' }} />
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
                                        disabled={userCreateReturnDisabled || !isValidEmail}
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
                                        disabled={userCreateDisabled || !isValidEmail}
                                        icon="pi pi-check"
                                        onClick={() => handleSaveReturn(true)}
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
                                    disabled={userEditDisabled || !isValidEmail}
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
                    </div>

                </Dialog>



                <div className="bg-grey pt-3 px-1 w-full h-full rounded-md">
                    <div className="flex justify-between ">
                        <div>
                            <h2 className=" text-blue text-2xl font-extrabold mb-3 pl-3 mt-1
">
                                Usuários
                            </h2>
                        </div>
                        {permissions?.insercao === "SIM" && (
                            <div className="mr-2">
                                <RegisterButton onClick={() => { setVisible(true); }} title="Cadastrar" />
                            </div>
                        )}
                    </div>


                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col mt-2" style={{ height: "95%" }}>

                        <div className="mb-4 flex justify-end ">
                            <p className="text-blue font-bold text-lg">Busca:</p>
                            <InputText
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder=""
                                className="p-inputtext-sm border rounded-md ml-1 text-black pl-1"
                                style={{ border: "1px solid #1B405D80", }} />
                        </div>

                        <DataTable
                            value={filteredUsers.slice(first, first + rows)}
                            paginator={true}
                            rows={rows}
                            rowsPerPageOptions={[5, 10]}
                            rowClassName={(data) => 'hover:bg-gray-200'}
                            onPage={(e) => {
                                setFirst(e.first);
                                setRows(e.rows);
                            }}
                            className="w-full rounded-lg"
                            responsiveLayout="scroll"
                            tableStyle={{
                                borderCollapse: 'collapse',
                                width: '100%',
                            }}
                        >
                            <Column
                                field="cod_usuario"
                                header="Código"
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
                            <Column
                                field="nome"
                                header="Nome Completo"
                                className="text-black"
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
                                }} />
                            <Column
                                field="usuario"
                                header="Login"
                                className="text-black"
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
                                }} />
                            <Column
                                field="email"
                                header="E-mail"
                                className="text-black"
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
                                }} />
                            <Column
                                field="situacao"
                                header="Situação"
                                className="text-black"
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
                                }} />
                            <Column
                                field="nomeGrupo"
                                header="Grupo"
                                className="text-black"
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
                                }} />

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
                                        <div className="bg-yellow500 flex gap-2 justify-center rounded-2xl w-full">
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
                                    }} />
                            )}
                            {permissions?.delecao === "SIM" && (
                                <Column
                                    header=""
                                    body={(rowData) => (
                                        <div className="bg-red400 flex gap-2 justify-center rounded-2xl w-full">
                                            <CancelButton onClick={() => openDialog(rowData.cod_usuario)} />
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
        totalRecords={filteredUsers.length}
        onPageChange={(e) => {
            setFirst(e.first);
            setRows(e.rows);
        }}
    />*/}
                    </div>
                </div>
            </div>
            <Footer />
        </SidebarLayout >
    );
};

export default UsersPage;
