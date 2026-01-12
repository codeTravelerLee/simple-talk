/*2026.01.08 개발시작
채팅 홈 화면에서, 왼쪽에 보여줄 사이드바.
사용자의 목록이 나열되고, 특정 사용자를 클릭하면
해당 사용자와의 채팅이 가능하다.
*/

import React, { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import UserItem from "./UserItem";

const SideBar = ({ onClose }) => {
  const {
    users,
    chats,
    getUsers,
    getChatList,
    isFetchingUsers,
    isFetchingChats,
    setSelectedChatPartner,
  } = useChatStore();
  const [activeTab, setActiveTab] = useState("friends");

  useEffect(() => {
    switch (activeTab) {
      case "friends":
        getUsers();
        break;

      case "chats":
        getChatList();
        break;

      default:
        break;
    }
    // 탭 변경 시 선택된 채팅 파트너 초기화
    setSelectedChatPartner(null);
  }, [activeTab, getUsers, getChatList, setSelectedChatPartner]);

  //선택한 탭에 맞춰 데이터를 담고 있는 배열
  const currentList =
    activeTab === "friends" ? users : chats.filter((chat) => chat.user);

  const isFetching =
    activeTab === "friends" ? isFetchingUsers : isFetchingChats;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex space-x-2 mb-2">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "friends"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("friends")}
          >
            친구
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "chats"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            onClick={() => setActiveTab("chats")}
          >
            채팅
          </button>
        </div>
        <h2
          className="text-lg font-semibold text-gray-900"
          title={activeTab === "friends" ? "대화상대 고르기" : "채팅 목록"}
        >
          {activeTab === "friends" ? "친구" : "채팅"}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isFetching ? (
          <div className="p-4 text-center text-gray-500">
            {activeTab === "friends"
              ? "사용자를 불러오는 중..."
              : "채팅 목록을 불러오는 중..."}
          </div>
        ) : currentList.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {activeTab === "friends"
              ? "대화를 나눌 수 있는 상대가 없습니다."
              : "채팅 내역이 없습니다."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {currentList.map((item) => (
              <UserItem
                key={item._id}
                user={activeTab === "friends" ? item : item.user}
                lastMessage={activeTab === "friends" ? null : item.lastMessage}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
