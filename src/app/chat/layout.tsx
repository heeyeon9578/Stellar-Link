'use client';

import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from "react";
import Profile from './Profile';
import Content from './Content';
import ChatRoom from './ChatRoom'
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // if (status === 'loading') return <p>Loading...</p>;
  // if (!session) return <p>You are not logged in</p>;
 // Fetch the user's initial theme from the database
 useEffect(() => {
  const fetchTheme = async () => {
    if (!session?.user?.id) return;

    const response = await fetch(`/api/theme?userId=${session.user.id}`);
    const { top, middle, bottom } = await response.json();
    applyTheme(top, middle, bottom);
  };

  fetchTheme();

 
}, [session]);

 // Set CSS variables for the theme
 const applyTheme = (top: string, middle: string, bottom: string) => {
  document.documentElement.style.setProperty("--top-color", top);
  document.documentElement.style.setProperty("--middle-color", middle);
  document.documentElement.style.setProperty("--bottom-color", bottom);
};
  return (
    <div className="flex h-screen p-8 gap-4">
      {/* 프로필 부분 */}
      <div className="flex-[0.7] border-2 border-customGray rounded-xl">
        <Profile></Profile>
      </div>

      {/* 선택한 부분 */}
      <div className="flex-[3] border-2 border-customGray rounded-xl bg-white/90 backdrop-blur-lg p-4">
       <Content></Content>
      </div>

      {/* 상세 부분 */}
      <div className="flex-[5] border-2 border-customGray rounded-xl bg-white/90 backdrop-blur-lg p-4" >
        <ChatRoom></ChatRoom>
      </div>
    </div>
  );
}
