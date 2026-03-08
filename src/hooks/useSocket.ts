"use client";
import { useEffect, useState, useMemo } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/auth-context"; 

const BASE_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "https://suredealbackend-production-8780.up.railway.app";

// We keep a reference outside the hook to ensure we don't recreate it 
// every time the hook is called in different components.
let globalSocket: Socket | null = null;

export const useSocket = () => {
  const { token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        setIsConnected(false);
      }
      return;
    }

    // Only create if it doesn't exist
    if (!globalSocket) {
      globalSocket = io(BASE_URL, {
        transports: ["websocket"],
        auth: { token },
        reconnection: true,
      });
    }

    // Subscribe to status changes (this is the "platform API" pattern React wants)
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    globalSocket.on("connect", onConnect);
    globalSocket.on("disconnect", onDisconnect);

    // Initial state check
    setIsConnected(globalSocket.connected);

    return () => {
      if (globalSocket) {
        globalSocket.off("connect", onConnect);
        globalSocket.off("disconnect", onDisconnect);
      }
    };
  }, [token]);

  // We return the global instance. useMemo ensures we aren't 
  // triggering downstream re-renders unless the connection status actually matters.
  return useMemo(() => globalSocket, [isConnected, token]);
};