import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  loading: false,
  error: null,
  //회원가입시 각 절차가 완료되었는자를 표시
  signupProgress: {
    termsAgreed: false,
    methodSelected: false,
    emailVerified: false,
    signupCompleted: false,
    email: "",
  },

  //현재 로그인된 사용자의 정보를 요청
  getCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get("/api/v1/auth/current");
      const currentUser = response.data.currentUser;

      set({ authUser: currentUser });

      return currentUser;
    } catch (error) {
      set({ authUser: null, error: error.response?.data?.error });
      throw new Error(
        error.response?.data?.error ||
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
      set({ error: error.response?.data?.error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email, fullName, password, passwordConfirm) => {
    set({ loading: true, error: null });

    try {
      const response = await axiosInstance.post("/api/v1/auth/signup", {
        email,
        fullName,
        password,
        passwordConfirm,
      });

      const userData = response.data.userData;
      set({ authUser: userData });

      return userData;
    } catch (error) {
      set({ error: error.response?.data?.error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/api/v1/auth/logout");
      set({ authUser: null });
    } catch (error) {
      set({ error: error.response?.data?.error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => {
    set({ error: null });
  },

  setSignupProgress: (step, value) =>
    set((state) => ({
      signupProgress: {
        ...state.signupProgress,
        [step]: value,
      },
    })),

  resetSignupProgress: () =>
    set({
      signupProgress: {
        termsAgreed: false,
        methodSelected: false,
        emailVerified: false,
        signupCompleted: false,
        email: "",
      },
    }),
}));
