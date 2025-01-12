import { createSlice, PayloadAction } from "@reduxjs/toolkit";
// 참여자 데이터 타입 정의
interface Participant {
  id: string;
  name: string;
  email: string;
  profileImage: string;
}
// 메시지 데이터 타입 정의
interface Message {
  id:string;
  requesterId :string;
  senderEmail: string;
  requesterName: string;
  requesterImage:string;
  requesterEmail:string;
  text: string;
  createdAt: Date;
  chatRoomId: string;
  file?: {
    name: string;
    type: string;
    data?: string; // 클라이언트에서 전송
    url?: string;  // 서버에서 추가
  };
}
interface ChatRoomInfo{
  createdAt: Date;
  participants: Participant[];
  title: string;

}
// 초기 상태 타입 정의
interface ChatState {
  chatRoomId: string | null;
  messages: Message[];
  chatRoomInfo:ChatRoomInfo | null; // 초기 상태에서 null 가능
  input: string;
}

// 초기 상태 설정
const initialState: ChatState = {
  chatRoomId: null,
  messages: [],
  chatRoomInfo:null,
  input: "",
};

// Slice 생성
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setChatRoomId(state, action: PayloadAction<string | null>) {
      state.chatRoomId = action.payload;
    },
    setChatRoomInfo(state, action: PayloadAction<ChatRoomInfo | null>) {
      state.chatRoomInfo = action.payload;
    },
    setMessages(state, action: PayloadAction<Message[]>) {
      state.messages = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      state.messages.push(action.payload);
    },
    setInput(state, action: PayloadAction<string>) {
      state.input = action.payload;
    },
    clearChat(state) {
      state.chatRoomId = null;
      state.chatRoomInfo = null;
      state.messages = [];
      state.input = "";
    },
  },
});

// 액션 및 리듀서 내보내기
export const { setChatRoomId,setChatRoomInfo, setMessages, addMessage, setInput, clearChat } =
  chatSlice.actions;
export default chatSlice.reducer;