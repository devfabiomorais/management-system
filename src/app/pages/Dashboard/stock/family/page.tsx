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
import { FaTrash, FaBan } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
interface Item {
    cod_familia: number;
    descricao: string;
    nome: string;
    situacao?: string;
}

const FamilyPage: React.FC = () => {
    const { groupCode } = useGroup();
    const [familyCreateDisabled, setFamilyCreateDisabled] = useState(false);
    const [familyEditDisabled, setFamilyEditDisabled] = useState(false);
    const { token } = useToken();
    const {
        permissions,
    } = useUserPermissions(groupCode ?? 0, "Estoque");
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#B8D047");
    const [itens, setItens] = useState<Item[]>([]);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedFamilia, setSelectedFamilia] = useState(0);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [familiaIdToDelete, setFamiliaIdToDelete] = useState<number | null>(null);
    const [nome, setNome] = useState("");
    const [descricao, setDescricao] = useState("");
    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);



    const filteredItens = itens.filter((item) => {
        // Apenas ATIVO aparecem
        if (item.situacao !== 'Ativo') {
            return false;
        }

        // Função de busca
        return item.nome.toLowerCase().includes(search.toLowerCase()) ||
            item.descricao.toLowerCase().includes(search.toLowerCase());
    });



    const clearInputs = () => {
        setDescricao("")
        setNome("")
    }

    useEffect(() => {
        fetchFamilias();
    }, []);

    const fetchFamilias = async () => {
        setLoading(true)

        try {
            const response = await axios.get("http://localhost:9009/api/familia/itens/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRowData(response.data.families);
            setIsDataLoaded(true);
            setItens(response.data.families);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error("Erro ao carregar familia de itens:", error);
        }
    };


    const [rowData, setRowData] = useState<Item[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const createItem = async () => {
        setFamilyCreateDisabled(true)
        if (descricao === "" || nome === "") {
            setFamilyCreateDisabled(false)
            setLoading(false)
            toast.info("Todos os campos devem ser preenchidos!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        const familiaEncontrada = rowData.find((item) => item.nome === nome);
        const nomeExists = !!familiaEncontrada;
        const situacaoInativo = familiaEncontrada?.situacao === "Inativo";

        if (nomeExists && !situacaoInativo) {
            setFamilyCreateDisabled(false);
            setLoading(false);
            toast.info("Esse nome já existe no banco de dados, escolha outro!", {
                position: "top-right",
                autoClose: 3000,
                progressStyle: { background: "yellow" },
                icon: <span>⚠️</span>, // Usa o emoji de alerta
            });
            return;
        }
        if (nomeExists && situacaoInativo && familiaEncontrada?.cod_familia) {
            await editItem(familiaEncontrada); // Passa o serviço diretamente
            fetchFamilias();
            setFamilyCreateDisabled(false);
            setLoading(false);
            clearInputs();
            toast.info("Esse nome já existia na base de dados, portanto foi reativado com os novos dados inseridos.", {
                position: "top-right",
                autoClose: 10000,
                progressStyle: { background: "green" },
                icon: <span>♻️</span>,
            });
            return;
        }

        try {
            const bodyForm = {
                description: descricao,
                name: nome
            }

            const response = await axios.post("http://localhost:9009/api/familia/itens/register", bodyForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setFamilyCreateDisabled(false)
                setLoading(false)
                clearInputs();
                fetchFamilias();
                toast.success("Item salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setFamilyCreateDisabled(false)
                setLoading(false)
                toast.error("Erro ao salvar o item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setFamilyCreateDisabled(false)
            setLoading(false)
            console.error("Erro ao salvar os items:", error);
        }
    }

    const editItem = async (familia: any = selectedFamilia) => {
        if (!familia?.cod_familia) {
            toast.error("Família não selecionada ou inválida. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        setFamilyEditDisabled(true)

        if (descricao === "" || nome === "") {
            setFamilyEditDisabled(false)
            setLoading(false)
            toast.info("Todos os campos devem ser preenchidos!", {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        try {
            const bodyForm = {
                description: descricao,
                name: nome
            }

            const response = await axios.put(`http://localhost:9009/api/familia/itens/edit/${familia.cod_familia}`,
                { ...bodyForm, situacao: "Ativo", cod_familia: familia.cod_familia },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            if (response.status >= 200 && response.status < 300) {
                setFamilyEditDisabled(false)
                setLoading(false)
                clearInputs();
                fetchFamilias();
                setIsEditing(false);
                toast.success("Item editado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setFamilyEditDisabled(false)
                setLoading(false)
                setIsEditing(false);
                toast.error("Erro ao editar o item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setFamilyEditDisabled(false)
            setLoading(false)
            setIsEditing(false);
            console.error("Erro ao editar o item:", error);
        }
    }

    const openDialog = (id: number) => {
        setFamiliaIdToDelete(id);
        setModalDeleteVisible(true);
    };

    const closeDialog = () => {
        setModalDeleteVisible(false);
        setFamiliaIdToDelete(null);
    };

    const handleCancelar = async () => {
        if (familiaIdToDelete === null) return;

        try {
            const response = await axios.put(
                `http://localhost:9009/api/familia/itens/cancel/${familiaIdToDelete}`,
                {}, // Enviar um corpo vazio, caso necessário para o endpoint
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                fetchFamilias(); // Atualizar a lista de famílias
                setModalDeleteVisible(false);
                toast.success("Família cancelada com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                toast.error("Erro ao cancelar família.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            console.log("Erro ao cancelar família:", error);
            toast.error("Erro ao cancelar família. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };


    const handleDelete = async () => {
        if (familiaIdToDelete === null) return;

        try {
            await axios.delete(`http://localhost:9009/api/familia/itens/${familiaIdToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Item removido com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchFamilias();
            setModalDeleteVisible(false)
        } catch (error) {
            console.log("Erro ao excluir item:", error);
            toast.error("Erro ao excluir item. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };

    const handleEdit = (itens: Item) => {
        setDescricao(itens.descricao)
        setNome(itens.nome)
        setSelectedFamilia(itens.cod_familia);
        setIsEditing(true);
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
                            onClick={handleCancelar}
                            className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all" />
                    </div>}
                >
                    <p>Tem certeza que deseja excluir este item?</p>
                </Dialog>

                <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
                    <div className="flex justify-between">
                        <div>
                            <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">Famílias de Itens</h2>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col" style={{ height: "95%" }}>

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
                                    className="w-full"
                                    responsiveLayout="scroll"
                                    tableStyle={{
                                        borderCollapse: "collapse",
                                        width: "100%",
                                    }}
                                >
                                    <Column
                                        field="cod_familia"
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
                                        header="Nome"
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
                                        field="descricao"
                                        header="Descrição"
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
                                        }}
                                        body={(rowData) => rowData.situacao}
                                    />

                                    {permissions?.edicao === "SIM" && (
                                        <Column
                                            header=""
                                            body={(rowData) => (
                                                <div className="flex gap-2 justify-center">
                                                    <button onClick={() => handleEdit(rowData)} className="hover:scale-125 hover:bg-yellow700 p-2 bg-yellow transform transition-all duration-50  rounded-2xl">
                                                        <MdOutlineModeEditOutline style={{ fontSize: "1.2rem" }} className="text-white text-2xl" />
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
                                                    <button onClick={() => openDialog(rowData.cod_familia)} className="bg-red hover:bg-red600 hover:scale-125 p-2 transform transition-all duration-50  rounded-2xl">
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

                            <div className="border border-[#D9D9D9] h-screen rounded-md p-5 w-full ml-5">

                                <div className="p-5">
                                    <div className="">
                                        <label htmlFor="nome" className="block text-blue font-bold">
                                            Nome:
                                        </label>
                                        <input
                                            type="text"
                                            id="nome"
                                            value={nome}
                                            onChange={(e => setNome(e.currentTarget.value))}
                                            className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
                                            placeholder="" />
                                    </div>

                                    <div className="mt-5">
                                        <label htmlFor="description" className="block text-blue  font-bold">
                                            Descrição:
                                        </label>
                                        <input
                                            type="text"
                                            id="description"
                                            value={descricao}
                                            onChange={(e => setDescricao(e.currentTarget.value))}
                                            className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
                                            placeholder="" />
                                    </div>

                                    <div className="flex justify-end mt-5">
                                        {permissions?.insercao === "SIM" && (
                                            <>
                                                {!isEditing && (<Button
                                                    label="Salvar Família"
                                                    className="text-white"
                                                    icon="pi pi-check"
                                                    onClick={() => createItem()}
                                                    disabled={familyCreateDisabled}
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
                                                    label="Salvar Família"
                                                    className="text-white"
                                                    icon="pi pi-check"
                                                    onClick={() => editItem()}
                                                    disabled={familyEditDisabled}
                                                    style={{
                                                        backgroundColor: '#28a745',
                                                        border: '1px solid #28a745',
                                                        padding: '0.5rem 1.5rem',
                                                        fontSize: '14px',
                                                        fontWeight: 'bold',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                    }} />)}
                                            </>
                                        )}
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

export default FamilyPage;
