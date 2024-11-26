"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Logo from "../../assets/imgs/logoConviver.png";
import { BiSolidHide } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { redirect } from "next/navigation";
import { useToken } from "../../hook/accessToken";

export default function Login() {
  const { setToken } = useToken();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  useEffect(() => {
    setToken("")
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (login === '' || senha === '') {
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const payload = {
      user: login,
      password: senha,
    };

    try {
      const response = await axios.post("https://back-end-birigui-w3dn.vercel.app/api/auth/login", payload);

      if (response.status === 200) {
        setToken(response.data.token)
        localStorage.setItem("@Birigui:token", response.data.token);
        localStorage.setItem("@Birigui:cod_grupo", response.data.cod_grupo)
        toast.success("Login realizado com sucesso!", {
          position: "top-right",
          autoClose: 3000,
        });
        setTimeout(() => {
          redirect("/pages/Dashboard/home")
        }, 3000);
      }
    } catch (err: any) {
      if (err.response) {
        toast.error(err.response.data.msg || "Erro ao realizar login.", {
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
    <div className="flex flex-col justify-between min-h-screen bg-gray-200">
      <div className="flex justify-center items-center flex-grow">
        <div className="bg-blue w-1/3 min-w-[350px] rounded-lg p-10 shadow-xl">
          <div className="text-center mb-8">
            <img
              src={Logo.src}
              alt="Logo da Conviver"
              className="mx-auto w-28 h-28"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder=""
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
                  className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder=""
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
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
                className="w-full py-3 bg-green100 text-blue rounded-md text-xl font-bold hover:bg-green-500 transition"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
      <footer className=" text-center py-4">
        <p className="text-blue">Copyright © Grupo ComViver 2024</p>
      </footer>
    </div>
  );
}
