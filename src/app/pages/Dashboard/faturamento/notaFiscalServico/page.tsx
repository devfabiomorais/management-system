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
import { Button } from "primereact/button";
import axios from "axios";
import { toast } from "react-toastify";
import BeatLoader from "react-spinners/BeatLoader";
import { useToken } from "../../../../hook/accessToken";
import Footer from "@/app/components/Footer";
import useUserPermissions from "@/app/hook/useUserPermissions";
import { useGroup } from "@/app/hook/acessGroup";
import EditButton from "@/app/components/Buttons/EditButton";
import ViewButton from "@/app/components/Buttons/ViewButton";
import RegisterButton from "@/app/components/Buttons/RegisterButton";
import CancelButton from "@/app/components/Buttons/CancelButton";
import { MultiSelect } from "primereact/multiselect";
import { Establishment, fetchEstabilishments } from "@/services/controls/estabilishment";
import type { NfsServico } from "@/services/faturamento/nfsServicos";
import { fetchNfsServicos } from "@/services/faturamento/nfsServicos";
import { fetchGruposTributacao, GrupoTributacao } from "@/services/faturamento/gruposTributacao";
import { Cfop, fetchCfops } from "@/services/faturamento/cfops";
import NaturezaOperacao from "../naturezaOperacao/page";
import { fetchNaturezaOperacao } from "@/services/faturamento/naturezaOperacao";
import { fetchFornecedores, Fornecedor } from "@/services/commercial/fornecedores";
import type { Client } from "@/services/commercial/clients";
import { fetchClients } from "@/services/commercial/clients";
import { FaTimes } from "react-icons/fa";
import { Dropdown } from "primereact/dropdown";
import AddButton from "@/app/components/Buttons/AddButton";



const NfsServico: React.FC = () => {
  const { groupCode } = useGroup();
  const { token } = useToken();
  const { permissions } = useUserPermissions(groupCode ?? 0, "Financeiro");
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");
  const [itemCreateDisabled, setItemCreateDisabled] = useState(false);
  const [itemCreateReturnDisabled, setItemCreateReturnDisabled] =
    useState(false);
  const [itemEditDisabled, setItemEditDisabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [first, setFirst] = useState(0);
  const [rows, setRows] = useState(10);

  const [nfsServicos, setNfsServicos] = useState<NfsServico[]>([]);
  const [selectedNfsServico, setSelectedNfsServico] = useState<NfsServico | null>(null);

  // useEffect para carregar os dados ao montar a página
  useEffect(() => {
    const carregarNfsServicos = async () => {
      const nfs = await fetchNfsServicos(token);
      setNfsServicos(nfs);
    };

    carregarNfsServicos();
  }, [token]);

  const filteredNfsServicos = (nfsServicos ?? []).filter((nfs) => {
    if (nfs.situacao !== 'Ativo') return false;

    return Object.values(nfs).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    );
  });




  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [NfsServicosIdToDelete, setNfsServicoIdToDelete] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formValues, setFormValues] = useState<NfsServico>({
    cod_nf_servico: 0,
    numero_rps: undefined,
    serie: undefined,
    cod_natureza_operacao: undefined,
    dt_emissao: undefined,
    hr_emissao: undefined,
    cod_entidade: undefined,
    cnpj_cpf_ent: "",
    razao_social_ent: "",
    tipo_contribuinte_ent: "",
    insc_estadual_ent: "",
    insc_municipal_ent: "",
    cep_ent: "",
    logradouro_ent: "",
    numero_ent: undefined,
    estado_ent: "",
    bairro_ent: "",
    cidade_ent: "",
    descricao_servico: "",
    total_icms: undefined,
    aliquota_icms: undefined,
    total_cofins: undefined,
    aliquota_cofins: undefined,
    total_pis: undefined,
    aliquota_pis: undefined,
    total_csll: undefined,
    aliquota_csll: undefined,
    total_ir: undefined,
    aliquota_ir: undefined,
    total_inss: undefined,
    aliquota_inss: undefined,
    observacoes: "",
    informacoes_adicionais: "",
    descontar_impostos: undefined,
    total_nf: undefined,
    valor_servicos: undefined,
    valor_deducoes: undefined,
    valor_iss: undefined,
    aliquota: undefined,
    descontos: undefined,
    base_calculo: undefined,
    iss_retido: undefined,
    situacao: "Ativo",
  });


  const clearInputs = () => {
    setVisualizar(false)
    setFormValues({
      cod_nf_servico: 0,
      numero_rps: undefined,
      serie: undefined,
      cod_natureza_operacao: undefined,
      dt_emissao: undefined,
      hr_emissao: undefined,
      cod_entidade: undefined,
      cnpj_cpf_ent: "",
      razao_social_ent: "",
      tipo_contribuinte_ent: "",
      insc_estadual_ent: "",
      insc_municipal_ent: "",
      cep_ent: "",
      logradouro_ent: "",
      numero_ent: undefined,
      estado_ent: "",
      bairro_ent: "",
      cidade_ent: "",
      descricao_servico: "",
      total_icms: undefined,
      aliquota_icms: undefined,
      total_cofins: undefined,
      aliquota_cofins: undefined,
      total_pis: undefined,
      aliquota_pis: undefined,
      total_csll: undefined,
      aliquota_csll: undefined,
      total_ir: undefined,
      aliquota_ir: undefined,
      total_inss: undefined,
      aliquota_inss: undefined,
      observacoes: "",
      informacoes_adicionais: "",
      descontar_impostos: undefined,
      total_nf: undefined,
      valor_servicos: undefined,
      valor_deducoes: undefined,
      valor_iss: undefined,
      aliquota: undefined,
      descontos: undefined,
      base_calculo: undefined,
      iss_retido: undefined,
      situacao: "Ativo",
    });
    setSelectedEstablishments([]);
  };


  const handleSaveEdit = async (cod_natureza_operacao: any) => {
    try {
      const requiredFields = [
        "numero_nf",
        "serie",
        "cod_natureza_operacao",
        "tipo",
        "dt_emissao",
        "hr_emissao",
        "dt_entrada_saida",
        "hr_entrada_saida",
        "finalidade_emissao",
        "forma_emissao",
        "destinacao_operacao",
        "tipo_atendimento",
        "cod_entidade",
        "tipo_en",
        "cnpj_cpf_ent",
        "razao_social_ent",
        "tipo_contribuinte_ent",
        "insc_estadual_ent",
        "insc_municipal_ent",
        "cep_ent",
        "logradouro_ent",
        "numero_ent",
        "estado_ent",
        "bairro_ent",
        "cidade_ent",
        "cod_transportadora",
        "cnpj_cpf_transp",
        "razao_social_transp",
        "tipo_contribuinte_transp",
        "insc_estadual_transp",
        "insc_municipal_transp",
        "cep_transp",
        "logradouro_transp",
        "numero_transp",
        "estado_transp",
        "bairro_transp",
        "cidade_transp",
        "estado_uf",
        "placa_veiculo",
        "reg_nac_trans_carga",
        "modalidade",
        "total_icms",
        "total_pis",
        "total_cofins",
        "total_ipi",
        "total_servicos",
        "total_frete",
        "total_nf",
        "impostos_federais",
        "impostos_estaduais",
        "impostos_municipais",
        "total_impostos",
        "informacoes_complementares",
        "informacoes_fisco",
      ];


      const verificarCamposObrigatorios = (dados: NfsServico): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof NfsServico];

          if (valor === "" || valor === null || valor === undefined) {
            return campo; // Retorna o primeiro campo inválido
          }

        }
        return null; // Todos os campos estão válidos
      };
      const campoFaltando = verificarCamposObrigatorios(formValues);

      if (campoFaltando) {
        toast.info(`O campo obrigatório "${campoFaltando}" não foi preenchido.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      } else if (selectedEstablishments == null) {
        toast.info(`Selecione pelo menos um estabelecimento.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/edit/${cod_natureza_operacao}`,
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
        const novasNaturezas = await fetchNfsServicos(token);
        setNfsServicos(novasNaturezas);
        toast.success("Nota Fiscal de Servico editada com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setVisible(false);
        setIsEditing(false);
      } else {
        setItemEditDisabled(false);
        setLoading(false);
        toast.error("Erro ao editar Nota Fiscal de Servico.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      setItemEditDisabled(false);
      setLoading(false);
      console.error("Erro ao editar Nota Fiscal de Servico:", error);
    }
  };


  const [rowData, setRowData] = useState<NfsServico[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleSaveReturn = async (fecharTela: boolean) => {
    setItemCreateReturnDisabled(true);
    setLoading(true);

    try {
      const requiredFields = [
        "nome",
        "padrao",
        "tipo",
        "finalidade_emissao",
        "tipo_agendamento",
        "consumidor_final",
        "observacoes",
        "cod_grupo_tributacao",
        "cod_cfop_interno",
        "cod_cfop_externo",
      ];

      const verificarCamposObrigatorios = (dados: NfsServico): string | null => {
        for (const campo of requiredFields) {
          const valor = dados[campo as keyof NfsServico];

          if (valor === "" || valor === null || valor === undefined) {
            return campo; // Retorna o primeiro campo inválido
          }

        }
        return null; // Todos os campos estão válidos
      };
      const campoFaltando = verificarCamposObrigatorios(formValues);

      if (campoFaltando) {
        toast.info(`O campo obrigatório "${campoFaltando}" não foi preenchido.`, {
          position: "top-right",
          autoClose: 3000,
        });
        setItemCreateReturnDisabled(false);
        setLoading(false);
        return;
      }


      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/register`,
        { ...formValues, estabelecimentos: selectedEstablishments },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        toast.success("Nota Fiscal de Servico salva com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        const novasNaturezas = await fetchNfsServicos(token);
        setNfsServicos(novasNaturezas);
        clearInputs();
        setVisible(fecharTela);
      } else {
        toast.error("Erro ao salvar Nota Fiscal de Servico.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Erro ao salvar Nota Fiscal de Servico:", error);
      toast.error("Erro interno ao tentar salvar.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setItemCreateReturnDisabled(false);
      setLoading(false);
    }
  };



  const [visualizando, setVisualizar] = useState<boolean>(false);

  const handleEdit = (NfsServicos: any, visualizar: boolean) => {
    console.log(NfsServicos)
    setVisualizar(visualizar);

    setFormValues(NfsServicos);
    // Filtra os estabelecimentos com base no cod_estabel
    const selectedEstablishmentsWithNames = NfsServicos.dbs_estabelecimentos_natureza.map(({ cod_estabel }: any) =>
      establishments.find((estab) => estab.cod_estabelecimento === cod_estabel)
    )
      .filter(Boolean); // Remove valores undefined (caso algum código não tenha correspondência)

    setSelectedEstablishments(selectedEstablishmentsWithNames);
    setSelectedNfsServico(NfsServicos);
    setIsEditing(true);
    setVisible(true);
  };


  const [naturezaOperacao, setNaturezaOperacao] = useState<NaturezaOperacao[]>([]);
  const [selectedNaturezaOperacao, setSelectedNaturezaOperacao] = useState<NaturezaOperacao[]>([]);

  // useEffect para carregar dados
  useEffect(() => {
    const carregarNatureza = async () => {
      const natureza = await fetchNaturezaOperacao(token);
      setNaturezaOperacao(natureza);
    };

    carregarNatureza();
  }, [token]);



  const openDialog = (id: number) => {
    setNfsServicoIdToDelete(id);
    setModalDeleteVisible(true);
  };

  const closeDialog = () => {
    setModalDeleteVisible(false);
    setNfsServicoIdToDelete(null);
  };

  const handleCancelar = async () => {
    if (NfsServicosIdToDelete === null) return;

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/nfsServicos/cancel/${NfsServicosIdToDelete}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        const novasNaturezas = await fetchNfsServicos(token);
        setNfsServicos(novasNaturezas);
        setModalDeleteVisible(false);
        toast.success("Nota Fiscal de Servico cancelado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
      } else {
        toast.error("Erro ao cancelar Nota Fiscal de Servico.", {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.log("Erro ao cancelar Nota Fiscal de Servico:", error);
      toast.error("Erro ao cancelar Nota Fiscal de Servico. Tente novamente.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };




  const closeModal = () => {
    clearInputs();
    setIsEditing(false);
    setVisible(false);
  };

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedEstablishments, setSelectedEstablishments] = useState<Establishment[]>([]);
  useEffect(() => {
    const carregarEstabs = async () => {
      const estabs = await fetchEstabilishments(token);
      setEstablishments(estabs);
    };

    carregarEstabs();
  }, [token]);


  const [gruposTributacao, setGruposTributacao] = useState<GrupoTributacao[]>([]);
  const [selectedGruposTributacao, setSelectedGruposTributacao] = useState<GrupoTributacao[]>([]);
  useEffect(() => {
    const carregarGrupos = async () => {
      const grupos = await fetchGruposTributacao(token);
      setGruposTributacao(grupos);
    };

    carregarGrupos();
  }, [token]);


  const [cfops, setCfops] = useState<Cfop[]>([]);
  const [selectedCfops, setSelectedCfops] = useState<Cfop[]>([]);

  // useEffect para carregar os CFOPs
  useEffect(() => {
    const carregarCfops = async () => {
      const data = await fetchCfops(token);
      setCfops(data);
    };

    carregarCfops();
  }, [token]);

  const [usarEndereco, setUsarEndereco] = useState("nao");
  const [usarEnderecoTransp, setUsarEnderecoTransp] = useState("nao");
  const [entidadeSelecionada, setEntidadeSelecionada] = useState<any>(null);
  const [transportadoraSelecionada, setTransportadoraSelecionada] = useState<any>(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDisabledTransp, setIsDisabledTransp] = useState(false);

  const clearInputsEndereco = () => {
    setFormValues((prev) => ({
      ...prev,
      cep_ent: "",
      logradouro_ent: "",
      numero_ent: 0,
      estado_ent: "",
      bairro_ent: "",
      cidade_ent: "",
    }));
  };

  const clearInputsEnderecoTransp = () => {
    setFormValues((prev) => ({
      ...prev,
      cep_transp: "",
      logradouro_transp: "",
      numero_transp: 0,
      estado_transp: "",
      bairro_transp: "",
      cidade_transp: "",
    }));
  };

  const restaurarEnderecoDaEntidade = (entidade: any) => {
    setFormValues((prev) => ({
      ...prev,
      cep_ent: entidade.cep || "",
      logradouro_ent: entidade.logradouro || "",
      numero_ent: Number(entidade.numero) || 0,
      estado_ent: entidade.estado || "",
      bairro_ent: entidade.bairro || "",
      cidade_ent: entidade.cidade || "",
    }));
  };

  const restaurarEnderecoDaTransp = (transp: any) => {
    if (!transp) return;
    setFormValues((prev) => ({
      ...prev,
      cep_transp: transp.cep ?? undefined,
      logradouro_transp: transp.logradouro || "",
      numero_transp: Number(transp.numero) || 0,
      estado_transp: transp.estado || "",
      bairro_transp: transp.bairro || "",
      cidade_transp: transp.cidade || "",
    }));
  };

  const [tipoEntidade, setTipoEntidade] = useState<'cliente' | 'fornecedor'>('cliente');


  const handleSelectEntidade = (id: string) => {
    let entidade: any;

    if (tipoEntidade === "fornecedor") {
      // Busca fornecedor
      entidade = fornecedores.find((f) => f.cod_fornecedor.toString() === id);

      setEntidadeSelecionada(entidade);

      if (entidade) {
        setFormValues((prev) => ({
          ...prev,
          tipo_en: id,
          cod_entidade: entidade.cod_fornecedor,
          razao_social_ent: entidade.nome,
          cnpj_cpf_ent: "",
          insc_estadual_ent: "",
          insc_municipal_ent: "",
          ...(usarEndereco === "sim"
            ? {
              cep_ent: entidade.cep || "",
              logradouro_ent: entidade.logradouro || "",
              numero_ent: Number(entidade.numero) || 0,
              estado_ent: entidade.estado || "",
              bairro_ent: entidade.bairro || "",
              cidade_ent: entidade.cidade || "",
            }
            : {
              cep_ent: "",
              logradouro_ent: "",
              numero_ent: 0,
              estado_ent: "",
              bairro_ent: "",
              cidade_ent: "",
            }),
        }));
      }
    } else {
      // Busca cliente
      entidade = clients.find((c) => c.cod_cliente.toString() === id);

      setEntidadeSelecionada(entidade);

      if (entidade) {
        setFormValues((prev) => ({
          ...prev,
          tipo_en: id,
          cod_entidade: entidade.cod_cliente,
          razao_social_ent: entidade.nome,
          cnpj_cpf_ent: entidade.documento || "",
          insc_estadual_ent: "",
          insc_municipal_ent: "",
          ...(usarEndereco === "sim"
            ? {
              cep_ent: entidade.cep || "",
              logradouro_ent: entidade.logradouro || "",
              numero_ent: Number(entidade.numero) || 0,
              estado_ent: entidade.estado || "",
              bairro_ent: entidade.bairro || "",
              cidade_ent: entidade.cidade || "",
            }
            : {
              cep_ent: "",
              logradouro_ent: "",
              numero_ent: 0,
              estado_ent: "",
              bairro_ent: "",
              cidade_ent: "",
            }),
        }));
      }
    }
  };



  const handleUsarEndereco = (valor: string) => {
    setUsarEndereco(valor);

    if (valor === "sim") {
      setIsDisabled(true);
      if (entidadeSelecionada) {
        restaurarEnderecoDaEntidade(entidadeSelecionada);
      }
    } else {
      setIsDisabled(false);
      clearInputsEndereco();
    }
  };



  const handleCepInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            cep_ent: response.data.cep || "",
            logradouro_ent: response.data.logradouro || "",
            bairro_ent: response.data.bairro || "",
            cidade_ent: response.data.localidade || "",
            estado_ent: response.data.uf || "",
          }));
        } else {
          toast.info("CEP não encontrado!", {
            position: "top-center",
            autoClose: 3000,
            progressStyle: { background: "yellow" },
            icon: <span>⚠️</span>,
          });
          setFormValues(prevValues => ({
            ...prevValues,
            logradouro_ent: "",
            bairro_ent: "",
            cidade_ent: "",
            estado_ent: "",
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar o CEP:", error);
      }
    }
  };



  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [selectedFornecedores, setSelectedFornecedores] = useState<Fornecedor[]>([]);
  useEffect(() => {
    const carregarFornecedores = async () => {
      const fornecedores = await fetchFornecedores(token);
      setFornecedores(fornecedores);
    };

    carregarFornecedores();
  }, [token]);

  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClients, setSelectedClients] = useState<Client[]>([]);
  useEffect(() => {
    const carregarClients = async () => {
      const clients = await fetchClients(token);
      setClients(clients);
    };

    carregarClients();
  }, [token]);


  const [totalICMSInput, setTotalICMSInput] = useState(
    formValues.total_icms?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );
  const [totalPISInput, setTotalPISInput] = useState(
    formValues.total_pis?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );
  const [totalCOFINSInput, setTotalCOFINSInput] = useState(
    formValues.total_cofins?.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) || ''
  );

  const impostosFederais =
    (formValues.total_pis || 0) +
    (formValues.total_cofins || 0);

  const [impostosFederaisInput, setImpostosFederaisInput] = useState(
    impostosFederais.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    const novosFederais =
      (formValues.total_pis || 0) +
      (formValues.total_cofins || 0);

    setImpostosFederaisInput(
      novosFederais.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, [formValues.total_pis, formValues.total_cofins]);


  const [impostosEstaduaisInput, setImpostosEstaduaisInput] = useState(
    (formValues.total_icms || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

  useEffect(() => {
    const impostosEstaduais = (formValues.total_icms || 0);
    setImpostosEstaduaisInput(
      impostosEstaduais.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    );
  }, [formValues.total_icms]);



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
            header="Confirmar Cancelamento"
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
            <p>Tem certeza que deseja cancelar este Nota Fiscal de Servico?</p>
          </Dialog>



          <Dialog
            header={isEditing ? (visualizando ? "Visualizando Nota Fiscal de Servico" : "Editar Nota Fiscal de Servico") : "Nova Nota Fiscal de Servico"}
            visible={visible}
            headerStyle={{
              backgroundColor: "#D9D9D9",
              color: "#1B405D",
              fontWeight: "bold",
              padding: "0.8rem",
              height: "3rem",
            }}
            onHide={() => closeModal()}
            style={{ position: 'fixed', width: '60rem' }}
          >
            <div
              className={`${visualizando ? 'visualizando' : ''}
              p-fluid grid gap-2 mt-2`}>
              <div className="grid gap-2 grid-cols-4">
                <div>
                  <label htmlFor="numero_rps" className="block text-blue font-medium">
                    Nº RPS
                  </label>
                  <input
                    type="number"
                    id="numero_rps"
                    name="numero_rps"
                    disabled
                    value={formValues.numero_rps}
                    onChange={handleInputChange}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-200 cursor-not-allowed"
                  />
                </div>

                <div className="">
                  <label htmlFor="cod_natureza_operacao" className="block text-blue font-medium">
                    Natureza de Operação
                  </label>
                  <select
                    id="cod_natureza_operacao"
                    disabled={visualizando}
                    value={formValues.cod_natureza_operacao || ""}
                    onChange={(e) =>
                      setFormValues((prev) => ({
                        ...prev,
                        cod_natureza_operacao: Number(e.target.value),
                      }))
                    }
                    className="w-full border text-black h-[35px] px-2 rounded"
                  >
                    <option value="">Selecione</option>
                    {naturezaOperacao.map((natureza) => (
                      <option key={natureza.cod_natureza_operacao} value={natureza.cod_natureza_operacao}>
                        {natureza.nome}
                      </option>
                    ))}
                  </select>
                </div>


                <div>
                  <label htmlFor="dt_emissao" className="block text-blue font-medium">
                    Data de Emissão
                  </label>
                  <input
                    type="date"
                    id="dt_emissao"
                    name="dt_emissao"
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    disabled={visualizando}
                    value={!isEditing ?
                      (formValues.dt_emissao ? new Date(formValues.dt_emissao).toISOString().split("T")[0] : "") :
                      (formValues.dt_emissao ? new Date(formValues.dt_emissao).toISOString().split("T")[0] : "")}


                    onChange={(e) => {
                      const value = e.target.value;
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        dt_emissao: value ? new Date(value) : undefined,
                      }));
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="hr_emissao" className="block text-blue font-medium">
                    Hora de Emissão
                  </label>
                  <input
                    type="time"
                    id="hr_emissao"
                    name="hr_emissao"
                    className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-gray-400 pl-1 rounded-sm h-8 w-full`}
                    disabled={visualizando}
                    value={
                      formValues.hr_emissao
                        ? new Date(formValues.hr_emissao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                        : ''
                    }
                    onChange={(e) => {
                      const value = e.target.value; // formato: "HH:MM"
                      const [hours, minutes] = value.split(':');
                      const now = new Date();
                      now.setHours(parseInt(hours));
                      now.setMinutes(parseInt(minutes));
                      now.setSeconds(0);
                      now.setMilliseconds(0);
                      setFormValues((prevValues) => ({
                        ...prevValues,
                        hr_emissao: value ? value : undefined,
                      }));
                    }}
                  />
                </div>
              </div>


              {
                // #region Cliente
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Cliente</h2>

                <div className="grid grid-cols-4 gap-2">

                  <div className="col-span-3">
                    <label htmlFor="cod_entidade" className="block text-blue font-medium">
                      Cliente
                    </label>
                    <input
                      type="text"
                      id="cod_entidade"
                      name="cod_entidade"
                      disabled={visualizando}
                      value={formValues.cod_entidade}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>

                  <div className="">
                    <label htmlFor="cnpj_cpf_ent" className="block text-blue font-medium">
                      Documento (CNPJ/CPF)
                    </label>
                    <input
                      type="text"
                      id="cnpj_cpf_ent"
                      name="cnpj_cpf_ent"
                      disabled
                      value={formValues.cnpj_cpf_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label htmlFor="razao_social_ent" className="block text-blue font-medium">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      id="razao_social_ent"
                      name="razao_social_ent"
                      disabled
                      value={formValues.razao_social_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 !bg-gray-300 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label htmlFor="tipo_contribuinte_ent" className="block text-blue font-medium">
                      Tipo de Contribuinte
                    </label>
                    <select
                      id="tipo_contribuinte_ent"
                      name="tipo_contribuinte_ent"
                      value={formValues.tipo_contribuinte_ent || ""}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 bg-white"
                      disabled={visualizando}
                    >
                      <option value="">Selecione</option>
                      <option value="Contribuinte ICMS">Contribuinte ICMS</option>
                      <option value="Contribuinte ISENTO">Contribuinte ISENTO</option>
                      <option value="Não Contribuinte">Não Contribuinte</option>
                    </select>
                  </div>


                  <div>
                    <label htmlFor="insc_estadual_ent" className="block text-blue font-medium">
                      Inscrição Estadual
                    </label>
                    <input
                      type="text"
                      id="insc_estadual_ent"
                      name="insc_estadual_ent"
                      value={formValues.insc_estadual_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>

                  <div>
                    <label htmlFor="insc_municipal_ent" className="block text-blue font-medium">
                      Inscrição Municipal
                    </label>
                    <input
                      type="text"
                      id="insc_municipal_ent"
                      name="insc_municipal_ent"
                      value={formValues.insc_municipal_ent}
                      onChange={handleInputChange}
                      className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="mb-2">
                    <label className="block text-blue font-medium mb-1">
                      Usar Endereço do Cliente
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          //audio.play();

                          setTimeout(() => {
                            handleUsarEndereco("sim");
                          }, 100);
                        }}
                        className={`h-[28px] px-8  rounded-full border font-medium ${usarEndereco === "sim" ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        SIM
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const audio = new Audio('/sounds/selection-button.mp3');
                          //audio.play();

                          setTimeout(() => {
                            handleUsarEndereco("nao");
                          }, 100);
                        }}
                        className={`h-[28px] px-8 rounded-full border font-medium ${usarEndereco === "nao" ? 'bg-blue500 text-white border-blue500' : 'bg-white text-blue500 border-gray-400'}`}
                      >
                        NÃO
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cep_ent" className="block text-blue font-medium">
                      CEP
                    </label>
                    <input
                      id="cep_ent"
                      name="cep_ent"
                      type="text"
                      value={formValues.cep_ent ?? undefined}
                      onChange={handleCepInputChange}
                      maxLength={9}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="logradouro_ent" className="block text-blue font-medium">
                      Logradouro
                    </label>
                    <input
                      id="logradouro_ent"
                      name="logradouro_ent"
                      type="text"
                      value={formValues.logradouro_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>

                </div>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  <div>
                    <label htmlFor="numero_ent" className="block text-blue font-medium">
                      Número
                    </label>
                    <input
                      id="numero_ent"
                      name="numero_ent"
                      type="text"
                      value={formValues.numero_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                  <div>
                    <label htmlFor="estado_ent" className="block text-blue font-medium">
                      Estado (sigla)
                    </label>
                    <input
                      id="estado_ent"
                      name="estado_ent"
                      type="text"
                      value={formValues.estado_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label htmlFor="bairro_ent" className="block text-blue font-medium">
                      Bairro
                    </label>
                    <input
                      id="bairro_ent"
                      name="bairro_ent"
                      type="text"
                      value={formValues.bairro_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                  <div>
                    <label htmlFor="cidade_ent" className="block text-blue font-medium">
                      Cidade
                    </label>
                    <input
                      id="cidade_ent"
                      name="cidade_ent"
                      type="text"
                      value={formValues.cidade_ent}
                      onChange={handleInputChange}
                      className="w-full border border-gray-400 pl-1 rounded-sm h-8 disabled:cursor-not-allowed disabled:!bg-gray-300"
                      disabled={isDisabled || visualizando}
                    />
                  </div>
                </div>
              </div>
              {
                // #endregion
              }

              {
                //#region Servicos
              }
              <div className="border border-gray-300 rounded space-y-1 p-2 bg-gray-50 mt-2 ">
                <div className="flex items-center top-0">
                  <h3 className="text-blue text-lg font-bold pt-1 mr-1">Servicos</h3>
                </div>
                <div style={{ height: "16px" }}></div>

                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="descricao_servico" className="block text-blue font-medium">
                      Descrição do Serviço
                    </label>
                    <textarea
                      id="descricao_servico"
                      name="descricao_servico"
                      value={formValues.descricao_servico}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descricao_servico: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="atividade_servico" className="block text-blue font-medium">
                      Atividade do Serviço
                    </label>
                    <input
                      type="text"
                      id="atividade_servico"
                      name="atividade_servico"
                      // value={formValues.atividade_servico}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          atividade_servico: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="">
                    <label htmlFor="item_lista_servico" className="block text-blue font-medium">
                      Item da Lista de Serviço
                    </label>
                    <input
                      type="text"
                      id="item_lista_servico"
                      name="item_lista_servico"
                      // value={formValues.item_lista_servico}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descricao_servico: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="ctm" className="block text-blue font-medium">
                      Cód Tributação Municipal
                    </label>
                    <input
                      type="text"
                      id="ctm"
                      name="ctm"
                      // value={formValues.ctm}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          ctm: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="cnae" className="block text-blue font-medium">
                      CNAE
                    </label>
                    <input
                      type="text"
                      id="cnae"
                      name="cnae"
                      // value={formValues.cnae}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          cnae: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div className="col-span-4">
                    <label htmlFor="descricao_atividade" className="block text-blue font-medium">
                      Descrição da Atividade
                    </label>
                    <input
                      type="text"
                      id="descricao_atividade"
                      name="descricao_atividade"
                      // value={formValues.descricao_atividade}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descricao_atividade: e.target.value,
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="">
                    <label htmlFor="valor_servicos" className="block text-blue font-medium">
                      Valor dos Serviços
                    </label>
                    <input
                      type="text"
                      id="valor_servicos"
                      name="valor_servicos"
                      // value={formValues.valor_servicos}
                      disabled={visualizando}
                      // onChange={(e) =>
                      //   setFormValues((prev) => ({
                      //     ...prev,
                      //     valor_servicos: e.target.value,
                      //   }))
                      // }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="base_calculo" className="block text-blue font-medium">
                      Base de Cálculo
                    </label>
                    <input
                      type="number"
                      id="base_calculo"
                      name="base_calculo"
                      value={formValues.base_calculo}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          base_calculo: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="aliquota" className="block text-blue font-medium">
                      %Alíquota
                    </label>
                    <input
                      type="number"
                      id="aliquota"
                      name="aliquota"
                      value={formValues.aliquota}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          aliquota: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="">
                    <label htmlFor="valor_deducoes" className="block text-blue font-medium">
                      Valor dos Serviços
                    </label>
                    <input
                      type="number"
                      id="valor_deducoes"
                      name="valor_deducoes"
                      value={formValues.valor_deducoes}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          valor_deducoes: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="descontos" className="block text-blue font-medium">
                      Descontos
                    </label>
                    <input
                      type="number"
                      id="descontos"
                      name="descontos"
                      value={formValues.descontos}
                      disabled={visualizando}
                      onChange={(e) =>
                        setFormValues((prev) => ({
                          ...prev,
                          descontos: parseFloat(e.target.value),
                        }))
                      }
                      className={`w-full border border-[#D9D9D9] pl-1 rounded-sm h-8 ${visualizando ? 'hidden' : ''}`}

                    />
                  </div>

                  <div className="">
                    <label htmlFor="valor_iss" className="block text-blue font-medium mb-1">
                      Valor ISS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="number"
                        id="valor_iss"
                        name="valor_iss"
                        value={formValues.valor_iss ?? ""}
                        disabled={visualizando}
                        onChange={(e) =>
                          setFormValues((prev) => ({
                            ...prev,
                            valor_iss: parseFloat(e.target.value),
                          }))
                        }
                        className={`flex-1 w-[100px] border border-[#D9D9D9] rounded-l-sm h-8 ${visualizando ? 'hidden' : ''}`}
                      />
                      <Button
                        label={formValues.iss_retido === "Sim" ? "Retido" : "̶R̶̶e̶̶t̶̶i̶̶d̶̶o̶"}
                        onClick={() =>
                          setFormValues((prev) => ({
                            ...prev,
                            iss_retido: prev.iss_retido === "Sim" ? "Nao" : "Sim",
                          }))
                        }
                        className={`h-8 w-[80px] rounded-l-none rounded-r-sm bg-blue text-white text-sm  ${formValues.iss_retido === "Sim" ? 'bg-blue400 hover:bg-blue175' : 'bg-gray-200 hover:bg-gray-400'} transition-all ${visualizando ? 'hidden' : ''}`}
                      />
                    </div>

                  </div>

                </div>
              </div>



              {
                //#region Totais
              }
              <div className="border border-gray-300 rounded p-2 bg-gray-50 mt-2 space-y-2">
                <h2 className="text-blue text-lg font-bold mb-4">Totais</h2>
                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="total_cofins" className="block text-blue font-medium">
                      %COFINS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_cofins"
                        name="total_cofins"
                        value={totalCOFINSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalCOFINSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_cofins: numericValue,
                          }));

                          setTotalCOFINSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_pis" className="block text-blue font-medium">
                      %PIS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_pis"
                        name="total_pis"
                        value={totalPISInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalPISInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_pis: numericValue,
                          }));

                          setTotalPISInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_icms" className="block text-blue font-medium">
                      %CSLL
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_icms"
                        name="total_icms"
                        value={totalICMSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          // Permite apenas números e vírgula, substitui vírgula por ponto para parse
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          // Atualiza o input com vírgula para visualização
                          setTotalICMSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_icms: numericValue,
                          }));

                          setTotalICMSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_ipi" className="block text-blue font-medium">
                      %IR
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_ipi"
                        name="total_ipi"
                        // value={totalIPIInput}
                        // disabled={visualizando}
                        // onChange={(e) => {
                        //   const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                        //   setTotalIPIInput(rawValue.replace('.', ','));
                        // }}
                        // onBlur={(e) => {
                        //   const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                        //   const numericValue = parseFloat(rawValue) || 0;

                        //   setFormValues((prevValues) => ({
                        //     ...prevValues,
                        //     total_ipi: numericValue,
                        //   }));

                        //   setTotalIPIInput(
                        //     numericValue.toLocaleString('pt-BR', {
                        //       minimumFractionDigits: 2,
                        //       maximumFractionDigits: 2,
                        //     })
                        //   );
                        // }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                </div>

                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="total_cofins" className="block text-blue font-medium">
                      Total COFINS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_cofins"
                        name="total_cofins"
                        value={totalCOFINSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalCOFINSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_cofins: numericValue,
                          }));

                          setTotalCOFINSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_pis" className="block text-blue font-medium">
                      Total PIS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_pis"
                        name="total_pis"
                        value={totalPISInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalPISInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_pis: numericValue,
                          }));

                          setTotalPISInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_icms" className="block text-blue font-medium">
                      Valor CSLL
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_icms"
                        name="total_icms"
                        value={totalICMSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          // Permite apenas números e vírgula, substitui vírgula por ponto para parse
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          // Atualiza o input com vírgula para visualização
                          setTotalICMSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_icms: numericValue,
                          }));

                          setTotalICMSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_ipi" className="block text-blue font-medium">
                      Valor IR
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_ipi"
                        name="total_ipi"
                        // value={totalIPIInput}
                        // disabled={visualizando}
                        // onChange={(e) => {
                        //   const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                        //   setTotalIPIInput(rawValue.replace('.', ','));
                        // }}
                        // onBlur={(e) => {
                        //   const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                        //   const numericValue = parseFloat(rawValue) || 0;

                        //   setFormValues((prevValues) => ({
                        //     ...prevValues,
                        //     total_ipi: numericValue,
                        //   }));

                        //   setTotalIPIInput(
                        //     numericValue.toLocaleString('pt-BR', {
                        //       minimumFractionDigits: 2,
                        //       maximumFractionDigits: 2,
                        //     })
                        //   );
                        // }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                </div>

                <div className="grid gap-2 grid-cols-4">
                  <div>
                    <label htmlFor="total_cofins" className="block text-blue font-medium">
                      %INSS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_cofins"
                        name="total_cofins"
                        value={totalCOFINSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalCOFINSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_cofins: numericValue,
                          }));

                          setTotalCOFINSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_pis" className="block text-blue font-medium">
                      Valor INSS
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_pis"
                        name="total_pis"
                        value={totalPISInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          setTotalPISInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_pis: numericValue,
                          }));

                          setTotalPISInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_icms" className="block text-blue font-medium">
                      Descontar Impostos
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 border-[#D9D9D9] rounded-l-sm h-8 bg-gray-100"
                      />
                      <input
                        type="text"
                        id="total_icms"
                        name="total_icms"
                        value={totalICMSInput}
                        disabled={visualizando}
                        onChange={(e) => {
                          // Permite apenas números e vírgula, substitui vírgula por ponto para parse
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          // Atualiza o input com vírgula para visualização
                          setTotalICMSInput(rawValue.replace('.', ','));
                        }}
                        onBlur={(e) => {
                          const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                          const numericValue = parseFloat(rawValue) || 0;

                          setFormValues((prevValues) => ({
                            ...prevValues,
                            total_icms: numericValue,
                          }));

                          setTotalICMSInput(
                            numericValue.toLocaleString('pt-BR', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          );
                        }}
                        style={{
                          textAlign: 'left',
                        }}
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : 'border-[#D9D9D9]'} border border-l-0 pl-1 rounded-r-sm h-8 w-full`}
                      />

                    </div>
                  </div>

                  <div>
                    <label htmlFor="total_ipi" className="block text-blue font-medium">
                      Total Nota
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value="R$"
                        readOnly
                        className="w-[34px] px-1 text-blue font-bold border border-r-0 !bg-gray-300 !border-gray-400 rounded-l-sm rounded-r-none h-8"
                      />
                      <input
                        type="text"
                        id="total_ipi"
                        name="total_ipi"
                        // value={totalIPIInput}
                        // disabled={visualizando}
                        // onChange={(e) => {
                        //   const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                        //   setTotalIPIInput(rawValue.replace('.', ','));
                        // }}
                        // onBlur={(e) => {
                        //   const rawValue = e.target.value.replace(/[^\d,]/g, '').replace(',', '.');
                        //   const numericValue = parseFloat(rawValue) || 0;

                        //   setFormValues((prevValues) => ({
                        //     ...prevValues,
                        //     total_ipi: numericValue,
                        //   }));

                        //   setTotalIPIInput(
                        //     numericValue.toLocaleString('pt-BR', {
                        //       minimumFractionDigits: 2,
                        //       maximumFractionDigits: 2,
                        //     })
                        //   );
                        // }}
                        style={{
                          textAlign: 'left',
                        }
                        }
                        disabled
                        className={`${visualizando ? '!bg-gray-300 !border-gray-400' : '!bg-gray-300 !border-gray-400 border-l-gray-300'} border border-l-0 pl-1 rounded-r-sm rounded-l-none h-8 w-full`}
                      />

                    </div>
                  </div>

                </div>
              </div>
              {
                //#endregion
              }
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <label htmlFor="observacoes" className="block text-blue font-medium">
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    name="observacoes"

                    value={formValues.observacoes}
                    onChange={(e) => setFormValues(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24 "
                  />
                </div>

                <div>
                  <label htmlFor="informacoes_adicionais" className="block text-blue font-medium">
                    Informações Adicionais
                  </label>
                  <textarea
                    id="informacoes_adicionais"
                    name="informacoes_adicionais"

                    value={formValues.informacoes_adicionais}
                    onChange={(e) => setFormValues(prev => ({ ...prev, informacoes_adicionais: e.target.value }))}
                    className="w-full border border-[#D9D9D9] pl-1 rounded-sm h-24 "
                  />
                </div>
              </div>
              <Button
                label="console.log(formValues)"
                className="text-black bg-yellow h-8 w-[300px] shadow-lg shadow-black
                active:scale-95 duration-100 transition-all active:translate-y-2 active:shadow-none"
                onClick={() => console.log(formValues)}
              />
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
                      disabled={itemCreateReturnDisabled}
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
                      disabled={itemCreateDisabled}
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
                    onClick={() => handleSaveEdit(formValues.cod_natureza_operacao)}
                    disabled={itemEditDisabled}
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
">
                  Nota Fiscal de Servico
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
                value={filteredNfsServicos.slice(first, first + rows)}
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
                  field="cod_grupo_tributacao"
                  header="Tributação"
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
                  field="padrao"
                  header="Padrão"
                  style={{
                    width: "0.5%",
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
                  field="cod_cfop_interno"
                  header="CFOP Interno"
                  style={{
                    width: "0.5%",
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
                {permissions?.edicao === "SIM" && (
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
                    }}
                  />
                )}
                {permissions?.delecao === "SIM" && (
                  <Column
                    header=""
                    body={(rowData) => (
                      <div className="flex gap-2 justify-center">
                        <CancelButton onClick={() => openDialog(rowData.cod_natureza_operacao)} />
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
        </div >
      </SidebarLayout >
      <Footer />
    </>
  );
};

export default NfsServico;
function setSelectedNfsServico(arg0: any[]) {
  throw new Error("Function not implemented.");
}

