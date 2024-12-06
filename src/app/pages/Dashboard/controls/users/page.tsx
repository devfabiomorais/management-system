"use client";
import React, { ChangeEvent, useEffect, useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from 'primereact/dialog';
import { MdOutlineModeEditOutline } from "react-icons/md";
import { FaTrash } from "react-icons/fa";
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
    const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment>();
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
    const [users, setUsers] = useState<User[]>([]);

    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [visible, setVisible] = useState(false);

    const clearInputs = () => {
        setFormValues({
            cod_usuario: 0,
            nome: "",
            usuario: "",
            email: "",
            situacao: "",
            nomeGrupo: "",
            cod_grupo: 0
        })
    }

    const filteredUsers = users.filter((user) =>
        user.nome.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveEdit = async () => {
        setUserEditDisabled(true)
        setLoading(true)
        try {
            let requiredFields: any[] = []
            if(isEditing){
                requiredFields = [
                    "nome",
                    "email",
                    "usuario",
                    "situacao",
                ];
            }else {
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
            const response = await axios.put(`https://api-birigui-teste.comviver.cloud/api/users/edit/${selectedUser?.cod_usuario}`, formValues, {
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

    const handleEdit = async (users: User) => {
        console.log(users);

        try {
            //if(users.cod_grupo !== null){
                const groups = await axios.get("https://api-birigui-teste.comviver.cloud/api/groupPermission/groups/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const selectedGroup = groups.data.groups.find(
                    (group: Group) => group.cod_grupo === users.cod_grupo
                );
    
                const estabilishmentResponse = await axios.get("https://api-birigui-teste.comviver.cloud/api/estabilishment/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                // Encontrar o estabelecimento correspondente pelo ID
                const selectedEstabilishment = estabilishmentResponse.data.estabelecimentos.find(
                    (es: Establishment) =>
                        Array.isArray(users.dbs_estabelecimentos_usuario) &&
                        users.dbs_estabelecimentos_usuario.some(
                            (dbEstabelecimento) => dbEstabelecimento.cod_estabel === es.cod_estabelecimento
                        )
                );
                setSelectedEstablishments(selectedEstabilishment ? selectedEstabilishment : {});
                setSelectedGroupPermissions(selectedGroup ? selectedGroup : {});
                setEstablishments(estabilishmentResponse.data.estabelecimentos);
           // }
            

            
        
            setFormValues(users);
            setSelectedUser(users);
           
            setIsEditing(true);
            setVisible(true);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    const handleSaveReturn = async () => {
        setUserCreateReturnDisabled(true)
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

            if (selectedEstablishments?.cod_estabelecimento === null) {
                setUserCreateReturnDisabled(false)
                setLoading(false);
                toast.info("Você deve selecionar pelo menos um estabelecimento!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            if (isEmptyField) {
                setUserCreateReturnDisabled(false)
                setLoading(false);
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const payload = {
                nome: formValues.nome,
                email: formValues.email,
                usuario: formValues.usuario,
                senha: "changeme",
                cod_grupo: selectedGroupPermissions?.cod_grupo,
                situacao: formValues.situacao,
                cod_estabel: selectedEstablishments?.cod_estabelecimento,
            };

            const response = await axios.post("https://api-birigui-teste.comviver.cloud/api/users/register", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status >= 200 && response.status < 300) {
                setUserCreateReturnDisabled(false)
                setLoading(false);
                clearInputs();
                fetchUsers();
                toast.success("Usuário salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
            } else {
                setUserCreateReturnDisabled(false)
                setLoading(false);
                toast.error("Erro ao salvar o usuário:" + response.data.msg, {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setUserCreateReturnDisabled(false)
            setLoading(false);
            console.error("Erro ao salvar usuário:", error);
            toast.error("Erro ao salvar o usuário", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleSave = async () => {
        setUserCreateDisabled(true)
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

            if (selectedEstablishments?.cod_estabelecimento === null) {
                setUserCreateDisabled(false)
                setLoading(false);
                toast.info("Você deve selecionar pelo menos um estabelecimento!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            if (isEmptyField) {
                setUserCreateDisabled(false)
                setLoading(false);
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const payload = {
                nome: formValues.nome,
                email: formValues.email,
                usuario: formValues.usuario,
                senha: "changeme",
                cod_grupo: selectedGroupPermissions?.cod_grupo,
                situacao: formValues.situacao,
                cod_estabel: selectedEstablishments?.cod_estabelecimento,
            };

            const response = await axios.post("https://api-birigui-teste.comviver.cloud/api/users/register", payload, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status >= 200 && response.status < 300) {
                setUserCreateDisabled(false)
                setLoading(false);
                clearInputs();
                fetchUsers();
                toast.success("Usuário salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });

            } else {
                setUserCreateDisabled(false)
                setLoading(false);
                toast.error("Erro ao salvar o usuário:" + response.data.msg, {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setUserCreateDisabled(false)
            setLoading(false);
            console.error("Erro ao salvar usuário:", error);
            toast.error("Erro ao salvar o usuário", {
                position: "top-right",
                autoClose: 3000,
            });
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
            const responseUsers = await axios.get("https://api-birigui-teste.comviver.cloud/api/users/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const responseGroup = await axios.get("https://api-birigui-teste.comviver.cloud/api/groupPermission/groups", {
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
            const response = await axios.get("https://api-birigui-teste.comviver.cloud/api/estabilishment", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.estabelecimentos)
            setEstablishments(response.data.estabelecimentos);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Erro ao carregar estabelecimentos:", error);
        }
    };

    const fetchGroupPermissions = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://api-birigui-teste.comviver.cloud/api/groupPermission/groups", {
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

    const handleDelete = async () => {

        setLoading(true)
        try {
            const response = await axios.put(`https://api-birigui-teste.comviver.cloud/api/users/edit/${clientIdToDelete}`, { situacao: "DESATIVADO" }, {
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
            await axios.delete(`https://api-birigui-teste.comviver.cloud/api/users/${clientIdToDelete}`);
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
                            onClick={handleDelete}
                            className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all" />
                    </div>}
                >
                    <p>Tem certeza que deseja desativar este usuário?</p>
                </Dialog>


                <Dialog
                    header={isEditing ? "Editar Usuário" : "Novo Usuário"}
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
                    <div className="p-fluid grid gap-3 mt-2">
                        <div className="">
                            <label htmlFor="nome" className="block text-blue font-medium">
                                Nome Completo:
                            </label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formValues.nome}
                                onChange={handleInputChange}
                                className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                placeholder="" />
                        </div>

                        <div className="">
                            <label htmlFor="email" className="block text-blue  font-medium">
                                E-mail:
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formValues.email}
                                onChange={handleInputChange}
                                className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                placeholder="" />
                        </div>

                        <div className="">
                            <label htmlFor="estabelecimento" className="block text-blue  font-medium">
                                Estabelecimentos:
                            </label>
                            <Dropdown
                                value={selectedEstablishments}
                                onChange={(e) => setSelectedEstablishments(e.value)}
                                options={establishments}
                                optionLabel="nome"
                                filter
                                placeholder="Selecione um Estabelecimento"
                                className="w-full border text-black" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="">
                                <label htmlFor="login" className="block text-blue  font-medium">
                                    Login:
                                </label>
                                <input
                                    type="text"
                                    id="login"
                                    name="usuario"
                                    value={formValues.usuario}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>
                            <div className="">
                                <label htmlFor="grupo" className="block text-blue  font-medium">
                                    Grupo de Permissões:
                                </label>
                                <Dropdown
                                    value={selectedGroupPermissions}
                                    onChange={(e) => setSelectedGroupPermissions(e.value)}
                                    options={groupPermissions}
                                    optionLabel="nome"
                                    filter
                                    placeholder="Selecione um grupo"
                                    className="w-full border text-black" />
                            </div>

                            <div className="">
                                <label htmlFor="situacao" className="block text-blue  font-medium">
                                    Situação:
                                </label>
                                <Dropdown
                                    id="situacao"
                                    name="situacao"
                                    value={formValues.situacao}
                                    onChange={(e) => setFormValues({ ...formValues, situacao: e.value })}
                                    options={[
                                        { label: 'Ativo', value: 'ATIVO' },
                                        { label: 'Inativo', value: 'DESATIVADO' }
                                    ]}
                                    placeholder="Selecione"
                                    className="w-full md:w-14rem"
                                    style={{ backgroundColor: 'white', borderColor: '#D9D9D9' }} />
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
                                    backgroundColor: '#dc3545',
                                    border: '1px solid #dc3545',
                                    padding: '0.5rem 1.5rem',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                onClick={() => closeModal()} />
                            {!isEditing && (
                                <><Button
                                    label="Salvar e Voltar à Listagem"
                                    className="text-white"
                                    icon="pi pi-refresh"
                                    onClick={handleSaveReturn}
                                    disabled={userCreateReturnDisabled}
                                    style={{
                                        backgroundColor: '#007bff',
                                        border: '1px solid #007bff',
                                        padding: '0.5rem 1.5rem',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }} /><Button
                                        label="Salvar e Adicionar Outro"
                                        className="text-white"
                                        icon="pi pi-check"
                                        onClick={handleSave}
                                        disabled={userCreateDisabled}
                                        style={{
                                            backgroundColor: '#28a745',
                                            border: '1px solid #28a745',
                                            padding: '0.5rem 1.5rem',
                                            fontSize: '14px',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                        }} /></>
                            )}

                            {isEditing && (
                                <Button
                                    label="Salvar"
                                    className="text-white"
                                    icon="pi pi-check"
                                    onClick={handleSaveEdit}
                                    disabled={userEditDisabled}
                                    style={{
                                        backgroundColor: '#28a745',
                                        border: '1px solid #28a745',
                                        padding: '0.5rem 1.5rem',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }} />
                            )}
                        </div>
                    </div>
                </Dialog>



                <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
                    <div className="flex justify-between">
                        <div>
                            <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">Usuários</h2>
                        </div>
                        {permissions?.insercao === "SIM" && (
                        <div>
                            <button className="bg-green200 rounded mr-3" onClick={() => setVisible(true)}>
                                <IoAddCircleOutline style={{ fontSize: "2.5rem" }} className="text-white text-center" />
                            </button>
                        </div>
                        )}
                    </div>


                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col" style={{ height: "95%" }}>
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
                            value={filteredUsers.slice(first, first + rows)}
                            paginator={true}
                            rows={rows}
                            rowsPerPageOptions={[5, 10]}
                            onPage={(e) => {
                                setFirst(e.first);
                                setRows(e.rows);
                            }}
                            className="w-full"
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
                                    {permissions?.edicao === "SIM" && (
                            <Column
                                header=""
                                body={(rowData) => (
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => handleEdit(rowData)} className="bg-yellow p-1 rounded">
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
                                }} />
                            )}
                                {permissions?.delecao === "SIM" && (
                            <Column
                                header=""
                                body={(rowData) => (
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => openDialog(rowData.cod_usuario)} className="bg-red text-black p-1 rounded">
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
        </SidebarLayout><Footer /></>
    );
};

export default UsersPage;
