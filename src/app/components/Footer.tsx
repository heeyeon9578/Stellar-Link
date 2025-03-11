'use client';
import React,{useState,useEffect} from 'react';
import { useTranslation } from "react-i18next";
import DynamicText from './DynamicText';
import Image from 'next/image';
import Button from './Button';

const Footer: React.FC = () => {
  const { t, i18n } = useTranslation("common");
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // 메뉴 열기/닫기 상태 토글
  };
  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = event.target.value;
    i18n.changeLanguage(newLang);
    setSelectedLanguage(newLang);
    localStorage.setItem("language", newLang); // 선택된 언어 저장
  };
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
  return (
    <footer className="footer">
      <div className="w-full h-full sm:px-[120px] py-[50px] px-[50px] flex flex-col justify-between"> 
        <div className='flex justify-between'>
          {/** 언어 선택 */}
          <div className="">
    
            <div className="relative cursor-pointer" style={{ zIndex: '9999' }}>
              {/* 메뉴 버튼 */}
              <div onClick={toggleMenu} className="flex items-center space-x-2 bg-transparent px-3 py-1 rounded-md justify-between">
                <span className="text-white text-[10px] sm:text-sm">{t(selectedLanguage)}</span>
                <Image
                  src={isMenuOpen ? "/SVG/up.svg" : "/SVG/down.svg"}
                  alt="toggle"
                  width={15}
                  height={15}
                  priority
                  className="cursor-pointer hover:scale-110"
                />
              </div>

              {/* 드롭다운 메뉴 */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-28 bg-white border border-gray-200 shadow-md rounded-md text-[10px] sm:text-sm text-gray-500">
                  <button
                    onClick={() => {
                      handleLanguageChange({ target: { value: 'en' } } as React.ChangeEvent<HTMLSelectElement>);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-[10px] sm:text-sm hover:bg-gray-100 ${selectedLanguage === 'en' ? 'bg-gray-200' : ''}`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      handleLanguageChange({ target: { value: 'ko' } } as React.ChangeEvent<HTMLSelectElement>);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-[10px] sm:text-sm hover:bg-gray-100 ${selectedLanguage === 'ko' ? 'bg-gray-200' : ''}`}
                  >
                    한국어
                  </button>
                  <button
                    onClick={() => {
                      handleLanguageChange({ target: { value: 'es' } } as React.ChangeEvent<HTMLSelectElement>);
                      setIsMenuOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2 text-[10px] sm:text-sm hover:bg-gray-100 ${selectedLanguage === 'es' ? 'bg-gray-200' : ''}`}
                  >
                    Español
                  </button>
                </div>
              )}
            </div>
            
          </div>

          {/* 로고 */}
          <Image
            src="/SVG/Logo.svg"
            alt="Logo"
            width={100}
            height={50}
            priority
            className="cursor-pointer md:block hidden"
          />
        </div>

        <div className='flex flex-col justify-start items-start gap-[10px] sm:text-lg text-xs'>
          STELLAR LINK
          <Button variant="main" className="justify-start items-start px-0 text-customGray py-0 sm:text-lg text-xs" onClick={() => window.open('https://heeyeonportfolio.vercel.app/')} >
            <DynamicText text={t('AboutMe')}/>
          </Button>
          <Button variant="main" className="justify-start items-start px-0 text-customGray py-0 sm:text-lg text-xs" onClick={() => window.open('https://heeyeon9578.notion.site/StellarLink-24-11-29-14caccb87c2b80bba05bf00fa9a970f4')} >
            <DynamicText text={t('Skills')}/>
          </Button>
        </div>

        <div className='flex justify-between md:flex-row flex-col sm:text-lg text-xs'>
          <div onClick={() => window.open('https://heeyeon9578.notion.site/154accb87c2b80b18af0e70d99f0a0ca?pvs=4')}>
          Terms of Use & Privacy Policy
          </div>
          <div className='a'>&copy; {new Date().getFullYear()} Stellar Link. All Rights Reserved</div>
        </div>
        
        
      </div>
    </footer>
  );
};

export default Footer;
