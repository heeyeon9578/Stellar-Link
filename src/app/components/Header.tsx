'use client';
import React,{useEffect, useState} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from './Button';
import { useTranslation } from 'react-i18next';
import '../../../i18n'
import 'animate.css'; // animate.css 불러오기
import DynamicText from './DynamicText';

const Header: React.FC = () => {
  const router = useRouter();
  const { t,i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => setIsInitialized(true);
      i18n.on('initialized', handleInitialized);
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, [i18n]);
  if (!isInitialized) return null;
  const toggleMenu = () => {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
      if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden', 'animate__fadeOut');
        menu.classList.add('animate__animated', 'animate__fadeIn');
      } else {
        menu.classList.remove('animate__fadeIn');
        menu.classList.add('animate__animated', 'animate__fadeOut');
        setTimeout(() => menu.classList.add('hidden'), 500); // 애니메이션 후 숨김
      }
    }
  };
  const goToLogin = () => {
    router.push('/login'); // '/login' 페이지로 이동
  };

  return (
    <header className="bg-transparent text-white py-2 sticky top-0 z-50">
      <div className="mx-2 flex justify-between items-center">
        {/* 로고 */}
        <Image
          src="/SVG/Logo.svg"
          alt="Logo"
          width={100}
          height={50}
          priority
          onClick={() => router.push('/')} // 로고 클릭 시 홈으로 이동
          className="cursor-pointer"
        />

        {/* 네비게이션 바 */}
        <nav className="hidden md:flex space-x-5">
          <Button variant="main" className="animate__animated animate__zoomIn" >
            <DynamicText text={t('AboutMe')}/>
          </Button>
          <Button variant="main" className="animate__animated animate__zoomIn">
            <DynamicText text= {t('Quests')}/>
          </Button>
          <Button variant="main" className="animate__animated animate__zoomIn">
            <DynamicText text={t('Skills')}/>
          </Button>
          <Button variant="primary" className="animate__animated animate__zoomIn" onClick={goToLogin}>
            <DynamicText text={t('Login')}/>
          </Button>
        </nav>

        <div className='md:hidden flex'>
          {/* 로그인 버튼 (모바일 전용) */}
          <div className="md:hidden mr-4 ">
            <Button size="sm" variant="primary" onClick={goToLogin}><DynamicText text={t('Login')}/></Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex md:hidden">
            <button
              className="text-white focus:outline-none"
              onClick={toggleMenu}
            >
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            </button>
          </div>
        </div>

      </div>

      {/* 모바일 메뉴 */}
      <div
        id="mobile-menu"
        className="hidden flex flex-col space-y-3 mt-3 px-2 md:hidden"
      >
        <Button size="sm" variant="main" className="animate__animated">
          <DynamicText text={t('AboutMe')}/>
        </Button>
        <Button size="sm" variant="main" className="animate__animated">
          <DynamicText text={t('Quests')}/>
        </Button>
        <Button size="sm" variant="main" className="animate__animated">
          <DynamicText text={t('Skills')}/>
        </Button>
        
      </div>
      
    </header>
  );
};

export default Header;
