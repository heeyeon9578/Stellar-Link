import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

interface ChatRoom {
  id: string;
  name: string;
  messages: Message[];
}

interface ChatState {
  rooms: Record<string, ChatRoom>; // 채팅방 ID를 키로 사용
  currentRoomId: string | null; // 현재 선택된 채팅방 ID
  loading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  rooms: {},
  currentRoomId: null,
  loading: false,
  error: null,
};

// Async action to fetch messages for a chat room
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (roomId: string) => {
    const response = await fetch(`/api/chat/${roomId}/messages`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    const messages: Message[] = await response.json();
    return { roomId, messages };
  }
);

// Async action to send a message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ roomId, message }: { roomId: string; message: string }) => {
    const response = await fetch(`/api/chat/${roomId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: message }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    const newMessage: Message = await response.json();
    return { roomId, newMessage };
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Select a chat room
    selectRoom(state, action: PayloadAction<string>) {
      state.currentRoomId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        const { roomId, messages } = action.payload;
        state.rooms[roomId] = {
          ...state.rooms[roomId],
          id: roomId,
          messages,
        };
        state.loading = false;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch messages";
      })

      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { roomId, newMessage } = action.payload;
        if (state.rooms[roomId]) {
          state.rooms[roomId].messages.push(newMessage);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.error.message || "Failed to send message";
      });
  },
});

export const { selectRoom } = chatSlice.actions;

export default chatSlice.reducer;
