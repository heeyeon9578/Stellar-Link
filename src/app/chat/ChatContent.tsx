'use client';
import { useEffect, useState,useRef } from "react";
import { useSession } from 'next-auth/react';
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import Image from 'next/image';
import Button from '@/app/components/Button';
import DynamicText from '../../app/components/DynamicText';
import { useRouter } from 'next/navigation';
import 'animate.css';
import { RootState } from '../../../store/store';
import { useAppDispatch} from '../../../store/hooks';
import { useSelector } from 'react-redux';
import { fetchFriends } from '../../../store/friendsSlice';
import { useSearchParams } from 'next/navigation';
import socket from "@/socketIns"; // 위에서 만든 socket.ts 경로
import {
  setChatRoomId,
  setChatRoomInfo,
  setMessages,
  addMessage,
  setInput,
} from "../../../store/chatSlice";
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
  title?:string;
  messages: {
    chatRoomId: string;
    senderEmail: string;
    senderInfo:senderInfo;
    text: string;
    requesterId: string;
    createdAt: string;
    requesterEmail?:string;
    requesterImage?:string;
    requesterName?:string;

  }[];
}
interface MenuPosition {
  x: number;
  y: number;
}

interface Friend {
  _id: string;
  email: string;
  name: string;
  profileImage?: string;
  status: string;
  addedAt?: string;
}
export default function ChatContent() {
  const { data: session, status } = useSession();
  const dispatch = useAppDispatch();
  const { t,i18n } = useTranslation('common');
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isClicked, setIsClicked] = useState<'All' | 'Personal' | 'Teams' >('All');
  const [data, setData] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const messages = useSelector((state: RootState) => state.chat.messages);
  const [isInitialized, setIsInitialized] = useState(false);
  const searchParams = useSearchParams();
  const menus = [
    { name: t('All'), onClick: () => setIsClicked('All') },
    { name: t('Personal'), onClick: () => setIsClicked('Personal') },
    { name: t('Teams'), onClick: () => setIsClicked('Teams') },
   
  ];
  
  const {
    list: friends,
   
  } = useSelector((state: RootState) => state.friends);
 // 애니메이션 상태 변수 추가
 const [isAnimating, setIsAnimating] = useState<boolean>(false);
 const [isGenerateChatRoom, setIsGenerateChatRoom] = useState<boolean>(false);
 const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
 const [title, setTitle] = useState<string>('');
 const [menuVisible, setMenuVisible] = useState<boolean>(false);
 const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);
 const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
 const [currentChatRoomId,setCurrentChatRoomId] = useState<string>('');
 const popupRef = useRef<HTMLUListElement | null>(null); // Ref를 HTMLUListElement로 변경
 const [currentContextMenuChatRoomId, setCurrentContextMenuChatRoomId] = useState<string | null>(null);
 const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

 const [editChatRoomName,setEditChatRoomName] = useState<string>("");
   useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside); // 클릭 감지 이벤트 등록
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // 컴포넌트 언마운트 시 이벤트 제거
    };
  }, []);
 // URL 파라미터에서 chatRoomId 가져오기
 useEffect(() => {
  const id = searchParams?.get("chatRoomId");
  if (id) {
    dispatch(setChatRoomId(id));
  }else{
    dispatch(setChatRoomId(null));
  }
}, [searchParams, dispatch]);
useEffect(() => {
  console.log("Socket instance:", socket);
  console.log("Socket connected:", socket.connected);

  socket.on("connect", () => {
    console.log("Socket connected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
  });

  return () => {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("disconnect");
  };
}, []);
useEffect(() => {
  socket.on("receive_message", (message) => {
    console.log(`
      
      
      
      
      receive_message for ChatContent
      
      
      
      
      `,message)
      setData((prevData) => {
        // 업데이트된 채팅방을 찾기
        const updatedChatRoomIndex = prevData.findIndex(
          (chatRoom) => chatRoom._id === message.chatRoomId
        );
  
        if (updatedChatRoomIndex === -1) return prevData; // 채팅방이 없으면 그대로 반환
  
        // 기존 데이터를 복사하여 수정
        const updatedChatRoom = { ...prevData[updatedChatRoomIndex] };
  
        if(updatedChatRoom.messages.length>0){
          // 메시지 업데이트
        updatedChatRoom.messages[updatedChatRoom.messages.length - 1] = {
          ...updatedChatRoom.messages[updatedChatRoom.messages.length - 1],
          text: message.text,
          senderInfo: {
            ...updatedChatRoom.messages[updatedChatRoom.messages.length - 1].senderInfo,
            name: message.requesterName,
          },
          createdAt: message.createdAt.toString(),
        };
        }else{
          updatedChatRoom.messages = [
            {
              chatRoomId: message.chatRoomId,
              senderEmail: message.senderEmail,
              senderInfo: {
                id: message.requesterId,
                name: message.requesterName,
                email: message.senderEmail,
                profileImage: "", // 기본 이미지 처리 (필요시 수정)
              },
              text: message.text,
              requesterId: message.requesterId,
              createdAt: new Date(message.createdAt).toISOString(),
            },]
        }
  
        // 기존 리스트에서 해당 채팅방 제거
        const updatedData = prevData.filter((chatRoom) => chatRoom._id !== message.chatRoomId);
  
        // 채팅방을 최상단에 추가
        return [updatedChatRoom, ...updatedData];

        
      });
   // 안 읽은 메시지 수 업데이트
   if (message.requesterId !== session?.user.id) {
    // 메시지를 보낸 사람이 현재 사용자가 아니라면 unreadCounts 증가
    setUnreadCounts((prevCounts) => {
      const updatedCounts = { ...prevCounts };
      updatedCounts[message.chatRoomId] =
        (prevCounts[message.chatRoomId] || 0) + 1;
      return updatedCounts;
    });
  }
  });

// 새로운 이벤트 리스너 추가: `update_read_status`
socket.on("update_read_status", ({ chatRoomId, userId }) => {
  console.log(`update_read_status for ChatRoom: ${chatRoomId}, User: ${userId}`);
  if (userId === session?.user.id) {
    console.log(`
      
      
      로그인한 사용자와 업데이트한 사용자가 같아서 읽음 표시 0으로 변경
      
      
      
      `);
    setUnreadCounts((prevCounts) => {
      const updatedCounts = { ...prevCounts };
      updatedCounts[chatRoomId] = 0; // 읽음 처리
      return updatedCounts;
    });
  }
});
  return () => {
    socket.off("receive_message");
    socket.off("update_read_status"); // 정리

  };
}, []);

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const response = await fetch('/api/chat/unread-counts');
        if (!response.ok) {
          throw new Error('Failed to fetch unread counts');
        }
        const data = await response.json();
        const counts = data.reduce((acc: Record<string, number>, room: any) => {
          acc[room._id] = room.unreadCount;
          return acc;
        }, {});
        console.log(`
          
          
          
          
          counts
          
          
          
          `,counts )
        setUnreadCounts(counts);
      } catch (error) {
        console.error("Error fetching unread counts:", error);
      }
    };
  
    fetchUnreadCounts();
  }, []);
  
  // 메시지가 변경될 때마다 처리
useEffect(() => {
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
   
    setData((prevData) => {
      // 업데이트된 채팅방을 찾기
      const updatedChatRoomIndex = prevData.findIndex(
        (chatRoom) => chatRoom._id === lastMessage.chatRoomId
      );

      if (updatedChatRoomIndex === -1) return prevData; // 채팅방이 없으면 그대로 반환

      // 기존 데이터를 복사하여 수정
      const updatedChatRoom = { ...prevData[updatedChatRoomIndex] };

      if(updatedChatRoom.messages.length>0){
        // 메시지 업데이트
      updatedChatRoom.messages[updatedChatRoom.messages.length - 1] = {
        ...updatedChatRoom.messages[updatedChatRoom.messages.length - 1],
        text: lastMessage.text,
        senderInfo: {
          ...updatedChatRoom.messages[updatedChatRoom.messages.length - 1].senderInfo,
          name: lastMessage.requesterName,
        },
        createdAt: lastMessage.createdAt.toString(),
      };
      }else{
        updatedChatRoom.messages = [
          {
            chatRoomId: lastMessage.chatRoomId,
            senderEmail: lastMessage.senderEmail,
            senderInfo: {
              id: lastMessage.requesterId,
              name: lastMessage.requesterName,
              email: lastMessage.senderEmail,
              profileImage: "", // 기본 이미지 처리 (필요시 수정)
            },
            text: lastMessage.text,
            requesterId: lastMessage.requesterId,
            createdAt: new Date(lastMessage.createdAt).toISOString(),
          },]
      }

      // 기존 리스트에서 해당 채팅방 제거
      const updatedData = prevData.filter((chatRoom) => chatRoom._id !== lastMessage.chatRoomId);

      // 채팅방을 최상단에 추가
      return [updatedChatRoom, ...updatedData];
    });
  }
}, [messages]);


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
      } catch (error: unknown) {
        console.error(error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isClicked]);

  useEffect(() => {
  
    setFilteredFriends(friends); // 새로운 상태 변수 `filteredFriends` 필요
  }, [friends]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때, Thunk 액션을 디스패치해서 데이터 로드
    dispatch(fetchFriends());
   
  }, [dispatch]);
  // 필터링된 데이터


const filteredData = data.filter((chatRoom) =>
  chatRoom.participants.some((participant) =>
    participant.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    participant.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) ||
  (chatRoom.messages && chatRoom.messages.length > 0 &&
    chatRoom.messages.some((message) =>
      message.text.toLowerCase().includes(debouncedSearch.toLowerCase())
    )
  )
);

const generateChatRoom = () => {
  // 애니메이션 트리거
  setIsAnimating(true);
  // 애니메이션이 끝난 후 상태를 초기화
  setTimeout(() => {
    setIsAnimating(false);
    if(isGenerateChatRoom){
      setFilteredFriends(friends); // 새로운 상태 변수 `filteredFriends` 필요
      setSelectedFriends([]);
      setCurrentChatRoomId('');
      setMenuVisible(false);
    }
    setIsGenerateChatRoom(!isGenerateChatRoom);
  
 
  }, 500); // 애니메이션 지속 시간에 맞게 설정 (예: 1초)
};

// 체크박스 상태를 관리하는 함수
const handleCheckboxChange = (friendId: string) => {
  setSelectedFriends((prevSelected) => {
    if (prevSelected.includes(friendId)) {
      // 이미 선택된 경우 제거
      return prevSelected.filter(id => id !== friendId);
    } else {
      // 선택되지 않은 경우 추가
      return [...prevSelected, friendId];

    }

    
  });
};

// 우클릭 핸들러
const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>,chatRoomId: string) => {
  event.preventDefault(); // 기본 브라우저 메뉴 비활성화
  setMenuPosition({ x: event.pageX, y: event.pageY });
  setMenuVisible(true); // 메뉴 표시
  setCurrentContextMenuChatRoomId(chatRoomId); // 현재 우클릭된 채팅방 ID 저장
};

// 클릭 핸들러 (메뉴 닫기)
const handleClickOutside = (event: MouseEvent) => {
  // 클릭한 요소가 팝업 내부가 아닐 경우 팝업 닫기
  if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
    setMenuVisible(false);
  }
};

// Esc 키로 메뉴 닫기
useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setMenuVisible(false);
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

const handleGenerateRoom = () =>{
  if(currentChatRoomId){
    fetchInviteChatRoom(currentChatRoomId);
  }else{
    fetchGenerateRoom();
  }
  
}

const fetchGenerateRoom = () =>{
  let type='';
  if(selectedFriends.length===1){
   type='personal';
  }else{
    type='teams';
  }
  fetch('/api/chat/create-room', {
    method: 'POST',
    body: JSON.stringify({ participants: selectedFriends, type: type, title:title }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      setSelectedFriends([]);
      setIsGenerateChatRoom(false);
      // 새 채팅방 데이터를 기존 상태에 추가
      setData((prevData) => [
        {
          _id: data.chatRoomId, // 서버에서 반환된 채팅방 ID
          participants: selectedFriends.map((id) => ({
            id,
            name: friends.find((friend) => friend._id === id)?.name || 'Unknown',
            email: friends.find((friend) => friend._id === id)?.email || 'Unknown',
            profileImage: friends.find((friend) => friend._id === id)?.profileImage || '/SVG/default-profile.svg',
          })),
          type: type,
          title: title || '',
          createdAt: new Date().toISOString(),
          messages: [], // 새로 생성된 채팅방에는 메시지가 없음
        },
        ...prevData, // 기존 데이터 유지
      ]);

      // 채팅 방 ID로 이동
      router.push(`/chat?chatRoomId=${data.chatRoomId}`);
      setFilteredFriends(friends); // 새로운 상태 변수 `filteredFriends` 필요
      
    });
};

const handelExitChatRoom =(chatRoomId:string)=>{
  fetch('/api/chat/exit-room', {
    method: 'POST',
    body: JSON.stringify({ chatRoomId:chatRoomId, user:session?.user.id }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {

      setMenuVisible(false);
      setData((prevData) => prevData.filter((room) => room._id !== chatRoomId));
      router.push('/chat')
      router.refresh(); 
    });
}
const handleInviteChatRoom = (chatRoomId: string) => {

  // 현재 채팅방의 참여자 가져오기
  const currentChatRoom = data.find((room) => room._id === chatRoomId);

  if (!currentChatRoom) {
    console.error("Chat room not found");
    return;
  }

  // 이미 참여 중인 사용자의 ID 목록
  const existingParticipantIds = currentChatRoom.participants.map((p) => p.id);

  // 친구 목록에서 이미 참여 중인 사용자를 제외한 목록 생성
  const filteredFriends = friends.filter(
    (friend) => !existingParticipantIds.includes(friend._id)
  );

  // 상태 업데이트로 필터링된 친구 목록을 설정 (필요한 경우 사용)
  setSelectedFriends([]);
  setFilteredFriends(filteredFriends); // 새로운 상태 변수 `filteredFriends` 필요

  // 현재 초대 중인 채팅방 ID 설정
  setCurrentChatRoomId(chatRoomId);

  // 생성 창 열기
  generateChatRoom();
};

const fetchInviteChatRoom =(chatRoomId:string)=>{

  let type='';
  if(selectedFriends.length===1){
   type='personal';
  }else{
    type='teams';
  }

  fetch('/api/chat/create-room', {
    method: 'POST',
    body: JSON.stringify({ chatRoomId:chatRoomId,participants: selectedFriends, type:type }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      setSelectedFriends([]);
      setIsGenerateChatRoom(false);
      setFilteredFriends(friends); // 새로운 상태 변수 `filteredFriends` 필요
      setCurrentChatRoomId('');
      setMenuVisible(false);
      router.push(`/chat?chatRoomId=${data.chatRoomId}`);
    });
};

const handleEditChatRoomName = (chatRoomId:string) =>{
  setEditChatRoomName(chatRoomId);
  setMenuVisible(false);
};

const cancelEditChatRoom = () =>{
  setEditChatRoomName('');
  
};

const fetchEditChatRoomName = (chatRoomId:string) =>{
  fetch('/api/chat/edit-room', {
    method: 'PATCH',
    body: JSON.stringify({chatRoomId:chatRoomId, title:title }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      // UI 업데이트
    setData((prevData) =>
      prevData.map((chatRoom) =>
        chatRoom._id === chatRoomId
          ? { ...chatRoom, title: title || chatRoom.title }
          : chatRoom
      )
    );

    // 제목 편집 모드 종료
    setEditChatRoomName('');
    setTitle(''); // 입력 필드 초기화
   
    });
};
const fetchMarkAsRead = (chatRoomId:string) =>{
  fetch('/api/chat/mark-as-read', {
    method: 'POST',
    body: JSON.stringify({ chatRoomId: chatRoomId, user: session?.user.id }),
    headers: { 'Content-Type': 'application/json' }
  });
}
const enterChatRoom = (chatRoomId:string)=> {
  router.push(`/chat?chatRoomId=${chatRoomId}`);
   // 안 읽은 메시지 수를 0으로 설정
   setUnreadCounts((prevCounts) => {
    const updatedCounts = { ...prevCounts };
    updatedCounts[chatRoomId] = 0; // 현재 채팅방 메시지 읽음 처리
    return updatedCounts;
  });

  fetchMarkAsRead(chatRoomId);
};

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

  return (
    <div className="mx-auto p-8 rounded-lg h-full text-customBlue relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold mb-4">
          <DynamicText text={t('Chat')} />
        </h2>
       {isGenerateChatRoom ? (
         <Image
         src="/SVG/cancel.svg"
         alt="add"
         width={25}
         height={25}
         priority
         className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
         onClick={generateChatRoom}
       />
       ):(
        <Image
        src="/SVG/add.svg"
        alt="add"
        width={25}
        height={25}
        priority
        className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
        onClick={generateChatRoom}
      />
       )}
        </div>
      {isGenerateChatRoom ? (
        <>  
          <div className="mt-4 max-h-[50vh] overflow-y-auto">
            {filteredFriends?.filter(friend => friend.status !== 'block').length === 0 ? (
              <DynamicText text={t('Yhnfy')}/>
          
            ) : (
              <ul>
                {filteredFriends
                .filter(friend => friend.status !== 'block')
                .map((friend)  => (
                  <li key={friend._id} className="flex mb-4 ">
                    
                   <div className="flex cursor-pointer items-center ml-1" >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleCheckboxChange(friend._id)}
                      className="appearance-none checked:bg-customLightPurple checked:border-customLightPurple mr-2 focus:outline-none rounded-full focus:ring-2 focus:ring-customLightPurple focus:border-transparent"
                    /> 
                     <img
                       src={friend.profileImage || "/SVG/default-profile.svg"}
                       alt={`${friend.name}'s profile`}
                       className="w-[50px] h-[50px] rounded-full mr-2" 
                     />

                     <div>
                       <div className="text-customPurple font-bold">
                         <DynamicText text={friend.name}/>
                       </div>

                       <div className="text-customGray text-xs">
                         {friend.email}
                       </div>
                     </div>
                   </div>

                  
                 </li>
                ))}
              </ul>
            )}

          </div>

          <div className="mb-4" lang="ko">
            <label className="block text-sm font-bold mb-2">
              <DynamicText text={t('Title')} />
            </label>
            <input
              type="text"
              value={title}
              lang="ko"
              onChange={(e) => setTitle(e.target.value)}
             className="w-full text-customPurple px-3 py-2 border-customGray rounded-lg focus:outline-none focus:ring-2 focus:ring-customLightPurple"
            />
          </div>

          <div className="absolute bottom-2 w-full left-0">
            <Button
              variant="primary"
              disabled={selectedFriends.length===0} // 한명이라도 선택되었을때
              className="animate__animated animate__zoomIn w-full"
              onClick={handleGenerateRoom}
            >
              <DynamicText text={t('GenerateRoom')} />
            </Button>
          </div>
        </>
        ):(
        <div className="h-full w-full">
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
                  lang="ko"
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
               <DynamicText text={t('Loading')} className="text-gray-500 mt-4"/>
            )  : (
              <div className="mt-4 h-[70%] overflow-y-auto">
                {filteredData.length === 0 ? (
                 <DynamicText text={t('Ncf')} className="text-gray-500"/>
                ) : (
                  filteredData.map((chatRoom) => (
                    <div 
                    
                    key={chatRoom._id} 
                    className="p-2 cursor-pointer rounded-xl mb-2 bg-white/50 h-[80px]"
                    onClick={(e) => {
                      if (!menuVisible && !editChatRoomName) {
                        enterChatRoom(chatRoom._id);
                      } else {
                        e.stopPropagation(); // 클릭 이벤트 버블링을 막음
                      }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, chatRoom._id)} // 우클릭 이벤트
                    
                     >
                     <div className="z-100">
                        {/* 우클릭 메뉴 */}
                        {menuVisible && currentContextMenuChatRoomId === chatRoom._id && (
                        <ul
                          ref={popupRef}
                          className="absolute bg-white/80 text-xs shadow-md list-none p-2 rounded-xl z-100"
                          style={{
                            top: menuPosition.y - 50,
                            left: menuPosition.x - 150,
                            zIndex: 9999, // 최상단으로 설정
                          }}
                        >
                          <li
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() =>handleEditChatRoomName(chatRoom._id)}
                          >
                            <DynamicText text={t('EditName')} />
                          </li>
                          <li
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => handleInviteChatRoom(chatRoom._id)}
                          >
                            <DynamicText text={t('InviteFriends')} />
                          </li>
                          <li
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100 text-red-500"
                            onClick={() => handelExitChatRoom(chatRoom._id)}
                          >
                            <DynamicText text={t('Exit')} />
                          </li>
                        </ul>
                      )}
                    </div>

                      {/** 친구 이름과 날짜 */}
                      <div className="flex justify-between relative">
                        {editChatRoomName===chatRoom._id && 
                        <div className="absolute flex top-9 right-7">
                           <Image
                              src="/SVG/confirm.svg"
                              alt="confirm"
                              width={15}
                              height={15}
                              priority
                              className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
                              onClick={()=>{fetchEditChatRoomName(chatRoom._id)}}
                            />
                          
                            <Image
                               src="/SVG/cancelChange.svg"
                               alt="cancelChange"
                               width={15}
                               height={15}
                               priority
                               className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
                               onClick={cancelEditChatRoom}
                             />
                        </div>
                        }
                        <ul className="w-[50%] h-[70px]">
                        {chatRoom.participants.length === 1 ? (
                          // 한 명일 때
                          <li className="flex text-sm flex-col h-[70px]">
                            <img
                              src={chatRoom.participants[0].profileImage}
                              alt={chatRoom.participants[0].name}
                              width={30}
                              height={30}
                              className="rounded-full w-8 h-8 mr-2 border border-white"
                            />
                            <div className="flex flex-col text-customPurple text-sm ">

                            <div className="flex flex-nowrap h-[20px] text-sm text-customPurple overflow-hidden whitespace-nowrap text-ellipsis ">
                              {
                                editChatRoomName ===chatRoom._id ? (
                                  <>
                                    <input
                                      type="text"
                                      value={title}
                                      lang="ko"
                                      onChange={(e) => setTitle(e.target.value)}
                                     className="w-full text-xs text-customPurple px-3 py-2 border-customGray rounded-lg focus:outline-none focus:ring-0 focus:border-customLightPurple"
                                    />
                                  </>
                                ):(
                                <>
                                {!chatRoom.title && <DynamicText text={chatRoom.participants[0].name} />}
                                {chatRoom.title && (
                                  <DynamicText text={chatRoom.title} />
                                )}
                                </>
                                )
                              }
                            </div>

                              {/** 마지막 메세지 */}
                              <div className="text-xs text-gray-500 overflow-hidden text-ellipsis h-[18px]">
                                {chatRoom.messages.length > 0 ? (
                                  <DynamicText className="" text={`${chatRoom.messages[chatRoom.messages.length - 1].senderInfo.name}: ${chatRoom.messages[chatRoom.messages.length - 1].text}`} /> 
                                  
                                ) : (
                                  <DynamicText text={t('Tmie')}/>
                                )}
                              </div>

                            </div>
                          </li>
                        ) : (
                          //여러 명 일때
                          <div className="h-[70px]">
                            {/* 참여자 프로필 이미지 표시 */}
                            <div className="relative flex ">
                              {chatRoom.participants.map((participant, index) => (
                                <div
                                  key={index}
                                  className="absolute"
                                  style={{
                                    left: `${index * 20}px`, // 겹치는 간격 조정
                                    zIndex: chatRoom.participants.length - index, // z-index로 겹침 순서 조정
                                  }}
                                >
                                  <img
                                    src={participant.profileImage}
                                    alt={participant.name}
                                    className="w-8 h-8 rounded-full border border-white"
                                  />
                                </div>
                              ))}
                            </div>
                            

                            {/* 참여자 프로필 이름 표시 */}
                            <div className="mt-8 flex h-[20px] text-sm text-customPurple flex-wrap overflow-hidden whitespace-nowrap text-ellipsis" >
                              <div className="">
                              {
                                editChatRoomName===chatRoom._id ?(
                                  <>
                                  <input
                                      type="text"
                                      value={title}
                                      lang="ko"
                                      onChange={(e) => setTitle(e.target.value)}
                                     className="w-full text-xs text-customPurple px-3 py-2 border-customGray rounded-lg focus:outline-none focus:ring-0 focus:border-customLightPurple"
                                    />
                                  </>
                                ):(
                                  <>
                                   {chatRoom.participants.map((participant, index) => (
                                      <span key={index}>
                                        {!chatRoom.title && (
                                          <DynamicText 
                                            className="mr-2" 
                                            text={
                                              index === chatRoom.participants.length - 1 
                                                ? participant.name 
                                                : participant.name + ','
                                            } 
                                          />
                                        )}
                                      </span>
                                    ))}
                                    {/* 제목 표시 */}
                                    {chatRoom.title && (
                                    <div className="mr-2 text-customPurple">
                                      <DynamicText text={chatRoom.title}/>
                                    </div>
                                    )}
                                  </>
                                ) 
                              }

                              </div>

                              {/* 인원수 표시 */}
                              <div className="text-xs text-gray-500">
                                  <DynamicText text={(chatRoom.participants.length+1).toString()}/>
                                  
                              </div>

                            </div>
                            {/** 마지막 메세지 */}
                            <div className="text-xs text-gray-500 overflow-hidden text-ellipsis  h-[18px]">
                              {chatRoom.messages.length > 0 ? (
                                 <DynamicText text={`${chatRoom.messages[chatRoom.messages.length - 1].senderInfo.name}: ${chatRoom.messages[chatRoom.messages.length - 1].text}`} /> 
                              ) : (
                                <DynamicText text={t('Tmie')}/>
                              )}
                            </div>
                            {/* 안 읽은 메시지 개수 표시 */}
                            {unreadCounts[chatRoom._id] > 0 && (
                              <span className="absolute bottom-0 right-0 bg-customLightPurple text-white text-xs rounded-full px-2 py-1">
                                {unreadCounts[chatRoom._id]}
                              </span>
                            )}
                          </div>
                        )}

                        
                        </ul>

                        {/** 날짜 시간 */}
                        <div className="text-xs flex-nowrap text-gray-500 w-[60px] flex justify-end">
                        {chatRoom.messages.length > 0 ? (
                          (() => {
                            const messageDate = new Date(chatRoom.messages[chatRoom.messages.length - 1].createdAt);
                            const today = new Date();
                          
                            // 오늘 날짜인지 확인
                            const isToday =
                              messageDate.getFullYear() === today.getFullYear() &&
                              messageDate.getMonth() === today.getMonth() &&
                              messageDate.getDate() === today.getDate();
                          
                            if (isToday) {
                              // 오늘 날짜라면 시간만 표시
                              return new Intl.DateTimeFormat(t('lang'), {
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true,
                              }).format(messageDate);
                            } else {
                              // 오늘 날짜가 아니라면 MM월 DD일로 표시
                              return new Intl.DateTimeFormat(t('lang'), {
                                month: '2-digit',
                                day: '2-digit',
                              }).format(messageDate);
                            
                              // // MM월 DD일로 표시하기 위해 포맷 후처리
                              // const [month, day] = formattedDate.split('.').map((part) => part.trim());
                              // return `${month} ${day}`;
                            }
                          })()
                        ) : (
                          // 메시지가 없을 경우 기본 텍스트
                          <span></span>
                        )}
                        </div>
                      </div>

                      
                      
                    </div>
                  ))
                )}
              </div>
            )}
        </div>
        )}
    </div>
  );
}