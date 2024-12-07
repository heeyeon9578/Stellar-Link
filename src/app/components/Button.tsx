import React, { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'main' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  className = '',
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const baseStyles = `relative inline-flex items-center justify-center font-medium rounded focus:outline-none 
                      disabled:opacity-50 disabled:cursor-not-allowed font-sans overflow-hidden`;

  const variantStyles = {
    primary: `
              bg-gradient-to-r from-customLightPurple to-customPurple text-white 
              rounded-custom shadow-custom 
              hover:from-white hover:to-white 
              
              disabled:from-customLightPurple-300 disabled:to-customPurple-500 
              disabled:hover:from-customLightPurple-300 disabled:hover:to-customPurple-500 
              transition-all duration-300 delay-100
            `,
    main: `
            bg-transparent text-white
            hover:underline hover:decoration-customPurple
             hover:text-underline-offset-4
           
            transition-all duration-300
          `,
    danger: `bg-red-500 text-white rounded-custom shadow-custom 
             disabled:bg-red-300 disabled:hover:bg-red-300
             transition-all duration-300 delay-100
             `,
  };

  const sizeStyles = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-7 py-3 text-lg',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(((e.clientX - rect.left) / rect.width - 0.5) * 10, -5); // -5 ~ 5로 제한
    const y = Math.max(((e.clientY - rect.top) / rect.height - 0.5) * 10, -5); // -5 ~ 5로 제한
    setPosition({ x, y });
  };
  

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 }); // 원래 위치로 복구
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={classes}
    >
        <span
          className="relative z-10 hover:text-transparent  hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text  bg-clip-text"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`, // 텍스트 이동
            transition: 'transform 0.2s ease-out',
          }}
        >
          {children}
        </span>
      
    </button>
  );
};

export default Button;
