import { useEffect, useRef } from 'react';
import { FaSuse } from 'react-icons/fa';
//CAMALEAO

interface TransformButtonProps {
  onClick: () => void;
  title?: string;
}

export default function TransformButton({ onClick, title = 'Usar' }: TransformButtonProps) {
  const handleClick = () => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
      // Carrega o áudio quando o componente é montado
      audioRef.current = new Audio('/sounds/soft.mp3');
    }, []);

    const audio = new Audio('/sounds/soft.mp3'); // som ao clicar
    audio.play();

    setTimeout(() => {
      onClick();
    }, 300);
  };

  return (
    <button
      onClick={handleClick}
      className="relative group"
      title={title}
    >
      {/* Base do botão (sombra) */}
      <div
        className="
          absolute inset-x-0 h-full -bottom-1 
          bg-gray-400 border border-gray-400 rounded-2xl 
          shadow-md shadow-black 
          transition duration-200 
          group-active:shadow-none
        "
      ></div>

      {/* Botão visível */}
      <div
        className="
          relative bg-green-500 rounded-2xl 
          py-1 px-1
          transition transform duration-200 
          group-active:translate-y-1
          group-active:bg-green700
          group-active:border-gray-400
        "
      >
        <FaSuse
          style={{ fontSize: '1.22rem' }}
          className="text-white text-2xl rounded-2xl"
        />
      </div>
    </button>
  );
}
