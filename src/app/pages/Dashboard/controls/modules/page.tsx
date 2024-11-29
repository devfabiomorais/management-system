"use client"
import React, { useState, useEffect } from "react";
import SidebarLayout from "@/app/components/Sidebar";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { FaTrash } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { Dialog } from "primereact/dialog";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";

interface ModuleType {
    cod_modulo: number;
    descricao: string;
    cod_modulo_pai: string;
    modulo_pai_nome?: string;
}

const ModulePage: React.FC = () => {
    const { groupCode } = useGroup();
    const { token } = useToken();
    const {
        permissions,
    } = useUserPermissions(groupCode ?? 0, "Controles");
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#B8D047");
    const [moduleCreateDisabled, setModuleCreateDisabled] =
    useState(false);
  const [moduleEditDisabled, setModuleEditDisabled] = useState(false);
    const [modules, setModules] = useState<ModuleType[]>([]);
    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [descricao, setDescricao] = useState("");
    const [codModuloPai, setCodModuloPai] = useState("");
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedModule, setSelectedModule] = useState(0);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [moduleIdToDelete, setModuleIdToDelete] = useState<number | null>(null);

    useEffect(() => {
        fetchModules();
    }, []);

    const clearInputs = () => {
        setDescricao("")
        setCodModuloPai("")
    }



    const fetchModules = async () => {
        try {

            const response = await axios.get("https://back-end-birigui-w3dn.vercel.app/api/module", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const modules = response.data.modules;
            const modulesWithParentName = modules.map((e: ModuleType) => {
                const parentModule = modules.find((m: ModuleType) => JSON.stringify(m.cod_modulo) === JSON.stringify(e.cod_modulo_pai));

                if (parentModule) {
                    e.modulo_pai_nome = parentModule.descricao;
                }
                return e;
            });

            setModules(modulesWithParentName);
        } catch (error) {
            console.error("Erro ao carregar módulos:", error);
        }
    };

    const createModulo = async () => {
        setModuleCreateDisabled(true)
        if (descricao === "") {
            setModuleCreateDisabled(false)
            setLoading(false)
            toast.info("Todos os campos devem ser preenchidos!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }
        console.log({
            descricao: descricao,
            cod_modulo_pai: codModuloPai
        })
        try {
            const bodyForm = {
                descricao: descricao,
                cod_modulo_pai: codModuloPai
            }

            const response = await axios.post("https://back-end-birigui-w3dn.vercel.app/api/module/register", bodyForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setModuleCreateDisabled(false)
                setLoading(false)
                clearInputs();
                fetchModules();
                toast.success("Módulo salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setModuleCreateDisabled(false)
                setLoading(false)
                toast.error("Erro ao salvar o módulo.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setModuleCreateDisabled(false)
            setLoading(false)
            console.error("Erro ao salvar os módulos:", error);
        }
    }

    const editModulo = async () => {
        setModuleEditDisabled(true)
        if (descricao === "") {
            setModuleEditDisabled(false)
            setLoading(false)
            toast.info("Todos os campos devem ser preenchidos!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        try {
            const bodyForm = {
                descricao: descricao,
                cod_modulo_pai: codModuloPai
            }

            const response = await axios.put(`https://back-end-birigui-w3dn.vercel.app/api/module/edit/${selectedModule}`, bodyForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setModuleEditDisabled(false)
                setLoading(false)
                clearInputs();
                fetchModules();
                setIsEditing(false);
                toast.success("Módulo editado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setModuleEditDisabled(false)
                setLoading(false)
                setIsEditing(false);
                toast.error("Erro ao editar o módulo.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setModuleEditDisabled(false)
            setLoading(false)
            setIsEditing(false);
            console.error("Erro ao editar os módulos:", error);
        }
    }

    const openDialog = (id: number) => {
        setModuleIdToDelete(id);
        setModalDeleteVisible(true);
    };

    const closeDialog = () => {
        setModalDeleteVisible(false);
        setModuleIdToDelete(null);
    };

    const handleDelete = async () => {
        if (moduleIdToDelete === null) return;

        try {
            await axios.delete(`https://back-end-birigui-w3dn.vercel.app/api/module/${moduleIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Módulo removido com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchModules();
            setModalDeleteVisible(false)
        } catch (error) {
            console.log("Erro ao excluir módulo:", error);
            toast.error("Erro ao excluir módulo. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleEdit = (modulos: ModuleType) => {
        setDescricao(modulos.descricao)
        setCodModuloPai(modulos.cod_modulo_pai)
        setSelectedModule(modulos.cod_modulo);
        setIsEditing(true);
    };

    const filteredItens = modules.filter(
        (item) =>
            item.descricao.toLowerCase().includes(search.toLowerCase())
    );

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
                    <p>Tem certeza que deseja excluir esta módulo?</p>
                </Dialog>


                <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
                    <div className="flex justify-between">
                        <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">Módulos</h2>
                    </div>
                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col" style={{ height: "95%" }}>
                        <div className="flex justify-around">
                            <div className="border border-[##D9D9D980] h-screen rounded-md p-5 w-full">
                                <div className="mb-4 flex justify-end">
                                    <p className="text-blue font-bold text-lg">Busca:</p>
                                    <InputText
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="p-inputtext-sm border rounded-md ml-1 text-black pl-1" />
                                </div>
                                <DataTable
                                    value={filteredItens.slice(first, first + rows)}
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
                                        borderCollapse: "collapse",
                                        width: "100%",
                                    }}
                                >
                                    <Column field="cod_modulo" header="Código" className="text-black"
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
                                    <Column field="descricao" header="Descrição" className="text-black"
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
                                    <Column field="modulo_pai_nome" header="Módulo Pai" className="text-black"
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
                                                <button onClick={() => openDialog(rowData.cod_modulo)} className="bg-red text-black p-1 rounded">
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
                            </div>


                            <div className="border border-[#D9D9D9] h-screen rounded-md p-5 w-full ml-5">
                                <div className="p-5">
                                    <label htmlFor="descricao" className="block text-blue font-bold">
                                        Descrição:
                                    </label>
                                    <input
                                        type="text"
                                        id="descricao"
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8" />

                                    <label htmlFor="codModuloPai" className="block text-blue font-bold mt-4">
                                        Módulo Pai:
                                    </label>

                                    <select
                                        id="codModuloPai"
                                        name="codModuloPai"
                                        value={codModuloPai}
                                        onChange={(e) => setCodModuloPai(e.target.value)}
                                        className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    >
                                        <option value="">
                                            Selecione
                                        </option>
                                        {modules.map((module) => (
                                            <option key={module.cod_modulo} value={module.cod_modulo}>
                                                {module.descricao}
                                            </option>
                                        ))}
                                    </select>

                                    <div className="flex justify-end mt-5">
                                    {permissions?.insercao === "SIM" && (
                                        <>
                                        {!isEditing && (<Button
                                            label="Salvar Módulo"
                                            className="text-white"
                                            icon="pi pi-check"
                                            onClick={() => createModulo()}
                                            disabled={moduleCreateDisabled}
                                            style={{
                                                backgroundColor: '#28a745',
                                                border: '1px solid #28a745',
                                                padding: '0.5rem 1.5rem',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }} />)}
                                        {isEditing && (<Button
                                            label="Salvar Módulo"
                                            className="text-white"
                                            icon="pi pi-check"
                                            onClick={() => editModulo()}
                                            disabled={moduleEditDisabled}
                                            style={{
                                                backgroundColor: '#28a745',
                                                border: '1px solid #28a745',
                                                padding: '0.5rem 1.5rem',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }} />)}
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

export default ModulePage;
