// Content.tsx
'use client';
import { usePathname, useSearchParams } from 'next/navigation';
import Chat from './ChatContent';
import Profile from './profile/ProfileContent';
import Friends from './friends/FriendsContent';
import Color from './color/ColorContent';
import ChatRoom from './ChatRoom';
import useIsMobile from '../components/useIsMobile'; // 커스텀 훅 임포트

export default function Content() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatRoomId = searchParams?.get('chatRoomId');
  const isMobile = useIsMobile(); // 화면 크기 상태 가져오기

  const isChatPage = pathname === '/chat';
  const isProfilePage = pathname === '/chat/profile';
  const isFriendsPage = pathname === '/chat/friends';
  const isColorPage = pathname === '/chat/color';

  // 공통 클래스 정의
  const commonClasses = "sm:flex-[3] flex-[5] border-2 border-customGray rounded-xl bg-white/90 backdrop-blur-lg md:p-4 sm:h-[100%] h-[80%]";

  // 렌더링할 컴포넌트 결정
  const renderContent = () => {
    if (isChatPage) {
      if (isMobile) {
        return chatRoomId ? <ChatRoom  /> : <Chat />;
      } else {
        return <Chat />;
      }
    }
    if (isProfilePage) return <Profile />;
    if (isFriendsPage) return <Friends />;
    if (isColorPage) return <Color />;
    return null;
  };

  return (
    <div className={commonClasses}>
      {/* 선택한 부분 */}
      {renderContent()}
    </div>
  );
}
