'use client';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchFriends, fetchReceivedRequests, fetchSentRequests } from '../../../store/friendsSlice';
import { RootState } from '../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import Button from '@/app/components/Button';
import DynamicText from '../../app/components/DynamicText';


export default function ChatContent(){
    const dispatch = useAppDispatch();
    const { t } = useTranslation('common');
    const [search, setSearch] = useState<string>("");
    // 디바운싱된 검색어 (일정 시간 지연 후 최종 반영)
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    const [isClicked, setIsClicked] = useState<'All'|'Personal'|'Teams'|'Hide'>('All');
    const menus =[
        {name: t('All'), onClick:() =>setIsClicked('All')},
        {name: t('Personal'), onClick:() =>setIsClicked('Personal')},
        {name: t('Teams'), onClick:() =>setIsClicked('Teams')},
        {name: t('Hide'), onClick:() =>setIsClicked('Hide')}
    ] 
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:3000/api/websocket');
        setSocket(ws);
    
        ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          setMessages((prev) => [...prev, message]);
        };
    
        return () => {
          ws.close();
        };
      }, []);

    // 0.3초(300ms) 디바운스: search 값이 변경될 때마다 타이머를 재설정
    useEffect(() => {
      const timer = setTimeout(() => {
        setDebouncedSearch(search.trim()); 
        // trim()은 앞뒤 공백 제거 용도로, 필요 없으면 제거해도 됩니다.
      }, 300);
  
      return () => clearTimeout(timer);
    }, [search]);

    const sendMessage = () => {
        if (socket && input.trim()) {
          socket.send(JSON.stringify({ sender: 'User', text: input, sessionId: '12345' }));
          setInput('');
        }
    };

    return(
        <div className="mx-auto p-8 rounded-lg h-full text-customBlue relative">
            {/** 헤더 */}
            <h2 className="text-2xl font-bold mb-4">
              <DynamicText text={t('Chat')} />
            </h2>

            {/** 검색 창 (디바운스 적용) */}
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

            {/** 메뉴 */}   
            <div className="w-full h-10 bg-customRectangle rounded-xl flex mt-4 text-customGray text-sm flex items-center justify-around p-2">

                {menus.map((menu)=>(
                  <Button
                  variant={isClicked===menu.name ? 'primary':"main"}
                  size="sm"
                  className={isClicked===menu.name? "text-white w-full h-8" :"text-customGray w-full h-8"}
                  onClick={menu.onClick}
                >
                  <DynamicText text={t(menu.name)} />
                </Button>
                ))}
            </div>

            <div>
              <div>
                {messages.map((msg, index) => (
                  <div key={index}>
                    <strong>{msg.sender}</strong>: {msg.text}
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    )
}