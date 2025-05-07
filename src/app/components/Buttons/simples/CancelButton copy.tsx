import { FaBan } from 'react-icons/fa';

interface BlockButtonProps {
  onClick: () => void;
}

export default function BlockButton({ onClick }: BlockButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
      bg-red 
      hover:bg-red600 
      hover:scale-125 
      p-2 
      transform 
      transition-all 
      duration-50 
      rounded-full
      "
      title="Bloquear ou desativar"
    >
      <FaBan
        style={{ fontSize: '1.2rem' }}
        className="text-white text-center"
      />
    </button>
  );
}
