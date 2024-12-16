import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

export default function Profile() {
  const router = useRouter();
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null); // 선택된 섹션 관리
  const { data: session, status } = useSession();

  useEffect(()=>{
    setSelectedSection('chat')
  },[])

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

    return (
      <div
        className="profile"
        onClick={() => setSelectedSection(key)} // 섹션 선택 상태 업데이트
      >
        {isSelected && (
          <Image
            src="/SVG/select.svg"
            alt="select"
            width={7}
            height={70}
            priority
            className="cursor-pointer absolute top-0 left-0"
          />
        )}
        <div className="profile-circle" onClick={() => router.push(navigateTo)}>
          <Image
            src={svgSrc}
            alt={label}
            width={22.5}
            height={22.5}
            priority
            className="cursor-pointer"
          />
        </div>
        <div>{t(label)}</div>
      </div>
    );
  };
 // session이 없을 때 처리
 if (!session) {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <p>{t('Please log in to access your profile.')}</p>
    </div>
  );
}

  return (
    <div className="w-full h-full"> 
      <div className="w-full h-full flex flex-col justify-around items-center">
        {/* 로고 */}
        <Image
          src="/SVG/Logo.svg"
          alt="Logo"
          width={100}
          height={100}
          priority
          onClick={() => router.push('/')} // 로고 클릭 시 홈으로 이동
          className="cursor-pointer mt-4"
        />

        {/* 프로필 섹션 */}
        {renderProfileSection('profile', '/SVG/Friends.svg',session.user?.name || t('Profile'), '/chat/profile')}
        {renderProfileSection('friends', '/SVG/Friends.svg', 'Friends', '/chat/friends')}
        {renderProfileSection('chat', '/SVG/Chat.svg', 'Chat', '/chat')}
        {renderProfileSection('color', '/SVG/Color.svg', 'Color', '/chat/color')}
        {renderProfileSection('logout', '/SVG/Logout.svg', 'Logout', '/')}
      </div>
    </div>
  );
}