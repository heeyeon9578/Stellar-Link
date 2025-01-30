'use client';
import Image from "next/image";
import React,{useEffect, useState} from 'react';
import GltfViewer from "./components/GltfViewer";
import { useTranslation } from 'react-i18next';
import '../../i18n'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import 'animate.css'; // animate.css 불러오기
//import Lottie from 'lottie-react'; // 올바른 컴포넌트 이름
import dynamic from 'next/dynamic';
import chattingSVG from '../../public/json/chatting.json';
import Rectangle from "./components/Rectangle";
import DynamicText from "./components/DynamicText";
import { useSession } from "next-auth/react";
// Lottie 컴포넌트를 클라이언트에서만 렌더링하도록 설정
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

export default function Home() {
  const { t,i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [animation1, setAnimation1] = useState('animate__zoomInLeft');
  const [animation2, setAnimation2] = useState('animate__zoomInLeft');
  const [inSection2, setInSection2] = useState(false); // 섹션 2 도달 여부 상태
  const { data: session } = useSession();
  const handleAnimationEnd1 = () => {
    setAnimation1('animate__pulse'); // 첫 번째 애니메이션 이후 반복 애니메이션 설정
  };

  const handleAnimationEnd2 = () => {
    setAnimation2('animate__pulse'); // 두 번째 애니메이션 이후 반복 애니메이션 설정
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

  useEffect(() => {
    const handleScroll = () => {
      if(typeof document !== undefined) {
        const section2Top = document.getElementById('section-2')?.offsetTop || 0; // 섹션 2의 상단 위치
        const scrollPosition = window.scrollY + window.innerHeight / 2; // 현재 스크롤 위치 + 화면의 절반
        if (scrollPosition >= section2Top) {
          setInSection2(true); // 섹션 2에 도달하면 상태 업데이트
        } else {
          setInSection2(false); // 섹션 2 이전이면 상태 초기화
        }
      }else{
        console.log(`
          
          src/app/page.tsx 에서 document 없음
          
          `)
      }
      
      
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll); // 클린업
  }, []);
  // Fetch the user's initial theme from the database
  useEffect(() => {
    const fetchTheme = async () => {
      if (!session?.user?.id) return;

      const response = await fetch(`/api/user/theme?userId=${session.user.id}`);
      const { top, middle, bottom } = await response.json();
      applyTheme(top, middle, bottom);
    };

    fetchTheme();

  }, [session]);
  // Set CSS variables for the theme
  const applyTheme = (top: string, middle: string, bottom: string) => {
    if(typeof document !== undefined) {
      document.documentElement.style.setProperty("--top-color", top);
      document.documentElement.style.setProperty("--middle-color", middle);
      document.documentElement.style.setProperty("--bottom-color", bottom);
    }else{
      console.log(`
        
        src/app/page.tsx 에서 document 없음
        
        `)
    }
    
  };

  if (!isInitialized) return null;
  return (
    <div >
     <main className="flex-1"> 
        {/* 섹션1 */}
        <section className="h-screen w-full bg-transparent flex items-center justify-center relative">


          {/* Intro 텍스트 (뒤쪽 레이어) */}
          <div
            className="absolute inset-0  items-center justify-cente z-0 pointer-events-none bg-transparent"
          >
            <div
              className={`text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-white px-4 mt-4 sm:mt-0 animate__animated ${animation1}`}
              style={{ animationDuration: '2s' }}
              onAnimationEnd={handleAnimationEnd1} // 애니메이션 종료 시 호출
            >
              <DynamicText text={t('intro1')}/>
            </div>

            <div
              className={`text-sm sm:text-base md:text-lg lg:text-2xl text-gray-300 px-4 mt-4 sm:mt-0 animate__animated ${animation2}`}
              style={{ animationDuration: '4s' }}
              onAnimationEnd={handleAnimationEnd2} // 애니메이션 종료 시 호출
            >
              <DynamicText text={t('intro2')}/>
      </div>
          </div>


        {/* GltfViewer */}
        <div
          className="
            w-[100%] h-[300px]             /* 기본값: sm 이하 */
            sm:w-[60%] sm:h-[60%]       /* 작은 화면 */
            md:w-[80%] md:h-[80%]       /* 중간 화면 */
            lg:w-[100%] lg:h-[100%]     /* 큰 화면 */
            relative z-10
          "
        >
          <GltfViewer />
        </div>

        </section>

        {/* 섹션2 */}
         <section
          id="section-2"
          className={`h-screen flex items-center justify-center relative ${
            inSection2 ? 'animate__animated animate__fadeIn' : ''
          }`}
        >
         <Rectangle
            className={`transition-all duration-700 ${
              inSection2 ? 'opacity-30 scale-100' : 'opacity-0 scale-0'
            }  w-[90%] h-[90%]`}
            classNameBg="opacity-30"
          >
            <div>This is a rectangle!</div>
          </Rectangle>

          <div
            className={`w-[30%] h-[30%] absolute bottom-0 right-0 transition-all duration-700 ${
              inSection2 ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
            }`}
          >
          <Lottie animationData={chattingSVG} loop autoplay />
        </div>

        </section>

        <section className="h-screen bg-gray-300 flex items-center justify-center "> 
          <h1 className="text-4xl font-bold">Section 3</h1>
        </section>
        <section className="h-screen bg-gray-400 flex items-center justify-center ">
          <h1 className="text-4xl font-bold">Section 4</h1>
        </section>
        <section className="h-screen bg-gray-500 flex items-center justify-center ">
          <h1 className="text-4xl font-bold">Section 5</h1>
        </section>
        <section className="h-screen bg-gray-600 flex items-center justify-center ">
          <h1 className="text-4xl font-bold">Section 6</h1>
        </section>
        <section className="h-screen bg-gray-600 flex items-center justify-center ">
          <h1 className="text-4xl font-bold">Section 7</h1>
        </section>
      </main>

    </div>
  );
}
