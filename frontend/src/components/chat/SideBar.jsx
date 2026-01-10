/*2026.01.08 개발시작
채팅 홈 화면에서, 왼쪽에 보여줄 사이드바.
사용자의 목록이 나열되고, 특정 사용자를 클릭하면
해당 사용자와의 채팅이 가능하다.
*/

import React, { useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import UserItem from "./UserItem";

const SideBar = ({ onClose }) => {
  const { users, getUsers, isFetchingUsers } = useChatStore();

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900" title="대화상대 고르기">채팅</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isFetchingUsers ? (
          <div className="p-4 text-center text-gray-500">
            사용자를 불러오는 중...
          </div>
        ) : users.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            대화를 나눌 수 있는 상대가 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <UserItem key={user._id} user={user} onClose={onClose} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
