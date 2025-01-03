'use client';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import { useAppDispatch } from '../../../store/hooks';
import Image from 'next/image';
import Button from '@/app/components/Button';
import DynamicText from '../../app/components/DynamicText';

interface participant{
  name:string;
  id:string;
  email:string;
  profileImage:string;
}
interface senderInfo{
  email:string;
  id:string;
  name:string;
  profileImage:string;
}
interface ChatRoom {
  _id: string;
  participants: participant[];
  type: string;
  createdAt: string;
  messages: {
    chatRoomId: string;
    senderEmail: string;
    senderInfo:senderInfo;
    text: string;
    requesterId: string;
    createdAt: string;
  }[];
}

export default function ChatContent() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isClicked, setIsClicked] = useState<'All' | 'Personal' | 'Teams' | 'Hide'>('All');
  const [data, setData] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const menus = [
    { name: t('All'), onClick: () => setIsClicked('All') },
    { name: t('Personal'), onClick: () => setIsClicked('Personal') },
    { name: t('Teams'), onClick: () => setIsClicked('Teams') },
    { name: t('Hide'), onClick: () => setIsClicked('Hide') },
  ];

  // 검색어 디바운싱 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/chat/chat?type=${isClicked}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
        console.log(`
          
          
          result

          
          `,result)
      } catch (error: unknown) {
        console.error(error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isClicked]);

  // 필터링된 데이터
const filteredData = data.filter((chatRoom) =>
  chatRoom.participants.some((participant) =>
    participant.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    participant.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) ||
  chatRoom.messages.some((message) =>
    message.text.toLowerCase().includes(debouncedSearch.toLowerCase())
  )
);


  return (
    <div className="mx-auto p-8 rounded-lg h-full text-customBlue relative">
      <h2 className="text-2xl font-bold mb-4">
        <DynamicText text={t('Chat')} />
      </h2>

      <div className="w-full h-10 bg-customGray rounded-xl flex">
        <div className="p-2 flex items-center">
          <Image
            src="/SVG/search.svg"
            alt="search"
            width={11}
            height={11}
            priority
            className="cursor-pointer"
          />
        </div>
        <div className="flex items-center text-sm w-full">
          <input
            type="text"
            value={search}
            placeholder={t('Search')}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[100%] text-black/45 border-customGray rounded-xl text-sm bg-transparent focus:outline-none focus:ring-0 focus:border-transparent"
          />
        </div>
      </div>

      <div className="w-full h-10 bg-customRectangle rounded-xl flex mt-4 text-customGray text-sm items-center justify-around p-2">
        {menus.map((menu) => (
          <Button
            key={menu.name}
            variant={isClicked === menu.name ? 'primary' : "main"}
            size="sm"
            className={isClicked === menu.name ? "text-white w-full h-8" : "text-customGray w-full h-8"}
            onClick={menu.onClick}
          >
            <DynamicText text={t(menu.name)} />
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="text-center mt-4">{t('Loading...')}</div>
      ) : error ? (
        <div className="text-red-500 mt-4">{t('Error')}: {error}</div>
      ) : (
        <div className="mt-4">
          {filteredData.length === 0 ? (
            <div>{t('No chats found')}</div>
          ) : (
            filteredData.map((chatRoom) => (
              <div key={chatRoom._id} className="p-4 bg-gray-100 rounded-md mb-2">
               
                <ul className="mb-2">
                  {chatRoom.participants.map((participant, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <img
                        src={participant.profileImage}
                        alt={participant.name}
                        width={30}
                        height={30}
                        className="rounded-full mr-2"
                      />
                      <span>{participant.name} ({participant.email})</span>
                    </li>
                  ))}
                </ul>
               
                <ul>
                  {chatRoom.messages.slice(-1).map((message, index) => (
                    <li key={index} className="text-sm text-black">
                      <strong>{message.senderInfo.name}:</strong> {message.text} 
                      <div>
                        {message.createdAt}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}