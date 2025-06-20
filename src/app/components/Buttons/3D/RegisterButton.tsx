import { useEffect, useRef } from 'react';
import { IoAddCircleOutline } from 'react-icons/io5';

interface AddButtonProps {
  onClick: () => void;
  title?: string;
}

export default function AddButton({ onClick, title = 'Adicionar' }: AddButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o áudio quando o componente é montado
    audioRef.current = new Audio('/sounds/mouse-click.mp3');
  }, []);

  const handleClick = () => {
    const audio = new Audio('/sounds/mouse-click.mp3');
    //audio.play();

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
          bg-gray-400 border border-gray-400 rounded-3xl 
          shadow-md shadow-black 
          transition duration-200 
          group-active:shadow-none
          group-hover:bg-gray-500
        "
      ></div>

      {/* Botão visível */}
      <div
        className="
    relative bg-green-600 rounded-3xl 
    
    transition transform duration-200 
    group-active:translate-y-1
    group-active:bg-green400
    flex items-center gap-1
    group-hover:bg-green-700
  "
      >
        <IoAddCircleOutline
          style={{ fontSize: '2.6rem' }}
          className="text-white"
        />
        {/* <span className="text-white font-medium">Novo</span> */}
      </div>

    </button>
  );
}
