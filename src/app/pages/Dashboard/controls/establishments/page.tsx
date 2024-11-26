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
import { FaTrash } from "react-icons/fa";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";

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

const EstablishmentsPage: React.FC = () => {
    const { token } = useToken();
    const [visible, setVisible] = useState(false);
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
    const filteredEstablishments = establishments.filter((establishment) =>
        establishment.nome.toLowerCase().includes(search.toLowerCase())
    );


    const clearInputs = () => {
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

    const handleSaveEdit = async () => {
        setLoading(true)
        try {
            const requiredFields = [
                "nome",
                "logradouro",
                "cidade",
                "bairro",
                "estado",
                "cep",
                "complemento",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }
          
            const response = await axios.put(`http://localhost:5000/api/estabilishment/edit/${selectedEstabilishment?.cod_estabelecimento}`, formValues, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            if (response.status >= 200 && response.status < 300) {
                setLoading(false)
                clearInputs();
                fetchEstabilishments();
                toast.success("Estabelecimento salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
            } else {
                setLoading(false)
                toast.error("Erro ao salvar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false)
            console.error("Erro ao salvar estabelecimento:", error);
        }
    };

    const handleSaveReturn = async () => {
        setLoading(true)
        try {
            const requiredFields = [
                "nome",
                "logradouro",
                "cidade",
                "bairro",
                "estado",
                "cep",
                "complemento",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }
          
            const response = await axios.post("http://localhost:5000/api/estabilishment/register", formValues, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            if (response.status >= 200 && response.status < 300) {
                setLoading(false)
                clearInputs();
                fetchEstabilishments();
                toast.success("Estabelecimento salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
            } else {
                setLoading(false)
                toast.error("Erro ao salvar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false)
            console.error("Erro ao salvar o estabelecimento:", error);
        }
    };

    const handleSave = async () => {
        setLoading(true)
        try {
            const requiredFields = [
                "nome",
                "logradouro",
                "cidade",
                "bairro",
                "estado",
                "cep",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return value === "" || value === null || value === undefined;
            });

            if (isEmptyField) {
                setLoading(false)
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }
         
            const response = await axios.post("http://localhost:5000/api/estabilishment/register", formValues, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            if (response.status >= 200 && response.status < 300) {
                setLoading(false)
                clearInputs();
                fetchEstabilishments();
                toast.success("Estabelecimento salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setLoading(false)
                toast.error("Erro ao salvar estabelecimento.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setLoading(false)
            console.error("Erro ao salvar o estabelecimento:", error);
        }
    };


    const handleEdit = (estabeleshiment: Establishment) => {
        setFormValues(estabeleshiment);
        setSelectedEstabilishment(estabeleshiment);
        setIsEditing(true);
        setVisible(true);
    };


    useEffect(() => {
        fetchEstabilishments();
    }, []);

    const fetchEstabilishments = async () => {
        setLoading(true)
        try {
          
            const response = await axios.get("http://localhost:5000/api/estabilishment", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
            console.log(response.data.estabelecimentos)
            setEstablishments(response.data.estabelecimentos);
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error("Erro ao carregar clientes:", error);
        }
    };

    const openDialog = (id: number) => {
        setEstabilishmentIdToDelete(id);
        setModalDeleteVisible(true);
    };

    const closeDialog = () => {
        setModalDeleteVisible(false);
        setEstabilishmentIdToDelete(null);
    };

    const handleDelete = async () => {
        if (estabilishmentIdToDelete === null) return;
   
        try {
            await axios.delete(`http://localhost:5000/api/estabilishment/${estabilishmentIdToDelete}`, {
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
            <div className="flex justify-center h-screen">

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
                                onClick={handleDelete}
                                className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all"
                            />
                        </div>
                    }
                >
                    <p>Tem certeza que deseja excluir este estabelecimento?</p>
                </Dialog>

                <Dialog
                    header={isEditing ? "Editar Estabelecimento" : "Novo Estabelecimento"}
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
                        <div className="grid grid-cols-2 gap-2">
                            {/*<div>
                                <label htmlFor="code" className="block text-blue font-medium">
                                    Código:
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>*/}

                            <div>
                                <label htmlFor="name" className="block text-blue font-medium">
                                    Nome:
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="nome"
                                    value={formValues.nome}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="street" className="block text-blue font-medium">
                                Logradouro:
                            </label>
                            <input
                                type="text"
                                id="street"
                                name="logradouro"
                                value={formValues.logradouro}
                                onChange={handleInputChange}
                                className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                placeholder=""
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label htmlFor="number" className="block text-blue font-medium">
                                    Número:
                                </label>
                                <input
                                    type="text"
                                    id="number"
                                    name="numero"
                                    value={formValues.numero}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <label htmlFor="cep" className="block text-blue font-medium">
                                    Cep:
                                </label>
                                <input
                                    type="text"
                                    id="cep"
                                    name="cep"
                                    value={formValues.cep}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <label htmlFor="complement" className="block text-blue font-medium">
                                    Complemento:
                                </label>
                                <input
                                    type="text"
                                    id="complement"
                                    name="complemento"
                                    value={formValues.complemento}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div>
                                <label htmlFor="state" className="block text-blue font-medium">
                                    Estado:
                                </label>
                                <select
                                    id="state"
                                    name="estado"
                                    value={formValues.estado}
                                    onChange={(e) => setFormValues({ ...formValues, estado: e.target.value })}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                >
                                     <option  value="">
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
                                    Cidade:
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    name="cidade"
                                    value={formValues.cidade}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>

                            <div>
                                <label htmlFor="neighborHood" className="block text-blue font-medium">
                                    Bairro:
                                </label>
                                <input
                                    type="text"
                                    id="neighborHood"
                                    name="bairro"
                                    value={formValues.bairro}
                                    onChange={handleInputChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder=""
                                />
                            </div>
                        </div>
                    </div>




                    <div className="flex justify-between items-center  mt-16">


                        <div className="flex gap-3">

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
                                onClick={() => closeModal()}
                            />
                            {!isEditing && (
                                <><Button
                                    label="Salvar e Voltar à Listagem"
                                    className="text-white"
                                    icon="pi pi-refresh"
                                    onClick={handleSaveReturn}
                                    style={{
                                        backgroundColor: '#007bff',
                                        border: '1px solid #007bff',
                                        padding: '0.5rem 1.5rem',
                                        fontSize: '14px',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }} />
                                    <Button
                                        label="Salvar e Adicionar Outro"
                                        className="text-white"
                                        icon="pi pi-check"
                                        onClick={handleSave}
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
                            )}
                        </div>

                    </div>
                </Dialog>










                <div className="bg-grey pt-3 pl-1 pr-1 w-full h-full rounded-md">
                    <div className="flex justify-between">
                        <div>
                            <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">Estabelecimentos</h2>
                        </div>

                        <div>
                            <button className="bg-green200 rounded mr-3" onClick={() => setVisible(true)}>
                                <IoAddCircleOutline style={{ fontSize: "2.5rem" }} className="text-white text-center" />
                            </button>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg p-8 pt-8 shadow-md w-full flex flex-col" style={{ height: "95%" }}>
                        <div className="mb-4 flex justify-end">
                            <p className="text-blue font-bold text-lg">Busca:</p>
                            <InputText
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder=""
                                className="p-inputtext-sm border rounded-md ml-1 text-black pl-1"
                                style={{ border: "1px solid #1B405D80", }}
                            />
                        </div>
                        <DataTable
                            value={filteredEstablishments.slice(first, first + rows)}
                            paginator={true}
                            rows={rows}
                            rowsPerPageOptions={[5, 10]}
                            onPage={(e) => {
                                setFirst(e.first);
                                setRows(e.rows);
                            }}
                            tableStyle={{
                                borderCollapse: 'collapse',
                                width: '100%',
                            }}
                            className="w-full"
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
                            <Column field="cep" header="Cep" style={{
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
                                }}
                            />
                            <Column
                                header=""
                                body={(rowData) => (
                                    <div className="flex gap-2 justify-center">
                                        <button onClick={() => openDialog(rowData.cod_estabelecimento)} className="bg-red text-black p-1 rounded">
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
        </SidebarLayout>
    );
};

export default EstablishmentsPage;
