"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const BASE_URL = "https://suredealbackend-production-8780.up.railway.app";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    // Create the socket instance
    const socketInstance = io(BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("✅ Connected:", socketInstance.id);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
    };
  }, []);

  return socket;
};