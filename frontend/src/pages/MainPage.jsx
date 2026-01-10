import React, { useState } from "react";
import { useChatStore } from "../store/useChatStore";

import Navbar from "../components/navbar/Navbar";
import SideBar from "../components/chat/SideBar";
import NoChat from "../components/chat/NoChat";
import ChatContainer from "../components/chat/ChatContainer";
import { Users } from "lucide-react";

const MainPage = () => {
  const {
    users,
    messages,
    selectedChatPartner,
    error,
    isFetchingUsers,
    isFetchingMessages,
  } = useChatStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 상단 내비게이션 바 */}
      <Navbar />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 모바일 사이드바 토글 버튼 */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden fixed top-20 left-4 z-50 bg-white p-2 rounded-full shadow-lg border border-gray-200"
        >
          <Users size={20} />
        </button>

        {/* 화면 좌측: 대화상대 목록이 나오는 사이드바 */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <SideBar onClose={() => setIsSidebarOpen(false)} />
          </div>
        )}
        <div className="hidden md:block w-80">
          <SideBar />
        </div>

        {/* 오버레이 for 모바일 */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* 화면 우측: 채팅화면 */}
        {/* 대화상대 선택시 해당 유저와의 채팅내역 표시, 없으면 기본화면 표시 */}
        <div className="flex-1 overflow-hidden md:ml-0">
          {selectedChatPartner ? <ChatContainer /> : <NoChat />}
        </div>
      </div>
    </div>
  );
};

export default MainPage;
