'use client';
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import socket from "@/socketIns"; // 위에서 만든 socket.ts 경로
import "../../../../i18n";
import DynamicText from "../../components/DynamicText";
import Image from 'next/image';
import Skeleton from "@/app/components/Skeleton"; // 스켈레톤 컴포넌트 가져오기

export default function ColorContent() {
  const { t, i18n } = useTranslation("common");
  const { data: session } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || "en");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sortOption, setSortOption] = useState<'en' | 'ko'| 'es'>('en'); // 정렬 옵션 상태
  const ThemeColors: Record<string, string> = {
    themePink: "#91034F",
    themeYellow: "#9F7000",
    themeGreen: "#4E5B02",
    themeBlue: "#030391",
    themeDarkBlue: "#02025B",
    themeBlack: "#01012B",
  };
// 초기 언어 설정 적용
useEffect(() => {
  const storedLang = localStorage.getItem("language");
  if (storedLang) {
    i18n.changeLanguage(storedLang);
    setSelectedLanguage(storedLang);
  }
}, []);

// 언어 변경 핸들러
const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  const newLang = event.target.value;
  i18n.changeLanguage(newLang);
  setSelectedLanguage(newLang);
  localStorage.setItem("language", newLang); // 선택된 언어 저장
};
  // Set CSS variables for the theme
  const applyTheme = (top: string, middle: string, bottom: string) => {
    if(typeof document !== undefined) {
      document.documentElement.style.setProperty("--top-color", top);
      document.documentElement.style.setProperty("--middle-color", middle);
      document.documentElement.style.setProperty("--bottom-color", bottom);
    }else{
      console.log(`
        
        src/app/chat/color.tsx 에서 document 없음
        
        `)
    }
    
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // 메뉴 열기/닫기 상태 토글
  };
  // Handle theme change
  const handleThemeChange = (color: string, section: "top" | "middle" | "bottom") => {
    if (!session?.user?.id) return;
    
    const updatedTheme = {
        section,
        color,
      };

    socket.emit("change_theme", {
      userId: session.user.id,
      ...updatedTheme,
    });
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(`--${section}-color`, color);
    }
  
  };

  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => setIsInitialized(true);
      i18n.on("initialized", handleInitialized);
      return () => {
        i18n.off("initialized", handleInitialized);
      };
    }
  }, [i18n]);

  // Fetch the user's initial theme from the database
  useEffect(() => {
    const fetchTheme = async () => {
      if (!session?.user?.id) return;

      const response = await fetch(`/api/theme?userId=${session.user.id}`);
      const { top, middle, bottom } = await response.json();
      applyTheme(top, middle, bottom);
    };

    fetchTheme();

    // Listen for theme updates from WebSocket
    socket.on("theme_updated", ({ userId, section, color }) => {
        if (session?.user?.id.toString() === userId.toString()) {
          if(typeof document !== undefined) {
            if (section === "top") {
              document.documentElement.style.setProperty("--top-color", color);
            } else if (section === "middle") {
                document.documentElement.style.setProperty("--middle-color", color);
            } else if (section === "bottom") {
                document.documentElement.style.setProperty("--bottom-color", color);
            }
          }
        
        }
    });

    return () => {
      socket.off("theme_updated");
    };
  }, [session]);

  if (!isInitialized) {
    return (
     <div className="mx-auto md:p-8 p-4 rounded-lg h-full text-customBlue relative flex flex-col">
             <Skeleton width="80%" height="30px" borderRadius="8px" className="mb-2"/>
             <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-2"/>
             <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-2"/>
             <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-4"/>
             <Skeleton width="100%" height="350px" borderRadius="12px" className="mb-2"/>
           </div>
    );
  }

  return (
    <div className="mx-auto  md:p-8 p-4 rounded-lg h-full text-customBlue flex flex-col gap-6">
      <h2 className="md:text-2xl text-sm sm:text-xl font-bold ">
        <DynamicText text={t("Setting")} />
      </h2>

      {/** 언어 선택 */}
      <div className="mb-6 ">
        <DynamicText className="block text-customPurple mb-2 text-[12px] sm:text-lg" text={t("Language")}></DynamicText>

        <div className="relative cursor-pointer" style={{ zIndex: '9999' }}>
          {/* 메뉴 버튼 */}
          <div onClick={toggleMenu} className="flex items-center space-x-2 bg-transparent border border-gray-300 px-3 py-1 rounded-md justify-between">
            <span className="text-gray-500 text-[10px] sm:text-sm">{t(selectedLanguage)}</span>
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

      {/** 색상 선택 */}
      <div className="flex flex-col gap-4 ">

        <DynamicText className="block text-customPurple mb-2 text-[12px] sm:text-lg" text={t("Color")}></DynamicText>

        {["top", "middle", "bottom"].map((section) => (
          <div key={section}>
            <DynamicText text={t(section.charAt(0).toUpperCase() + section.slice(1))} className="text-[10px] sm:text-sm text-gray-500" />
            <div className="flex gap-2 mt-2  justify-between">
              {Object.keys(ThemeColors).map((key) => (
                <div
                  key={key}
                  className={`w-6 h-6 sm:w-8 sm:h-8  rounded-full cursor-pointer border border-white hover:scale-125 `}
                  style={{ backgroundColor: ThemeColors[key] }}
                  onClick={() => handleThemeChange(ThemeColors[key], section as "top" | "middle" | "bottom")}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>

      

    </div>
  );
}
