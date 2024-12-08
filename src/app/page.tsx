'use client';
import Image from "next/image";
import React,{useEffect, useState} from 'react';
import GltfViewer from "./components/GltfViewer";
import { useTranslation } from 'react-i18next';
import '../../i18n'
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import 'animate.css'; // animate.css 불러오기

export default function Home() {
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
  return (
    <div >
     <main className="flex-1"> 
       {/* 섹션1 */}
        <section className="h-screen w-full bg-transparent flex items-center justify-center relative">


          {/* Intro 텍스트 (뒤쪽 레이어) */}
          <div
            className="absolute inset-0  items-center justify-cente z-0 pointer-events-none "
          >
            <div className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-white px-4 mt-4 sm:mt-0 animate__animated animate__zoomInLeft" style={{ animationDuration: '2s' }}>
              {t('intro1')}
            </div>
            <div className="text-sm sm:text-base md:text-lg lg:text-2xl text-gray-300 px-4 mt-4 sm:mt-0 animate__animated animate__zoomInLeft" style={{ animationDuration: '4s' }}>
              {t('intro2')}
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

        <section className="h-screen bg-gray-200 flex items-center justify-center ">
          <h1 className="text-4xl font-bold">Section 2</h1>
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
