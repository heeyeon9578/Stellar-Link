'use client';
import { useEffect, useState } from "react";
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
  const router = useRouter();
  const menus = [
    { name: t('All'), onClick: () => setIsClicked('All') },
    { name: t('Personal'), onClick: () => setIsClicked('Personal') },
    { name: t('Teams'), onClick: () => setIsClicked('Teams') },
    { name: t('Hide'), onClick: () => setIsClicked('Hide') },
  ];
  const {
    list: friends,
   
  } = useSelector((state: RootState) => state.friends);
 // 애니메이션 상태 변수 추가
 const [isAnimating, setIsAnimating] = useState<boolean>(false);
 const [isGenerateChatRoom, setIsGenerateChatRoom] = useState<boolean>(false);
 const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
// const [type, setType] = useState<'personal' | 'teams'| 'hide'>('personal');
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

  useEffect(() => {
    console.log("friends changed:", friends);
  }, [friends]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때, Thunk 액션을 디스패치해서 데이터 로드
    dispatch(fetchFriends());

    console.log(`friends`,friends)
  }, [dispatch]);
  // 필터링된 데이터

// useEffect(()=>{
//   tempUser();
// },[])

 // 임시 유저 생성
//  const tempUser = async () => {

//   try {
//     // 이 부분도 Thunk로 만들 수 있지만,
//     // 예시는 그대로 로컬 fetch 예시를 유지
//     const response = await fetch(`/api/tempUsers`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
     
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || t('failAddFriend'));
//     }

  
//   } catch (err) {
//     console.log(err)
//   }
// };


const filteredData = data.filter((chatRoom) =>
  chatRoom.participants.some((participant) =>
    participant.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
    participant.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  ) ||
  chatRoom.messages.some((message) =>
    message.text.toLowerCase().includes(debouncedSearch.toLowerCase())
  )
);

const generateChatRoom = () => {
  // 애니메이션 트리거
  setIsAnimating(true);
  // 애니메이션이 끝난 후 상태를 초기화
  setTimeout(() => {
    setIsAnimating(false);
    setIsGenerateChatRoom(!isGenerateChatRoom);
    // 실제 채팅방 생성 로직을 여기에 추가하세요
    console.log("채팅방 생성");
  }, 500); // 애니메이션 지속 시간에 맞게 설정 (예: 1초)
}

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

const handleGenerateRoom = () =>{
  let type='';
  if(selectedFriends.length===1){
   type='personal';
  }else{
    type='hide';
  }
  fetch('/api/chat/create-room', {
    method: 'POST',
    body: JSON.stringify({ participants: selectedFriends, type: type }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      setSelectedFriends([]);
      setIsGenerateChatRoom(false);
      // 채팅 방 ID로 이동
      router.push(`/chat?chatRoomId=${data.chatRoomId}`);

    });
}

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
          <div className="mt-4 max-h-[500px] overflow-y-auto">
            {friends.filter(friend => friend.status !== 'block').length === 0 ? (
              <p>{t('Yhnfy')}</p> 
            ) : (
              <ul>
                {friends
                .filter(friend => friend.status !== 'block')
                .map((friend)  => (
                  <li key={friend._id} className="flex mb-4 ">
                    
                   <div className="flex cursor-pointer items-center ml-1" >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => handleCheckboxChange(friend._id)}
                      className="mr-2"
                    />
                     <img
                       src={friend.profileImage || "/SVG/default-profile.svg"}
                       alt={`${friend.name}'s profile`}
                       className="w-[50px] h-[50px] rounded-full mr-2" 
                     />

                     <div>
                       <div className="text-black font-bold">
                         {friend.name}
                       </div>

                       <div className="text-customGray text-sm">
                         {friend.email}
                       </div>
                     </div>
                   </div>

                  
                 </li>
                ))}
              </ul>
            )}

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
        <>
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
            )  : (
              <div className="mt-4">
                {filteredData.length === 0 ? (
                  <div>{t('No chats found')}</div>
                ) : (
                  filteredData.map((chatRoom) => (
                    <div key={chatRoom._id} className="p-4 bg-gray-100 rounded-md mb-2" onClick={()=>{ router.push(`/chat?chatRoomId=${chatRoom._id}`);}}>
                    
                      <ul className="mb-2">
                        {chatRoom.participants.map((participant, index) => (
                          <li key={index} className="flex items-center text-sm" >
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
        </>
        )}
    </div>
  );
}