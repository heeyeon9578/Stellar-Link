'use client';
import { usePathname,useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect,useState } from 'react';
import socket from "@/socketIns"; // 위에서 만든 socket.ts 경로

export default function Detail() {
  const searchParams = useSearchParams();
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ requesterName: string; text: string; createdAt:Date }[]>([]);
  const [input, setInput] = useState<string>("");
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("User is authenticated:", session);
    } else {
      console.log("User is not authenticated");
    }
  }, [status, session]);

  // URL 파라미터에서 chatRoomId 가져오기
  useEffect(() => {
    const id = searchParams?.get("chatRoomId");
    console.log(`
      id
      `,id)
    if (id) {
      setChatRoomId(id);
    }
  }, [searchParams]);
  useEffect(() => {
    console.log("Socket instance:", socket);
    console.log("Socket connected:", socket.connected);
  
    socket.on("connect", () => {
      console.log("Socket connected");
    });
  
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  
    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    if (chatRoomId && socket.connected) {
      
      socket.emit("join_room", chatRoomId);
      console.log("Joining room:", chatRoomId);
      // 메시지 수신 이벤트
      socket.on("receive_message", (message) => {
        console.log("New message received:", message);
        setMessages((prev) => [...prev, message]);
      });
  
      return () => {
        socket.off("receive_message");
      };
    }
  }, [chatRoomId, socket.connected]);

  const handleSendMessage = () => {
    if (input.trim()) {
      const message = {
        chatRoomId,
        senderEmail:session?.user.email,
        text: input,
      };

      console.log("Sending message:", message);
      socket?.emit("send_message", message);
      // setMessages((prev) => [...prev, { sender: "Me", text: input }]); // UI 업데이트
      setInput("");
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      
      {chatRoomId ?(
        <div className='text-black'>
          <div>
            <h1>Chat Room {chatRoomId}</h1>
            <div>
              {messages.map((msg, index) => (
                <div key={index}>
                  <strong>{msg.requesterName}</strong>: {msg.text || "No message"}
                  <div>
                    {msg.createdAt.toString()}
                  </div>
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
        </div>
      ):(
        <Image
        src="/SVG/bigLogo.svg"
        alt="select"
        width={339}
        height={199}
        priority
        className=""
      />
      )}
      
    </div>
  );
}
