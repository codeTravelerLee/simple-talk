/*
2026.01.12 개발시작
새 채팅을 시작하기 위한 모달.
친구 목록을 표시하고, 체크박스로 다중 선택 가능.
1명 선택: 1:1 채팅
2명 이상 선택: 단체 채팅
*/

import React, { useState, useEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { X } from "lucide-react";

const CreateChatModal = ({ isOpen, onClose }) => {
  const { 
    users, 
    getUsers, 
    isFetchingUsers, 
    setSelectedChatPartner,
    createRoom,  
    isCreatingRoom,
    setSelectedRoom, 
  } = useChatStore();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [roomName, setRoomName] = useState(""); // 단체채팅방 이름

  useEffect(() => {
    if (isOpen) {
      getUsers(); //서비스 사용자 불러오기 
      setSelectedUsers([]); //대화상대 초기화 
      setRoomName(""); // 방 이름 초기화
    }
  }, [isOpen, getUsers]);

  const handleToggleUser = (user) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.some((u) => u._id === user._id);

      if (isSelected) {
        return prev.filter((u) => u._id !== user._id);
      } else {
        return [...prev, user];
      }
    });
  };

  const handleStartChat = async () => {
    if (selectedUsers.length === 0) return;

    try {
      // 선택한 사용자들의 ID만 추출
      const participantIds = selectedUsers.map((user) => user._id);

      if (selectedUsers.length === 1) {
        // 1:1 채팅방 생성 (이름은 컨트롤러 안에서 상대방 이름으로 설정)
        const room = await createRoom(participantIds, null);
        setSelectedRoom(room);
        onClose();
      } else {
        // 단체 채팅 (2명 이상)
        // 방 이름이 없으면 기본 이름 생성
        const defaultName = roomName.trim() || 
          `${selectedUsers.map(u => u.fullName).join(", ")} 외 단체 채팅`;
        
        const room = await createRoom(participantIds, defaultName);
        setSelectedRoom(room);
        onClose();
      }
    } catch (error) {
      console.error("채팅방 생성 실패:", error);
      // 에러는 Store에서 toast로 표시됨
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-h-[600px] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">새 채팅 시작</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* 선택된 사용자 수 */}
        <div className="px-4 py-2 bg-blue-50 border-b">
          <p className="text-sm text-gray-700">
            {selectedUsers.length === 0
              ? "친구를 선택하세요"
              : selectedUsers.length === 1
              ? "1:1 채팅"
              : `단체 채팅 (${selectedUsers.length}명)`}
          </p>
        </div>

        {/* 단체 채팅 방 이름 입력 (2명 이상 선택 시) */}
        {selectedUsers.length >= 2 && (
          <div className="px-4 py-3 border-b">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              채팅방 이름 (선택사항)
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="예: 프로젝트 팀"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">
              입력하지 않으면 참여자 이름으로 자동 설정됩니다
            </p>
          </div>
        )}

        {/* 친구 목록 */}
        <div className="flex-1 overflow-y-auto p-4">
          {isFetchingUsers ? (
            <div className="text-center text-gray-500 py-8">
              친구 목록을 불러오는 중...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              친구가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {users.map((user) => {
                const isSelected = selectedUsers.some(
                  (u) => u._id === user._id
                );
                return (
                  <div
                    key={user._id}
                    onClick={() => handleToggleUser(user)}
                    className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-100 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    {/* 체크박스 */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 text-blue-600 rounded"
                    />

                    {/* 프로필 */}
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.profileImg ? (
                        <img
                          src={user.profileImg}
                          alt={user.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {/[가-힣]/.test(user.fullName.charAt(0))
                            ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[
                                Math.floor(Math.random() * 26)
                              ]
                            : user.fullName.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* 이름과 이메일 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t">
          <button
            onClick={handleStartChat}
            disabled={selectedUsers.length === 0 || isCreatingRoom}
            className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
              selectedUsers.length === 0 || isCreatingRoom
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isCreatingRoom
              ? "채팅방 생성 중..."
              : selectedUsers.length === 0
              ? "친구를 선택하세요"
              : selectedUsers.length === 1
              ? "1:1 채팅 시작"
              : `단체 채팅 시작 (${selectedUsers.length}명)`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal;
