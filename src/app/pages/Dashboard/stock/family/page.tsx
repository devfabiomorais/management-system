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
import { FaTrash } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
interface Item {
    cod_familia: number;
    descricao: string;
    nome: string;
}

const FamilyPage: React.FC = () => {
    const { token } = useToken();
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



    const filteredItens = itens.filter(
        (item) =>
            item.nome.toLowerCase().includes(search.toLowerCase()) ||
            item.descricao.toLowerCase().includes(search.toLowerCase())
    );

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
            const response = await axios.get("https://back-end-birigui-w3dn.vercel.app/api/familia/itens/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data.families)
            setItens(response.data.families);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error("Erro ao carregar familia de itens:", error);
        }
    };

    const createItem = async () => {
        if (descricao === "" || nome === "") {
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

            const response = await axios.post("https://back-end-birigui-w3dn.vercel.app/api/familia/itens/register", bodyForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setLoading(false)
                clearInputs();
                fetchFamilias();
                toast.success("Item salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setLoading(false)
                toast.error("Erro ao salvar o item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false)
            console.error("Erro ao salvar os items:", error);
        }
    }

    const editItem = async () => {
        if (descricao === "" || nome === "") {
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

            const response = await axios.put(`https://back-end-birigui-w3dn.vercel.app/api/familia/itens/edit/${selectedFamilia}`, bodyForm, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.status >= 200 && response.status < 300) {
                setLoading(false)
                clearInputs();
                fetchFamilias();
                setIsEditing(false);
                toast.success("Item editado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setLoading(false)
                setIsEditing(false);
                toast.error("Erro ao editar o item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
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

    const handleDelete = async () => {
        if (familiaIdToDelete === null) return;

        try {
            await axios.delete(`https://back-end-birigui-w3dn.vercel.app/api/familia/itens/${familiaIdToDelete}`, {
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
            <div className="flex justify-center h-screen">
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
                                    <Column
                                        header=""
                                        body={(rowData) => (
                                            <div className="flex gap-2 justify-center">
                                                <button onClick={() => openDialog(rowData.cod_familia)} className="bg-red text-black p-1 rounded">
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
                                        {!isEditing && (<Button
                                            label="Salvar Família"
                                            className="text-white"
                                            icon="pi pi-check"
                                            onClick={() => createItem()}
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
                                            style={{
                                                backgroundColor: '#28a745',
                                                border: '1px solid #28a745',
                                                padding: '0.5rem 1.5rem',
                                                fontSize: '14px',
                                                fontWeight: 'bold',
                                                display: 'flex',
                                                alignItems: 'center',
                                            }} />)}

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
