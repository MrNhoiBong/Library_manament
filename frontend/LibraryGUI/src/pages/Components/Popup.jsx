import React from 'react';

export default function Popup({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Overlay mờ, nhìn xuyên */}
      <div
        className="absolute inset-0 bg-black/60 bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Cửa sổ popup */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-[70%] h-[70%] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
