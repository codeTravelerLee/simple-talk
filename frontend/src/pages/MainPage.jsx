/*
채팅 홈화면. 
왼쪽엔 사용자 목록이 나타나는 <SideBar /> 컴포넌트, 
오른쪽에는 채팅 목록을 표시 
*/

import React from "react";
import { useChatStore } from "../store/useChatStore";

import SideBar from "../components/chat/SideBar";
import NoChat from "../components/chat/NoChat";
import ChatContainer from "../components/chat/ChatContainer";

const MainPage = () => {
  const {
    users,
    messages,
    selectedChatPartner,
    error,
    isFetchingUsers,
    isFetchingMessages,
  } = useChatStore();

  return (
    <div>
      {/* 화면 좌측: 대화상대 목록이 나오는 사이드바  */}
      <SideBar />

      {/* 화면 우측: 채팅화면 */}
      {/* 대화상대 선택시 해당 유저와의 채팅내역 표시, 없으면 기본화면 표시 */}
      {selectedChatPartner ? <ChatContainer /> : <NoChat />}
    </div>
  );
};

export default MainPage;
