import React from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[90%] max-w-sm rounded-xl shadow-lg p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Delete Post?
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete this post? This action cannot be
          undone.
        </p>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
