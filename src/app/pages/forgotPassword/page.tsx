"use client";
import React, { useRef, useState } from "react";
import Logo from "../../assets/imgs//emerald.png";
import { BiSolidHide } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import BeatLoader from "react-spinners/BeatLoader";

export default function ForgotPassword() {
  let [loading, setLoading] = useState(false);
  let [color, setColor] = useState("#B8D047");
  const [stepPass, setStepPass] = useState(0);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [idUser, setIdUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass1, setNewPass1] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarSenha1, setMostrarSenha1] = useState(false);
  const [code, setCode] = useState(Array(6).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (email === "") {
      setLoading(false);
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const payload = {
      email: email,
    };

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/users/sendCode",
        payload
      );

      if (response.status === 200) {
        setLoading(false);
        localStorage.setItem("@Portal:id", response.data.id);
        setIdUser(response.data.id);
        setStepPass(1);
      }
    } catch (err: any) {
      setLoading(false);
      if (err.response) {
        toast.error(err.response.data.msg || "Não foi possível enviar o código", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error("Erro ao se conectar ao servidor. Tente novamente mais tarde.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (/^[0-9]$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (index < inputsRef.current.length - 1 && value) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);

      if (index > 0 && !code[index]) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const codeDigit = code.join("");
    if (codeDigit === "") {
      setLoading(false);
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const payload = {
      cod_usuario: idUser,
      code: codeDigit,
    };

    try {
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/users/checkCode",
        payload
      );

      if (response.status === 200) {
        setLoading(false);
        setStepPass(2);
      }
    } catch (err: any) {
      setLoading(false);
      if (err.response) {
        toast.error(err.response.data.msg || "Não foi possível validar o código", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error("Erro ao se conectar ao servidor. Tente novamente mais tarde.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  const handleSubmitNewPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPass === "" || newPass1 === "") {
      setLoading(false);
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (newPass.length < 6 || newPass1.length < 6) {
      setLoading(false);
      toast.info("A nova senha deve ter mais de 6 dígitos", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if (newPass !== newPass1) {
      setLoading(false);
      toast.info("As senhas devem ser iguais", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const payload = {
      newPassword: newPass,
    };

    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/changePassword/${idUser}`,
        payload
      );
      if (response.status === 200) {
        setLoading(false);
        window.location.href = "/";
      }
    } catch (err: any) {
      setLoading(false);
      if (err.response) {
        toast.error(err.response.data.msg || "Não foi possível mudar a senha", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        toast.error("Erro ao se conectar ao servidor. Tente novamente mais tarde.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gradient-to-b from-blue500 via-green100 to-white pt-10">
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
      <div className="flex justify-center items-center flex-grow app-zoom px-4">

        {stepPass === 0 && (
          <div
            className="
      bg-cyan-500/20 
      backdrop-blur-md 
      border border-cyan-100/30
      shadow-md
      [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)] 
      w-full max-w-md min-w-[350px] rounded-lg p-6
    "
          >
            <div className="flex justify-start mb-6">
              <button
                onClick={() => redirect("/")}
                aria-label="Voltar para login"
                className="text-white text-2xl hover:text-green-400 transition-colors"
              >
                <FiArrowLeft />
              </button>
            </div>
            <div className="text-center mb-8">
              <img
                src={Logo.src}
                alt="Logo"
                className="mx-auto w-28 h-28 drop-shadow-lg"
              />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-white text-sm font-medium mb-2"
                >
                  E-mail
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  placeholder=""
                  autoComplete="email"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 rounded-md text-xl font-bold text-green-950 transition-transform duration-150 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {/* Fundo com blur e transparência */}
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-green-500/30 backdrop-blur-md border border-green-300/60 shadow-md shadow-green-400/50 rounded-md"
                  />

                  {/* Texto em cima, totalmente opaco */}
                  <span className="relative opacity-100">
                    {loading ? "Carregando..." : "Solicitar Código"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}


        {stepPass === 1 && (
          <div
            className="
              bg-cyan-500/20 
              backdrop-blur-md 
              border border-cyan-100/30
              shadow-md
              [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)] 
              w-full max-w-md min-w-[350px] rounded-lg p-10
            "
          >
            <div className="text-center mb-8">
              <img
                src={Logo.src}
                alt="Logo"
                className="mx-auto w-28 h-28 drop-shadow-lg"
              />
            </div>

            <div className="text-center mb-2">
              <p className="text-white text-xl">Digite o Código Recebido por E-mail</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitCode}>
              <div className="flex flex-wrap justify-center gap-2">
                {[...Array(6)].map((_, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={code[index] || ""}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    className="w-14 h-14 text-center text-xl font-bold text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                ))}
              </div>

              <div className="pt-5 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-3/4 py-3 rounded-md text-xl font-bold text-green-950 transition-transform duration-150 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-green-500/30 backdrop-blur-md border border-green-300/60 shadow-md shadow-green-400/50 rounded-md"
                  />
                  <span className="relative opacity-100">{loading ? "Validando..." : "Salvar"}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {stepPass === 2 && (
          <div
            className="
              bg-cyan-500/20 
              backdrop-blur-md 
              border border-cyan-100/30
              shadow-md
              [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)] 
              w-full max-w-md min-w-[350px] rounded-lg p-10
            "
          >
            <div className="text-center mb-8">
              <img
                src={Logo.src}
                alt="Logo"
                className="mx-auto w-28 h-28 drop-shadow-lg"
              />
            </div>

            <form className="space-y-6" onSubmit={handleSubmitNewPass}>
              <div>
                <label
                  htmlFor="newPass"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="newPass"
                    type={mostrarSenha ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                    placeholder=""
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    tabIndex={-1}
                    aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha ? <FaEye /> : <BiSolidHide />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="newPass1"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Confirme a Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="newPass1"
                    type={mostrarSenha1 ? "text" : "password"}
                    value={newPass1}
                    onChange={(e) => setNewPass1(e.target.value)}
                    className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                    placeholder=""
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha1(!mostrarSenha1)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    tabIndex={-1}
                    aria-label={mostrarSenha1 ? "Ocultar senha" : "Mostrar senha"}
                  >
                    {mostrarSenha1 ? <FaEye /> : <BiSolidHide />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full py-3 rounded-md text-xl font-bold text-green-950 transition-transform duration-150 hover:scale-110 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-green-500/30 backdrop-blur-md border border-green-300/60 shadow-md shadow-green-400/50 rounded-md"
                  />
                  <span className="relative opacity-100">{loading ? "Salvando..." : "Salvar Senha"}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer className="text-center py-4 bg-blue-900 bg-opacity-20">
        <p className="text-blue-900">
          <a
            href="https://github.com/devfabiomorais"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-blue-700"
          >
            @devfabiomorais
          </a>{" "}
          {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
