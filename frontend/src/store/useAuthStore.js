import { create } from "zustand";
import axiosInstance from "../api/axiosInstance";

export const useAuthStore = create((set) => ({
  authUser: null,
  loading: false,
  error: null,

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
}));
