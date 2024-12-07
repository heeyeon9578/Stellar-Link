'use client';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from './Button';


const Header: React.FC = () => {
    const router = useRouter();

    return (
      <header className="bg-transparent text-white py-2 sticky top-0 z-50">
        <div className=" mx-2 flex justify-between items-center">
            <Image
                src="/SVG/Logo.svg" // public 폴더의 logo.svg 경로
                alt="Logo"
                width={100} // 원하는 너비
                height={50} // 원하는 높이
                priority // 중요한 리소스 우선 로드
                onClick={() => router.push('/')} // 로고 클릭 시 홈으로 이동
                className="cursor-pointer"
              />
              {/* 네비게이션 바 */}
            <nav className="flex space-x-10">

                <Button variant='main' className="animate__animated animate__zoomIn ">About Me</Button>
                <Button variant='main' className="animate__animated animate__zoomIn ">Quests</Button>
                <Button variant='main' className="animate__animated animate__zoomIn ">Skills</Button>
        
                <Button variant='primary' className="animate__animated animate__zoomIn ">Login</Button>
            </nav>
        </div>
      </header>
    );
};

export default Header;
