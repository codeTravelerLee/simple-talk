import { create } from "zustand";
import toast from "react-hot-toast";

import axiosInstance from "../api/axiosInstance";
import { io } from "socket.io-client";

export const useChatStore = create((set, get) => ({
  users: [],
  messages: [],
  selectedChatPartner: null, //선택된 대화상대
  error: null,

  isFetchingUsers: false,
  isFetchingMessages: false,
  socket: null,

  //서비스 가입된 유저 전체 불러옴
  getUsers: async () => {
    set({ isFetchingUsers: true, error: null });
    try {
      const response = await axiosInstance.get("/api/v1/user");
      const usersArray = response.data.usersArray;

      set({ users: usersArray });
      return usersArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      throw new Error(errorMessage || "사용자를 불러오지 못했어요.");
    } finally {
      set({ isFetchingUsers: false });
    }
  },

  //특정 사용자와 주고받은 메시지 불러옴
  getMessageByRecipientId: async (recepientId) => {
    set({ isFetchingMessages: true });
    try {
      const response = await axiosInstance.get(
        `/api/v1/message/${recepientId}`
      );
      const messagesArray = response.data.messagesArray;

      set({ messages: messagesArray });

      return messagesArray;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      toast.error(error);

      throw new Error(errorMessage || "사용자를 불러오지 못했어요.");
    } finally {
      set({ isFetchingMessages: false });
    }
  },

  //대화상대 지정
  setSelectedChatPartner: (partner) => set({ selectedChatPartner: partner }),

  // Socket 연결
  connectSocket: (userId) => {
    const socket = io(import.meta.env.VITE_SERVER_URI, {
      query: { userId },
    });

    socket.on("newMessage", (message) => {
      set((state) => ({
        messages: [...state.messages, message],
      }));
    });

    set({ socket });
  },

  // Socket 연결 해제
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  //메시지 전송
  sendMessage: async (recipientId, message) => {
    try {
      const response = await axiosInstance.post("/api/v1/message", {
        receiverId: recipientId,
        message,
      });

      const newMessage = response.data.newMessage;

      // 메시지 목록에 새 메시지 추가
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      return newMessage;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      toast.error(errorMessage || "메시지 전송에 실패했습니다.");

      throw new Error(errorMessage || "메시지 전송 실패");
    }
  },

  //이미지 메시지 전송
  sendImageMessage: async (recipientId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("recipientId", recipientId);
      formData.append("image", imageFile);

      const response = await axiosInstance.post(
        "/api/v1/message/send-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newMessage = response.data.newMessage;

      // 메시지 목록에 새 메시지 추가
      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      return newMessage;
    } catch (error) {
      const errorMessage = error.response?.data?.message;
      set({ error: errorMessage });

      toast.error(errorMessage || "이미지 전송에 실패했습니다.");

      throw new Error(errorMessage || "이미지 전송 실패");
    }
  },
}));
