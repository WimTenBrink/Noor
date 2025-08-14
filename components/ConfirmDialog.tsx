
import React, { ReactNode } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    children, 
    confirmLabel = 'Confirm', 
    cancelLabel = 'Cancel' 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-[var(--bg-modal-overlay)] z-50 flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-lg shadow-2xl w-full max-w-md border border-[var(--border-primary)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
        <div className="text-[var(--text-secondary)] mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-4">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-md hover:opacity-80 transition-opacity font-semibold"
          >
            {cancelLabel}
          </button>
          <button 
            onClick={onConfirm} 
            className="px-6 py-2 bg-[var(--color-red)] text-white rounded-md hover:bg-[var(--color-red)]/80 transition-colors font-semibold"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
