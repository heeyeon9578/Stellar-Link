'use client';
import Image from "next/image";
import Button from "./components/Button";
import React from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import GltfViewer from "./components/GltfViewer";
import GltfViewer2 from "./components/GltfViewer2";
import Lottie from "lottie-react";
import Earth from '../../public/Earth.json';
export default function Home() {
  return (
    <div >
     <main className="flex-1"> 
       {/* 섹션1 */}
        <section className="h-screen w-full bg-transparent flex items-center justify-center">

        {/* GltfViewer */}
        <div
          className="
            w-[100%] h-[300px]             /* 기본값: sm 이하 */
            sm:w-[60%] sm:h-[60%]       /* 작은 화면 */
            md:w-[80%] md:h-[80%]       /* 중간 화면 */
            lg:w-[100%] lg:h-[100%]     /* 큰 화면 */
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
