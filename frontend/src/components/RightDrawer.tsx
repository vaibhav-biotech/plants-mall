'use client';

import { useDrawerStore } from '../lib/store';
import { FiX } from 'react-icons/fi';

export default function RightDrawer() {
  const { isOpen, content, closeDrawer } = useDrawerStore();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Details</h2>
          <button
            onClick={closeDrawer}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <FiX size={24} />
          </button>
        </div>
        <div className="p-6">{content}</div>
      </div>
    </>
  );
}
