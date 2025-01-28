'use client';
import React from 'react';
import Image from 'next/image';
import DynamicText from '@/app/components/DynamicText'; // 기존 import 경로 맞춰주세요
import { useLongPress } from '@/app/components/useLongPress'; // <-- 추가 (경로 맞춰주세요)
interface participant{
    name:string;
    id:string;
    email:string;
    profileImage:string;
  }
  interface senderInfo{
    email:string;
    id:string;
    name:string;
    profileImage:string;
  }
  interface ChatRoom {
    _id: string;
    participants: participant[];
    type: string;
    createdAt: string;
    title?:string;
    messages: {
      chatRoomId: string;
      senderEmail: string;
      senderInfo:senderInfo;
      text: string;
      requesterId: string;
      createdAt: string;
      requesterEmail?:string;
      requesterImage?:string;
      requesterName?:string;
  
    }[];
  }
interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  isAnimating: boolean;
  menuVisible: boolean;
  editChatRoomName: string | null;  
  currentContextMenuChatRoomId: string | null;
  menuPosition: { x: number; y: number };
  unreadCount: number;  
  popupRef: React.RefObject<HTMLUListElement>;

  // 필요한 핸들러들
  handleContextMenu: (e: React.MouseEvent<HTMLDivElement>, chatRoomId: string) => void;
  enterChatRoom: (chatRoomId: string) => void;
  handleEditChatRoomName: (chatRoomId: string) => void;
  handleInviteChatRoom: (chatRoomId: string) => void;
  handelExitChatRoom: (chatRoomId: string) => void;
  cancelEditChatRoom: () => void;
  fetchEditChatRoomName: (chatRoomId: string) => void;

  // form 관련
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;

  // 번역함수 등
  t: (key: string) => string; 
}

/**
 * 하나의 채팅방 아이템을 렌더링하는 컴포넌트
 */
export default function ChatRoomItem({
  chatRoom,
  isAnimating,
  menuVisible,
  editChatRoomName,
  currentContextMenuChatRoomId,
  menuPosition,
  unreadCount,
  popupRef,
  handleContextMenu,
  enterChatRoom,
  handleEditChatRoomName,
  handleInviteChatRoom,
  handelExitChatRoom,
  cancelEditChatRoom,
  fetchEditChatRoomName,
  title,
  setTitle,
  t,
}: ChatRoomItemProps) {

    const longPressEvents = useLongPress(
        (e) => {
          e.preventDefault(); // 길게 누를 때 터치/마우스 기본 동작 방지
          // 같은 로직: 우클릭 메뉴 열기
          handleContextMenu(e as React.MouseEvent<HTMLDivElement>, chatRoom._id);
        },
        { threshold: 500 } // 0.5초 이상 누르면 길게 누름으로 인식
      );


  return (
    <div
    key={chatRoom._id}
    {...longPressEvents}
      
      className="sm:p-2 p-1 cursor-pointer rounded-xl mb-2 bg-white/50"
      onClick={(e) => {
        // 메뉴가 안 떠있고, 방 이름 수정 중이 아닐 때에만 클릭 진입
        if (!menuVisible && !editChatRoomName) {
          enterChatRoom(chatRoom._id);
        } else {
          e.stopPropagation(); // 클릭 이벤트 버블링을 막음
        }
      }}
      onContextMenu={(e) => handleContextMenu(e, chatRoom._id)}
    >
      {/* 우클릭 (or 컨텍스트) 메뉴 */}
      <div className="z-100">
        
        {menuVisible && currentContextMenuChatRoomId === chatRoom._id && (
          <ul
            ref={popupRef}
            className="absolute bg-white/80 text-[10px] sm:text-xs shadow-md list-none sm:p-2 p-1 rounded-xl z-100"
            style={{
              top: menuPosition.y - 50,
              left: menuPosition.x - 150,
              zIndex: 9999,
            }}
          >
            <li
              className="sm:px-4 sm:py-2 px-2 py-1 cursor-pointer hover:bg-gray-100"
              onClick={() => handleEditChatRoomName(chatRoom._id)}
            >
              <DynamicText text={t('EditName')} />
            </li>
            <li
              className="sm:px-4 sm:py-2 px-2 py-1 cursor-pointer hover:bg-gray-100"
              onClick={() => handleInviteChatRoom(chatRoom._id)}
            >
              <DynamicText text={t('InviteFriends')} />
            </li>
            <li
              className="sm:px-4 sm:py-2 px-2 py-1 cursor-pointer hover:bg-gray-100 text-red-500"
              onClick={() => handelExitChatRoom(chatRoom._id)}
            >
              <DynamicText text={t('Exit')} />
            </li>
          </ul>
        )}
      </div>

      {/* 목록 내부 */}
      <div className="flex justify-between relative ">

        {/** 사진, 이름, 방제목, 몇명인지, 마지막 메시지 */}
        <ul className="w-[70%]">
          {chatRoom.participants.length === 1 ? (
            // (1) 한 명일 때
            <li className="flex text-sm flex-col">
              <img
                src={chatRoom.participants[0].profileImage}
                alt={chatRoom.participants[0].name}
                width={30}
                height={30}
                className="rounded-full sm:w-8 sm:h-8 w-6 h-6 mr-2 border border-white object-cover"
              />
              <div className="flex flex-col text-customPurple">
                {/* 방 이름 or participant 이름 */}
                <div className="flex flex-nowrap text-customPurple overflow-hidden whitespace-nowrap text-ellipsis">
                  {editChatRoomName === chatRoom._id ? (
                    <div className=' w-full flex'>
                      <input
                        type="text"
                        value={title}
                        lang="ko"
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-[80%] h-2 sm:h-3 text-[10px] sm:text-xs text-customPurple border-customGray rounded-lg 
                                   focus:outline-none focus:ring-0 focus:border-customLightPurple"
                      />

                      <div className=" flex">
                        <Image
                          src="/SVG/confirm.svg"
                          alt="confirm"
                          width={15}
                          height={15}
                          priority
                          className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`}
                          onClick={() => {
                            fetchEditChatRoomName(chatRoom._id);
                          }}
                        />
                        <Image
                          src="/SVG/cancelChange.svg"
                          alt="cancelChange"
                          width={15}
                          height={15}
                          priority
                          className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`}
                          onClick={cancelEditChatRoom}
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      {!chatRoom.title && (
                        <DynamicText text={chatRoom.participants[0].name} className='sm:text-sm text-xs'/>
                      )}
                      {chatRoom.title && <DynamicText text={chatRoom.title} className='sm:text-sm text-xs'/>}
                    </>
                  )}
                </div>

                {/* 마지막 메시지 */}
                <div className="sm:text-xs text-[10px] text-gray-500 overflow-hidden text-ellipsis h-[18px]">
                  {chatRoom.messages.length > 0 ? (
                    <DynamicText
                      className=""
                      text={`${chatRoom.messages[chatRoom.messages.length - 1].senderInfo.name}: ${chatRoom.messages[chatRoom.messages.length - 1].text}`}
                    />
                  ) : (
                    <DynamicText text={t('Tmie')} />
                  )}
                </div>
              </div>
            </li>
          ) : (
            // (2) 여러 명일 때
            <div className="">
              {/* 참여자 프로필 이미지 표시 (겹침) */}
              <div className="relative flex">
                {chatRoom.participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className="absolute"
                    style={{
                      left: `${index * 20}px`,
                      zIndex: chatRoom.participants.length - index,
                    }}
                  >
                    <img
                      src={participant.profileImage}
                      alt={participant.name}
                      className="sm:w-8 sm:h-8 w-6 h-6 rounded-full border border-white object-cover"
                    />
                  </div>
                ))}
              </div>

              {/* 참여자 이름 or 방 제목 */}
              <div className="sm:mt-8 mt-6 flex h-[20px] w-full max-w-[100%] text-sm text-customPurple 
                              overflow-hidden whitespace-nowrap text-ellipsis"
              >
                <div className="flex  max-w-[90%]">
                  {editChatRoomName === chatRoom._id ? (
                    <div className='w-full flex'>
                      <input
                        type="text"
                        value={title}
                        lang="ko"
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-[80%] h-2 sm:h-3 text-[10px] sm:text-xs text-customPurple border-customGray 
                                   rounded-lg focus:outline-none focus:ring-0 focus:border-customLightPurple"
                      />

                      <div className=" flex">
                        <Image
                          src="/SVG/confirm.svg"
                          alt="confirm"
                          width={15}
                          height={15}
                          priority
                          className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`}
                          onClick={() => {
                            fetchEditChatRoomName(chatRoom._id);
                          }}
                        />
                        <Image
                          src="/SVG/cancelChange.svg"
                          alt="cancelChange"
                          width={15}
                          height={15}
                          priority
                          className={`cursor-pointer ${isAnimating ? 'animate__animated animate__flip' : ''}`}
                          onClick={cancelEditChatRoom}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className='flex '>
                      {/* 방에 title이 없으면, 참가자들 이름을 보여줌 */}
                      {!chatRoom.title && (
                        <div className='flex flex-wrap 
                              overflow-hidden whitespace-nowrap text-ellipsis items-center'>
                          {chatRoom.participants.map((p, idx) => (
                            <span key={p.id} className='text-xs sm:text-sm'>
                            {idx === chatRoom.participants.length - 1 ? (
                              <DynamicText text={p.name} className='text-xs sm:text-sm' />
                            ) : (
                              <>
                                <DynamicText text={p.name+','} className='text-xs sm:text-sm' /> {' '}
                              </>
                            )}
                          </span>
                          ))}
                        </div>
                      )}
                      {/* 방 title이 있으면 표시 */}
                      {chatRoom.title && (
                        <div className="sm:mr-2 mr-1 text-customPurple">
                          <DynamicText text={chatRoom.title} className='text-xs sm:text-sm'/>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* 인원수 */}
                <div className="text-[10px] sm:text-xs text-gray-500">
                  <DynamicText text={String(chatRoom.participants.length)} />
                </div>
              </div>

              {/* 마지막 메세지 */}
              <div className="text-[10px] sm:text-xs text-gray-500 overflow-hidden text-ellipsis h-[18px]">
                {chatRoom.messages.length > 0 ? (
                  <DynamicText
                    text={`${chatRoom.messages[chatRoom.messages.length - 1].senderInfo.name}: ${chatRoom.messages[chatRoom.messages.length - 1].text}`}
                  />
                ) : (
                  <DynamicText text={t('Tmie')} />
                )}
              </div>

              {/* 안 읽은 메시지 수 표시 */}
              {unreadCount > 0 && (
                <span className="absolute bottom-0 right-0 bg-customLightPurple text-white text-[10px] sm:text-xs rounded-full px-2 py-1">
                  {unreadCount}
                </span>
              )}
            </div>
          )}
        </ul>

        {/* 날짜/시간 */}
        <div className="sm:text-xs text-[10px] flex-nowrap text-gray-500 w-[60px] flex justify-end">
          {chatRoom.messages.length > 0 ? (
            (() => {
              const messageDate = new Date(
                chatRoom.messages[chatRoom.messages.length - 1].createdAt
              );
              const today = new Date();
              const isToday =
                messageDate.getFullYear() === today.getFullYear() &&
                messageDate.getMonth() === today.getMonth() &&
                messageDate.getDate() === today.getDate();

              if (isToday) {
                // 오늘이면 시:분 표시
                return new Intl.DateTimeFormat(t('lang'), {
                  hour: 'numeric',
                  minute: 'numeric',
                  hour12: true,
                }).format(messageDate);
              } else {
                // 아니면 MM-DD 표시
                return new Intl.DateTimeFormat(t('lang'), {
                  month: '2-digit',
                  day: '2-digit',
                }).format(messageDate);
              }
            })()
          ) : (
            <span />
          )}
        </div>
      </div>
    </div>
  );
}
