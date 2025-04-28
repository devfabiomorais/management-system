import { MdOutlineModeEditOutline } from 'react-icons/md';

interface EditButtonProps {
  onClick: () => void;
}

export default function EditButton({ onClick }: EditButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        hover:scale-125
        hover:bg-yellow700
        p-2
        bg-yellow
        transform
        transition-all
        duration-50
        rounded-full
        ">
      <MdOutlineModeEditOutline
        style={{ fontSize: '1.2rem' }}
        className="text-white text-2xl"
      />
    </button>
  );
}
