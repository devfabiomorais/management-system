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
    audioRef.current = new Audio('/sounds/new.mp3');
  }, []);

  const handleClick = () => {
    const audio = new Audio('/sounds/new.mp3');
    audio.play();

    setTimeout(() => {
      onClick();
    }, 0);
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
         bg-green-600 
         active:bg-green-200
         active:scale-105
         active:shadow-2xl      
         active:shadow-green-200
         hover:shadow-lg        
         hover:shadow-green-800
         p-[3px]          
         transform 
         transition-all 
         duration-50 
         rounded-full
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
