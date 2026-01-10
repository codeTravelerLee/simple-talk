/*
대화창 
*/

import React, { useState, useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import { Send, Plus, Image } from "lucide-react";

const ChatContainer = () => {
  const {
    selectedChatPartner,
    messages,
    getMessageByRecipientId,
    sendMessage,
    sendImageMessage,
  } = useChatStore();

  const [newMessage, setNewMessage] = useState("");
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (selectedChatPartner) {
      getMessageByRecipientId(selectedChatPartner._id);
    }
  }, [selectedChatPartner, getMessageByRecipientId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(selectedChatPartner._id, newMessage.trim());
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
      await sendImageMessage(selectedChatPartner._id, selectedFile);
      setSelectedFile(null);
    } catch (error) {
      console.error("이미지 전송 실패:", error);
    }
  };

  if (!selectedChatPartner) return null;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 상단 헤더 */}
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
          {selectedChatPartner.profileImg ? (
            <img
              src={selectedChatPartner.profileImg}
              alt={selectedChatPartner.fullName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 text-sm font-medium">
              {selectedChatPartner.fullName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedChatPartner.fullName}
        </h2>
      </div>

      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(Boolean).map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderId === selectedChatPartner._id
                ? "justify-start"
                : "justify-end"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.senderId === selectedChatPartner._id
                  ? "bg-gray-200 text-gray-900"
                  : "bg-blue-500 text-white"
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
        ))}
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
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <button
            type="button"
            onClick={handleAttachClick}
            className="p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            <Plus size={20} />
          </button>
          {showAttachMenu && (
            <div className="absolute bottom-full mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2">
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
