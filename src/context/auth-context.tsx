"use client";

import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { auth } from "../lib/firebase";
import { apiService } from "../lib/api"; 
import { AuthStorage } from "../lib/auth-storage"; 
import { useRouter } from "next/navigation";


export interface Contact {
  label: string;
  sdNumber: string;
  city?: string;
  country?: string;
}

export interface User {
  id: string;
  email: string;
  roles: string[];
  status: string;
  sdNumber: string;
  displayName: string | null;
  profilePhoto: string | null;
  bio: string | null;
  flags: {
    isFraud: boolean;
    isVerified: boolean;
  };
  badges: string[];
  addressBook?: Contact[];
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null); 
  //const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(() => {
    // This runs only ONCE during the very first component creation
    if (typeof window !== "undefined") {
      return AuthStorage.getUserData();
    }
    return null;
  });
  // 1. Define logout FIRST so other functions can use it
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      AuthStorage.clearAll();
      setUser(null);
      setFirebaseUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, [router]);

  // 2. Define refreshUser with useCallback to fix the dependency error
  const refreshUser = useCallback(async () => {
    try {
      const jwt = await auth.currentUser?.getIdToken();
      setToken(jwt || null);
      const res = await apiService.get("auth/me");
      const userData = res.data.user;
      setUser(userData);
      AuthStorage.setUserData(userData);
    } catch (error) {
      console.error("Failed to sync backend user:", error);
      if (auth.currentUser) await logout(); // Now 'logout' is available!
    }
  }, [logout]);

  // 3. The main auth listener
  useEffect(() => {
    // REMOVED: The synchronous setUser(storedUser) is gone from here!
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setFirebaseUser(null);
        AuthStorage.clearAll();
        setIsLoading(false);
        return;
      }

      setFirebaseUser(fbUser);
      await refreshUser();
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [refreshUser]);
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!firebaseUser,
        isLoading,
        user,
        token,
        firebaseUser,
        setUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};