import { useEffect, useRef } from 'react';
import { MdVisibility } from 'react-icons/md';

interface ViewButtonProps {
  onClick: () => void;
}

export default function ViewButton({ onClick }: ViewButtonProps) {
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
    }, 0); // 1 segundo = 1000 milissegundos
  };

  return (
    <button
      onClick={handleClick}
      className="relative group"
      title="Visualizar"
    >

      {/* Botão visível */}
      <div
        className="
        active:bg-blue175 
        active:scale-105
        active:shadow-lg       
        active:shadow-blue175
        hover:shadow-lg        
        hover:shadow-blue500 
        p-2 
        bg-blue300 
        transform 
        transition-all 
        duration-50 
        rounded-full
        "
      >
        <MdVisibility
          style={{ fontSize: '1.2rem' }}
          className="text-white text-2xl"
        />
      </div>
    </button>
  );
}
