"use client";
import React, { useEffect, useState } from "react";
import Logo from "../../assets/imgs//Apple-Glass-Logo.png";
import { BiSolidHide } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { useToken } from "../../hook/accessToken";

export default function Login() {
  const { setCodUsuarioLogado } = useToken();
  const { setToken } = useToken();

  const [login, setLogin] = useState("teste");
  const [senha, setSenha] = useState("123");
  const [mostrarSenha, setMostrarSenha] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken("");
  }, []);

  const handleLogTeste = () => {
    toast.success("Login realizado com sucesso!", {
      position: "top-right",
      autoClose: 2000,
    });

    setTimeout(() => {
      redirect("/pages/Dashboard/home");
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (login === "" || senha === "") {
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    // Nova lógica simples: se for "teste" e "123", entra direto
    if (login === "teste" && senha === "123") {
      setLoading(true);
      setToken("token-teste-liberado");
      setCodUsuarioLogado("usuario-teste");
      localStorage.setItem("@Portal:token", "token-teste-liberado");
      localStorage.setItem("@Portal:cod_usuario", "usuario-teste");
      localStorage.setItem("@Portal:cod_grupo", "grupo-teste");

      toast.success("Login realizado com sucesso!", {
        position: "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        redirect("/pages/Dashboard/home");
      }, 2000);
      return;
    }

    // Caso contrário, rejeitar (sem chamar API)
    toast.error("Usuário ou senha incorretos.", {
      position: "top-right",
      autoClose: 5000,
    });
  };

  return (
    <div className="flex flex-col justify-between bg-gradient-to-b from-blue500 via-green100 to-white pt-10 min-h-screen">
      <div className="flex justify-center items-center flex-grow app-zoom px-4">
        <div className="bg-cyan-500/20 
                        backdrop-blur-md 
                        border border-cyan-100/30
                        shadow-md
                        [box-shadow:inset_0_2px_6px_rgba(255,255,255,0.3)] w-full max-w-md min-w-[350px] rounded-lg p-10 ">
          <div className="text-center mb-8">
            <img
              src={Logo.src}
              alt="Logo"
              className="mx-auto w-28 h-28 mb-4 drop-shadow-lg"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="login"
                className="block text-white text-sm font-medium mb-2"
              >
                Login
              </label>
              <input
                id="login"
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="senha"
                className="block text-white text-sm font-medium mb-2"
              >
                Senha
              </label>
              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  autoComplete="current-password"
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

            <div className="text-center pb-5">
              <a
                href="/pages/forgotPassword"
                className="text-white text-sm hover:underline"
              >
                Esqueci a Senha
              </a>
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
                  {loading ? "Entrando..." : "Entrar"}
                </span>
              </button>


            </div>
          </form>
        </div>
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
