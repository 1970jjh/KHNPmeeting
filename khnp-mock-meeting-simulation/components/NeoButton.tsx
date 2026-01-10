
import React from 'react';

interface NeoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'success' | 'white';
}

export const NeoButton: React.FC<NeoButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const bgColors = {
    primary: 'bg-[#4361EE] text-white',
    danger: 'bg-[#FF4D4D] text-white',
    success: 'bg-[#4CC9F0] text-black',
    white: 'bg-white text-black'
  };

  return (
    <button 
      className={`
        neo-border neo-shadow-sm px-6 py-3 font-black uppercase transition-all
        active:translate-x-1 active:translate-y-1 active:shadow-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${bgColors[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};
