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
  // 처음에 메시지 가져오기
  useEffect(() => {
    if (chatRoomId) {
      fetch(`/api/chat/getMessages?chatRoomId=${chatRoomId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch messages");
          }
          return response.json();
        })
        .then((data) => {
          console.log("Fetched messages:", data);
          setMessages(data);
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [chatRoomId]);

  useEffect(() => {
    if (chatRoomId && socket.connected) {
      
      socket.emit("join_room", chatRoomId);
      console.log("Joining room:", chatRoomId);
      // 메시지 수신 이벤트
      socket.on("receive_message", (message) => {
        if (message.chatRoomId === chatRoomId) {
          console.log("New message received for this chat room:", message);
          setMessages((prev) => [...prev, message]);
        } else {
          console.log("Message received for another chat room. Ignoring.");
        }
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
