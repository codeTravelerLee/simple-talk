/*
2026.01.08 개발시작
채팅 홈 화면의 왼쪽 사이드바에서,
목록으로 뜨는 사용자 한명한명을 표시할 컴포넌트
이 컴포넌트를 클릭하면 그 사용자와 채팅이 가능해진다.
*/
import React, { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";

import {
  formatDateForChatList,
  formatlastSocketConnection,
} from "../../utils/dateFormatter";
import { Users } from "lucide-react";

const UserItem = ({ user, room, lastMessage, onClose }) => {
  const {
    selectedChatPartner,
    setSelectedChatPartner,
    selectedRoom,
    setSelectedRoom,
    onlineUsers,
    userStatus,
    getUserStatus,
    markRoomMessagesAsRead,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const currentUserId = authUser?._id;

  const [localLastSocketConnection, setLocalLastSocketConnection] =
    useState(null);

  // 사용자의 온라인 상태 확인
  const isOnline = user && onlineUsers.includes(user._id);

  // 컴포넌트 마운트 시 사용자 소켓 접속 상태 조회 (개인 채팅이고 오프라인인 경우)
  useEffect(() => {
    if (user && !isOnline && !room) {
      getUserStatus(user._id);
    }
  }, [user, isOnline, room]);

  // userStatus에서 lastSocketConnection 정보 가져오기
  useEffect(() => {
    if (user && userStatus[user._id]) {
      setLocalLastSocketConnection(userStatus[user._id].lastSocketConnection);
    } else if (user?.lastSocketConnection) {
      // API 응답에 lastSocketConnection이 포함된 경우
      setLocalLastSocketConnection(user.lastSocketConnection);
    }
  }, [user, userStatus]);

  const handleClick = async () => {
    if (room) {
      // 단체채팅방인 경우
      setSelectedRoom(room);
      setSelectedChatPartner(null);
      await markRoomMessagesAsRead(room._id, currentUserId);
    } else {
      // 1:1 채팅인 경우
      setSelectedChatPartner(user);
      setSelectedRoom(null);
      await markRoomMessagesAsRead(room._id, currentUserId);
    }
    if (onClose) onClose();
  };

  const isSelected = room
    ? selectedRoom && selectedRoom._id === room._id
    : selectedChatPartner && user && selectedChatPartner._id === user._id;

  return (
    <div
      onClick={handleClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative w-10 h-10">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {room ? (
              // 단체채팅방인 경우
              <Users className="text-gray-600" size={20} />
            ) : user?.profileImg ? (
              <img
                src={user.profileImg}
                alt={user?.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              // 설정한 프로필 사진이 없으면 fullName의 첫 글자를 이니셜로 따서 기본 프사 지정, 한글이면 A~Z중 아무글자 랜덤
              <span className="text-gray-600 font-medium">
                {/[가-힣]/.test(user?.fullName?.charAt(0))
                  ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)]
                  : user?.fullName?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* 온라인 상태 표시 (개인 채팅인 경우에만) */}
          {!room && isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* 친구 이름이나 단톡방의 이름이 표시되는 영역 */}
          <p className="text-sm font-medium text-gray-900 truncate">
            {room ? room.name : user?.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {/* 
            lastMessage가 존재하는 경우는 SideBar의 채팅 탭을 선택한 경우임.
            lastMessage가 존재하지만 message가 없으면 이미지만 전송한 경우이므로 "사진을 보냈습니다 문구 표시"
            lastMessage가 없으면 친구 탭을 선택한 경우이므로 온라인 상태를 표시 
             */}
            {lastMessage
              ? room
                ? lastMessage // room의 lastMessage는 문자열로 저장됨
                : lastMessage.message || "사진을 보냈습니다."
              : !room && (isOnline || localLastSocketConnection !== undefined)
              ? formatlastSocketConnection(
                  isOnline ? null : localLastSocketConnection
                )
              : user?.email}

            {/* 몇분전 나눈 채팅인지 표시  */}
            {room ? (
              // 단체채팅방인 경우 lastMessageAt 사용
              room.lastMessageAt ? (
                <span className="ml-2 text-xs text-gray-400">
                  {formatDateForChatList(room.lastMessageAt)}
                </span>
              ) : null
            ) : lastMessage?.createdAt ? (
              // 개인채팅인 경우 lastMessage.createdAt 사용
              <span className="ml-2 text-xs text-gray-400">
                {formatDateForChatList(lastMessage.createdAt)}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserItem;
