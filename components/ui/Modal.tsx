import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm sm:p-6 md:p-20">
      <div className="relative w-full max-w-lg transform rounded-xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-800 dark:text-white sm:my-8">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold leading-6 text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <Icons.X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};