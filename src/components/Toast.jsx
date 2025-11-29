import React from 'react';

const colorByType = {
  info: 'bg-gray-900 text-white',
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
};

const Toast = ({ message, type = 'info' }) => {
  if (!message) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-4 pointer-events-none">
      <div
        className={`min-w-[260px] max-w-[360px] px-4 py-3 rounded-2xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] text-sm font-semibold text-center ${colorByType[type] || colorByType.info}`}
      >
        {message}
      </div>
    </div>
  );
};

export default Toast;
