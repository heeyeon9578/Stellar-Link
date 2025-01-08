'use client';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useEffect ,useRef, useState} from 'react';
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../store/store";
import socket from "@/socketIns"; // 위에서 만든 socket.ts 경로
import { useTranslation } from 'react-i18next';
import '../../../i18n';

import {
  setChatRoomId,
  setMessages,
  addMessage,
  setInput,
} from "../../../store/chatSlice";

export default function Detail() {
  const { t,i18n } = useTranslation('common');
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const chatRoomId = useSelector((state: RootState) => state.chat.chatRoomId);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const input = useSelector((state: RootState) => state.chat.input);
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const isComposingRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
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
    if (id) {
      dispatch(setChatRoomId(id));
    }
  }, [searchParams, dispatch]);

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
          dispatch(setMessages(data));
        })
        .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [chatRoomId, dispatch]);


  useEffect(() => {
    if (chatRoomId && socket.connected) {
      
      socket.emit("join_room", chatRoomId);
      console.log("Joining room:", chatRoomId);
      // 메시지 수신 이벤트
      socket.on("receive_message", (message) => {
        if (message.chatRoomId === chatRoomId) {
          console.log("New message received for this chat room:", message);
          dispatch(addMessage(message));
        } else {
          console.log("Message received for another chat room. Ignoring.");
        }
      });
  
      return () => {
        socket.off("receive_message");
      };
    }
  }, [chatRoomId, socket.connected]);

  /**
   * 메시지 전송
   */
  const handleSendMessage = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (input.trim()) {
        const message = {
          chatRoomId,
          senderEmail:session?.user.email,
          text: input,
        };
  
        
        socket?.emit("send_message", message);
        dispatch(setInput("")); // 입력 필드 초기화
      }
    
    }, 400);
    
  };
  useEffect(() => {
    if (i18n.isInitialized) {
      setIsInitialized(true);
    } else {
      const handleInitialized = () => setIsInitialized(true);
      i18n.on('initialized', handleInitialized);
      return () => {
        i18n.off('initialized', handleInitialized);
      };
    }
  }, [i18n]);
  if (!isInitialized) return null;
  return (
    <div className="w-full h-full flex items-center justify-center bg-red-500">
      
      {chatRoomId ?(
        <div>
          <h1>Chat Room {chatRoomId}</h1>
          <div>
            {messages.map((msg, index) => (
              <div key={index} className='flex'>
                <img
                  src={msg.requesterImage || '/SVG/default-profile.svg'}
                  alt="Profile"
                  className="w-[30px] h-[30px] rounded-full object-cover"
                />
                <strong>{msg.requesterName}</strong>: {msg.text || "No message"}
                <div>
                  {msg.createdAt.toString()}
                </div>
              </div>
            ))}
          </div>
          
          {/** 전송 섹션 */}
          <div className='flex'>


            <div className='flex bg-white w-[15%] justify-center'>
              <Image
                src="/SVG/clip.svg"
                alt="clip"
                width={15}
                height={15}
                priority
                className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
                onClick={handleSendMessage}
              />
            </div>


            <input
              type="text"
              value={input}
              lang='ko'
              onChange={(e) => dispatch(setInput(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isComposingRef.current) {
                  handleSendMessage();
                }
              }}
              onCompositionStart={() => (isComposingRef.current = true)} // IME 입력 시작
              onCompositionEnd={() => (isComposingRef.current = false)} // IME 입력 종료
              className="w-[100%] px-3 py-1 border-customGray rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-customLightPurple"
            />

            <div className='flex bg-white  w-[15%] justify-center'>
              <Image
                src="/SVG/send.svg"
                alt="send"
                width={20}
                height={20}
                priority
                className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`} // 애니메이션 클래스 추가
                onClick={handleSendMessage}
              />
            </div>
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
