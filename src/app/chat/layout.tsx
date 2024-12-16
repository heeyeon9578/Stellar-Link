'use client';

import { useSession } from 'next-auth/react';
import Profile from './Profile';
import Content from './Content';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  if (status === 'loading') return <p>Loading...</p>;
  if (!session) return <p>You are not logged in</p>;

  return (
    <div className="flex h-screen p-8 gap-4">

        {/* <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
      <img src={session.user?.image || ''} alt="User Avatar" /> */}
      
      {/* 프로필 부분 */}
      <div className="flex-[0.7] border-2 border-customGray rounded-xl">
        <Profile></Profile>
      </div>

      {/* 선택한 부분 */}
      <div className="flex-[3] border-2 border-customGray rounded-xl bg-white/80 backdrop-blur-lg">
       <Content></Content>
      </div>

      {/* 상세 부분 */}
      <div className="flex-[5] border-2 border-customGray rounded-xl bg-white/80 backdrop-blur-lg">
        {children}
      </div>
    </div>
  );
}
