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
    const response = await fetch("/api/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetEmail: friendEmail }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || t('Ftbf'));
    }
    alert(t('Fbs'));
  } catch (err) {
    alert(t('Ftbf'));
  }
};

//친구 차단 해제
const handleUnblockFriend = async (friendEmail: string) => {
  try {
    const response = await fetch("/api/block", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetEmail: friendEmail }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || t('Ftuf'));
    }
    alert(t('Fus'));
  } catch (err) {
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
  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="mx-auto p-8 rounded-lg h-full text-customBlue relative">

      {/** 헤더 */}
      <h2 className="text-2xl font-bold mb-4">
        <DynamicText text={t('Friends')} />
      </h2>

      {/** 검색 창 */}
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
        <div className="flex items-center text-sm">
          <DynamicText text={t('Search')} className="text-black/45"/>
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
          <>
            {friends.length === 0 ? (
              <p>{t('Yhnfy')}</p>
            ) : (
              <ul>
                {friends.map((friend) => (
                  <li key={friend.friendId} className="flex mt-4 justify-between">

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
                ))}
              </ul>
            )}

          </>
        )
      }
    
      {isClicked==='Request'&&(
        <>
          
          {sentRequests.length === 0 ? (
            <p>No sent friend requests.</p>
          ) : (
            <ul>
              {sentRequests.map((request) => (
                <li key={request._id}>
                  <p>
                    <strong>To:</strong> {request.toUserName} ({request.toUserEmail})
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) }

      {
        isClicked==='Pending' &&
        (

          <>
        
            {receivedRequests.length === 0 ? (
              <p>No friend requests received.</p>
            ) : (
              <ul>
                {receivedRequests.map((request) => (
                  <li key={request._id}>
                    <img
                      src={request.fromUserProfileImage || "/SVG/default-profile.svg"}
                      alt={`${request.fromUserName}'s profile`}
                      style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                    />
                    <p>
                      <strong>From:</strong> {request.fromUserName} ({request.fromUserEmail})
                    </p>
                    <button onClick={() => handleRequestAction(request.fromUserEmail, "accepted")}>
                      Accept
                    </button>
                    <button onClick={() => handleRequestAction(request.fromUserEmail, "rejected")}>
                      Reject
                    </button>
                  </li>
                ))}
              </ul>
            )}

          </>
        )
      }
      
      

      
    </div>
  );
}