import { ReactNode } from "react";

interface CategoryButtonProps {
  onClick: () => void;
  opened: boolean;
  icon: ReactNode;
  label: string;
}

export default function CategoryButton({ onClick, opened, icon, label }: CategoryButtonProps) {
  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col justify-center items-center w-40 h-40 ${opened ? 'bg-green100' : 'bg-blue'
        } cursor-pointer text-white rounded-lg shadow-lg hover:scale-125 transform transition-transform duration-200`}
    >
      {icon}
      <span className="text-lg mt-2 font-bold">{label}</span>
    </div>
  );
}
