import React from 'react';

export const Sparkline: React.FC = () => {
  return (
    <svg className="w-full h-20" viewBox="0 0 100 60" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,20 C10,18 15,10 20,15 C25,20 30,8 35,12 C40,16 45,25 50,22 C55,19 60,14 65,18 C70,22 75,30 80,26 C85,22 90,28 100,24"
        stroke="#00e5ff"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M0,20 C10,18 15,10 20,15 C25,20 30,8 35,12 C40,16 45,25 50,22 C55,19 60,14 65,18 C70,22 75,30 80,26 C85,22 90,28 100,24 L100,60 L0,60 Z"
        fill="url(#lineGrad)"
      />
      {/* Target line */}
      <line x1="0" y1="35" x2="100" y2="35" stroke="#ffab00" strokeWidth="0.8" strokeDasharray="3 2" opacity="0.5" />
      <text x="2" y="33" fontSize="4" fill="#ffab00" opacity="0.7" fontFamily="monospace">
        Target 130
      </text>
    </svg>
  );
}; 
