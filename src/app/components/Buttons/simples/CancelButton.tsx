import { useEffect, useRef } from 'react';
import { FaBan } from 'react-icons/fa';

interface CancelButtonProps {
  onClick: () => void;
}

export default function CancelButton({ onClick }: CancelButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o áudio quando o componente é montado
    audioRef.current = new Audio('/sounds/cancel.mp3');
  }, []);

  const handleClick = () => {
    const audio = new Audio('/sounds/cancel.mp3');
    audio.play();

    setTimeout(() => {
      onClick();
    }, 0); // Delay de 300ms
  };

  return (
    <button
      onClick={handleClick}
      className="relative group"
      title="Desativar"
    >

      {/* Botão principal */}
      <div
        className="
        bg-red 
        active:bg-red100 
        active:scale-105
        active:shadow-lg       
        active:shadow-red100
        hover:shadow-lg        
        hover:shadow-red700
        p-2 
        transform 
        transition-all 
        duration-50 
        rounded-full
        "
      >
        <FaBan
          style={{ fontSize: '1.2rem' }}
          className="text-white text-center"
        />
      </div>
    </button>
  );
}
