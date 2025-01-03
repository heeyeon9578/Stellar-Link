import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 메시지 데이터 타입 정의
interface Message {
  requesterName: string;
  requesterImage:string;
  requesterEmail:string;
  text: string;
  createdAt: Date;
  chatRoomId: string;
}

// 초기 상태 타입 정의
interface ChatState {
  chatRoomId: string | null;
  messages: Message[];
  input: string;
}

// 초기 상태 설정
const initialState: ChatState = {
  chatRoomId: null,
  messages: [],
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
      state.messages = [];
      state.input = "";
    },
  },
});

// 액션 및 리듀서 내보내기
export const { setChatRoomId, setMessages, addMessage, setInput, clearChat } =
  chatSlice.actions;
export default chatSlice.reducer;