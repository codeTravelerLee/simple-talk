/*
2026.01.08 개발시작
채팅 홈 화면의 왼쪽 사이드바에서,
목록으로 뜨는 사용자 한명한명을 표시할 컴포넌트
이 컴포넌트를 클릭하면 그 사용자와 채팅이 가능해진다.
*/
import React from "react";
import { useChatStore } from "../../store/useChatStore";

const UserItem = ({ user }) => {
  const { selectedChatPartner, setSelectedChatPartner } = useChatStore();

  const handleClick = () => {
    setSelectedChatPartner(user);
  };

  const isSelected = selectedChatPartner?._id === user._id;

  return (
    <div
      onClick={handleClick}
      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-blue-50 border-r-2 border-blue-500" : ""
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          {user.profileImg ? (
            <img
              src={user.profileImg}
              alt={user.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-gray-500 truncate">{user.email}</p>
        </div>
      </div>
    </div>
  );
};

export default UserItem;
