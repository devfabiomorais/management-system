import { FaPlus } from "react-icons/fa";

interface AddButtonProps {
  onClick: () => void;
  visualizando?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, visualizando = false }) => {
  if (visualizando) return null;

  const handleClick = () => {
    const audio = new Audio('/sounds/soft.mp3');
    audio.play();

    setTimeout(() => {
      onClick();
    }, 300); // Delay de 300ms para sincronia com o som
  };

  return (
    <button
      onClick={handleClick}
      className="relative group ml-2 h-8"
      title="Adicionar"
    >

      {/* Botão principal */}
      <div
        className="
       bg-lime-500
       active:bg-lime-200 
       active:scale-105
       active:shadow-lg       
       active:shadow-lime-200  
       hover:shadow-md    
       hover:bg-lime-400    
       p-2 
       transform 
       transition-all 
       duration-50 
       rounded-full
       "
      >
        <FaPlus style={{ fontSize: '1rem' }}
          className="text-white text-center"
        />
      </div>
    </button>
  );
};

export default AddButton;
