// lib/auth-storage.ts
import { User } from "../context/auth-context";

const USER_DATA = "suredeal_user_data";

export const AuthStorage = {
  setUserData(user: User) {
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_DATA, JSON.stringify(user));
    }
  },

  getUserData(): User | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(USER_DATA);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  clearAll() {
    if (typeof window !== "undefined") {
      localStorage.removeItem(USER_DATA);
    }
  },
};