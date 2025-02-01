/**
 * 채팅방
 * 참여 인원 10명까지만 프로필 이미지 표시
 * 타이틀이 존재할 경우, 타이틀 표기 / 존재하지 않을 경우 참여자 이름표기
 * 채팅방 본인의 메세지 텍스트 색상, 말풍선 색상을 변경할 수 있음 (서버에 데이터 저장)
 * 파일 첨부 기능을 통해 사진, pdf 등을 메세지에 첨부 가능
 * 웹소켓을 통해 실시간-양방향 통신
 */

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
import 'animate.css';
import DynamicText from '../components/DynamicText';
import Skeleton from "@/app/components/Skeleton"; // 스켈레톤 컴포넌트 가져오기
import { useRouter } from 'next/navigation';
import {
  setChatRoomId,
  setChatRoomInfo,
  setMessages,
  addMessage,
  setInput,
  //setLoading
} from "../../../store/chatSlice";

// const {
   
//   isLoading,

// } = useSelector((state: RootState) => state.chat);

export default function Detail() {
  const { t,i18n } = useTranslation('common');
  const searchParams = useSearchParams();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const chatRoomId = useSelector((state: RootState) => state.chat.chatRoomId);
  const messages = useSelector((state: RootState) => state.chat.messages);
  const input = useSelector((state: RootState) => state.chat.input);
  const chatRoomInfo = useSelector((state: RootState) => state.chat.chatRoomInfo);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const isComposingRef = useRef(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [isAnimatingFileAdd, setIsAnimatingFileAdd] = useState<boolean>(false);
  const [animatedMessageIndex, setAnimatedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [selectedColor,setSelectedColor] = useState<string>('');
  const [participantColors, setParticipantColors] = useState<{ [userId: string]: string }>({});
  const [participantTextColors, setParticipantTextColors] = useState<{ [userId: string]: string }>({});
  const [isColorChange, setIsColorChange] = useState<boolean>(false);
  // 최대 표시할 참여자 수
  const MAX_DISPLAY = 10;
  
  // 전체 참여자 수
  const totalParticipants = chatRoomInfo?.participants.length || 0;
  
  // 슬라이스된 참여자 배열
  const displayedParticipants = chatRoomInfo?.participants.slice(0, MAX_DISPLAY) || [];

  const colorClasses: Record<string, string> = {
    customRectangle: "bg-customRectangle",
    blue200: "bg-blue200",
    green200: "bg-green200",
    yellow200: "bg-yellow200",
    pink200: "bg-pink200",
    purple200: "bg-purple200",
    black: "bg-black",
    blue500: "bg-blue500",
    green500: "bg-green500",
    yellow500: "bg-yellow500",
    pink500: "bg-pink500",
    customPurple: "bg-customPurple",
  };
  const borderClasses: Record<string, string> = {
    customRectangle: "border-customRectangle",
    blue200: "border-blue200",
    green200: "border-green200",
    yellow200: "border-yellow200",
    pink200: "border-pink200",
    purple200: "border-purple200",
  };
  
  const textColorClasses: Record<string, string> = {
    black: "text-black",
    blue500: "text-blue500",
    green500: "text-green500",
    yellow500: "text-yellow500",
    pink500: "text-pink500",
    customPurple: "text-customPurple",
  };
 
  
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
    //console.log("Socket instance:", socket);
    //console.log("Socket connected:", socket.connected);
  
    socket.on("connect", () => {
      //console.log("Socket connected");
    });
  
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  
    socket.on("disconnect", (reason) => {
      //console.log("Socket disconnected:", reason);
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

        dispatch(setMessages(data.messages)); // 메시지 상태 업데이트
        dispatch(setChatRoomInfo(data.chatRoomInfo)); // 채팅방 정보 상태 업데이트
      })
      .catch((error) => {
        console.error("Error fetching messages:", error)
        router.push('/chat');
      });
    }
  }, [chatRoomId, dispatch]);

  // 메시지가 변경될 때마다 스크롤 이동
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
    
     //socket.emit("mark_as_read", { chatRoomId: chatRoomId, userId: session?.user.id });
  }, [messages]); // 메시지가 변경될 때마다 실행  

  useEffect(() => {
    if (chatRoomId && socket.connected) {
      socket.emit("join_room", chatRoomId);
      //console.log("Joining room:", chatRoomId);
  
     // 메시지 읽음 상태 업데이트
     socket.on("update_read_status", ({ chatRoomId: updatedChatRoomId, userId }) => {
      // console.log(`
      //   update_read_status
      //   updatedChatRoomId: ${updatedChatRoomId}
      //   userId: ${userId}
      // `);
      
      if (updatedChatRoomId === chatRoomId) {
        // 모든 메시지에서 `readBy`에 userId를 추가
        const updatedMessages = messages.map((msg) => ({
          ...msg,
          readBy: msg.readBy.includes(userId)
            ? msg.readBy // 이미 userId가 포함된 경우 그대로 유지
            : [...msg.readBy, userId], // 포함되지 않은 경우 추가
        }));
      
        // Redux 상태 업데이트
        dispatch(setMessages(updatedMessages));
      }
    });

    // 색상 변경 이벤트 처리
    socket.on(
      "changed_color",
      (data: { chatRoomId: string; userId: string; color: string }) => {
        //console.log("Color change received:", data);
        // 현재 채팅룸과 동일한 경우에만 반영
        if (data.chatRoomId === chatRoomId) {
          setParticipantColors((prev) => ({
            ...prev,
            [data.userId]: data.color,
          }));
        }
      }
    );
     // 색상 변경 이벤트 처리
     socket.on(
      "changed_textColor",
      (data: { chatRoomId: string; userId: string; color: string }) => {
       // console.log("Color change received:", data);
        // 현재 채팅룸과 동일한 경우에만 반영
        if (data.chatRoomId === chatRoomId) {
          setParticipantTextColors((prev) => ({
            ...prev,
            [data.userId]: data.color,
          }));
        }
      }
    );
      // 메시지 수신 이벤트
      socket.on("receive_message", (message) => {
        if (message.chatRoomId === chatRoomId) {
          dispatch(addMessage(message));

        }
        socket.emit("mark_as_read", { chatRoomId: chatRoomId, userId: session?.user.id });
      });
  
      return () => {
        socket.off("receive_message");
        socket.off("update_read_status");
      };
    }
  }, [chatRoomId, socket.connected, messages, dispatch]);

  useEffect(() => {
    if (chatRoomId) {
      fetch(`/api/chat/getParticipantsColors?chatRoomId=${chatRoomId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch participants colors");
          }
          return response.json();
        })
        .then((data) => {
          const colorMapping = data.participants.reduce(
            (acc: { [key: string]: string }, participant: any) => {
              acc[participant.userId] = participant.color;
              return acc;
            },
            {}
          );
          setParticipantColors(colorMapping); // 색상 데이터를 상태로 저장

          const textColorMapping = data.participants.reduce(
            (acc: { [key: string]: string }, participant: any) => {
              acc[participant.userId] = participant.textColor;
              return acc;
            },
            {}
          );
          setParticipantTextColors(textColorMapping); // 색상 데이터를 상태로 저장
        })
        .catch((error) => console.error("Error fetching participants colors:", error));
    }
  }, [chatRoomId]);

  
  const fetchMarkAsRead = (chatRoomId:string) =>{
    fetch('/api/chat/mark-as-read', {
      method: 'POST',
      body: JSON.stringify({ chatRoomId: chatRoomId, user: session?.user.id }),
      headers: { 'Content-Type': 'application/json' }
    });
  }
 
  /**
   * 메시지 전송
   */
  const handleSendMessage = async () => {
    setIsAnimating(true);
  
    setTimeout(async () => {
      setIsAnimating(false);
  
      if (selectedFile) {
        try {
          // Step 1: Get Presigned URL from the server
          const fileName = encodeURIComponent(selectedFile.name);
          const response = await fetch(`/api/post/image?file=${fileName}`);
      

          if (!response.ok) {
            throw new Error('이미지 업로드 URL을 가져오는 데 실패했습니다.');
          }
    
          const data = await response.json();

          const formData = new FormData();

          Object.entries(data.fields).forEach(([key, value]) => {
            formData.append(key, value as string);
          });
          formData.append("file", selectedFile); // 파일은 반드시 "file" 키로 추가
         
          const uploadResult = await fetch(data.url, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResult.ok) {
            console.error('S3 Upload Error:', uploadResult.status, uploadResult.statusText);
            throw new Error('이미지 업로드 실패');
          }
          
  
          // 업로드된 이미지 URL
          let uploadedUrl = `${data.url}/${data.fields.key}`;
        
          // Step 3: Send message with file URL via socket
          const message = {
            chatRoomId,
            senderEmail: session?.user.email,
            text: "File",
            file: {
              name: selectedFile.name,
              type: selectedFile.type,
              url:uploadedUrl, // Use the key to reconstruct the URL if needed
            },
          };
  
          socket?.emit("send_message", message);
          socket.emit("mark_as_read", { chatRoomId: chatRoomId, userId: session?.user.id });
          //fetchMarkAsRead(chatRoomId || "");
          // Reset file state
          setSelectedFile(null);
        } catch (error) {
          console.error("Error handling file upload:", error);
          setSelectedFile(null);
        }
      } else if (input.trim()) {
        // Handle text message
        const message = {
          chatRoomId,
          senderEmail: session?.user.email,
          text: input,
        };
  
        // Send message via socket
        socket?.emit("send_message", message);
  
        // Reset input field
        dispatch(setInput(""));
      }
    }, 500);
  };
  

  const handleGoToBack = () =>{
    window.location.href = '/chat';
    
  }

  // 파일 선택 핸들러
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const deleteFile = () =>{
    setSelectedFile(null);
  }

  const handleColorChange = (color:string) => {
    // 선택한 색상 상태 업데이트
    setSelectedColor(color);
    const data = {
      chatRoomId, // 이미 서버에서 검증할 것이므로 변환하지 않음
      userId: session?.user.id.toString(), // userId도 문자열로 전송
      color,
    };
   
    socket?.emit("change_color", data);

  };

  const handleTextColorChange = (color:string) => {
    // 선택한 색상 상태 업데이트
    setSelectedColor(color);
    const data = {
      chatRoomId, // 이미 서버에서 검증할 것이므로 변환하지 않음
      userId: session?.user.id.toString(), // userId도 문자열로 전송
      color,
    };
   
    socket?.emit("change_textColor", data);

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
  // // 로딩 상태
  // if ( isLoading) {
 
  //   return (
  //     <div className="mx-auto md:p-8 p-4 rounded-lg h-full text-customBlue relative flex flex-col">
  //     <Skeleton width="80%" height="30px" borderRadius="8px" className="mb-2"/>
  //     <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-2"/>
  //     <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-2"/>
  //     <Skeleton width="100%" height="50px" borderRadius="12px" className="mb-4"/>
  //     <Skeleton width="100%" height="350px" borderRadius="12px" className="mb-2"/>
  //   </div>
  //   );
  // }

  return (
    <div className="w-full h-full text-black p-2 md:p-0">
      
      {chatRoomId ?(
        <div className='flex h-full flex-col '>

          {/** 타이틀 섹션 */}
           
          <div className="h-[15%] ">
            {/** 뒤로가기 버튼 */}
            <div className="flex justify-start sm:mb-2 mb-1 ">
              <img
                src="/SVG/back.svg"
                alt="back"
                // width={30}
                // height={30}
                // priority
                className={`cursor-pointer sm:h-[30px] sm:w-[30px] h-[15px] w-[15px] hover:scale-125 ${isAnimatingFileAdd ? 'animate__animated animate__headShake' : ''}`}
                onClick={handleGoToBack}
              />
            </div>
            <div className='relative '>
              {chatRoomInfo?.title? (
                
              <div className=''>{/** 타이틀이 존재할때 */}

                <div className="relative flex ">
                 {displayedParticipants.map((participant, index) => (
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
                       className="sm:w-8 sm:h-8 h-6 w-6 rounded-full border border-white object-cover"
                     />
                    </div>

                 ))}
                
                </div>

                <div className='flex sm:mt-8 mt-6'>
                  <div className='sm:text-sm text-xs text-customPurple'><DynamicText text={chatRoomInfo?.title}/></div>
                  <div className='sm:text-sm text-xs text-gray-500'>({chatRoomInfo?.participants.length || 0})</div>
                </div>

              </div>

                ):(
                <div className=''>{/** 타이틀이 존재하지 않을때 */}
                  <div className="relative flex">
                    {displayedParticipants.map((participant, index) => (
                      <div
                        key={participant.id}
                        className="absolute"
                        style={{
                          left: `${index * 20}px`, // 겹치는 간격 조정
                          zIndex: totalParticipants - index, // z-index로 겹침 순서 조정
                        }}
                      >
                        <img
                        src={participant.profileImage}
                        alt={participant.name}
                        className="sm:w-8 sm:h-8 h-6 w-6 rounded-full border border-white object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  <div className='flex sm:mt-8 mt-6  max-w-[80%] h-[15px] sm:h-[23px] overflow-hidden whitespace-nowrap text-ellipsis'>
                    <div className='flex max-w-[90%] overflow-hidden whitespace-nowrap text-ellipsis flex-wrap '>
                      {chatRoomInfo?.participants.map((p, idx) => (
                      <span key={p.id} className='text-xs sm:text-sm text-customPurple '>
                      {idx === chatRoomInfo.participants.length - 1 ? (
                        <DynamicText text={p.name} className='text-xs sm:text-sm' />
                      ) : (
                        <>
                          <DynamicText text={p.name+','} className='text-xs sm:text-sm' /> {' '}
                        </>
                      )}
                    </span>
                    ))}
                    </div>
                    <div className='sm:text-sm text-xs text-gray-500'>({chatRoomInfo?.participants.length || 0})</div>
                  </div>
                

                  

                </div>
              )}
              <div className='absolute bottom-0 right-2 flex flex-col items-end'>
                
              
               <img
                    src="/SVG/more.svg"
                    alt="colorChange"
                    // width={30}
                    // height={30}
                    // priority
                    onClick={()=>{setIsColorChange(!isColorChange)}}
                    className="cursor-pointer hover:scale-125 w-[20px] h-[20px] sm:w-[30px] sm:h-[30px]"
                  />
                  {
                    isColorChange && 
                    <div className='absolute bg-white top-6 sm:top-8 right-2 sm:right-4 rounded-custom-myChat p-2'>
                      <div className='flex mb-1'>
                      {['black','blue500', 'green500', 'yellow500', 'pink500', 'customPurple'].map((color, idx) => (
                      <div
                        key={idx}
                        className={`sm:w-6 sm:h-6 h-4 w-4 ${colorClasses[color]} mr-1 rounded-full cursor-pointer border border-white hover:scale-125 hover:animate__animated hover:animate__bounce`}
                        onClick={() => handleTextColorChange(color)}
                      ></div>
                      ))}
                      <img
                        src="/SVG/text.svg"
                        alt="text"
                        // width={24}
                        // height={24}
                        // priority

                        className="w-[15px] h-[15px] sm:w-[24px] sm:h-[24px]"
                      />
                      </div>
                      <div className='flex mb-1'>
                      {['customRectangle','blue200', 'green200', 'yellow200', 'pink200', 'purple200'].map((color, idx) => (
                      <div
                        key={idx}
                        className={`sm:w-6 sm:h-6 h-4 w-4  mr-1 ${colorClasses[color]} rounded-full cursor-pointer border border-white hover:scale-125 hover:animate__animated hover:animate__bounce`}
                        onClick={() => handleColorChange(color)}
                      ></div>
                      ))}
                      <img
                        src="/SVG/colorChange.svg"
                        alt="colorChange"
                        // width={24}
                        // height={24}
                        // priority

                         className="w-[15px] h-[15px] sm:w-[24px] sm:h-[24px]"
                      />
                      </div>
                    </div>
                  }
              </div>
            </div>

          </div>

          {/** 채팅 섹션 */}
          <div className="h-[90%] overflow-y-auto sm:mt-2 mt-1">
            {messages.map((msg,index) => {
               const messageColor = participantColors[msg.requesterId] || "customRectangle"; // 기본 색상 설정
               const messageTextColor = participantTextColors[msg.requesterId] || "customPurple"; // 기본 색상 설정

              const dynamicBorderClass = borderClasses[messageColor] || "border-customRectangle";
              const dynamicTextClass = textColorClasses[messageTextColor] || "text-customPurple";

              // 메시지 날짜 포맷 처리
              const messageDate = new Date(msg.createdAt);
              const today = new Date();
              const isUser = msg.requesterId === session?.user.id.toString();
              const participantCount = chatRoomInfo?.participants.length ||0;
              const unreadCount =  participantCount- (msg.readBy?.length || 0);
              // 오늘 날짜인지 확인
              const isToday =
                messageDate.getFullYear() === today.getFullYear() &&
                messageDate.getMonth() === today.getMonth() &&
                messageDate.getDate() === today.getDate();
            
              // 날짜 포맷 결정
              const formattedDate = isToday
                ? new Intl.DateTimeFormat(t('lang'), {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  }).format(messageDate)
                : `${messageDate.getMonth() + 1}${t('month')} ${messageDate.getDate()}${t('day')}`;
                
              return (
                <div key={msg.id}>
                {isUser ? (
                <div key={msg.id} className={`flex mb-2 sm:mb-4 justify-end  ${
                  animatedMessageIndex === index ? "animate__animated animate__fadeInUp" : ""
                }`}>
                 
                  
                  <div className="flex flex-col items-end  sm:mr-2 mr-1">
                    <DynamicText className={`text-xs sm:text-sm ${dynamicTextClass}`} text={msg.requesterName}/>
                    <div className='flex items-end'>
                      <div className='flex flex-col items-end'>
                        {/** 안 읽은 사람 수 표시 */}
                        {unreadCount > 0 && (
                          <div className="text-[10px] sm:text-xs text-customLightPurple">
                            {unreadCount}
                          </div>
                        )}
                         <div className="text-[10px] sm:text-xs text-gray-400">{formattedDate}</div>
                      </div>
                        <span className={`ml-1 sm:ml-2 text-[10px] sm:text-xs text-gray-500 bg-${messageColor} rounded-custom-myChat max-w-[140px] sm:max-w-[300px] p-1 sm:p-2 flex-wrap`}>
                        {msg.file? (
                            <>
                             {msg.file.type.startsWith("image/") ? (
                                // 이미지 파일
                                <img
                                  src={msg.file.url}
                                  alt={msg.file.name}
                                  className="max-w-full rounded-lg"
                                />
                              ) : (
                                // 일반 파일 (다운로드 링크 제공)
                                <a
                                  href={msg.file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  {msg.file.name}
                                </a>
                              )}
                            </>
                          ):(
                            <>
                            {msg.text || "No message"}
                            </>
                          )}
                        </span>
                        
                    </div>
                    
                  </div>
                  <img
                    src={msg.requesterImage || "/SVG/default-profile.svg"}
                    alt="Profile"
                    className={`sm:w-[30px] sm:h-[30px] w-[20px] h-[20px] object-cover rounded-full object-cover mr-1 sm:mr-2 border border-2 ${dynamicBorderClass}`}
                  />
                  {/* 채팅 끝에 위치한 더미 div */}
                  <div ref={messagesEndRef}></div>

                </div>
                ):(
                  <div key={msg.id} className={`flex mb-2 sm:mb-4 ${
                    animatedMessageIndex === index ? "animate__animated animate__fadeInUp" : ""
                  }`}>
                  <img
                    src={msg.requesterImage || "/SVG/default-profile.svg"}
                    alt="Profile"
                    className={`sm:w-[30px] sm:h-[30px] w-[20px] h-[20px] rounded-full object-cover mr-1 sm:mr-2 border border-2 ${dynamicBorderClass}`}
                  />
                  <div className="flex flex-col">
                    <DynamicText className={`text-xs sm:text-sm ${dynamicTextClass}`} text={msg.requesterName}/>
                    <div className='flex items-end'>
                        <div className={`text-[10px] sm:text-xs text-gray-500 bg-${messageColor} max-w-[140px]  sm:max-w-[300px] p-1 sm:p-2 flex-wrap rounded-custom-otherChat`}>
                          {msg.file? (
                            <>
                             {msg.file.type.startsWith("image/") ? (
                                // 이미지 파일
                                <img
                                  src={msg.file.url}
                                  alt={msg.file.name}
                                  className="max-w-full rounded-lg"
                                />
                              ) : (
                                // 일반 파일 (다운로드 링크 제공)
                                <a
                                  href={msg.file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 underline"
                                >
                                  {msg.file.name}
                                </a>
                              )}
                            </>
                          ):(
                            <>
                            {msg.text || "No message"}
                            </>
                          )}
                          
                        </div>
                        <div className='flex flex-col ml-1 sm:ml-2'>
                        {unreadCount > 0 && (
                          <div className="text-[10px] sm:text-xs text-customLightPurple">
                            {unreadCount}
                          </div>
                        )}
                      <div className="text-[10px] sm:text-xs text-gray-400">{formattedDate}</div>
                        </div>
                    </div>
                  </div>
                  
                  {/* 채팅 끝에 위치한 더미 div */}
                  <div ref={messagesEndRef}></div>

                </div>
                )}</div>
              );
            })}
          </div>
          
          {/** 전송 섹션 */}
          <div className="flex w-full items-center">
             {/** 첨부 버튼 */}
              <div className="flex w-[10%] sm:w-[10%] justify-center items-center">
                <label htmlFor="fileInput" className="cursor-pointer">
                  <img
                    src="/SVG/clip.svg"
                    alt="clip"
                    // width={15}
                    // height={15}
                    // priority
                    className="cursor-pointer hover:scale-125 w-[12px] h-[12px] sm:w-[15px] sm:h-[15px]"
                  />
                </label>
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              {/** 입력 필드 */}
            <div className='w-[80%] relative'>
              <input
                type="text"
                disabled={selectedFile? true:false}
                value={selectedFile ? selectedFile.name : input}
                lang="ko"
                onChange={(e) => dispatch(setInput(e.target.value))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isComposingRef.current) {
                    handleSendMessage();
                  }
                }}
                onCompositionStart={() => (isComposingRef.current = true)}
                onCompositionEnd={() => (isComposingRef.current = false)}
                className={selectedFile? `w-full h-4 sm:h-8 border-customGray rounded-xl text-xs sm:text-sm text-gray-500 bg-gray-300 focus:outline-none focus:ring-2 focus:border-transparent focus:ring-customLightPurple`:
                    `w-full border-customGray h-4  sm:h-8 rounded-xl text-xs sm:text-sm text-gray-500 focus:outline-none focus:ring-2 focus:ring-customLightPurple focus:border-transparent`}
              />
              {selectedFile &&(
                <div className='absolute top-2 right-2' onClick={deleteFile}>
                <img
                  src="/SVG/fileCancel.svg"
                  alt="fileCancel"
                  // width={15}
                  // height={15}
                  // priority
                  className="cursor-pointer w-[12px] h-[12px] sm:w-[15px] sm:h-[15px]"
                />
              </div>
              )}
            </div>
              
           
              
            {/** 전송 버튼 */}
            <div className="flex w-[10%] justify-center">
              <img
                src="/SVG/send.svg"
                alt="send"
                // width={20}
                // height={20}
                // priority
                className={`cursor-pointer hover:scale-125 w-[12px] h-[12px] sm:w-[15px] sm:h-[15px] ${isAnimating ? 'animate__animated animate__headShake' : ''}`}
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
