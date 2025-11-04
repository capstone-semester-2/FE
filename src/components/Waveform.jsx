import React from 'react';

const Waveform = () => {
  const heights = [4, 8, 5, 10, 4, 8, 6, 10, 5, 7, 4, 10, 6, 8, 5, 10, 4, 7, 6, 8];
  
  return (
    <div className="flex items-center justify-center gap-0.5 h-8">
      {heights.map((height, idx) => (
        <div
          key={idx}
          className="w-1 bg-gray-900 rounded-full transition-all"
          style={{ height: `${height * 2}px` }}
        />
      ))}
    </div>
  );
};

export default Waveform;