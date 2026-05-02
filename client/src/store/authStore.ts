import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type User = {
  id: number;
  email: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  // state
  user: null,
  token: null,

  // actions
  setAuth: async (user, token) => {
    await SecureStore.setItemAsync("token", token);
    set({
      user,
      token,
    });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync("token");
    set({
      user: null,
      token: null,
    });
  },
}));
