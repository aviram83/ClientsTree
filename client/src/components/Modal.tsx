import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  textColor?: string;
}

export const Modal = ({ isOpen, onClose, title, children, textColor }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-card rounded-lg shadow-lg w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="text-foreground text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div className={`p-4 ${textColor ?? 'text-foreground'}`}>
          {children}
        </div>
      </div>
    </div>
  );
};
