"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi } from "lucide-react";

export const OfflineStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Sync with browser state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      // Briefly show "Back Online" then hide
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 transform ${
        showStatus ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className={`px-4 py-2 flex items-center justify-center gap-2 shadow-md ${
        isOnline ? "bg-emerald-500" : "bg-gray-900"
      }`}>
        {isOnline ? (
          <>
            <Wifi size={14} className="text-white" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">
              Back Online • Syncing SureDeal...
            </span>
          </>
        ) : (
          <>
            <WifiOff size={14} className="text-amber-500 animate-pulse" />
            <span className="text-[11px] font-black text-white uppercase tracking-widest">
              You are offline • Limited Functionality
            </span>
          </>
        )}
      </div>
    </div>
  );
};