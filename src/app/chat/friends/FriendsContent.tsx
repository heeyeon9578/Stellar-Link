// FriendsContent.tsx
'use client';
import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import { useDispatch, useSelector } from 'react-redux';
import Image from 'next/image';
import { fetchFriends, fetchReceivedRequests, fetchSentRequests } from '../../../../store/friendsSlice';
import { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import Button from '@/app/components/Button';
import DynamicText from '../../../app/components/DynamicText';
import { useRouter } from 'next/navigation';
import 'animate.css';
import Skeleton from "@/app/components/Skeleton"; // 스켈레톤 컴포넌트 가져오기

export default function FriendsContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { t,i18n } = useTranslation('common');
  const [isClicked, setIsClicked] = useState<'All'|'Request'|'Pending'|'Blocked'>('All');
  // const [isMoreClicked,setIsMoreClicked] = useState<Record<string, boolean>>({});
  // 더보기 메뉴가 열려 있는 친구의 ID만 저장하는 state
  const [openMoreMenuFriendId, setOpenMoreMenuFriendId] = useState<string | null>(null);  
  // const [isCancelClicked,setIsCancelClicked] = useState<Record<string, boolean>>({});
  // const [isAcceptClicked,setIsAcceptClicked] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [sortOption, setSortOption] = useState<'latest' | 'name'>('latest'); // 정렬 옵션 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toggleUpDown,setToggleUpDown] = useState<boolean>(false);
  // Redux store에서 필요한 상태를 꺼내옵니다.
  const {
    list: friends,
    receivedRequests,
    sentRequests,
    loading,
    error,
  } = useSelector((state: RootState) => state.friends);
   // 친구 목록 정렬
 
  const sortedFriends = friends
  .filter((friend) => friend.status !== "block") // 차단된 친구 제외
  .sort((a, b) => {
    if (sortOption === "latest") {
      // addedAt 값이 undefined일 경우 기본값으로 0을 사용
      return (
        (new Date(b.addedAt || 0).getTime() || 0) -
        (new Date(a.addedAt || 0).getTime() || 0)
      );
    } else if (sortOption === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }
    return 0;
  });
  const handleSortChange = (option:'latest' | 'name') => {
    const order = option === "name" ? "asc" : "desc"; // Default to ascending for names
    setSortOption(option);
    dispatch(fetchFriends({ sortBy: option, order }));
    setIsMenuOpen(false); // 옵션 선택 후 메뉴 닫기
  };
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen); // 메뉴 열기/닫기 상태 토글
  };
  // 로컬 상태 (새로운 친구 추가용)
  const [newFriendEmail, setNewFriendEmail] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  // 디바운싱된 검색어 (일정 시간 지연 후 최종 반영)
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // 0.3초(300ms) 디바운스: search 값이 변경될 때마다 타이머를 재설정
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim()); 
      // trim()은 앞뒤 공백 제거 용도로, 필요 없으면 제거해도 됩니다.
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================
  // 검색을 위한 필터 로직 추가
  // =========================
  // 1) All/Blocked일 때 사용할 친구 목록 필터
  //    (blocked 상태도 함께 필터링 하거나, 탭 별로 로직이 달라질 수 있으니
  //     상황에 맞게 필터링 조건을 다르게 적용 가능합니다.)
  const filteredFriends = friends.filter((friend) => {
    // 상태가 'block'인지 여부는 탭에서 구분 처리
    const nameMatch = friend.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const emailMatch = friend.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return nameMatch || emailMatch;
  });

  // 2) Request 탭(보낸 요청)에서 사용할 필터
  const filteredSentRequests = sentRequests.filter((request) => {
    const nameMatch = request.toUserDetails.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const emailMatch = request.toUserDetails.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return nameMatch || emailMatch;
  });

  // 3) Pending 탭(받은 요청)에서 사용할 필터
  const filteredReceivedRequests = receivedRequests.filter((request) => {
    const nameMatch = request.fromUserDetails.name?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const emailMatch = request.fromUserDetails.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return nameMatch || emailMatch;
  });
  const menus =[
    {name: t('All'), onClick:() =>setIsClicked('All')},
    {name: t('Request'), onClick:() =>setIsClicked('Request')},
    {name: t('Pending'), onClick:() =>setIsClicked('Pending')},
    {name: t('Blocked'), onClick:() =>setIsClicked('Blocked')}
  ]

  const toggleMoreMenu = (friendId: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect(); // 버튼의 위치 계산
  setDropdownPosition({
    x: rect.left-125, // 버튼의 왼쪽 좌표
    y: rect.bottom + window.scrollY-20, // 버튼의 아래쪽 좌표 (스크롤 고려)
  });

  if (openMoreMenuFriendId === friendId) {
    setOpenMoreMenuFriendId(null);
  } else {
    setOpenMoreMenuFriendId(friendId);
  }
  };

  // const toggleCancelMenu = (requestId: string, event: React.MouseEvent<HTMLDivElement>) => {
  //   const rect = event.currentTarget.getBoundingClientRect(); // 버튼의 위치 계산
  // setDropdownPosition({
  //   x: rect.left-125, // 버튼의 왼쪽 좌표
  //   y: rect.bottom + window.scrollY-20, // 버튼의 아래쪽 좌표 (스크롤 고려)
  // });
  //   setIsCancelClicked((prev) => ({
  //     ...prev,
  //     [requestId]: !prev[requestId], // 현재 값의 반대로
  //   }));
  // };

  // const toggleAcceptMenu = (requestId: string, event: React.MouseEvent<HTMLDivElement>) => {
  //   const rect = event.currentTarget.getBoundingClientRect(); // 버튼의 위치 계산
  // setDropdownPosition({
  //   x: rect.left-125, // 버튼의 왼쪽 좌표
  //   y: rect.bottom + window.scrollY-20, // 버튼의 아래쪽 좌표 (스크롤 고려)
  // });
  //   setIsAcceptClicked((prev) => ({
  //     ...prev,
  //     [requestId]: !prev[requestId], // 현재 값의 반대로
  //   }));
  // };



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

  useEffect(() => {
    // 컴포넌트가 마운트될 때, Thunk 액션을 디스패치해서 데이터 로드
    dispatch(fetchFriends({ sortBy: sortOption, order: sortOption === 'name' ? 'asc' : 'desc' }));
    dispatch(fetchReceivedRequests());
    dispatch(fetchSentRequests());

  }, [dispatch, sortOption]);

  // 친구 추가 요청
  const handleAddFriend = async () => {
    if (!newFriendEmail) {
      alert(t('Peae'));
      return;
    }

    try {
      // 이 부분도 Thunk로 만들 수 있지만,
      // 예시는 그대로 로컬 fetch 예시를 유지
      const response = await fetch(`/api/friends`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newFriendEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('failAddFriend'));
      }

      setNewFriendEmail(""); // 입력 필드 초기화
      alert(t('Frss'));

      // 친구 요청을 보냈으니, 혹시 리스트가 업데이트되었을 수 있어 재조회
      dispatch(fetchSentRequests());
      setOpenMoreMenuFriendId(null);
    } catch (err) {
      alert(t('failAddFriend'));
    }
  };
 
  
  // 친구 요청 수락/거절 (이것도 필요하다면 Slice에 Thunk로 옮길 수 있음)
  const handleRequestAction = async (fromUserId: string, action: "accepted" | "rejected") => {
    try {
    

      const response = await fetch("/api/friends-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromUserId, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} friend request.`);
      }

      const successMessage =
        action === "accepted"
          ? t('Fras')
          : t('Frrs');
      //alert(successMessage);

      // 요청 목록이 바뀌었으니 다시 요청을 디스패치해서 데이터 갱신
      // 데이터 갱신
      dispatch(fetchReceivedRequests());
      dispatch(fetchFriends({ sortBy: sortOption, order: sortOption === 'name' ? 'asc' : 'desc' }));
      setOpenMoreMenuFriendId(null);
    } catch (err) {
      console.log(err)
      //alert(t('Fraorf'));
    }
  };

// 친구 차단
const handleBlockFriend = async (toUserId: string) => {
  try {
    // PATCH /api/friends (action: "block")
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toUserId: toUserId, action: "block" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to block friend request.");
    }

    alert(t('Fbs'));
    dispatch(fetchFriends({ sortBy: sortOption, order: sortOption === 'name' ? 'asc' : 'desc' }));
    setOpenMoreMenuFriendId(null);
  } catch (err) {
    console.error("Error blocking friend request:", err);
    alert(t('Ftbf'));
  }
};

//친구 차단 해제
const handleUnblockFriend = async (toUserId: string) => {
  try {
    // PATCH /api/friends (action: "block")
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toUserId: toUserId, action: "unblock" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to unblock friend request.");
    }

    alert(t('Fus'));
    dispatch(fetchFriends({ sortBy: sortOption, order: sortOption === 'name' ? 'asc' : 'desc' }));
    setOpenMoreMenuFriendId(null);
  } catch (err) {
    console.error("Error unblocking friend request:", err);
    alert(t('Ftuf'));
  }
};

// ★ 친구 삭제 (핵심 추가 부분)
const handleDeleteFriend = async (toUserId: string) => {
  try {
    const response = await fetch("/api/friends", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ friendId: toUserId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete friend.");
    }
    alert("Friend removed successfully.");

    // 친구 목록 다시 불러오기
   dispatch(fetchFriends({ sortBy: sortOption, order: sortOption === 'name' ? 'asc' : 'desc' }));
   setOpenMoreMenuFriendId(null);
  } catch (err) {
    console.error("Error removing friend:", err);
    alert("Error removing friend");
  }
};

function startChat(friendId: string) {
  fetch('/api/chat/create-room', {
    method: 'POST',
    body: JSON.stringify({ participants: [ friendId], type: 'personal' }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((res) => res.json())
    .then((data) => {
      // 채팅 방 ID로 이동
      router.push(`/chat?chatRoomId=${data.chatRoomId}`);
    });
}

// 보낸 친구 요청 취소
const handleCancelRequest = async (toUserId: string) => {
  try {

    // PATCH /api/friends (action: "cancel")
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ toUserId: toUserId, action: "cancel" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to cancel friend request.");
    }

    alert(t('Frcs'));
    // 보낸 요청 목록 새로고침
    dispatch(fetchSentRequests());
    setOpenMoreMenuFriendId(null);
  } catch (err) {
    console.error("Error canceling friend request:", err);
    alert(t('Ecfr'));
  }
};
const generateChatRoom = () => {
  // 애니메이션 트리거
  setIsAnimating(true);
  // 애니메이션이 끝난 후 상태를 초기화
  setTimeout(() => {
    setIsAnimating(false);

  
  }, 1000); // 애니메이션 지속 시간에 맞게 설정 (예: 1초)
}


  if (!isInitialized) return null;

  // 로딩 상태
  if (loading) {
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
      <div className="p-8 text-red-500">
         <p>{t("Effd")}</p>
         <p>{t("Ptal")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto md:p-8 p-4 rounded-lg h-full text-customBlue relative flex flex-col">

      {/** 헤더 */}
      <h2 className="md:text-2xl text-sm sm:text-xl font-bold ">
        <DynamicText text={t('Friends')} />
      </h2>
    
     {/** 검색 창 (디바운스 적용) */}
      <div className="w-full sm:h-10 h-8 bg-customGray sm:mt-4 mt-2 rounded-xl flex">
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
        <div className="flex items-center w-[80%]">
          <input
            type="text"
            value={search}
            placeholder={t('Search')}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[100%] text-black/45 border-0 text-[10px] sm:text-sm bg-transparent focus:outline-none focus:ring-0 focus:border-transparent"
          />
        </div>
      </div>

      {/** 친구 추가 */}   
      <div className="flex items-center sm:h-10 h-8 justify-between sm:mt-4 mt-2">
        <input
          type="text"
          value={newFriendEmail}
          placeholder={t('EFE')}
          onChange={(e) => setNewFriendEmail(e.target.value)}
         className="w-[90%] h-full border-customGray rounded-xl text-[10px]  sm:text-sm text-customGray focus:border-transparent focus:outline-none focus:ring-2 focus:ring-customLightPurple"
        />
        <div className="w-[10%] flex items-center justify-end h-full" onClick={handleAddFriend}>
          <Image
            src="/SVG/add.svg"
            alt="add"
            width={25}
            height={25}
            priority
            className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
              onClick={generateChatRoom}
          />
        </div>
      </div>

      {/** 메뉴 */}   
      <div className="w-full sm:h-10 h-8 bg-customRectangle rounded-xl flex sm:mt-4 mt-2 text-customGray flex items-center justify-around p-2">

        {menus.map((menu)=>(
          <Button
          key={menu.name}
          variant={isClicked===menu.name ? 'primary':"main"}
          size="sm"
          className={isClicked===menu.name? "text-white w-full sm:h-8 h-6" :"text-customGray w-full sm:h-8 h-6"}
          onClick={menu.onClick}
        >
          <DynamicText text={t(menu.name)} className="text-[10px] sm:text-sm"/>
        </Button>
        ))}

      
      </div>

      {/** 정렬 */}
      <div onClick={toggleMenu} className="relative bg-black cursor-pointer" style={{zIndex:'9999'}}>
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
      {
        isClicked==='All' && 
        (
          <div className="sm:mt-10 mt-8 max-h-[100%] overflow-y-auto">
            {filteredFriends.filter(friend => friend.status !== 'block').length === 0 ? (
             <DynamicText className="text-gray-500 text-[10px] sm:text-sm" text={t('Yhnfy')}/>
            ) : (
              <ul>
                {filteredFriends
                .filter(friend => friend.status !== 'block')
                .map((friend)  => (
                  <li key={friend._id} className="flex mb-4 justify-between">

                   <div className="flex cursor-pointer" onClick={()=>{startChat(friend._id)}}>
                     <img
                       src={friend.profileImage || "/SVG/default-profile.svg"}
                       alt={`${friend.name}'s profile`}
                       className="sm:w-[50px] sm:h-[50px] w-[30px] h-[30px] rounded-full mr-2 object-cover" 
                     />

                     <div>
                       <div className="font-bold text-customPurple">
                       <DynamicText text={friend.name} className="text-[10px] sm:text-sm"/> 
                       </div>

                       <div className="text-customGray text-[7px] sm:text-xs">
                         {friend.email}
                       </div>
                     </div>
                   </div>

                   <div className="relative ">
                     <img
                       src="/SVG/more.svg"
                       alt="more"
                      //  width={25}
                      //  height={25}
                      //  priority
                       className="cursor-pointer sm:w-[25px] sm:h-[25px] w-[15px] h-[15px]"
                      onClick={(event) => toggleMoreMenu(friend._id, event)}
                     />
                     {/* 차단, 차단 해제 버튼 추가 */}
                     {openMoreMenuFriendId === friend._id &&(
                       <div className=" z-50 absolute sm:w-[80px] sm:h-[68px] w-[60px] h-[40px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-[10px] sm:text-sm"
                       style={{
                        top: 5, // 드롭다운의 Y축 위치
                        right: 30, // 드롭다운의 X축 위치
                      }}
                       >
                         <button onClick={() => handleBlockFriend(friend._id)} className="text-red-500">
                          <DynamicText text={t('Block')}/>
                         </button>
                         <button onClick={() => handleDeleteFriend(friend._id)} >
                           <DynamicText text={t('Delete')}/>
                         </button>
                         
                       </div>
                     )}
                   
                   </div>
                 </li>
                ))}
              </ul>
            )}

          </div>
        )
      }
    
      {isClicked==='Request'&&(
        <div className="sm:mt-10 mt-8  max-h-[100%] overflow-y-auto"> 
          {filteredSentRequests.length === 0 ? (
            <DynamicText className="text-gray-500 text-[10px] sm:text-sm" text={t('Nsfr')}/>
          ) : (
            <ul>
              {filteredSentRequests.map((request) => (
                
                <li key={request._id} className="flex mb-4 justify-between">
                
                  <div className="flex">
                      <img
                        src={request.toUserDetails.profileImage || "/SVG/default-profile.svg"}
                        alt={`${request.toUserDetails.name}'s profile`}
                        className="sm:w-[50px] sm:h-[50px] w-[30px] h-[30px] rounded-full mr-2 object-cover" 
                      />

                      <div>
                      <div className="font-bold text-customPurple">
                       <DynamicText text={request.toUserDetails.name} className="text-[10px] sm:text-sm"/> 
                       </div>

                       <div className="text-customGray text-[7px] sm:text-xs">
                       {request.toUserDetails.email}
                       </div>
                      </div>
                    </div>

                    <div className="relative ">
                      <img
                        src="/SVG/more.svg"
                        alt="more"
                        // width={25}
                        // height={25}
                        // priority
                        className="cursor-pointer sm:w-[25px] sm:h-[25px] w-[15px] h-[15px]"
                       onClick={(event) => toggleMoreMenu(request._id,event)}
                      />
                      {/* Cancel */}
                      {openMoreMenuFriendId === request._id &&(
                        <div className=" z-50 absolute sm:w-[80px] sm:h-[68px] w-[60px] h-[40px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-[10px] sm:text-sm"
                        style={{
                         top: 5, // 드롭다운의 Y축 위치
                         right: 30, // 드롭다운의 X축 위치
                       }}
                        >
                          <button onClick={() => handleCancelRequest(request.toUserDetails._id)} className="text-red-500">
                            <DynamicText text={t('Cancel')}/>
                          </button>
                        </div>
                      )}
                    
                    </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) }

      {
        isClicked==='Pending' &&
        (

          <div className="sm:mt-10 mt-8 max-h-[100%] overflow-y-auto">
        
            {filteredReceivedRequests.length === 0 ? (
              <DynamicText className='text-gray-500 text-[10px] sm:text-sm' text={t('Nfrr')}/>
            ) : (
              <ul>
                {filteredReceivedRequests.map((request) => (
                  <li key={request._id} className="flex mb-4 justify-between">
              

                    <div className="flex">
                      <img
                        src={request.fromUserDetails.profileImage || "/SVG/default-profile.svg"}
                        alt={`${request.fromUserDetails.name}'s profile`}
                        className="sm:w-[50px] sm:h-[50px] w-[30px] h-[30px]  rounded-full mr-2 object-cover" 
                      />

                      <div>
               
                        <div className="font-bold text-customPurple">
                       <DynamicText text={request.fromUserDetails.name} className="text-[10px] sm:text-sm"/> 
                       </div>

                       <div className="text-customGray text-[7px] sm:text-xs">
                       {request.fromUserDetails.email}
                       </div>
                      </div>
                    </div>

                    <div className="relative ">
                      <img
                        src="/SVG/more.svg"
                        alt="more"
                        // width={25}
                        // height={25}
                        // priority
                        className="cursor-pointer sm:w-[25px] sm:h-[25px] w-[15px] h-[15px]"
                        onClick={(event) => toggleMoreMenu(request._id,event)}
                      />
                      {/* 수락 거절 추가 */}
                      {openMoreMenuFriendId === request._id &&(
                         <div className=" z-50 absolute sm:w-[80px] sm:h-[68px] w-[60px] h-[40px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-[10px] sm:text-sm"
                         style={{
                          top: 5, // 드롭다운의 Y축 위치
                          right: 30, // 드롭다운의 X축 위치
                        }}
                         >
                          <button onClick={() => handleRequestAction(request.fromUserDetails._id, "accepted")} className="text-red-500">
                            <DynamicText text={t('Accept')}/>
                          </button>
                          <button onClick={() => handleRequestAction(request.fromUserDetails._id, "rejected")}>
                            <DynamicText text={t('Reject')}/>
                          </button>
                          
                        </div>
                      )}
                    
                    </div>
                  </li>
                ))}
              </ul>
            )}

          </div>
        )
      }
      
      {
        isClicked==='Blocked' &&
        (

          <div className="sm:mt-10 mt-8  max-h-[100%] overflow-y-auto">
          {filteredFriends.filter(friend => friend.status === 'block').length === 0 ? (
            <DynamicText className="text-gray-500 text-[10px] sm:text-sm" text={t('Tanbf')}/>
          ) : (
            <ul>
              {filteredFriends.filter(friend => friend.status === 'block').map((friend) => (
                 <li key={friend._id} className="flex mb-4 justify-between">

                 <div className="flex">
                   <img
                     src={friend.profileImage || "/SVG/default-profile.svg"}
                     alt={`${friend.name}'s profile`}
                     className="sm:w-[50px] sm:h-[50px] w-[30px] h-[30px] rounded-full mr-2 object-cover" 
                   />

                   <div>
                      <div className="font-bold text-customPurple">
                       <DynamicText text={friend.name} className="text-[10px] sm:text-sm"/> 
                       </div>

                       <div className="text-customGray text-[7px] sm:text-xs">
                       {friend.email}
                       </div>
                    
                   </div>
                 </div>

                 <div className="relative ">
                   <img
                     src="/SVG/more.svg"
                     alt="more"
                    //  width={25}
                    //  height={25}
                    //  priority
                     className="cursor-pointer sm:w-[25px] sm:h-[25px] w-[15px] h-[15px]"
                    onClick={(event) => toggleMoreMenu(friend._id, event)}
                   />
                   {/* 삭제, 차단 해제 버튼 추가 */}
                   {openMoreMenuFriendId === friend._id &&(
                     <div className=" z-50 absolute sm:w-[80px] sm:h-[68px] w-[60px] h-[40px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-[10px] sm:text-sm"
                     style={{
                      top: 5, // 드롭다운의 Y축 위치
                      right: 30, // 드롭다운의 X축 위치
                    }}
                     >
                       <button onClick={() => handleUnblockFriend(friend._id)} className="text-red-500">
                        <DynamicText text={t('Unblock')}/>
                       </button>
                       <button onClick={() => handleDeleteFriend(friend._id)} >
                         <DynamicText text={t('Delete')}/>
                       </button>
                   
                     </div>
                   )}
                 
                 </div>
               </li>
              ))}
            </ul>
          )}

        </div>
        )
      }
      

      
    </div>
  );
}