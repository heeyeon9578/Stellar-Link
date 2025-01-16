'use client';

import { usePathname } from 'next/navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import ClientProvider from './components/ClientProvider';
import { useEffect, useState,useRef } from "react";
import socket from "@/socketIns"; // 위에서 만든 socket.ts 경로

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isChatPage = pathname?.startsWith('/chat')
  useEffect(() => {
    //console.log("Socket instance:", socket);
    //console.log("Socket connected:", socket.connected);
  
    socket.on("connect", () => {
      //console.log("Socket connected");
    });
  
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  
    socket.on("disconnect", (reason) => {
      //console.log("Socket disconnected:", reason);
    });
  
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);
 
  return (
    <div className={`text-white`}>
      {!isChatPage && <Header />}
      <main className={` ${isChatPage ? 'chat-layout' : 'container mx-auto py-4'}`}>
        <ClientProvider>{children}</ClientProvider>
      </main>
      {!isChatPage && <Footer />}
    </div>
  );
}
