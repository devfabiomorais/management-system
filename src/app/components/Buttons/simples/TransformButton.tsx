import { useEffect, useRef } from 'react';
import { FaSuse } from 'react-icons/fa';
//CAMALEAO

interface TransformButtonProps {
  onClick: () => void;
  title?: string;
}

export default function TransformButton({ onClick, title = 'Usar' }: TransformButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Carrega o áudio quando o componente é montado
    audioRef.current = new Audio('/sounds/magic.mp3');
  }, []);

  const handleClick = () => {
    const audio = new Audio('/sounds/magic.mp3');
    audio.play();

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
       bg-green-500
       active:bg-green-200 
       active:scale-105
       active:shadow-lg       
       active:shadow-green-bg-green-200
       hover:shadow-lg        
       hover:shadow-green-700
       p-2 
       transform 
       transition-all 
       duration-50 
       rounded-full
       "
      >
        <FaSuse
          style={{ fontSize: '1.2rem' }}
          className="text-white text-center"
        />
      </div>
    </button>
  );
}
