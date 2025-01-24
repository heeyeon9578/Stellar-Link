'use client';
import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import DynamicText from '../components/DynamicText';

export default function Profile() {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null); // 선택된 섹션 관리
  const { data: session, } = useSession();
  const profileImage = session?.user?.profileImage || '';
  const pathname = usePathname();
  
  useEffect(() => {
    if (pathname?.startsWith('/chat/profile')) {
      setSelectedSection('profile');
    } else if (pathname?.startsWith('/chat/friends')) {
      setSelectedSection('friends');
    } else if (pathname === '/chat') {
      setSelectedSection('chat');
    } else if (pathname?.startsWith('/chat/color')) {
      setSelectedSection('color');
    } else {
      setSelectedSection(null); // 기본값 설정 (선택 없음)
    }
  }, [pathname]);

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

  // 공통 프로필 렌더링 함수
  const renderProfileSection = (
    key: string,
    svgSrc: string,
    label: string,
    navigateTo: string
  ) => {
    const isSelected = selectedSection === key; // 현재 섹션이 선택된 상태인지 확인
    const clickIcon = () =>{
      setSelectedSection(key);
      router.push(navigateTo);
    }
    return (
      <div
        className="flex flex-col w-full items-center relative cursor-pointer "
        onClick={clickIcon} // 섹션 선택 상태 업데이트
      >
        {isSelected && (
          <Image
            src="/SVG/select.svg"
            alt="select"
            width={6}
            height={22.5}
            priority
            className=" cursor-pointer absolute top-2 left-0 hidden sm:block"
          />
        )}

        <div className=''>
          <div 
          className={`profile-circle
            ${isSelected ? "border-2 border-customGray sm:border-none" : ""}`}
          >
            { key !== 'profile'? (
              <img
              src={svgSrc}
              alt={label}
              // width={22.5}
              // height={22.5}
              // priority
              className="cursor-pointer  xs:w-5 xs:h-5 h-3 w-3"
            />
            ):
            (
              <img
              src={profileImage || '/SVG/default-profile.svg'}
              alt="Profile"
              className={`w-full h-full rounded-full object-cover 
              `}
            />
            )}
          </div>
        </div>

        <div className='overflow-hidden whitespace-nowrap text-ellipsis flex justify-center w-6 xs:w-10 sm:w-16 text-[7px] xs:text-[10px] sm:text-sm'>
          <DynamicText className={label === session?.user?.name ? 'text-scroll' : ''} text={label === session?.user?.name ? session?.user?.name : t(label)}/>
        </div>
        
      </div>
    );
  };
 // session이 없을 때 처리
 if (!session) {
  return (
    <div className="w-full h-full flex justify-center items-center">
     
    </div>
  );
}

  return (
    <div className="w-full h-full flex sm:flex-col flex-row justify-around items-center p-2 sm:p-0 gap-1"> 
       {/* 로고 */}
       <img
          src="/SVG/Logo.svg"
          alt="Logo"
          // width={100}
          // height={100}
          // priority
          onClick={() => router.push('/')} // 로고 클릭 시 홈으로 이동
          className="cursor-pointer sm:mt-4 mt-0 sm:w-full w-[10vw]"
        />

        {/* 프로필 섹션 */}
        {renderProfileSection('profile', profileImage||'/SVG/Friends.svg',session.user?.name || t('Profile'), '/chat/profile')}
        {renderProfileSection('friends', '/SVG/Friends.svg', 'Friends', '/chat/friends')}
        {renderProfileSection('chat', '/SVG/Chat.svg', 'Chat', '/chat')}
        {renderProfileSection('color', '/SVG/Color.svg', 'Color', '/chat/color')}
        {renderProfileSection('logout', '/SVG/Logout.svg', 'Logout', '/')}
    </div>
  );
}
