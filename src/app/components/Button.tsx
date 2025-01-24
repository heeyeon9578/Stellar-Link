'use client';
import React, { useState, useEffect } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'main' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean; // 로딩 상태 추가
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  type = 'button',
  disabled = false,
  loading = false, // 기본값 false
  className = '',
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const baseStyles = `relative inline-flex items-center justify-center font-medium rounded focusDefault
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
            bg-transparent 
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
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-5 py-2 text-lg',
  };

  const classes = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled || isTouchDevice) return; // 터치 기기에서는 무시
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPosition({ x, y });
  };
  useEffect(() => {
  const checkTouchDevice = () => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  };
 
  checkTouchDevice();
}, []);

useEffect(()=>{
 console.log(`
  
  
  isTouchDevice : ${isTouchDevice}
  
  
  `)
},[isTouchDevice])
const handleMouseLeave = () => {
  if (loading || disabled || isTouchDevice) return; // 터치 기기에서는 무시
  setPosition({ x: 0, y: 0 });
};
const handleTouchStart = () => {
  if (isTouchDevice) {
    setPosition({ x: 0, y: 0 }); // 터치 시작 시 위치 초기화
  }
};

const handleTouchEnd = () => {
  if (isTouchDevice) {
    setPosition({ x: 0, y: 0 }); // 터치 종료 시 위치 초기화
  }
};
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading} // 로딩 중일 때 비활성화
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={classes}
    >
        {loading ? (
          <div className="relative z-10 flex items-center justify-center">
            <span className="loader border-t-transparent border-2 border-white w-4 h-4 rounded-full animate-spin"></span>
          </div>
        ):(
          <span
          className={`relative z-10 hover:text-transparent hover:!bg-gradient-to-r hover:!from-customPurple hover:!to-customLightPurple hover:bg-clip-text bg-clip-text`}
          style={
            !isTouchDevice
              ? {
                  transform: `translate(${position.x}px, ${position.y}px)`,
                  transition: 'transform 0.1s ease-out',
                  animationDuration: '4s',
                }
              : {}
          }
        >
          {children}
        </span>
        )}
      
    </button>
  );
};

export default Button;
