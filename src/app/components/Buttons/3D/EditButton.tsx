import { useEffect, useRef } from 'react';
import { MdOutlineModeEditOutline } from 'react-icons/md';

interface EditButtonProps {
  onClick: () => void;
}

export default function EditButton({ onClick }: EditButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o áudio quando o componente é montado
    audioRef.current = new Audio('/sounds/soft.mp3');
  }, []);

  const handleClick = () => {
    const audio = new Audio('/sounds/soft.mp3');
    //audio.play();

    setTimeout(() => {
      onClick();
    }, 300); // 1 segundo = 1000 milissegundos
  };

  return (
    <button
      onClick={handleClick}
      className="relative group"
      title="Editar"
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
          relative bg-yellow600 rounded-2xl 
          py-1 px-1
          transition transform duration-200 
          group-active:translate-y-1
          group-active:bg-yellow800
          group-active:border-gray-400
        "
      >
        <MdOutlineModeEditOutline
          style={{ fontSize: '1.2rem' }}
          className="text-white text-2xl rounded-2xl"
        />
      </div>
    </button>
  );
}
