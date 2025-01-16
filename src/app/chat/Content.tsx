'use client';
import { usePathname } from 'next/navigation';
import Chat from './ChatContent';
import Profile from './Profile/ProfileContent'
import Friends from './friends/FriendsContent';
import Color from './color/ColorContent';

export default function Content() {
  const pathname = usePathname();

  const isChatPage = pathname === '/chat';
  const isProfilePage = pathname === '/chat/profile';
  const isFriendsPage = pathname === '/chat/friends';
  const isColorPage = pathname === '/chat/color';

  return (
    <>
      {isChatPage && <Chat />}
      {isProfilePage && <Profile />}
      {isFriendsPage && <Friends />}
      {isColorPage && <Color />}
    </>
  );
}
