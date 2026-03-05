"use client";

import React, { useEffect, useState } from "react";
import { 
  Bell, 
  Wallet, 
  Heart, 
  Briefcase, 
  CheckCheck, 
  BellOff, 
  Loader2,
  ChevronRight,
  Circle
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: "payment" | "social" | "system" | "job";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await apiService.get("notifications");

      const data = Array.isArray(res.data) 
      ? res.data 
      : (res.data?.notifications || []);
      setNotifications(data);
    } catch (e) {
      console.error("Failed to fetch notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiService.post("notifications/mark-read");
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch (e) {
      console.error("Update failed");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "payment":
        return { icon: <Wallet size={20} />, color: "text-emerald-500", bg: "bg-emerald-50" };
      case "social":
        return { icon: <Heart size={20} />, color: "text-blue-500", bg: "bg-blue-50" };
      case "job":
        return { icon: <Briefcase size={20} />, color: "text-amber-500", bg: "bg-amber-50" };
      default:
        return { icon: <Bell size={20} />, color: "text-slate-400", bg: "bg-slate-50" };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Activity</h1>
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8">
      
            {Array.isArray(notifications) && notifications.length === 0 ? (
        
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <BellOff size={32} className="text-gray-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">All caught up!</h3>
            <p className="text-sm text-gray-500">No new notifications at the moment.</p>
          </div>
        
        ) : (
  <div className="space-y-3">
    {notifications?.map((item) => {
              const { icon, color, bg } = getIcon(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => item.type === "payment" && router.push("/wallet")}
                  className={`group relative flex items-start gap-4 p-5 rounded-[24px] border transition-all cursor-pointer ${
                    item.isRead 
                      ? "bg-transparent border-transparent hover:bg-white hover:border-gray-100" 
                      : "bg-white border-gray-100 shadow-sm ring-1 ring-black/[0.02]"
                  }`}
                >
                  {/* Icon */}
                  <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${bg} ${color}`}>
                    {icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm truncate ${item.isRead ? "text-gray-600 font-medium" : "text-gray-900 font-black"}`}>
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tighter shrink-0 ml-4">
                        {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                      {item.message}
                    </p>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-center w-6">
                    {!item.isRead ? (
                      <Circle size={8} className="fill-blue-600 text-blue-600" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 transition-colors" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}