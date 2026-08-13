import { create } from "zustand";

import {
  loginUser,
  registerUser,
  logoutUser,
  getMe,
} from "@/services/auth.service";
import { queryClient } from "@/api/queryClient";

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  fetchCurrentUser: async () => {
    try {
      const response = await getMe();
      set({ user: response.user });
    } catch {
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

  login: async (credentials) => {
    const response = await loginUser(credentials);
    set({ user: response.user });
    return response;
  },

  register: async (userData) => {
    const response = await registerUser(userData);
    return response;
  },

  logout: async () => {
    await logoutUser();
    // Wipe all cached server data — queries are user-scoped, so nothing
    // should leak across sessions.
    queryClient.clear();
    set({ user: null });
  },
}));

export default useAuthStore;