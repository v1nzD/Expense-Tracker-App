import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
};

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  hydrate: () => void;
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
  hydrate: async () => {
    const token = await SecureStore.getItemAsync("token");
    if (token) {
      // decode token to get user info
      const decoded = JSON.parse(atob(token.split(".")[1]));
      set({
        token,
        user: {
          id: decoded.id,
          email: decoded.email,
          first_name: decoded.first_name,
          last_name: decoded.last_name,
        },
      });
    }
  },
}));
