import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import '../../../../i18n';
import Button from '@/app/components/Button';
import DynamicText from '../../../app/components/DynamicText';
import Image from 'next/image';
interface Friend {
  friendId: string;
  email: string;
  name: string;
  profileImage?: string;
  status: string;
  addedAt?: string; // 선택적 필드
}

interface FriendRequest {
  _id: string;
  fromUserEmail: string;
  fromUserName: string;
  fromUserProfileImage: string;
  toUserEmail: string;
  toUserName: string;
  toUserProfileImage: string;
  status: string;
}

export default function FriendsContent() {
  const [friends, setFriends] = useState<Friend[]>([]); // 친구 목록
  const { t, i18n } = useTranslation('common');
  const [isInitialized, setIsInitialized] = useState(false);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]); // 내게 온 친구 요청
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]); // 내가 보낸 친구 요청
  const [newFriendEmail, setNewFriendEmail] = useState<string>(""); // 친구 추가 이메일
  const [loading, setLoading] = useState<boolean>(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  // 데이터 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 친구 목록 가져오기
        const friendsResponse = await fetch("/api/friends");
        if (!friendsResponse.ok) throw new Error("Failed to fetch friends");
        const friendsData: Friend[] = await friendsResponse.json();
        setFriends(friendsData);

        // 받은 친구 요청 가져오기
        const receivedResponse = await fetch("/api/friends-requests");
        if (!receivedResponse.ok) throw new Error("Failed to fetch received requests");
        const receivedData: FriendRequest[] = await receivedResponse.json();
        setReceivedRequests(receivedData);
        console.log(`
            
            
            receivedData
            
            
            
            `,receivedData)

        // 보낸 친구 요청 가져오기
        const sentResponse = await fetch("/api/sent-friend-requests");
        if (!sentResponse.ok) throw new Error("Failed to fetch sent requests");
        const sentData: FriendRequest[] = await sentResponse.json();
        setSentRequests(sentData);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 친구 추가 요청
  const handleAddFriend = async () => {
    if (!newFriendEmail) {
      alert("Please enter an email.");
      return;
    }

    try {
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
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // 친구 요청 수락/거절
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
  
      // 요청 목록에서 해당 요청 제거
      setReceivedRequests((prev) =>
        prev.filter((req) => req.fromUserEmail !== fromUserEmail)
      );
  
      // 친구 목록 갱신 (수락된 경우)
      if (action === "accepted") {
        const friendsResponse = await fetch("/api/friends");
        if (friendsResponse.ok) {
          const updatedFriends: Friend[] = await friendsResponse.json();
          setFriends(updatedFriends);
        }
      }
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
