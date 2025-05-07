import { useEffect, useRef } from 'react';
import { GiFunnel } from 'react-icons/gi';

interface FilterButtonProps {
  onClick: () => void;
  title?: string;
}

export default function FilterButton({ onClick, title = 'Filtrar' }: FilterButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o áudio quando o componente é montado
    audioRef.current = new Audio('/sounds/plastic-bottle.mp3');
  }, []);

  const handleClick = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }

    setTimeout(() => {
      onClick();
    }, 1);
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
          bg-gray-400 border border-gray-400 rounded-full 
          shadow-md shadow-black 
          transition duration-200 
          group-active:shadow-none
          group-hover:bg-gray-500
        "
      ></div>

      {/* Botão visível */}
      <div
        className="
          relative bg-blue300 rounded-full
          w-[40px] h-[40px] flex items-center justify-center
          transition transform duration-200
          group-active:translate-y-1
          group-active:bg-green400
          group-hover:bg-blue400
        "
      >
        <div className="w-[35px] h-[35px] bg-white rounded-full flex items-center justify-center">
          <div className="w-[30px] h-[30px] bg-blue300 rounded-full flex items-center justify-center">
            <GiFunnel className="text-white text-xl" />
          </div>
        </div>
      </div>
    </button>
  );
}
