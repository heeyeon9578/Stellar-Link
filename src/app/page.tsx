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
        <section className="h-screen bg-transparent flex items-center justify-center relative">
          <div >
          <Lottie
          animationData={Earth}
          loop
          className="w-[500px] h-[500px]"
        />


          </div>
          
          {/* GltfViewer: 절대 위치 */}
          <div className="absolute flex items-center justify-center top-0" style={{'left': '25%'}}>
            <GltfViewer />
          </div>
          <div className="absolute flex items-center justify-center top-[75%] left-[25%]">
            <GltfViewer2 />
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
