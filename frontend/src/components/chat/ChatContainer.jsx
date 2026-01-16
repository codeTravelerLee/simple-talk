/*
대화창 
*/

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore";
import { Send, Plus, Image, Menu, X } from "lucide-react";

const ChatContainer = () => {
  const {
    selectedChatPartner,
    selectedRoom,
    messages,
    getMessageByRecipientId,
    getRoomMessages,
    sendMessage,
    sendRoomMessage,
    sendImageMessage,
    sendRoomImageMessage,
    markRoomMessagesAsRead,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const currentUserId = authUser?._id;

  const [newMessage, setNewMessage] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showParticipantsPanel, setShowParticipantsPanel] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  // 채팅방 선택(접속)
  useEffect(() => {
    const loadMessagesAndMarkAsRead = async () => {
      try {
        if (selectedRoom) {
          await getRoomMessages(selectedRoom._id); // 단체채팅방 메시지 불러오기
        } else if (selectedChatPartner) {
          await getMessageByRecipientId(selectedChatPartner._id); // 1:1 채팅 메시지 불러오기
        }
        // 메시지 읽음 처리
        if (selectedRoom) {
          await markRoomMessagesAsRead(selectedRoom._id);
        }
      } catch (error) {
        console.error("메시지 불러오기 실패:", error);
      }
    };

    loadMessagesAndMarkAsRead();
  }, [
    selectedRoom,
    selectedChatPartner,
    getRoomMessages,
    getMessageByRecipientId,
    markRoomMessagesAsRead,
  ]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        attachMenuRef.current &&
        !attachMenuRef.current.contains(event.target)
      ) {
        setShowAttachMenu(false);
      }
    };

    if (showAttachMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachMenu]);

  //채팅방 화면을 자동으로 말풍선 최하단으로 스크롤다운
  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //텍스트 메시지 전송버튼 클릭시
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      if (selectedRoom) {
        // 채팅방에 메시지 보내기
        await sendRoomMessage(selectedRoom._id, newMessage.trim());
      } else if (selectedChatPartner) {
        // 1:1 채팅 메시지 보내기
        await sendMessage(selectedChatPartner._id, newMessage.trim());
      }
      setNewMessage("");
    } catch (error) {
      console.error("메시지 전송 실패:", error);
    }
  };

  //파일첨부 버튼 클릭시
  const handleAttachClick = () => {
    setShowAttachMenu(!showAttachMenu);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowAttachMenu(false);
    }
  };

  //이미지 전송버튼 클릭시
  const handleSendImage = async () => {
    if (!selectedFile) return;

    try {
      if (selectedRoom) {
        // 채팅방에 이미지 보내기
        await sendRoomImageMessage(selectedRoom._id, selectedFile);
      } else if (selectedChatPartner) {
        // 1:1 채팅 이미지 보내기
        await sendImageMessage(selectedChatPartner._id, selectedFile);
      }
      setSelectedFile(null);
    } catch (error) {
      console.error("이미지 전송 실패:", error);
    }
  };

  //채팅방 안에서 오른쪽 메뉴 아이콘 클릭시
  const handleChatMenuIconClick = async () => {
    setShowParticipantsPanel(!showParticipantsPanel);
  };

  // 현재 대화 대상 (채팅방 또는 1:1 상대)
  const currentChat = selectedRoom || selectedChatPartner;

  if (!currentChat) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center">
          {selectedRoom ? (
            // 채팅방 헤더
            <>
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-medium">
                  {selectedRoom.participants?.length || 0}
                </span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedRoom.name}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedRoom.isGroupChat
                    ? `${selectedRoom.participants?.length || 0}명 참여 중`
                    : "1:1 채팅"}
                </p>
              </div>
            </>
          ) : (
            // 1:1 채팅 헤더
            <>
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                {selectedChatPartner?.profileImg ? (
                  <img
                    src={selectedChatPartner.profileImg}
                    alt={selectedChatPartner.fullName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 text-sm font-medium">
                    {selectedChatPartner?.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedChatPartner?.fullName}
              </h2>
            </>
          )}
        </div>
        <button
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label="메뉴"
          onClick={handleChatMenuIconClick}
        >
          <Menu size={24} className="text-gray-700" />
        </button>
      </div>

      {/* 메인 컨텐츠 영역 (채팅 + 사이드 패널) */}
      <div className="flex flex-1 overflow-hidden">
        {/* 메인 채팅 영역 */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            showParticipantsPanel ? "w-1/2" : "w-full"
          }`}
        >
          {/* 메시지 영역 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!currentUserId ? (
              <div className="text-center text-gray-500">
                사용자 정보를 불러오는 중...
              </div>
            ) : (
              messages.filter(Boolean).map((message, index) => {
                // 내가 보낸 메시지인지 확인
                // senderId가 객체인 경우와 문자열인 경우 모두 처리
                const messageSenderId =
                  typeof message.senderId === "object"
                    ? message.senderId?._id
                    : message.senderId;

                const isMyMessage = messageSenderId === currentUserId;

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isMyMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div className="flex items-end gap-1">
                      <div className="flex flex-col max-w-xs lg:max-w-md">
                        {/* 단체 채팅이고 내 메시지가 아니면 보낸 사람 이름 표시 */}
                        {selectedRoom?.isGroupChat && !isMyMessage && (
                          <span className="text-xs text-gray-500 mb-1 ml-2">
                            {typeof message.senderId === "object"
                              ? message.senderId.fullName || "알 수 없음"
                              : "알 수 없음"}
                          </span>
                        )}

                        <div
                          className={`px-4 py-2 rounded-lg ${
                            isMyMessage
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          {message.image ? (
                            <img
                              src={message.image}
                              alt="이미지"
                              className="max-w-full rounded"
                            />
                          ) : (
                            <p className="text-sm">{message.message}</p>
                          )}
                          <p className="text-xs mt-1 opacity-70">
                            {new Date(message.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* 상대방이 보낸 메시지에만 읽음 표시 (오른쪽) */}
                      {!isMyMessage && (
                        <span className="text-xs text-gray-500 mb-1">
                          {message.isRead ? "읽음" : "안읽음"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 메시지 입력 영역 */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            {selectedFile && (
              <div className="mb-2 flex items-center space-x-2">
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="선택된 이미지"
                  className="w-16 h-16 object-cover rounded"
                />
                <button
                  onClick={handleSendImage}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  전송
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  취소
                </button>
              </div>
            )}
            <form
              onSubmit={handleSendMessage}
              className="flex space-x-2 relative"
            >
              <button
                type="button"
                onClick={handleAttachClick}
                className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                <Plus size={20} />
              </button>
              {showAttachMenu && (
                <div
                  ref={attachMenuRef}
                  className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50"
                >
                  <button
                    onClick={handleFileSelect}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                  >
                    <Image size={16} />
                    <span>사진</span>
                  </button>
                </div>
              )}
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="메시지를 입력하세요..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </form>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        </div>

        {/* 참여자 패널 */}
        {showParticipantsPanel && (
          <div className="w-1/2 border-l border-gray-200 bg-gray-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                참여자{" "}
                {selectedRoom
                  ? `(${selectedRoom.participants?.length || 0})`
                  : "(2)"}
              </h3>
              <button
                onClick={() => setShowParticipantsPanel(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="닫기"
              >
                <X size={20} className="text-gray-700" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {selectedRoom ? (
                // 단체 채팅 참여자 목록
                <div className="space-y-2">
                  {(selectedRoom.participants || []).map((participant) => (
                    <div
                      key={participant._id}
                      className="flex items-center p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        {participant.profileImg ? (
                          <img
                            src={participant.profileImg}
                            alt={participant.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-600 text-sm font-medium">
                            {participant.fullName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {participant.fullName}
                          {participant._id === authUser._id && " (나)"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {participant.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 1:1 채팅 참여자 목록
                <div className="space-y-2">
                  <div className="flex items-center p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      {authUser.profileImg ? (
                        <img
                          src={authUser.profileImg}
                          alt={authUser.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">
                          {authUser.fullName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {authUser.fullName} (나)
                      </p>
                      <p className="text-xs text-gray-500">{authUser.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-white rounded-lg">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                      {selectedChatPartner?.profileImg ? (
                        <img
                          src={selectedChatPartner.profileImg}
                          alt={selectedChatPartner.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 text-sm font-medium">
                          {selectedChatPartner?.fullName
                            ?.charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {selectedChatPartner?.fullName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedChatPartner?.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
