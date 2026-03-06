import React from 'react';

type ButtonVariant = 'primary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-cyan text-bg-void hover:bg-white hover:shadow-[0_0_30px_rgba(0,229,255,0.25)]',
  ghost:
    'bg-transparent text-text-primary border border-border-bright hover:bg-cyan-ghost hover:border-cyan hover:text-cyan',
  danger: 'bg-red text-white hover:bg-[#ff1744] hover:shadow-[0_0_30px_rgba(255,61,87,0.4)]',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  fullWidth = false,
  ...props
}) => {
  return (
    <button
      className={`
        font-display text-sm font-semibold tracking-wider uppercase px-8 py-3.5 rounded-sm
        transition-all duration-200 hover:-translate-y-0.5
        ${variantClasses[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}; 
