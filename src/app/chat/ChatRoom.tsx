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
import DynamicText from '../components/DynamicText';

import {
  setChatRoomId,
  setChatRoomInfo,
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
  const chatRoomInfo = useSelector((state: RootState) => state.chat.chatRoomInfo);

  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const isComposingRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isAnimatingFileAdd, setIsAnimatingFileAdd] = useState<boolean>(false);
  const [animatedMessageIndex, setAnimatedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
    }else{
      dispatch(setChatRoomId(null));
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
        console.log(`
          
          
          data
          
          
          
          `,data)
        dispatch(setMessages(data.messages)); // 메시지 상태 업데이트
        dispatch(setChatRoomInfo(data.chatRoomInfo)); // 채팅방 정보 상태 업데이트
      })
      .catch((error) => console.error("Error fetching messages:", error));
    }
  }, [chatRoomId, dispatch]);

  // 메시지가 변경될 때마다 스크롤 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]); // 메시지가 변경될 때마다 실행  

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
    
    }, 200);
    
  };
   // 메시지 변경 감지 후 애니메이션 설정
   useEffect(() => {
    if (messages.length > 0) {
      const newMessageIndex = messages.length - 1; // 마지막 메시지
      setAnimatedMessageIndex(newMessageIndex);

      // 일정 시간 후 애니메이션 상태 제거
      setTimeout(() => {
        setAnimatedMessageIndex(null);
      }, 500); // 애니메이션 시간 (0.5초)
    }
  }, [messages]);
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
    <div className="w-full h-full text-black">
      
      {chatRoomId ?(
        <div className='flex h-full flex-col'>

          {/** 타이틀 섹션 */}
           
          <div className="h-[10%]">
            {chatRoomInfo?.title? (
              <div>

                <div className="relative flex">
                 {chatRoomInfo?.participants.map((participant, index) => (
                    <div
                     key={participant.id}
                     className="absolute"
                     style={{
                       left: `${index * 20}px`, // 겹치는 간격 조정
                       zIndex: chatRoomInfo?.participants.length - index, // z-index로 겹침 순서 조정
                     }}
                    >
                     <img
                       src={participant.profileImage}
                       alt={participant.name}
                       className="w-8 h-8 rounded-full border border-white"
                     />
                    </div>

                 ))}
                
                </div>

                <div className='flex mt-8'>
                  <div className='text-sm text-customPurple'><DynamicText text={chatRoomInfo?.title}/></div>
                  <div className='text-sm text-gray-500'>({chatRoomInfo?.participants.length || 0})</div>
                </div>

              </div>

              ):(
                <div>
                  <div className="relative flex ml-[22px]">
                    {chatRoomInfo?.participants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="absolute"
                        style={{
                          left: `${index * 20}px`, // 겹치는 간격 조정
                          zIndex: chatRoomInfo?.participants.length - index, // z-index로 겹침 순서 조정
                        }}
                      >
                        <img
                        src={participant.profileImage}
                        alt={participant.name}
                        className="w-8 h-8 rounded-full border border-white"
                        />
                      </div>
                    ))}
                  </div>
                  <div className='text-sm text-gray-500'>({chatRoomInfo?.participants.length || 0})</div>
                </div>
            )}
              
            
          </div>

          {/** 채팅 섹션 */}
          <div className="h-[90%] overflow-y-auto">
            {messages.map((msg,index) => {
              // 메시지 날짜 포맷 처리
              const messageDate = new Date(msg.createdAt);
              const today = new Date();
              const isUser = msg.requesterId === session?.user.id.toString();

              // 오늘 날짜인지 확인
              const isToday =
                messageDate.getFullYear() === today.getFullYear() &&
                messageDate.getMonth() === today.getMonth() &&
                messageDate.getDate() === today.getDate();
            
              // 날짜 포맷 결정
              const formattedDate = isToday
                ? new Intl.DateTimeFormat("ko-KR", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  }).format(messageDate)
                : `${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
                
              return (
                <div key={msg.id}>
                {isUser ? (
                <div key={msg.id} className={`flex items-center mb-4 justify-end ${
                  animatedMessageIndex === index ? "animate__animated animate__fadeInUp" : ""
                }`}>
                  <div className="text-xs text-gray-400">{formattedDate}</div>
                  
                  <div className="flex flex-col items-end">
                    <strong className="text-sm">{msg.requesterName}</strong>
                    <span className="text-xs text-gray-500">{msg.text || "No message"}</span>
                  </div>
                  <img
                    src={msg.requesterImage || "/SVG/default-profile.svg"}
                    alt="Profile"
                    className="w-[30px] h-[30px] rounded-full object-cover mr-2 border border-white"
                  />
                  {/* 채팅 끝에 위치한 더미 div */}
                  <div ref={messagesEndRef}></div>

                </div>
                ):(
                  <div key={msg.id} className={`flex items-center mb-4 ${
                    animatedMessageIndex === index ? "animate__animated animate__fadeInUp" : ""
                  }`}>
                  <img
                    src={msg.requesterImage || "/SVG/default-profile.svg"}
                    alt="Profile"
                    className="w-[30px] h-[30px] rounded-full object-cover mr-2 border border-white"
                  />
                  <div className="flex flex-col">
                    <strong className="text-sm">{msg.requesterName}</strong>
                    <span className="text-xs text-gray-500">{msg.text || "No message"}</span>
                  </div>
                  <div className="text-xs text-gray-400">{formattedDate}</div>
                  {/* 채팅 끝에 위치한 더미 div */}
                  <div ref={messagesEndRef}></div>

                </div>
                )}</div>






               
              );
            })}
          </div>
          
          {/** 전송 섹션 */}
          <div className="flex w-full items-center ">
            {/** 첨부 버튼 */}
            <div className="flex  w-[10%] justify-center">
              <Image
                src="/SVG/clip.svg"
                alt="clip"
                width={15}
                height={15}
                priority
                className={`cursor-pointer ${isAnimatingFileAdd ? 'animate__animated animate__headShake' : ''}`}
                onClick={handleSendMessage}
              />
            </div>

            {/** 입력 필드 */}
            <input
              type="text"
              value={input}
              lang="ko"
              onChange={(e) => dispatch(setInput(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isComposingRef.current) {
                  handleSendMessage();
                }
              }}
              onCompositionStart={() => (isComposingRef.current = true)}
              onCompositionEnd={() => (isComposingRef.current = false)}
              className="w-[80%] px-3 py-1 border-customGray rounded-xl text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-customLightPurple"
            />

            {/** 전송 버튼 */}
            <div className="flex w-[10%] justify-center">
              <Image
                src="/SVG/send.svg"
                alt="send"
                width={20}
                height={20}
                priority
                className={`cursor-pointer ${isAnimating ? 'animate__animated animate__headShake' : ''}`}
                onClick={handleSendMessage}
              />
            </div>
          </div>
        </div>
      ):(
       <div className='w-full h-full flex items-center justify-center'>
         <Image
        src="/SVG/bigLogo.svg"
        alt="select"
        width={339}
        height={199}
        priority
        className=""
      />
       </div>
      )}
      
    </div>
  );
}
