/*
2026.01.08 개발시작
채팅 홈 화면의 왼쪽 사이드바에서,
목록으로 뜨는 사용자 한명한명을 표시할 컴포넌트
이 컴포넌트를 클릭하면 그 사용자와 채팅이 가능해진다.
*/
import React from "react";
import { useChatStore } from "../../store/useChatStore";
import { formatDateForChatList } from "../../utils/dateFormatter";
import { Users } from "lucide-react";

const UserItem = ({ user, room, lastMessage, onClose }) => {
  const { selectedChatPartner, setSelectedChatPartner, selectedRoom, setSelectedRoom } = useChatStore();

  const handleClick = () => {
    if (room) {
      // 단체채팅방인 경우
      setSelectedRoom(room);
      setSelectedChatPartner(null);
    } else {
      // 1:1 채팅인 경우
      setSelectedChatPartner(user);
      setSelectedRoom(null);
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
        <div className="flex-1 min-w-0">
          {/* 친구 이름이나 단톡방의 이름이 표시되는 영역 */}
          <p className="text-sm font-medium text-gray-900 truncate">
            {room ? room.name : user?.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {/* 
            lastMessage가 존재하는 경우는 SideBar의 채팅 탭을 선택한 경우임.
            lastMessage가 존재하지만 message가 없으면 이미지만 전송한 경우이므로 "사진을 보냈습니다 문구 표시"
            lastMessage가 없으면 친구 탭을 선택한 경우이므로 user.email을 표시 
             */}
            {lastMessage
              ? lastMessage.message || "사진을 보냈습니다."
              : user?.email}

            {/* 몇분전 나눈 채팅인지 표시  */}
            {lastMessage?.createdAt ? (
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
