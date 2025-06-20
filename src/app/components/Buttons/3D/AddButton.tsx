import { FaPlus } from "react-icons/fa";

interface AddButtonProps {
  onClick: () => void;
  visualizando?: boolean;
}

const AddButton: React.FC<AddButtonProps> = ({ onClick, visualizando = false }) => {
  if (visualizando) return null;

  const handleClick = () => {
    const audio = new Audio('/sounds/soft.mp3');
    //audio.play();

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
      {/* Sombra (base) */}
      <div
        className="
          absolute inset-x-0 h-full -bottom-1 
          bg-gray-500 border border-gray-500 rounded-2xl 
          shadow-md shadow-black 
          transition duration-200 
          group-active:shadow-none
        "
      ></div>

      {/* Botão principal */}
      <div
        className="
          relative bg-lime-500 rounded-2xl 
          border border-white
          py-1 px-1 
          transition transform duration-200 
          group-active:translate-y-1 
          group-active:bg-lime-700
          group-active:border-gray-400
          flex items-center justify-center h-full
        "
      >
        <FaPlus className="text-white text-lg" />
      </div>
    </button>
  );
};

export default AddButton;
