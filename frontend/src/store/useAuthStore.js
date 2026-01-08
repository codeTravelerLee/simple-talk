import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useAuthStore = create((set) => ({
  authUser: null,
  loading: false,
  error: null,

  //현재 로그인된 사용자의 정보를 요청
  getCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/v1/auth/current");
      const currentUser = response.data.currentUser;

      set({ authUser: currentUser });

      return currentUser;
    } catch (error) {
      set({ authUser: null, error: error.response?.data?.message });
      throw new Error(
        error.response?.data?.message ||
          "현재 로그인된 회원정보를 불러오는데 실패했어요."
      );
    } finally {
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.post("/api/v1/auth/login", {
        email,
        password,
      });

      const userData = response.data.userData;
      set({ authUser: userData });

      return userData;
    } catch (error) {
      set({ error: error.response?.data?.message });
      throw Error(error);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
