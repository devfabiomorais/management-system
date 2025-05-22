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
    audioRef.current = new Audio('/sounds/open.mp3');
  }, []);

  const handleClick = () => {
    const audio = new Audio('/sounds/open.mp3');
    //audio.play();

    setTimeout(() => {
      onClick();
    }, 0); // Delay de 300ms
  };

  return (
    <button
      onClick={handleClick}
      className="relative group"
      title={title}
    >

      {/* Botão visível */}
      <div
        className="
          relative bg-blue300 rounded-full
          w-[45px] h-[45px] flex items-center justify-center
          transition transform duration-200
          active:bg-blue150 
        active:scale-105
        active:shadow-lg       
        active:shadow-blue150
        hover:shadow-lg        
        hover:shadow-blue500
        "
      >

        <div className="w-[35px] h-[35px] bg-white rounded-full flex items-center justify-center">
          <div className="w-[30px] h-[30px] bg-blue300 group-active:bg-blue175 rounded-full flex items-center justify-center">
            <GiFunnel className="text-white text-xl" />
          </div>
        </div>

      </div>
    </button>
  );
}
