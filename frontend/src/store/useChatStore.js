import { create } from "zustand";
import toast from "react-hot-toast";

import axiosInstance from "../api/axiosInstance";

export const useChatStore = create((set) => ({
  users: [],
  messages: [],
  selectedChatPartner: null, //선택된 대화상대
  error: null,

  isFetchingUsers: false,
  isFetchingMessages: false,

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
}));
