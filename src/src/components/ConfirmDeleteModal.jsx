import React from 'react';
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[var(--danger)] mb-2">{title}</h3>
          <p className="text-[var(--text-secondary)] text-sm mb-6">{message}</p>
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] py-3 rounded-xl font-medium transition-colors">Anuluj</button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 bg-[var(--danger)] text-white py-3 rounded-xl font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">Usuń</button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ConfirmDeleteModal;
