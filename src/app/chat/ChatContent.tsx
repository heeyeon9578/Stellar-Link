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
import Skeleton from "@/app/components/Skeleton"; // 스켈레톤 컴포넌트 가져오기
import socket from "@/socketIns"; // 위에서 만든 socket.ts 경로
import { useLongPress } from '@/app/components/useLongPress';  // 위에서 만든 커스텀 훅
import ChatRoomItem from "./ChatRoomItem";
import {
  setChatRoomId,
  setLoading
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
  const { data: session, status, update } = useSession();
  const dispatch = useAppDispatch();
  const { t,i18n } = useTranslation('common');
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isClicked, setIsClicked] = useState<'All' | 'Personal' | 'Teams' >('All');
  const [data, setData] = useState<ChatRoom[]>([]);
  const [isError, setIsError] = useState<string | null>(null);
  const router = useRouter();
  const [sortOption, setSortOption] = useState<'latest' | 'name'>('latest'); // 정렬 옵션 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const [isInitialized, setIsInitialized] = useState(false);
  const searchParams = useSearchParams();
  const menus = [
    { name: t('All'), onClick: () => setIsClicked('All') },
    { name: t('Personal'), onClick: () => setIsClicked('Personal') },
    { name: t('Teams'), onClick: () => setIsClicked('Teams') },
   
  ];
  const {
   
    isLoading,
  
  } = useSelector((state: RootState) => state.chat);
  const {
    list: friends,
    loading,
    error,
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
    if(typeof document !== undefined) {
      document.addEventListener("mousedown", handleClickOutside); // 클릭 감지 이벤트 등록
    }else{
      console.log(`
        
        src/app/chat/ChatContent.tsx 에서 document 없음
        
        `)
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside); // 컴포넌트 언마운트 시 이벤트 제거
    };
  }, []);

   useEffect(() => {
      if (status === "unauthenticated") {
        alert(t('SessionCheck'));
        router.push('/'); // 세션이 없으면 홈으로 리디렉션
      }
    }, [status, router]);
  
    useEffect(() => {
      if (status === "authenticated") {
        setIsInitialized(true);
      }
    }, [status]);

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
  //console.log("Socket instance:", socket);
  //console.log("Socket connected:", socket.connected);

  socket.on("connect", () => {
    //console.log("Socket connected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });

  socket.on("disconnect", (reason) => {
    //console.log("Socket disconnected:", reason);
  });

  return () => {
    socket.off("connect");
    socket.off("connect_error");
    socket.off("disconnect");
  };
}, []);
useEffect(() => {
  socket.on("receive_message", (message) => {
   
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
  //console.log(`update_read_status for ChatRoom: ${chatRoomId}, User: ${userId}`);
  if (userId === session?.user.id) {
   
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
      dispatch(setLoading(true)); // Redux에서 로딩 상태 관리
      setIsError(null);
      try {
        const response = await fetch(`/api/chat/chat?type=${isClicked}`);
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        setData(result);
      } catch (error: unknown) {
        console.error(error);
        setIsError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        dispatch(setLoading(false)); // Redux에서 로딩 상태 관리
      }
    };
    fetchData();
  }, [isClicked]);

  useEffect(() => {
  
    setFilteredFriends(friends); 
  }, [friends]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때, Thunk 액션을 디스패치해서 데이터 로드
    dispatch(fetchFriends({ sortBy: sortOption, order: sortOption === 'name' ? 'asc' : 'desc' }));
   
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
// (1) [debouncedSearch, friends]를 의존성 배열로 하는 useEffect 추가:
useEffect(() => {
  // 검색어가 없으면 전체 friends 중 block이 아닌 것만
  // 검색어가 있으면 name 또는 email에 검색어가 포함된 친구만.
  setFilteredFriends(
    friends.filter((friend) => {
      // 차단(block)된 친구는 제외
      if (friend.status === "block") return false;

      // 검색어가 비어있으면 모두 통과
      if (!debouncedSearch) return true;

      const lowerName = friend.name?.toLowerCase() || "";
      const lowerEmail = friend.email?.toLowerCase() || "";
      const lowerSearch = debouncedSearch.toLowerCase();

      return lowerName.includes(lowerSearch) || lowerEmail.includes(lowerSearch);
    })
  );
}, [debouncedSearch, friends]);
const generateChatRoom = () => {
  // 애니메이션 트리거
  setIsAnimating(true);
  // 애니메이션이 끝난 후 상태를 초기화
  setTimeout(() => {
    setIsAnimating(false);
    if(isGenerateChatRoom){
      setFilteredFriends(friends); 
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
      setFilteredFriends(friends); 
      
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
  setFilteredFriends(filteredFriends); 

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
      setFilteredFriends(friends); 
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
  setTitle('');
  
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

const toggleMenu = () => {
  setIsMenuOpen(!isMenuOpen); // 메뉴 열기/닫기 상태 토글
};

  // (P) **모바일**에서 길게 누를 때 → 우클릭 메뉴처럼 처리
  const handleLongPress = (e: React.MouseEvent | React.TouchEvent, chatRoomId: string) => {
    e.preventDefault();
    // 터치 이벤트 위치 계산
    if ('touches' in e && e.touches.length > 0) {
      setMenuPosition({ 
        x: e.touches[0].pageX, 
        y: e.touches[0].pageY 
      });
    } else {
      // 마우스 이벤트(데스크톱 테스트용)
      const mouse = e as React.MouseEvent;
      setMenuPosition({ x: mouse.pageX, y: mouse.pageY });
    }
    setMenuVisible(true);
    setCurrentContextMenuChatRoomId(chatRoomId);
  };

  // (Q) useLongPress 훅 적용 (threshold=500ms)
  const getLongPressEvents = (chatRoomId: string) =>
    useLongPress((e) => handleLongPress(e, chatRoomId), { threshold: 500 });

const handleSortChange = (option:'latest' | 'name') => {
  const order = option === "name" ? "asc" : "desc"; // Default to ascending for names
  setSortOption(option);
  dispatch(fetchFriends({ sortBy: option, order }));
  setIsMenuOpen(false); // 옵션 선택 후 메뉴 닫기
};
// (추가) 모든 화면에서 기본 컨텍스트 메뉴를 차단
useEffect(() => {
  const disableContextMenu = (e: Event) => e.preventDefault();
  
  document.addEventListener("contextmenu", disableContextMenu);
  
  return () => {
    document.removeEventListener("contextmenu", disableContextMenu);
  };
}, []);

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

  // 로딩 상태
  if (loading || isLoading) {
 
    return (
      <div className="mx-auto md:p-8 p-4 rounded-lg h-full text-customBlue relative flex flex-col">
      <Skeleton width="80%" height="30px" borderRadius="8px" className="mb-2"/>
      <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-2"/>
      <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-2"/>
      <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-4"/>
      <Skeleton width="100%" height="350px" borderRadius="12px" className="mb-2"/>
    </div>
    );
  }

  // 에러 상태
  if (error) {
   
    return (
      <div className="md:p-8 p-4 text-red-500">
        <p>{t("Effd")}</p>
        <p>{t("Ptal")}</p>
      </div>
    );
  }


  return (
    <div className="mx-auto md:p-8 p-4 rounded-lg h-[100%] text-customBlue relative flex flex-col">
      <div className="flex justify-between items-center">

        <h2 className="md:text-2xl text-sm sm:text-xl font-bold mb-4">
          <DynamicText text={t('Chat')}/>
        </h2>

       {isGenerateChatRoom ? (
         <img
         src="/SVG/cancel.svg"
         alt="cancel"
        //  width={25}
        //  height={25}
        //  priority
         className={`cursor-pointer hover:scale-125 sm:w-[25px] sm:h-[25px] w-[15px] h-[15px] ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
         onClick={generateChatRoom}
       />
       ):(
        <img
        src="/SVG/add.svg"
        alt="add"
        // width={25}
        // height={25}
        // priority
        className={`cursor-pointer hover:scale-125 sm:w-[25px] sm:h-[25px] w-[15px] h-[15px] ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
        onClick={generateChatRoom}
      />
       )}
        </div>
      {isGenerateChatRoom ? (
        <>  
        {/** 검색 창 (디바운스 적용) */}
        <div className="w-full sm:h-10 h-8 bg-customGray rounded-xl flex ">
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
              className="w-[100%] text-black/45 border-0 text-[10px] sm:text-sm bg-transparent focus:outline-none focus:ring-0 focus:border-transparent"
            />
          </div>
        </div>
        {/** 정렬 */}
        <div onClick={toggleMenu} className="relative cursor-pointer" style={{zIndex:'9999'}}>
          {/* 메뉴를 여는 버튼 */}
          <div className="right-0 absolute flex sm:mt-3 mt-2">
            <div
              className=" bg-trasparent text-customPurple text-[10px] sm:text-xs"
            >
              {sortOption === 'latest' ? t('SortByLatest') : t('SortByName')}

            </div>
            {isMenuOpen ? (
              <Image
              src="/SVG/up.svg"
              alt="up"
              width={15}
              height={15}
              priority
              className="cursor-pointer hover:scale-125"
        
            />
            ):(
              <Image
              src="/SVG/down.svg"
              alt="down"
              width={15}
              height={15}
              priority
              className="cursor-pointer hover:scale-125"
          
            />
            )}
          </div>

          {/* 드롭다운 메뉴 */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-8 w-22 bg-white border border-gray-200 bg-transparent z-1000 text-customPurple text-[10px] sm:text-sm">
              <button
                onClick={() => handleSortChange('latest')}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'latest' ? 'bg-gray-100' : ''}`}
              >
                {t('SortByLatest')}
              </button>
              <button
                onClick={() => handleSortChange('name')}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'name' ? 'bg-gray-100' : ''}`}
              >
                {t('SortByName')}
              </button>
            </div>
          )}
        </div>
        {/** 친구 목록 */}
          <div className="sm:mt-10 sm:mt-8 mt-6 max-h-[100%] overflow-y-auto">
            {filteredFriends.length === 0 ? (
              <DynamicText className="text-gray-500 text-[10px] sm:text-sm" text={t('Yhnfy')}/>
          
            ) : (
              <ul>
                {filteredFriends
                .map((friend)  => (
                  <li key={friend._id} className="flex mb-4 ">
                    
                   <div className="flex cursor-pointer items-center ml-1" >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleCheckboxChange(friend._id)}
                      className="appearance-none checked:bg-customLightPurple checked:border-customLightPurple mr-2 focus:outline-none  focus:ring-2 focus:ring-customLightPurple focus:border-transparent"
                    /> 
                     <img
                       src={friend.profileImage || "/SVG/default-profile.svg"}
                       alt={`${friend.name}'s profile`}
                       className="sm:w-[50px] sm:h-[50px] w-[30px] h-[30px] rounded-full mr-2 object-cover" 
                     />

                     <div>
                       <div className="text-customPurple font-bold">
                       <DynamicText text={friend.name} className="text-[10px] sm:text-sm"/> 
                       </div>

                       <div className="text-customGray text-[7px] sm:text-xs">
                         {friend.email}
                       </div>
                     </div>
                   </div>

                  
                 </li>
                ))}
              </ul>
            )}

          </div>
            {/** 방 이름 적는 칸 */}
          <div className="mb-4 " lang="ko">
            <label className="block text-sm font-bold sm:mb-2">
              <DynamicText text={t('Title')} className="text-[10px]  sm:text-sm"/>
            </label>
            <input
              type="text"
              value={title}
              lang="ko"
              onChange={(e) => setTitle(e.target.value)}
             className="w-full sm:h-10 h-8 text-[10px] sm:text-sm text-customPurple border-customGray rounded-lg focus:border-transparent focus:outline-none focus:ring-2 focus:ring-customLightPurple"
            />
          </div>
            {/** 방 생성 버튼 */}
          <div className="absolute bottom-1 sm:bottom-2 w-full left-0">
            <Button
              variant="primary"
              disabled={selectedFriends.length===0} // 한명이라도 선택되었을때
              className="animate__animated animate__zoomIn w-full sm:h-8 h-6"
              onClick={handleGenerateRoom}
            >
              <DynamicText text={t('GenerateRoom')} className="text-[10px] sm:text-sm"/>
            </Button>
          </div>
        </>
        ):(
        <div className="h-[90%] w-full flex flex-col">
          {/** 검색 */}
             <div className="w-full sm:h-10 h-8 bg-customGray rounded-xl flex">
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
                  className="w-[100%] text-black/45 border-0 text-[10px] sm:text-sm bg-transparent focus:outline-none focus:ring-0 focus:border-transparent"
                />
              </div>
            </div>

          {/** 메뉴 */}
            <div className="w-full sm:h-10 h-8 bg-customRectangle rounded-xl flex sm:mt-4 mt-2 text-customGray items-center justify-around p-2">
              {menus.map((menu) => (
                <Button
                  key={menu.name}
                  variant={isClicked === menu.name ? 'primary' : "main"}
                  size="sm"
                  className={isClicked === menu.name ? "text-white w-full sm:h-8 h-6" : "text-customGray w-full sm:h-8 h-6"}
                  onClick={menu.onClick}
                >
                  <DynamicText text={t(menu.name)} className="text-[10px] sm:text-sm"/>
                </Button>
              ))}
            </div>

            <div className="mt-4 max-h-[100%] overflow-y-auto ">
                {filteredData.length === 0 ? (
                 <DynamicText text={t('Ncf')} className="text-gray-500 text-[10px] sm:text-sm"/>
                ) : (
                  filteredData.map((chatRoom) => {
                    // unreadCounts[chatRoom._id] 가 있다면, 
                    // 현재 안 읽은 메시지 수를 받아서 <ChatRoomItem>에 넘겨줍니다.
                    
                    const unreadCount = unreadCounts[chatRoom._id] || 0;
            
                    return (
                      <ChatRoomItem
                        key={chatRoom._id}
                        chatRoom={chatRoom}
                        unreadCount={unreadCount}
                        isAnimating={isAnimating}
                        menuVisible={menuVisible}
                        editChatRoomName={editChatRoomName}
                        currentContextMenuChatRoomId={currentContextMenuChatRoomId}
                        menuPosition={menuPosition}
                        popupRef={popupRef}
                        handleContextMenu={handleContextMenu}
                        enterChatRoom={enterChatRoom}
                        handleEditChatRoomName={handleEditChatRoomName}
                        handleInviteChatRoom={handleInviteChatRoom}
                        handelExitChatRoom={handelExitChatRoom}
                        cancelEditChatRoom={cancelEditChatRoom}
                        fetchEditChatRoomName={fetchEditChatRoomName}
                        title={title}
                        setTitle={setTitle}
                        t={t}
                      />
                    );
                  })
             
                )}
              </div>
        </div>
        )}
    </div>
  );
}