/*2026.01.08 개발시작
채팅 홈 화면에서, 왼쪽에 보여줄 사이드바.
사용자의 목록이 나열되고, 특정 사용자를 클릭하면
해당 사용자와의 채팅이 가능하다.
*/

import React, { useEffect, useState, useMemo } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
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

  const { authUser } = useAuthStore();

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
  const currentList = useMemo(() => {
    if (activeTab === "friends") {
      // friends 탭도 동일한 구조로 정규화
      return users.map((user) => ({
        _id: user._id,
        isGroupChat: false,
        user: user,
        room: null,
        lastMessage: null,
        lastMessageTime: null,
      }));
    }

    //activeTab이 "chats" 탭인 경우
    // rooms에 1:1 채팅과 단체 채팅이 모두 포함되어 있으므로 rooms만 사용
    const normalizedRooms = rooms.map((room) => {
      // 1:1 채팅방인 경우 상대방 정보 찾기
      if (!room.isGroupChat) {
        const partner = room.participants?.find((p) => p._id !== authUser?._id);
        return {
          _id: room._id,
          isGroupChat: false,
          user: partner, // 1:1 채팅방의 상대방
          room: room,
          lastMessage: room.lastMessage,
          lastMessageTime: room.lastMessageAt || room.updatedAt,
        };
      }
      // 단체 채팅방인 경우
      return {
        _id: room._id,
        isGroupChat: true,
        user: null,
        room: room,
        lastMessage: room.lastMessage,
        lastMessageTime: room.lastMessageAt || room.updatedAt,
      };
    });

    // 최근 메시지 시간 기준으로 정렬
    return normalizedRooms.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || 0);
      const timeB = new Date(b.lastMessageTime || 0);
      return timeB - timeA;
    });
  }, [activeTab, users, chats, rooms, authUser]);

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
            {currentList.map((item) => (
              <UserItem
                key={item._id}
                user={item.user}
                room={item.room}
                lastMessage={item.lastMessage}
                onClose={onClose}
              />
            ))}
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
