/*
대화창 
*/

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useChatStore } from "../../store/useChatStore";
import { useAuthStore } from "../../store/useAuthStore"; 
import { Send, Plus, Image } from "lucide-react";

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
  } = useChatStore();

  const { authUser } = useAuthStore(); // 현재 로그인한 사용자

  const [newMessage, setNewMessage] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const attachMenuRef = useRef(null);

  // 메시지 불러오기 (1:1 채팅 또는 채팅방)
  useEffect(() => {
    if (selectedRoom) {
      // 채팅방 메시지 불러오기
      getRoomMessages(selectedRoom._id);
    } else if (selectedChatPartner) {
      // 1:1 채팅 메시지 불러오기
      getMessageByRecipientId(selectedChatPartner._id);
    }
  }, [selectedRoom, selectedChatPartner, getRoomMessages, getMessageByRecipientId]);

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

  useLayoutEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // 현재 대화 대상 (채팅방 또는 1:1 상대)
  const currentChat = selectedRoom || selectedChatPartner;

  if (!currentChat) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 상단 헤더 */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
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

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(Boolean).map((message) => {
          // 내가 보낸 메시지인지 확인
          const isMyMessage = message.senderId._id === authUser._id || 
                             message.senderId === authUser._id;
          
          return (
            <div
              key={message._id}
              className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
            >
              <div className="flex flex-col max-w-xs lg:max-w-md">
                {/* 단체 채팅이고 내 메시지가 아니면 보낸 사람 이름 표시 */}
                {selectedRoom?.isGroupChat && !isMyMessage && (
                  <span className="text-xs text-gray-500 mb-1 ml-2">
                    {message.senderId.fullName || "알 수 없음"}
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
            </div>
          );
        })}
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
        <form onSubmit={handleSendMessage} className="flex space-x-2 relative">
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
  );
};

export default ChatContainer;
