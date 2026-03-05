"use client";

import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { authEvents, AUTH_EVENTS } from "@/lib/auth-events";
import { useRouter, usePathname } from "next/navigation";
import "./globals.css";

function RootContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Handle Global Auth Events (e.g., Logout from other tabs or 401s)
  useEffect(() => {
    const handleUnauthorized = async () => {
      await logout();
      router.push("/login");
    };

    authEvents.on(AUTH_EVENTS.LOGOUT, handleUnauthorized);
    
    return () => {
      authEvents.off(AUTH_EVENTS.LOGOUT, handleUnauthorized);
    };
  }, [logout, router]);

  // Handle Protected Route Logic
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === "/login" || pathname === "/register";
      if (!isAuthenticated && !isAuthPage) {
        router.push("/login");
      } else if (isAuthenticated && isAuthPage) {
        router.push("/");
      }
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <RootContent>{children}</RootContent>
        </AuthProvider>
      </body>
    </html>
  );
}