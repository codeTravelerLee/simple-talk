/*2026.01.08 개발시작
채팅 홈 화면에서, 왼쪽에 보여줄 사이드바.
사용자의 목록이 나열되고, 특정 사용자를 클릭하면
해당 사용자와의 채팅이 가능하다.
*/

import React, { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import UserItem from "./UserItem";
import CreateChatModal from "./CreateChatModal";
import { Plus } from "lucide-react";

const SideBar = ({ onClose }) => {
  const {
    users,
    chats,
    rooms,
    getUsers,
    getChatList,
    getRooms,
    isFetchingUsers,
    isFetchingChats,
    isFetchingRooms,
    setSelectedChatPartner,
    setSelectedRoom,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState("friends");
  const [isCreateChatModalOpen, setIsCreateChatModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      switch (activeTab) {
        case "friends":
          await getUsers();
          break;

        case "chats":
          await Promise.all([getChatList(), getRooms()]); //1:1채팅, 단체채팅 목록 불러옴
          break;

        default:
          break;
      }
    };

    fetchData();

    //cleanup - 탭 변경 시 선택된 채팅 파트너, 채팅방 초기화
    return () => {
      setSelectedChatPartner(null);
      setSelectedRoom(null);
    };
  }, [
    activeTab,
    getUsers,
    getChatList,
    getRooms,
    setSelectedChatPartner,
    setSelectedRoom,
  ]);

  //선택한 탭에 맞춰 데이터를 담고 있는 배열
  const currentList =
    activeTab === "friends"
      ? users
      : [
          ...chats.filter((chat) => chat.user), // 1:1 채팅 목록
          ...rooms.filter((room) => room.isGroupChat), // 단체 채팅만 (중복 방지)
        ];

  const isFetching =
    activeTab === "friends"
      ? isFetchingUsers
      : isFetchingChats || isFetchingRooms;

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-2">
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

          {/* 새 채팅 시작 버튼 */}
          <button
            onClick={() => setIsCreateChatModalOpen(true)}
            className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
            title="새 채팅 시작"
          >
            <Plus size={20} />
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
            {currentList.map((item) => {
              // item이 단체채팅방인지 확인 (isGroupChat 속성으로 판단)
              const isRoom = item.isGroupChat === true;

              return (
                <UserItem
                  key={item._id}
                  user={
                    activeTab === "friends" ? item : isRoom ? null : item.user
                  }
                  room={isRoom ? item : null}
                  lastMessage={
                    activeTab === "friends" ? null : item.lastMessage
                  }
                  onClose={onClose}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* 새 채팅 모달 */}
      <CreateChatModal
        isOpen={isCreateChatModalOpen}
        onClose={() => setIsCreateChatModalOpen(false)}
      />
    </div>
  );
};

export default SideBar;
