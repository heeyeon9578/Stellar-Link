// FriendsContent.tsx

import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import { useDispatch, useSelector } from 'react-redux';

import { fetchFriends, fetchReceivedRequests, fetchSentRequests } from '../../../../store/friendsSlice';
import { RootState } from '../../../../store/store';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import Button from '@/app/components/Button';
import DynamicText from '../../../app/components/DynamicText';



export default function FriendsContent() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation('common');

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
      alert("Please enter an email.");
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
        throw new Error(errorData.message || "Failed to send friend request.");
      }

      setNewFriendEmail(""); // 입력 필드 초기화
      alert("Friend request sent successfully!");

      // 친구 요청을 보냈으니, 혹시 리스트가 업데이트되었을 수 있어 재조회
      dispatch(fetchSentRequests());
    } catch (err) {
      alert((err as Error).message);
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
          ? "Friend request accepted successfully!"
          : "Friend request rejected successfully!";
      alert(successMessage);

      // 요청 목록이 바뀌었으니 다시 요청을 디스패치해서 데이터 갱신
      dispatch(fetchReceivedRequests());
      dispatch(fetchFriends());
    } catch (err) {
      alert((err as Error).message);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="mx-auto p-4 rounded-lg h-full text-customBlue relative bg-red-100">
      <h2 className="text-2xl font-bold mb-4">
        <DynamicText text={t('Friends')} />
      </h2>

      {friends.length === 0 ? (
        <p>You have no friends yet.</p>
      ) : (
        <ul>
          {friends.map((friend) => (
            <li key={friend.friendId}>
              <img
                src={friend.profileImage || "/default-profile.png"}
                alt={`${friend.name}'s profile`}
                style={{ width: "50px", height: "50px", borderRadius: "50%" }}
              />
              <p>
                <strong>Name:</strong> {friend.name} <br />
                <strong>Email:</strong> {friend.email}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2>Received Friend Requests</h2>
      {receivedRequests.length === 0 ? (
        <p>No friend requests received.</p>
      ) : (
        <ul>
          {receivedRequests.map((request) => (
            <li key={request._id}>
              <img
                src={request.fromUserProfileImage || "/default-profile.png"}
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

      <h2>Sent Friend Requests</h2>
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

      <h2>Add a New Friend</h2>
      <input
        type="text"
        placeholder="Enter Friend's Email"
        value={newFriendEmail}
        onChange={(e) => setNewFriendEmail(e.target.value)}
      />
      <button onClick={handleAddFriend}>Add Friend</button>
    </div>
  );
}