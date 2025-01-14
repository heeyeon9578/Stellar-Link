// store/friendsSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
/**
 * createAsyncThunk 
 * 비동기 로직(예: API 요청)을 처리하기 위해 Redux Toolkit에서 제공하는 편의 함수입니다.
 * 첫 번째 인자로 액션 타입 문자열, 두 번째 인자로 비동기 함수를 받습니다.
 * 내부에서 fetchFriends.pending, fetchFriends.fulfilled, fetchFriends.rejected 형태의 액션이 자동으로 생성됩니다.
 */
interface Friend {
  _id: string;
  email: string;
  name: string;
  profileImage?: string;
  status: string;
  addedAt?: string;
}

interface toUserDetails{
  _id:string;
  name:string;
  email:string;
  profileImage?:string;
  
}

interface FriendRequest {
  _id:string;
  fromUserId:string;
  requestedAt:string;
  status: string;
  toUserDetails: toUserDetails;
  fromUserDetails:toUserDetails;
  toUserId:string;
}

interface FriendsState {
  list: Friend[];
  receivedRequests: FriendRequest[];
  sentRequests: FriendRequest[];
  loading: boolean;
  error: string | null;
}

const initialState: FriendsState = {
  list: [],
  receivedRequests: [],
  sentRequests: [],
  loading: false,
  error: null,
};

// Async actions for API calls
// 실제 API 엔드포인트(/api/friends)를 호출해 친구 정보를 가져옵니다.
// 응답이 정상(ok)이 아니면 에러를 던집니다.
// 성공 시 JSON을 파싱해 Friend[] 형태로 반환합니다.
export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (
    { sortBy = "addedAt", order = "desc" }: { sortBy?: string; order?: string },
    { rejectWithValue }
  ) => {
    try {
      // Validate sortBy and order
      const validSortBy = ["addedAt", "name"];
      const validOrder = ["asc", "desc"];

      // Ensure sortBy and order are valid; fallback to defaults if not
      if (!validSortBy.includes(sortBy)) {
        sortBy = "addedAt";
      }
      if (!validOrder.includes(order)) {
        order = "desc";
      }

      const response = await fetch(`/api/friends?sortBy=${sortBy}&order=${order}`);

      if (!response.ok) {
        // Throw a custom error message based on response status
        const errorMessage = `Failed to fetch friends. Status: ${response.status}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Ensure the error message is returned for better debugging
      return rejectWithValue(error instanceof Error ? error.message : "Unknown error");
    }
  }
);

export const fetchReceivedRequests = createAsyncThunk("friends/fetchReceivedRequests", async () => {
  const response = await fetch("/api/friends-requests");
  if (!response.ok) throw new Error("Failed to fetch received requests");
  return (await response.json()) as FriendRequest[];
});

export const fetchSentRequests = createAsyncThunk("friends/fetchSentRequests", async () => {
  const response = await fetch("/api/sent-friend-requests");
  if (!response.ok) throw new Error("Failed to fetch sent requests");
  return (await response.json()) as FriendRequest[];
});


/**
 * createSlice
 * Redux Toolkit에서 제공하는 슬라이스 생성 함수입니다.
	•	name: 슬라이스 이름. 예) "friends".
	•	initialState: 이 슬라이스가 관리할 상태의 초기 값.
	•	reducers: 동기 액션 리듀서를 정의할 수 있는 공간. 현재는 빈 객체 {}.
	•	extraReducers: createAsyncThunk를 사용한 비동기 액션에 대한 리듀서를 정의하는 공간.
 */
const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch friends";
      })

      // Fetch Received Requests
      .addCase(fetchReceivedRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReceivedRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.receivedRequests = action.payload;
      })
      .addCase(fetchReceivedRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch received requests";
      })

      // Fetch Sent Requests
      .addCase(fetchSentRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.sentRequests = action.payload;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch sent requests";
      });
  },
});

export default friendsSlice.reducer;
