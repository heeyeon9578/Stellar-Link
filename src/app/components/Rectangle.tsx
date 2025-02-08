'use client';

import React from 'react';

interface RectangleProps {
  children?: React.ReactNode; // 내부 콘텐츠
  className?: string; // 추가 클래스
  classNameBg?: string; // 추가 클래스
}

const Rectangle: React.FC<RectangleProps> = ({ children, className,classNameBg }) => {
  return (
    <div className={`relative ${className}  flex `}>
      {/* 배경 */}
      <div className={`absolute inset-0 bg-customRectangle rounded-[20px] sm:rounded-[40px] md:rounded-[60px] ${classNameBg}`}></div>

      {/* 내용물 */}
      <div className="relative z-10 w-full h-full flex">{children}</div>
    </div>
  );
};

export default Rectangle;
