import React, { useState } from 'react';

interface ToggleProps {
  initial?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ initial = false, onChange }) => {
  const [isOn, setIsOn] = useState(initial);

  const handleClick = () => {
    const newState = !isOn;
    setIsOn(newState);
    onChange?.(newState);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-11 h-6 rounded-full border transition-all duration-200 cursor-pointer flex-shrink-0
        ${isOn ? 'bg-cyan border-cyan' : 'bg-bg-elevated border-border-bright'}
      `}
    >
      <div
        className={`
          w-4 h-4 rounded-full transition-all duration-200 mt-0.5
          ${isOn ? 'ml-[calc(100%-1.25rem)] bg-bg-void' : 'ml-0.5 bg-text-muted'}
        `}
      />
    </div>
  );
}; 
