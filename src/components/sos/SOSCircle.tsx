import React from 'react';

interface SOSCircleProps {
  onClick?: () => void;
}

export const SOSCircle: React.FC<SOSCircleProps> = ({ onClick }) => {
  return (
    <div className="relative w-28 h-28 md:w-32 md:h-32 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-red opacity-30 animate-pulse-ring" />
      <div className="absolute inset-2.5 rounded-full border border-red opacity-50" />
      <button
        onClick={onClick}
        className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-radial from-[#cc0022] to-red border-3 border-red flex items-center justify-center font-display text-xl md:text-2xl font-bold text-white tracking-wider cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,61,87,0.6)] shadow-[0_0_30px_rgba(255,61,87,0.4)] z-10"
      >
        SOS
      </button>
    </div>
  );
}; 
