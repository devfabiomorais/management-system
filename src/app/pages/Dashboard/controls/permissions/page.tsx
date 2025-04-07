"use client"
import React, { useEffect, useState } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { FaBan, FaTrash } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import { RiListView } from "react-icons/ri";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import { debug } from "console";

interface PermissionType {
    situacao: string;
    cod_permissao_grupo: number;
    dbs_modulos?: {
        cod_modulo: number;
        cod_modulo_pai: number;
        descricao: string;
    }
    dbs_grupos?: {
        cod_grupo: number;
        nome: string;
        situacao?: string;
    }
    cod_grupo: number;
    cod_modulo: number;
    nome: string;
    descricao?: string;
    insercao: string;
    edicao: string;
    delecao: string;
    visualizacao: string;
}

const PermissionsPage: React.FC = () => {
    const { groupCode } = useGroup();
    const { token } = useToken();
    const {
        permissions,
    } = useUserPermissions(groupCode ?? 0, "Controles");
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#B8D047");
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedPermission, setSelectedPermission] = useState(0);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [nomeGroup, setNomeGroup] = useState("");
    const [permissionIdToDelete, setPermissionIdToDelete] = useState<number | null>(null);

    const [visible, setVisible] = useState(false);
    const [permissionsType, setPermissionsType] = useState<PermissionType[]>([]);
    const colunas = ["Módulo", <IoAddCircleOutline className="text-3xl " />, <MdOutlineModeEditOutline style={{ fontSize: "1.2rem" }} className="text-2xl " />, <FaBan style={{ fontSize: "1.2rem" }} className="text-white text-center" />, <RiListView className="text-2xl" />];
    const [linhas, setLinhas] = useState<any[]>([]);


    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);

    useEffect(() => {
        fetchPermission();
        fetchModules();
    }, []);

    const clearInputs = () => {
        setNomeGroup("")
    }

    const clearCheckboxes = () => {
        const updatedLinhas = linhas.map((linha: (boolean | string | number)[]) =>
            linha.map((coluna: boolean | string | number) =>
                typeof coluna === "boolean" ? false : coluna
            )
        );
        setLinhas(updatedLinhas);
    };




    const fetchModules = async () => {
        try {

            const response = await axios.get("http://localhost:9009/api/module", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const modules = response.data.modules;

            const formattedData = modules.map((module: any) => [
                module.descricao,
                module.cod_modulo,
                module.insercao ?? false,
                module.edicao ?? false,
                module.delecao ?? false,
                module.visualizacao ?? false,
            ]);

            setLinhas(formattedData);


        } catch (error) {
            console.error("Erro ao carregar módulos:", error);
        }
    };

    const fetchPermission = async () => {
        try {
            const response = await axios.get("http://localhost:9009/api/groupPermission", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const uniqueGroups: PermissionType[] = [];
            const seenGroupNames = new Set<string>();

            response.data.permissions.forEach((permission: PermissionType) => {
                const groupName = permission.dbs_grupos?.nome;
                if (groupName && !seenGroupNames.has(groupName)) {
                    seenGroupNames.add(groupName);
                    uniqueGroups.push(permission);
                }
            });

            setPermissionsType(uniqueGroups);  // Atualiza o estado com grupos únicos
        } catch (error) {
            console.error("Erro ao carregar módulos:", error);
        }
    };

    const createPermission = async () => {
        if (nomeGroup === "") {
            setLoading(false);
            toast.info("Todos os campos devem ser preenchidos!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const permissionsToSend = linhas.map((linha) => ({
            cod_modulo: linha[1],
            descricao: linha[0],
            insercao: linha[2],
            edicao: linha[3],
            delecao: linha[4],
            visualizacao: linha[5],
        }));

        try {
            const bodyForm = {
                nome: nomeGroup,
                permissoes: permissionsToSend,
            };

            // Verifica se o nome já existe no banco de dados na lista carregada
            const nomeJaExiste = permissionsType.find(
                (perm) => perm.dbs_grupos?.nome?.toLowerCase() === nomeGroup.toLowerCase()
            );
            const situacaoInativo = nomeJaExiste?.dbs_grupos?.situacao?.toLowerCase() === 'inativo';
            const cod_grupoParaEnvio = nomeJaExiste?.dbs_grupos?.cod_grupo

            if (nomeJaExiste && !situacaoInativo) {
                setLoading(false);
                toast.info("Este nome já existe no banco de dados, escolha outro!", {
                    position: "top-right",
                    autoClose: 3000,
                    progressStyle: { background: "yellow" }, // Cor do progresso
                    icon: <span>⚠️</span>, // Ícone de alerta
                });
                return;
            } else if (nomeJaExiste && situacaoInativo) {
                setSelectedPermission(cod_grupoParaEnvio ?? 0);
                await editPermission();
                setLoading(false);
                clearInputs();
                fetchPermission();
                fetchModules();
                toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
                    position: "top-right",
                    autoClose: 10000,
                    progressStyle: { background: "green" },
                    icon: <span>♻️</span>,
                });
                return;
            }

            const response = await axios.post("http://localhost:9009/api/groupPermission/register", bodyForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status >= 200 && response.status < 300) {
                setLoading(false);
                clearInputs();
                fetchPermission();
                fetchModules();
                toast.success("Grupo de Permissão salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setLoading(false);
                toast.error("Erro ao salvar o Grupo de Permissão.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false);
            console.error("Erro ao salvar o Grupo de Permissão:", error);
            toast.error("Erro ao salvar o Grupo de Permissão. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };



    const editPermission = async () => {
        if (nomeGroup === "") {
            setLoading(false);
            toast.info("Todos os campos devem ser preenchidos!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const permissionsToSend = linhas.map((linha) => ({
            cod_modulo: linha[1], // ID do módulo
            descricao: linha[0], // Nome do módulo
            insercao: linha[2], // Permissão de inserção
            edicao: linha[3], // Permissão de edição
            delecao: linha[4], // Permissão de deleção
            visualizacao: linha[5], // Permissão de visualização
        }));

        const bodyForm = {
            nome: nomeGroup, // Certifique-se de que o nome está sendo enviado corretamente
            permissoes: permissionsToSend,
        };

        try {
            const response = await axios.put(
                `http://localhost:9009/api/groupPermission/edit/${selectedPermission}`,
                bodyForm,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                setLoading(false);
                clearInputs();
                fetchPermission();
                fetchModules();
                setIsEditing(false);
                toast.success("Grupo de Permissão editado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setLoading(false);
                setIsEditing(false);
                toast.error("Erro ao editar o Grupo de Permissão.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false);
            setIsEditing(false);
            console.error("Erro ao editar os Grupos de Permissoes:", error);
        }
    };



    const openDialog = (id: number) => {
        setPermissionIdToDelete(id);
        setModalDeleteVisible(true);
    };

    const closeDialog = () => {
        setModalDeleteVisible(false);
        setPermissionIdToDelete(null);
    };


    const filteredItens = permissionsType.filter((perm) => {
        // Apenas itens ATIVOS aparecem
        if (perm.dbs_grupos?.situacao !== 'Ativo') {
            return false;
        }

        // Função de busca
        return Object.values(perm).some((value) =>
            String(value).toLowerCase().includes(search.toLowerCase())
        );
    });



    /*const handleCheckboxChange = (rowIndex: number, colIndex: number) => {
        console.log("Alterando checkbox:", rowIndex, colIndex);
        setLinhas((prevLinhas) => {
            const newLinhas = prevLinhas.map((linha, i) =>
                i === rowIndex
                    ? linha.map((checked, j) => (j === colIndex ? !checked : checked))
                    : linha
            );
            console.log(newLinhas);
            return newLinhas;
        });
    };

    const renderCheckbox = (checked: boolean, rowIndex: number, colIndex: number) => (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={() => handleCheckboxChange(rowIndex, colIndex)}
                className="sr-only peer"
                id={`${rowIndex}-${colIndex}`}
            />
            <div className="w-6 h-6 bg-white border-2 border-blue200 rounded-md peer-checked:bg-blue200 peer-checked:border-blue-700 flex items-center justify-center transition">
                {checked && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-white"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                        />
                    </svg>
                )}
            </div>
        </label>
    );*/

    const handleCancel = async () => {
        if (!permissionIdToDelete) return;

        // Verifica se o token existe
        if (!token) {
            toast.error("Erro de autenticação: Token ausente.");
            return;
        }

        try {
            await axios.put(
                `http://localhost:9009/api/groupPermission/cancel/${permissionIdToDelete}`,
                {}, // Segundo argumento vazio pois PUT espera um body antes dos headers
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success("Grupo cancelado com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });

            fetchPermission();
            fetchModules();
            setModalDeleteVisible(false);
        } catch (error) {
            console.error("Erro ao cancelar grupo:", error);

            // Verifica se o erro foi de autorização
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                toast.error("Sessão expirada. Faça login novamente.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                toast.error("Erro ao cancelar grupo. Tente novamente.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        }
    };




    const handleDelete = async () => {
        if (permissionIdToDelete === null) return;

        try {
            await axios.delete(`http://localhost:9009/api/groupPermission/${permissionIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Grupo e permissões removidas com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchPermission();
            fetchModules();
            setModalDeleteVisible(false);
        } catch (error) {
            console.log("Erro ao excluir grupo:", error);
            toast.error("Erro ao excluir grupo. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleEdit = async (perm: PermissionType) => {
        const nomeGrupo = perm.dbs_grupos?.nome || "";
        setNomeGroup(nomeGrupo);

        try {
            const responsePermissions = await axios.get("http://localhost:9009/api/groupPermission", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const responseModules = await axios.get("http://localhost:9009/api/module", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const permissions = responsePermissions.data.permissions;
            const modules = responseModules.data.modules;

            // Filtrar as permissões com base no cod_grupo
            const filteredPermissions = permissions.filter((permission: any) => permission.cod_grupo === perm.cod_grupo);

            // Atualizar a descrição (nome do módulo) nas permissões filtradas
            const formattedData = filteredPermissions.map((permission: any) => {
                const matchingModule = modules.find((module: any) => module.cod_modulo === permission.cod_modulo);
                return [
                    matchingModule ? matchingModule.descricao : permission.descricao,
                    permission.cod_modulo,
                    permission.insercao === "SIM",
                    permission.edicao === "SIM",
                    permission.delecao === "SIM",
                    permission.visualizacao === "SIM",
                ];
            });

            console.log(formattedData);

            // Atualizar estados
            setLinhas(formattedData);
            setSelectedPermission(perm.cod_grupo);
            setIsEditing(true);
        } catch (error) {
            console.error("Erro ao carregar módulos ou permissões:", error);
        }
    };

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
                            onClick={handleCancel}
                            className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all" />
                    </div>}
                >
                    <p>Tem certeza que deseja excluir este grupo?</p>
                </Dialog>

                <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
                    <div className="flex justify-between">
                        <div>
                            <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">Grupo de Permissões</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col"
                        style={{ height: "95%" }}>

                        <div className="flex justify-around">

                            <div className="border border-[##D9D9D980] h-screen rounded-md p-5 w-full">

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
                                    value={filteredItens.slice(first, first + rows)}
                                    paginator={true}
                                    rows={rows}
                                    rowsPerPageOptions={[5, 10]}
                                    rowClassName={(data) => 'hover:bg-gray-200'}
                                    onPage={(e) => {
                                        setFirst(e.first);
                                        setRows(e.rows);
                                    }}
                                    className="w-full h-full"
                                    responsiveLayout="scroll"
                                    scrollHeight="flex" // Permite ajustar a altura conforme necessário
                                    tableStyle={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                    }}
                                >
                                    <Column
                                        field="cod_grupo"
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
                                        field="dbs_grupos.nome"
                                        header="Grupo de Permissões"
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
                                                <div className="bg-yellow500 flex gap-2 justify-center rounded-2xl w-full">
                                                    <button onClick={() => handleEdit(rowData)}
                                                        className="hover:scale-125 hover:bg-yellow700 p-2 bg-yellow transform transition-all duration-50  rounded-2xl"
                                                    >
                                                        <MdOutlineModeEditOutline style={{ fontSize: "1.2rem" }} className="text-white text-center" />
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
                                                <div className="bg-red400 flex gap-2 justify-center rounded-2xl w-full">
                                                    <button onClick={() => {
                                                        openDialog(rowData.cod_permissao_grupo);
                                                        setPermissionIdToDelete(rowData.cod_permissao_grupo);
                                                    }}
                                                        className="hover:bg-red600 hover:scale-125 p-2 bg-transparent transform transition-all duration-50  rounded-2xl"
                                                    >
                                                        <FaBan style={{ fontSize: "1.2rem" }} className="text-white text-center" />
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
                            </div>

                            <div className="border border-[#D9D9D9] h-screen rounded-md p-5 w-full ml-5"
                                style={{ overflow: "auto" }}>

                                <div className="p-5">
                                    <div className="">
                                        <label htmlFor="un" className="block text-blue font-bold">
                                            Nome do Grupo:
                                        </label>
                                        <input
                                            type="text"
                                            id="un"
                                            value={nomeGroup}
                                            onChange={(e) => setNomeGroup(e.target.value)}
                                            className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                            placeholder="" />
                                    </div>


                                    <div className="overflow-x-auto mt-5">
                                        <table className="table-auto border-collapse border border-gray-300 w-full hover:bg-gray-50"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th className="border text-blue border-gray-300 px-4 py-2 text-left">Módulo</th>
                                                    <th className="border text-blue border-gray-300 px-4 py-2 text-center">Inserção</th>
                                                    <th className="border text-blue border-gray-300 px-4 py-2 text-center">Edição</th>
                                                    <th className="border text-blue border-gray-300 px-4 py-2 text-center">Deleção</th>
                                                    <th className="border text-blue border-gray-300 px-4 py-2 text-center">Visualização</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {linhas.map((linha, index) => (
                                                    <tr key={index}>
                                                        <td className="border text-black border-gray-300 px-4 py-2 text-left hover:bg-gray-200"
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            {linha[0]}
                                                        </td>
                                                        {linha.slice(2).map((coluna: any, colIndex: any) => (
                                                            <td
                                                                key={colIndex}
                                                                className="border text-black border-gray-300 px-4 py-2 text-center hover:bg-gray-200"
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                {typeof coluna === "boolean" ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={coluna}
                                                                        onChange={(e) => {
                                                                            const updatedLinhas = [...linhas];
                                                                            updatedLinhas[index][colIndex + 2] = e.target.checked;
                                                                            setLinhas(updatedLinhas);
                                                                        }}
                                                                        className="w-6 h-6"
                                                                    />
                                                                ) : (
                                                                    coluna
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>



                                    <div className="flex justify-end mt-5">
                                        {(permissions?.insercao)?.toString() === "SIM" && (
                                            <>
                                                {!isEditing && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            label="Limpar"
                                                            className="text-white !bg-pink-500 border-pink-900 transition-all duration-200 !hover:bg-pink-700 hover:scale-125"
                                                            icon="pi pi-eraser"
                                                            onClick={() => {
                                                                clearInputs();
                                                                setIsEditing(false);
                                                                clearCheckboxes();
                                                            }}
                                                            style={{
                                                                backgroundColor: '#dc3545',
                                                                border: '1px solid #dc3545',
                                                                padding: '0.5rem 1.5rem',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                        />

                                                        <Button
                                                            label="Salvar Permissão"
                                                            className="text-white hover:bg-green-500 !bg-green-500 transition-all hover:scale-125 duration-50"
                                                            icon="pi pi-check"
                                                            onClick={() => createPermission()}
                                                            style={{
                                                                backgroundColor: '#28a745',
                                                                border: '1px solid #28a745',
                                                                padding: '0.5rem 1.5rem',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }} />
                                                    </div>

                                                )}
                                                {isEditing && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            label="Cancelar"
                                                            className="text-white bg-red400 border-red600 transition-all duration-200 hover:bg-red600 hover:scale-125"
                                                            icon="pi pi-times"
                                                            onClick={() => {
                                                                clearInputs();
                                                                setIsEditing(false);
                                                                clearCheckboxes();
                                                            }}
                                                            style={{
                                                                backgroundColor: '#dc3545',
                                                                border: '1px solid #dc3545',
                                                                padding: '0.5rem 1.5rem',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                        />

                                                        <Button
                                                            label="Salvar Edição"
                                                            className="text-white bg-green-500 border-green700 transition-all duration-200 hover:bg-green-600 hover:scale-125"
                                                            icon="pi pi-check"
                                                            onClick={() => editPermission()}
                                                            style={{
                                                                backgroundColor: '#28a745',
                                                                border: '1px solid #28a745',
                                                                padding: '0.5rem 1.5rem',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                            }}
                                                        />
                                                    </div>
                                                )}

                                            </>)}

                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </SidebarLayout><Footer /></>
    );
};

export default PermissionsPage;
