'use client';

import { useSession } from 'next-auth/react';
import Profile from './Profile';
import Content from './Content';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // if (status === 'loading') return <p>Loading...</p>;
  // if (!session) return <p>You are not logged in</p>;

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
      <div className="flex-[5] border-2 border-customGray rounded-xl bg-white/90 backdrop-blur-lg">
        {children}
      </div>
    </div>
  );
}
