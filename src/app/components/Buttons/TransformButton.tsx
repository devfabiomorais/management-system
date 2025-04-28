import { FaSuse } from 'react-icons/fa';

interface TransformButtonProps {
  onClick: () => void;
  title?: string;
}

export default function TransformButton({ onClick, title = 'Usar' }: TransformButtonProps) {
  return (
    <button
      onClick={onClick}
      className="hover:scale-125 hover:bg-green-700 p-2 bg-green-500 transform transition-all duration-50 rounded-2xl"
      title={title}
    >
      <FaSuse
        style={{ fontSize: '1.2rem' }}
        className="text-white text-2xl"
      />
    </button>
  );
}
