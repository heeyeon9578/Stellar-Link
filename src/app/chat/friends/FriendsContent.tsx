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


export default function FriendsContent() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');
  const [isClicked, setIsClicked] = useState<'All'|'Request'|'Pending'|'Blocked'>('All');
  const [isMoreClicked,setIsMoreClicked] = useState<Record<string, boolean>>({});
  const [isCancelClicked,setIsCancelClicked] = useState<Record<string, boolean>>({});
  const [isAcceptClicked,setIsAcceptClicked] = useState<Record<string, boolean>>({});

  // Redux store에서 필요한 상태를 꺼내옵니다.
  const {
    list: friends,
    receivedRequests,
    sentRequests,
    loading,
    error,
  } = useSelector((state: RootState) => state.friends);

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
    const nameMatch = request.toUserName?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const emailMatch = request.toUserEmail?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return nameMatch || emailMatch;
  });

  // 3) Pending 탭(받은 요청)에서 사용할 필터
  const filteredReceivedRequests = receivedRequests.filter((request) => {
    const nameMatch = request.fromUserName?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const emailMatch = request.fromUserEmail?.toLowerCase().includes(debouncedSearch.toLowerCase());
    return nameMatch || emailMatch;
  });
  const menus =[
    {name: t('All'), onClick:() =>setIsClicked('All')},
    {name: t('Request'), onClick:() =>setIsClicked('Request')},
    {name: t('Pending'), onClick:() =>setIsClicked('Pending')},
    {name: t('Blocked'), onClick:() =>setIsClicked('Blocked')}
  ]

  const toggleMoreMenu = (friendId: string) => {
    setIsMoreClicked((prev) => ({
      ...prev,
      [friendId]: !prev[friendId], // 현재 값의 반대로
    }));
  };

  const toggleCancelMenu = (requestId: string) => {
    setIsCancelClicked((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // 현재 값의 반대로
    }));
  };

  const toggleAcceptMenu = (requestId: string) => {
    setIsAcceptClicked((prev) => ({
      ...prev,
      [requestId]: !prev[requestId], // 현재 값의 반대로
    }));
  };

  useEffect(() => {
    console.log("friends changed:", friends);
  }, [friends]);

  useEffect(() => {
    // 컴포넌트가 마운트될 때, Thunk 액션을 디스패치해서 데이터 로드
    dispatch(fetchFriends());
    dispatch(fetchReceivedRequests());
    dispatch(fetchSentRequests());

    console.log(`friends`,friends)
  }, [dispatch]);

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
    } catch (err) {
      alert(t('failAddFriend'));
    }
  };

  // 친구 요청 수락/거절 (이것도 필요하다면 Slice에 Thunk로 옮길 수 있음)
  const handleRequestAction = async (fromUserEmail: string, action: "accepted" | "rejected") => {
    try {
      console.log(`Handling request action: ${action} for email: ${fromUserEmail}`);

      const response = await fetch("/api/friends-requests", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fromUserEmail, action }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} friend request.`);
      }

      const successMessage =
        action === "accepted"
          ? t('Fras')
          : t('Frrs');
      alert(successMessage);

      // 요청 목록이 바뀌었으니 다시 요청을 디스패치해서 데이터 갱신
      dispatch(fetchReceivedRequests());
      dispatch(fetchFriends());
    } catch (err) {
      alert(t('Fraorf'));
    }
  };

// 친구 차단
const handleBlockFriend = async (friendEmail: string) => {
  try {
    // PATCH /api/friends (action: "block")
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: friendEmail, action: "block" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to block friend request.");
    }

    alert(t('Fbs'));
    dispatch(fetchFriends());
  } catch (err) {
    console.error("Error blocking friend request:", err);
    alert(t('Ftbf'));
  }
};

//친구 차단 해제
const handleUnblockFriend = async (friendEmail: string) => {
  try {
    // PATCH /api/friends (action: "block")
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: friendEmail, action: "unblock" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to unblock friend request.");
    }

    alert(t('Fus'));
    dispatch(fetchFriends());
  } catch (err) {
    console.error("Error unblocking friend request:", err);
    alert(t('Ftuf'));
  }
};

// ★ 친구 삭제 (핵심 추가 부분)
const handleDeleteFriend = async (friendEmail: string) => {
  try {
    const response = await fetch("/api/friends", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: friendEmail }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete friend.");
    }
    alert("Friend removed successfully.");

    // 친구 목록 다시 불러오기
    dispatch(fetchFriends());
  } catch (err) {
    console.error("Error removing friend:", err);
    alert("Error removing friend");
  }
};

// 보낸 친구 요청 취소
const handleCancelRequest = async (requestEmail: string) => {
  try {
    // PATCH /api/friends (action: "cancel")
    const response = await fetch("/api/friends", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: requestEmail, action: "cancel" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to cancel friend request.");
    }

    alert(t('Frcs'));
    // 보낸 요청 목록 새로고침
    dispatch(fetchSentRequests());
  } catch (err) {
    console.error("Error canceling friend request:", err);
    alert(t('Ecfr'));
  }
};

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  // if (error) {
  //   return <p>Error: {error}</p>;
  // }

  return (
    <div className="mx-auto p-8 rounded-lg h-full text-customBlue relative">

      {/** 헤더 */}
      <h2 className="text-2xl font-bold mb-4">
        <DynamicText text={t('Friends')} />
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

      {/** 친구 추가 */}   
      <div className="flex items-center justify-between mt-4 ">
        <input
          type="text"
          value={newFriendEmail}
          placeholder={t('EFE')}
          onChange={(e) => setNewFriendEmail(e.target.value)}
         className="w-[90%] px-3 py-2 border-customGray rounded-xl text-sm text-cuustomGray"
        />
        <div className="w-[10%] flex items-center justify-end h-full" onClick={handleAddFriend}>
          <Image
            src="/SVG/add.svg"
            alt="add"
            width={25}
            height={25}
            priority
            className="cursor-pointer"
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

      {
        isClicked==='All' && 
        (
          <div className="mt-4">
            {filteredFriends.filter(friend => friend.status !== 'block').length === 0 ? (
              <p>{t('Yhnfy')}</p>
            ) : (
              <ul>
                {filteredFriends
                .filter(friend => friend.status !== 'block')
                .map((friend)  => (
                 <>
                 {friend.status !== 'block' &&(
                   <li key={friend.friendId} className="flex mb-4 justify-between">

                   <div className="flex">
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

                   <div className="relative ">
                     <Image
                       src="/SVG/more.svg"
                       alt="more"
                       width={25}
                       height={25}
                       priority
                       className="cursor-pointer"
                      onClick={() => toggleMoreMenu(friend.friendId)}
                     />
                     {/* 차단, 차단 해제 버튼 추가 */}
                     {isMoreClicked[friend.friendId]&&(
                       <div className=" z-50 absolute top-8 w-[80px] h-[68px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-sm">
                         <button onClick={() => handleBlockFriend(friend.email)} className="text-red-500">
                         {t('Block')}
                         </button>
                         <button onClick={() => handleDeleteFriend(friend.email)} >
                           {t('Delete')}
                         </button>
                         {/* <button onClick={() => handleUnblockFriend(friend.email)}>
                            {t('Unblock')}
                         </button> */}
                       </div>
                     )}
                   
                   </div>
                 </li>
                 )}
                 </>
                ))}
              </ul>
            )}

          </div>
        )
      }
    
      {isClicked==='Request'&&(
        <div className="mt-4"> 
          {filteredSentRequests.length === 0 ? (
            <p>{t('Nsfr')}</p>
          ) : (
            <ul>
              {filteredSentRequests.map((request) => (
                <li key={request._id} className="flex mb-4 justify-between">
                 
                  <div className="flex">
                      <img
                        src={request.toUserProfileImage || "/SVG/default-profile.svg"}
                        alt={`${request.toUserName}'s profile`}
                        className="w-[50px] h-[50px] rounded-full mr-2" 
                      />

                      <div>
                        <div className="text-black font-bold">
                          {request.toUserName}
                        </div>

                        <div className="text-customGray text-sm">
                          {request.toUserEmail}
                        </div>
                      </div>
                    </div>

                    <div className="relative ">
                      <Image
                        src="/SVG/more.svg"
                        alt="more"
                        width={25}
                        height={25}
                        priority
                        className="cursor-pointer"
                       onClick={() => toggleCancelMenu(request._id)}
                      />
                      {/* 차단, 차단 해제 버튼 추가 */}
                      {isCancelClicked[request._id]&&(
                        <div className=" z-50 absolute top-8 w-[80px] h-[68px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-sm">
                          <button onClick={() => handleCancelRequest(request.toUserEmail)} className="text-red-500">
                          {t('Cancel')}
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

          <div className="mt-4">
        
            {filteredReceivedRequests.length === 0 ? (
              <p>No friend requests received.</p>
            ) : (
              <ul>
                {filteredReceivedRequests.map((request) => (
                  <li key={request._id} className="flex mb-4 justify-between">
              

                    <div className="flex">
                      <img
                        src={request.fromUserProfileImage || "/SVG/default-profile.svg"}
                        alt={`${request.fromUserName}'s profile`}
                        className="w-[50px] h-[50px] rounded-full mr-2" 
                      />

                      <div>
                        <div className="text-black font-bold">
                          {request.fromUserName}
                        </div>

                        <div className="text-customGray text-sm">
                          {request.fromUserEmail}
                        </div>
                      </div>
                    </div>

                    <div className="relative ">
                      <Image
                        src="/SVG/more.svg"
                        alt="more"
                        width={25}
                        height={25}
                        priority
                        className="cursor-pointer"
                       onClick={() => toggleAcceptMenu(request._id)}
                      />
                      {/* 차단, 차단 해제 버튼 추가 */}
                      {isAcceptClicked[request._id]&&(
                        <div className=" z-50 absolute top-8 w-[80px] h-[68px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-sm">
                          <button onClick={() => handleRequestAction(request.fromUserEmail, "accepted")} className="text-red-500">
                          {t('Accept')}
                          </button>
                          <button onClick={() => handleRequestAction(request.fromUserEmail, "rejected")}>
                            {t('Reject')}
                          </button>
                          {/* <button onClick={() => handleUnblockFriend(friend.email)}>
                             {t('Unblock')}
                          </button> */}
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

          <div className="mt-4">
          {filteredFriends.filter(friend => friend.status === 'block').length === 0 ? (
            <p>{t('Yhnfy')}</p>
          ) : (
            <ul>
              {filteredFriends.map((friend) => (
               <>
                {friend.status === 'block' &&(
                  <li key={friend.friendId} className="flex mb-4 justify-between">

                  <div className="flex">
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

                  <div className="relative ">
                    <Image
                      src="/SVG/more.svg"
                      alt="more"
                      width={25}
                      height={25}
                      priority
                      className="cursor-pointer"
                     onClick={() => toggleMoreMenu(friend.friendId)}
                    />
                    {/* 차단, 차단 해제 버튼 추가 */}
                    {isMoreClicked[friend.friendId]&&(
                      <div className=" z-50 absolute top-8 w-[80px] h-[68px] bg-customRectangle rounded-md flex flex-col justify-center text-black text-sm">
                        <button onClick={() => handleBlockFriend(friend.email)} className="text-red-500">
                        {t('Block')}
                        </button>
                        <button onClick={() => handleDeleteFriend(friend.email)} >
                          {t('Delete')}
                        </button>
                        {/* <button onClick={() => handleUnblockFriend(friend.email)}>
                           {t('Unblock')}
                        </button> */}
                      </div>
                    )}
                  
                  </div>
                </li>
                )}
               </>
              ))}
            </ul>
          )}

        </div>
        )
      }
      

      
    </div>
  );
}