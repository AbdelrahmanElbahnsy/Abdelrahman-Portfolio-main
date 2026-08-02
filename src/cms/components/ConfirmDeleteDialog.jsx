import React from 'react';

const ConfirmDeleteDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#131b2c] border border-[#1e293b] rounded-2xl p-6 shadow-2xl max-w-sm w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-2">{title || "Confirm Deletion"}</h3>
        <p className="text-gray-400 text-sm mb-6">
          {message || "Are you sure you want to permanently delete this item? This action cannot be undone."}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-[#1e293b] text-gray-300 hover:bg-[#1e293b] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;
