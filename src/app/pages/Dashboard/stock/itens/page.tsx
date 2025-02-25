"use client"
import React, { ChangeEvent, useEffect, useState } from "react";
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
import { MultiSelect } from "primereact/multiselect";
import { Dropdown } from "primereact/dropdown";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import { useGroup } from "@/app/hook/acessGroup";
import useUserPermissions from "@/app/hook/useUserPermissions";

interface Item {
    cod_item: string;
    descricao: string;
    narrativa: string;
    dbs_unidades_medida?: {
        un?: string;
        cod_un: number;
    };
    dbs_familias?: {
        cod_familia: number;
        nome: string;
        descricao: string
    };
    dbs_estabelecimentos_item?: Array<{
        cod_estabel: number;
        cod_estabel_item: number;
        cod_item: string;
    }>;
    cod_un: { cod_un: number; un: string; descricao: string } | null;
    cod_familia: { cod_familia: number; nome: string; descricao: string } | null
    cod_estabelecimento: string[];
    dt_hr_criacao?: string;
    anexo?: File;
    situacao: string;
}

interface ItemFamilia {
    cod_familia: number;
    descricao: string;
    nome: string;
}

interface ItemMedida {
    cod_un: number;
    descricao: string;
    un: string;
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

const ItensPage: React.FC = () => {
    const { groupCode } = useGroup();
    const { token } = useToken();
    const {
        permissions,
    } = useUserPermissions(groupCode ?? 0, "Estoque");
    const [isItemCreateDisabled, setItemCreateDisabled] = useState(false);
    const [isItemCreateDisabledReturn, setItemCreateDisabledReturn] = useState(false);
    const [isItemEditDisabled, setIsItemEditDisabled] = useState(false);
    const [visible, setVisible] = useState(false);
    const [itens, setItens] = useState<Item[]>([]);
    let [loading, setLoading] = useState(false);
    let [color, setColor] = useState("#B8D047");
    const [search, setSearch] = useState("");
    const [first, setFirst] = useState(0);
    const [rows, setRows] = useState(10);
    const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
    const [itensIdToDelete, setItensIdToDelete] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [establishments, setEstablishments] = useState<Establishment[]>([]);
    const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
    const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
    const [selectedFamily, setSelectedFamily] = useState<number | null>(null);
    const [units, setUnits] = useState<ItemMedida[]>([]);
    const [families, setFamilies] = useState<ItemFamilia[]>([]);
    const [formValues, setFormValues] = useState<Item>({
        cod_item: "",
        descricao: "",
        narrativa: "",
        dbs_unidades_medida: {
            un: "",
            cod_un: 0
        },
        cod_estabelecimento: [],
        cod_un: null,
        cod_familia: null,
        situacao: "",
    });



    const filteredItens = itens.filter(
        (item) =>
            item.descricao.toLowerCase().includes(search.toLowerCase()) ||
            item.narrativa.toLowerCase().includes(search.toLowerCase())
    );

    const clearInputs = () => {
        setFormValues({
            cod_item: "",
            descricao: "",
            narrativa: "",
            dbs_unidades_medida: {
                un: "",
                cod_un: 0
            },
            cod_estabelecimento: [],
            cod_un: null,
            cod_familia: null,
            situacao: "",
        })
        console.log("Form values after clear:", formValues);
        setSelectedFamily(null)
        setSelectedUnit(null)
        setSelectedEstablishments([]);
    }

    useEffect(() => {
        fetchItens();
    }, []);

    const fetchItens = async () => {
        clearInputs()
        setLoading(true)
        try {
            const response = await axios.get("https://api-birigui-teste.comviver.cloud/api/itens", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRowData(response.data.items);
            setIsDataLoaded(true);
            setItens(response.data.items);
            setFormValues({ ...formValues, cod_item: (response.data.items.length + 1) })
            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.error("Erro ao carregar itens:", error);
        }
    };

    const openDialog = (id: number) => {
        setItensIdToDelete(id);
        setModalDeleteVisible(true);
    };

    const closeDialog = () => {
        setModalDeleteVisible(false);
        setItensIdToDelete(null);
    };

    const handleDelete = async () => {
        if (itensIdToDelete === null) return;
        try {
            await axios.put(`https://api-birigui-teste.comviver.cloud/api/itens/edit/${itensIdToDelete}`, { situacao: "DESATIVADO" }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success("Cliente removido com sucesso!", {
                position: "top-right",
                autoClose: 3000,
            });
            fetchItens();
            setModalDeleteVisible(false)
        } catch (error) {
            console.log("Erro ao excluir item:", error);
            toast.error("Erro ao excluir item. Tente novamente.", {
                position: "top-right",
                autoClose: 3000,
            });
        }
    };



    const closeModal = () => {
        clearInputs()
        setIsEditing(false)
        setVisible(false)
    }

    const handleSaveEdit = async () => {
        setIsItemEditDisabled(true)
        setLoading(true);
        setIsEditing(false);
        try {
            // Verificar campos obrigatórios
            const requiredFields = [
                "descricao",
                "narrativa",
                "cod_un",
                "situacao",
                "cod_familia",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return Array.isArray(value) ? value.length === 0 : value === "" || value === null || value === undefined;
            });

            if (selectedEstablishments.length === 0) {
                setIsItemEditDisabled(false)
                setLoading(false);
                toast.info("Você deve selecionar pelo menos um estabelecimento!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            if (isEmptyField) {
                setIsItemEditDisabled(false)
                setLoading(false);
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const formData = new FormData();
            formData.append("descricao", formValues.descricao);
            formData.append("narrativa", formValues.narrativa);
            formData.append("cod_item", formValues.cod_item);

            // Passar cod_un e cod_familia corretamente
            if (formValues.cod_un?.cod_un) {
                formData.append("cod_un", formValues.cod_un.cod_un.toString());
            }
            if (formValues.cod_familia?.cod_familia) {
                formData.append("cod_familia", formValues.cod_familia.cod_familia.toString());
            }

            formData.append("situacao", formValues.situacao);

            // Adicionar os estabelecimentos
            selectedEstablishments.forEach((establishment) => {
                if (establishment.cod_estabelecimento) {
                    formData.append("cod_estabelecimento[]", establishment.cod_estabelecimento.toString());
                }
            });

            // Enviar arquivo de anexo, se presente
            if (formValues.anexo) {
                const file = formValues.anexo;
                formData.append("anexo", file);
            }
            const response = await axios.put(
                `https://api-birigui-teste.comviver.cloud/api/itens/edit/${selectedItem?.cod_item}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status >= 200 && response.status < 300) {
                setIsItemEditDisabled(false)
                setLoading(false);
                clearInputs();
                fetchItens();
                toast.success("Item atualizado com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
            } else {
                setIsItemEditDisabled(false)
                setLoading(false);
                toast.error("Erro ao atualizar item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setIsItemEditDisabled(false)
            setLoading(false);
            console.error("Erro ao atualizar item:", error);
        }
    };

    const handleSave = async () => {
        setItemCreateDisabled(true)
        setLoading(true);
        try {
            const requiredFields = [
                "descricao",
                "narrativa",
                "cod_un",
                "situacao",
                "cod_familia",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return Array.isArray(value) ? value.length === 0 : value === "" || value === null || value === undefined;
            });

            if (selectedEstablishments.length === 0) {
                setItemCreateDisabled(false)
                setLoading(false);
                toast.info("Você deve selecionar pelo menos um estabelecimento!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            if (isEmptyField) {
                setItemCreateDisabled(false)
                setLoading(false);
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const formData = new FormData();
            formData.append("descricao", formValues.descricao);
            formData.append("narrativa", formValues.narrativa);
            formData.append("cod_item", formValues.cod_item);
            if (formValues.cod_un && formValues.cod_un.cod_un !== undefined) {
                formData.append("cod_un", formValues.cod_un.cod_un.toString());
            }

            formData.append("situacao", formValues.situacao);

            if (formValues.cod_familia && formValues.cod_familia.cod_familia !== undefined) {
                formData.append("cod_familia", formValues.cod_familia.cod_familia.toString());
            }

            selectedEstablishments.forEach((establishment) => {
                if (establishment.cod_estabelecimento) {
                    console.log(establishment.cod_estabelecimento)
                    formData.append("cod_estabelecimento[]", establishment.cod_estabelecimento.toString());
                } else {
                    console.error("Valor inválido para cod_estabelecimento:", establishment);
                }
            });

            if (formValues.anexo) {
                const file = formValues.anexo;
                formData.append("anexo", file);
            }
            const response = await axios.post("https://api-birigui-teste.comviver.cloud/api/itens/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });


            if (response.status >= 200 && response.status < 300) {
                setItemCreateDisabled(false)
                setLoading(false);
                clearInputs();
                fetchItens();
                toast.success("Item salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
            } else {
                setItemCreateDisabled(false)
                setLoading(false);
                toast.error("Erro ao salvar item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setItemCreateDisabled(false)
            setLoading(false);
            console.error("Erro ao salvar item:", error);
        }
    };


    const [rowData, setRowData] = useState<Item[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    const handleSaveReturn = async () => {
        setItemCreateDisabledReturn(true)
        setLoading(true);
        try {
            const requiredFields = [
                "descricao",
                "narrativa",
                "cod_un",
                "situacao",
                "cod_familia",
            ];

            const isEmptyField = requiredFields.some((field) => {
                const value = formValues[field as keyof typeof formValues];
                return Array.isArray(value) ? value.length === 0 : value === "" || value === null || value === undefined;
            });

            if (selectedEstablishments.length === 0) {
                setItemCreateDisabledReturn(false)
                setLoading(false);
                toast.info("Você deve selecionar pelo menos um estabelecimento!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            if (isEmptyField) {
                setItemCreateDisabledReturn(false)
                setLoading(false);
                toast.info("Todos os campos devem ser preenchidos!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                return;
            }

            const formData = new FormData();
            formData.append("descricao", formValues.descricao);
            formData.append("narrativa", formValues.narrativa);
            formData.append("cod_item", formValues.cod_item);
            if (formValues.cod_un && formValues.cod_un.cod_un !== undefined) {
                formData.append("cod_un", formValues.cod_un.cod_un.toString());
            }

            formData.append("situacao", formValues.situacao);

            if (formValues.cod_familia && formValues.cod_familia.cod_familia !== undefined) {
                formData.append("cod_familia", formValues.cod_familia.cod_familia.toString());
            }

            selectedEstablishments.forEach((establishment) => {
                if (establishment.cod_estabelecimento) {
                    console.log(establishment.cod_estabelecimento)
                    formData.append("cod_estabelecimento[]", establishment.cod_estabelecimento.toString());
                } else {
                    console.error("Valor inválido para cod_estabelecimento:", establishment);
                }
            });



            if (formValues.anexo) {
                const file = formValues.anexo;
                formData.append("anexo", file);
            }

            // Verificar se o "nome" já existe no storedRowData
            const nomeExists = rowData.some((item) => item.descricao === formValues.descricao);

            if (nomeExists) {
                setItemCreateDisabledReturn(false);
                setLoading(false);
                toast.info("Essa descrição já existe, escolha outra!", {
                    position: "top-right",
                    autoClose: 3000,
                    progressStyle: { background: "yellow" },
                    icon: <span>⚠️</span>, // Usa o emoji de alerta
                });

                return;
            }

            const response = await axios.post("https://api-birigui-teste.comviver.cloud/api/itens/register", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status >= 200 && response.status < 300) {
                setItemCreateDisabledReturn(false)
                setLoading(false);
                clearInputs();
                fetchItens();
                toast.success("Item salvo com sucesso!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setVisible(false);
            } else {
                setItemCreateDisabledReturn(false)
                setLoading(false);
                toast.error("Erro ao salvar item.", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            setItemCreateDisabledReturn(false)
            setLoading(false);
            console.error("Erro ao salvar item:", error);
        }
    };


    const handleEdit = async (itens: Item) => {
        console.log(itens);
        try {
            // Requisição para obter as unidades de medida
            const unitResponse = await axios.get("https://api-birigui-teste.comviver.cloud/api/unMedida", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnits(unitResponse.data.units);

            // Requisição para obter as famílias de itens
            const familyResponse = await axios.get("https://api-birigui-teste.comviver.cloud/api/familia/itens/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFamilies(familyResponse.data.families);

            const estabilishmentResponse = await axios.get("https://api-birigui-teste.comviver.cloud/api/estabilishment", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEstablishments(estabilishmentResponse.data.estabelecimentos);

            // Encontrar a unidade correspondente pelo ID
            const selectedUnit = unitResponse.data.units.find(
                (unit: ItemMedida) => unit.cod_un === itens.dbs_unidades_medida?.cod_un
            );

            // Encontrar a família correspondente pelo ID
            const selectedFamily = familyResponse.data.families.find(
                (family: ItemFamilia) => family.cod_familia === itens.dbs_familias?.cod_familia
            );

            // Encontrar o estabelecimento correspondente pelo ID
            const selectedEstabilishment = estabilishmentResponse.data.estabelecimentos.find(
                (es: Establishment) =>
                    Array.isArray(itens.dbs_estabelecimentos_item) &&
                    itens.dbs_estabelecimentos_item.some(
                        (dbEstabelecimento) => dbEstabelecimento.cod_estabel === es.cod_estabelecimento
                    )
            );

            console.log("asads", selectedEstabilishment)
            setFormValues({
                cod_item: itens.cod_item || "",
                descricao: itens.descricao || "",
                narrativa: itens.narrativa || "",
                dbs_unidades_medida: itens.dbs_unidades_medida,
                cod_estabelecimento: itens.cod_estabelecimento || [],
                situacao: itens.situacao || "",
                cod_un: selectedUnit ? selectedUnit.cod_un : null,
                cod_familia: selectedFamily ? selectedFamily.cod_familia : null
            });

            setSelectedEstablishments(selectedEstabilishment ? [selectedEstabilishment] : []);
            setSelectedFamily(selectedFamily || null);
            setSelectedUnit(selectedUnit || null);

            setSelectedItem(itens);
            setIsEditing(true);
            setVisible(true);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            setFormValues({ ...formValues, anexo: file });
        }
    };

    useEffect(() => {
        fetchEstabilishments();
        fetchUnits();
        fetchFamilias();
    }, []);

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

    const fetchUnits = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://api-birigui-teste.comviver.cloud/api/unMedida", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnits(response.data.units);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Erro ao carregar unidades de medida:", error);
        }
    };

    const fetchFamilias = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://api-birigui-teste.comviver.cloud/api/familia/itens/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setFamilies(response.data.families);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            console.error("Erro ao carregar famílias de itens:", error);
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
                            onClick={handleDelete}
                            className="p-button-danger bg-green200 text-white p-2 ml-5 hover:bg-green-700 transition-all" />
                    </div>}
                >
                    <p>Tem certeza que deseja desativar este item?</p>
                </Dialog>



                <Dialog
                    header={isEditing ? "Editar Item" : "Novo Item"}
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
                        <div className="grid grid-cols-2 gap-2">
                            <div className="">
                                <label htmlFor="code" className="block text-blue font-medium">
                                    Código:
                                </label>
                                <input
                                    type="text"
                                    id="code"
                                    name="descricao"
                                    disabled
                                    value={formValues.cod_item}
                                    onChange={(e) => setFormValues({ ...formValues, cod_item: e.target.value })}
                                    className="w-full bg-slate-600 border border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>

                            <div className="">
                                <label htmlFor="description" className="block text-blue  font-medium">
                                    Descrição:
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    name="descricao"
                                    value={formValues.descricao}
                                    onChange={(e) => setFormValues({ ...formValues, descricao: e.target.value })}
                                    className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
                                    placeholder="" />
                            </div>
                        </div>

                        <div className="">
                            <label htmlFor="narrative" className="block text-blue  font-medium">
                                Narrativa:
                            </label>
                            <textarea
                                id="narrative"
                                rows={3}
                                name="narrativa"
                                value={formValues.narrativa}
                                onChange={(e) => setFormValues({ ...formValues, narrativa: e.target.value })}
                                className="w-full border text-black border-[#D9D9D9] pl-1 rounded-sm h-8"
                                placeholder="" />
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <div className="">
                                <label htmlFor="un" className="block text-blue  font-medium">
                                    UN:
                                </label>
                                <Dropdown
                                    id="un"
                                    name="cod_un"
                                    value={selectedUnit}
                                    onChange={(e) => {
                                        setSelectedUnit(e.value);
                                        setFormValues({ ...formValues, cod_un: e.value });
                                    }}
                                    options={units}
                                    optionLabel="descricao"
                                    placeholder="Selecione"
                                    filter

                                    className="w-full" />
                            </div>
                            <div className="">
                                <label htmlFor="family" className="block text-blue  font-medium">
                                    Família:
                                </label>
                                <Dropdown
                                    id="family"
                                    name="cod_familia"
                                    value={selectedFamily}
                                    onChange={(e) => {
                                        console.log(e.value);
                                        setSelectedFamily(e.value);
                                        setFormValues({ ...formValues, cod_familia: e.value });
                                    }}
                                    options={families}
                                    optionLabel="nome"
                                    placeholder="Selecione a Família"
                                    filter
                                    className="w-full md:w-14rem" />
                            </div>

                            <div className="">
                                <label htmlFor="situation" className="block text-blue  font-medium">
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

                        <div className="grid grid-cols-2 gap-2">
                            <div className="">
                                <label htmlFor="photo" className="block text-blue  font-medium">
                                    Foto:
                                </label>
                                <input
                                    type="file"
                                    id="photo"
                                    name="foto"
                                    onChange={handleFileChange}
                                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-12" />
                            </div>
                            <div className="">
                                <label htmlFor="estabilishments" className="block text-blue  font-medium">
                                    Estabelecimentos:
                                </label>

                                <MultiSelect
                                    value={selectedEstablishments}
                                    onChange={(e) => setSelectedEstablishments(e.value)}
                                    options={establishments}
                                    optionLabel="nome"
                                    filter
                                    placeholder="Selecione os Estabelecimentos"
                                    maxSelectedLabels={3}
                                    className="w-full border text-black" />
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
                                onClick={() => closeModal()} />
                            {!isEditing && (
                                <><Button
                                    label="Salvar e Voltar à Listagem"
                                    className="text-white"
                                    icon="pi pi-refresh"
                                    onClick={handleSaveReturn}
                                    disabled={isItemCreateDisabledReturn}
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
                                        disabled={isItemCreateDisabled}
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
                                    disabled={isItemEditDisabled}
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
                            <h2 className="text-blue text-2xl font-extrabold mb-3 pl-3">Itens</h2>
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
                                field="cod_item"
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
                                field="narrativa"
                                header="Narrativa"
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
                                field="dbs_unidades_medida.un"
                                header="UN"
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
                                field="dt_hr_criacao"
                                header="DT Cadastro"
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
                                body={(rowData) => {
                                    const date = new Date(rowData.dt_hr_criacao);
                                    const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                        hour12: true,
                                    }).format(date);

                                    return <span>{formattedDate}</span>;
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
                                            <button onClick={() => openDialog(rowData.cod_item)} className="bg-red text-black p-1 rounded">
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
                </div>
            </div>
        </SidebarLayout><Footer /></>
    );
};

export default ItensPage;
