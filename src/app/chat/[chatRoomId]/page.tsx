'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ChatRoom() {
  const searchParams = useSearchParams();
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);

  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // URL 파라미터에서 chatRoomId 가져오기
  useEffect(() => {
    const id = searchParams?.get("chatRoomId");
    if (id) {
      setChatRoomId(id);
    }
  }, [searchParams]);

  // WebSocket 연결 설정
  useEffect(() => {
    if (chatRoomId) {
      const ws = new WebSocket(`ws://localhost:3000/api/websocket`);
      setSocket(ws);

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };

      return () => {
        ws.close();
      };
    }
  }, [chatRoomId]);

  const handleSendMessage = () => {
    if (socket && input.trim() && chatRoomId) {
      const message = {
        chatRoomId,
        sender: "currentUserId", // 세션에서 가져온 사용자 ID
        text: input,
      };
      socket.send(JSON.stringify(message));
      setInput(""); // 메시지 전송 후 입력 초기화
    }
  };

  // 로딩 상태 처리
  if (!chatRoomId) {
    return <div>Loading Chat Room...</div>;
  }

  return (
    <div>
      <h1>Chat Room {chatRoomId}</h1>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.sender}</strong>: {msg.text || "No message"}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <button onClick={handleSendMessage}>Send</button>
    </div>
  );
}