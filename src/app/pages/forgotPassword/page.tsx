"use client";
import React, { useRef, useState } from "react";
import Logo from "../../assets/imgs/logoConviver.png";
import { BiSolidHide } from "react-icons/bi";
import { FaEye } from "react-icons/fa";
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

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    console.log("Senha:", email);

    if(email === ''){
      setLoading(false)
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
      const response = await axios.post("https://api-birigui-teste.comviver.cloud/api/users/sendCode", payload);
      
      if (response.status === 200) {
        setLoading(false)
        localStorage.setItem("@Birigui:id", response.data.id)
        setIdUser(response.data.id)
        setStepPass(1)
      }
    } catch (err: any) {
      if (err.response) {
        setLoading(false)
        toast.error(err.response.data.msg || "Não foi possivel enviar o código", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        setLoading(false)
        toast.error("Erro ao se conectar ao servidor. Tente novamente mais tarde.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }


  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
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

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      const newCode = [...code];
      newCode[index] = "";
      setCode(newCode);

      if (index > 0 && !code[index]) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmitCode = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    const codeDigit = code.join("")
    if(codeDigit === ''){
      setLoading(false)
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    const payload = {
      cod_usuario: idUser,
      code: codeDigit
    };

    try {
      const response = await axios.post("https://api-birigui-teste.comviver.cloud/api/users/checkCode", payload);
      
      if (response.status === 200) {
        setLoading(false)
        setStepPass(2)
      }
    } catch (err: any) {
      if (err.response) {
        setLoading(false)
        toast.error(err.response.data.msg || "Não foi possivel validar o código", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        setLoading(false)
        toast.error("Erro ao se conectar ao servidor. Tente novamente mais tarde.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };


  const handleSubmitNewPass = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)
    if(newPass === "" && newPass1 == ""){
      setLoading(false)
      toast.info("Nenhum campo pode estar vazio!", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if(newPass.length < 6 && newPass1.length < 6){
      setLoading(false)
      toast.info("A nova senha deve ter mais de 6 digitos", {
        position: "top-right",
        autoClose: 5000,
      });
      return;
    }

    if(newPass !== newPass1){
      setLoading(false)
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
      const response = await axios.put(`https://api-birigui-teste.comviver.cloud/api/users/changePassword/${idUser}`, payload);
      if (response.status === 200) {
        setLoading(false)
        window.location.href="/"
      }
    } catch (err: any) {
      if (err.response) {
        setLoading(false)
        toast.error(err.response.data.msg || "Não foi possivel mudar a senha", {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        setLoading(false)
        toast.error("Erro ao se conectar ao servidor. Tente novamente mais tarde.", {
          position: "top-right",
          autoClose: 5000,
        });
      }
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gray-200">
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
      <div className="flex justify-center items-center flex-grow">
        {stepPass === 0 && (
          <div className="bg-blue w-1/3 min-w-[350px] rounded-lg p-10 shadow-xl">
            <div className="text-center mb-8">
              <img
                src={Logo.src}
                alt="Logo da Conviver"
                className="mx-auto w-28 h-28"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl text-white">Esqueci a Senha</h2>
            </div>

            <form  className="space-y-4">
              {/*<div>
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
              </div>*/}

              <div>
                <label
                  htmlFor="senha"
                  className="block text-white text-sm font-medium mb-2"
                >
                  E-mail
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={"text"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder=""
                  />
                </div>
              </div>

              <div className="pt-5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full py-3 bg-green100 text-blue rounded-md text-xl font-bold hover:bg-green-500 transition"
                >
                  Solicitar Código
                </button>
              </div>
            </form>
          </div>
        )}

        {stepPass === 1 && (
          <div className="bg-blue w-1/3 min-w-[350px] rounded-lg p-10 shadow-xl">
            <div className="text-center mb-8">
              <img
                src={Logo.src}
                alt="Logo da Conviver"
                className="mx-auto w-28 h-28"
              />
            </div>

            <div className="text-center mb-2">
              <p className="text-white text-xl">
                Digite o Código Recebido por E-mail
              </p>
            </div>

            <form className="space-y-4">
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
                    className=" w-14 h-14 text-center text-xl font-bold text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                ))}
              </div>

              <div className="pt-5 flex justify-center">
                <button
                onClick={handleSubmitCode}
                  type="button"
                  className="w-3/4 py-3 bg-green100 text-blue rounded-md text-xl font-bold hover:bg-green-500 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        )}

        {stepPass === 2 && (
          <div className="bg-blue w-1/3 min-w-[350px] rounded-lg p-10 shadow-xl">
            <div className="text-center mb-8">
              <img
                src={Logo.src}
                alt="Logo da Conviver"
                className="mx-auto w-28 h-28"
              />
            </div>

            <form className="space-y-4">
              {/*<div>
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
              </div>*/}

              <div>
                <label
                  htmlFor="senha"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha ? "text" : "password"}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
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


              <div>
                <label
                  htmlFor="senha"
                  className="block text-white text-sm font-medium mb-2"
                >
                  Confirme a Nova Senha
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    type={mostrarSenha1 ? "text" : "password"}
                    value={newPass1}
                    onChange={(e) => setNewPass1(e.target.value)}
                    className="w-full p-3 rounded-md text-black bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha1(!mostrarSenha)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {mostrarSenha1 ? <FaEye /> : <BiSolidHide />}
                  </button>
                </div>
              </div>



              <div>
                <button
                  type="button"
                  onClick={handleSubmitNewPass}
                  className="w-full py-3 bg-green100 text-blue rounded-md text-xl font-bold hover:bg-green-500 transition"
                >
                  Salvar Senha
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <footer className=" text-center py-4">
        <p className="text-blue">Copyright © Grupo ComViver 2024</p>
      </footer>
    </div>
  );
}
