import { useEffect, useRef } from 'react';
import { MdOutlineModeEditOutline } from 'react-icons/md';

interface EditButtonProps {
  onClick: () => void;
}

export default function EditButton({ onClick }: EditButtonProps) {
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
      title="Editar"
    >

      {/* Botão visível */}
      <div
        className="
       active:bg-yellow200 
        active:scale-105
        active:shadow-lg       
        active:shadow-yellow200
        hover:shadow-lg        
        hover:shadow-yellow800
       p-2
       bg-yellow600
       transform
       transition-all
       duration-50
       rounded-full
       "
      >
        <MdOutlineModeEditOutline
          style={{ fontSize: '1.2rem' }}
          className="text-white text-2xl"
        />
      </div>
    </button>
  );
}
