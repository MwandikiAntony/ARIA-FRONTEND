import React from 'react';

interface ChartCardProps {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}

export const ChartCard: React.FC<ChartCardProps> = ({ children, className = '', wide = false }) => {
  return (
    <div className={`bg-bg-card border border-border rounded-xl p-5 md:p-6 ${wide ? 'lg:col-span-2' : ''} ${className}`}>
      {children}
    </div>
  );
}; 
