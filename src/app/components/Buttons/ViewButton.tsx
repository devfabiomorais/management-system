import { MdVisibility } from 'react-icons/md';

interface ViewButtonProps {
  onClick: () => void;
}

export default function ViewButton({ onClick }: ViewButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
      hover:scale-125 
      hover:bg-blue400 
      p-2 
      bg-blue300 
      transform 
      transition-all 
      duration-50 
      rounded-full
      "
      title="Visualizar"
    >
      <MdVisibility
        style={{ fontSize: '1.2rem' }}
        className="text-white text-2xl"
      />
    </button>
  );
}
