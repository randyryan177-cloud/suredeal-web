"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MessageSquare } from "lucide-react";

export const SocketNotificationListener = () => {
  const socket = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    socket.on("message_notification", (data: { 
      conversationId: string; 
      preview: string; 
      senderSD: string;
      senderName?: string;
    }) => {
      // Don't show toast if the user is already in THAT specific chat
      if (window.location.pathname.includes(`/messages/${data.conversationId}`)) {
        return;
      }

      toast.custom((t) => (
        <div 
          onClick={() => {
            router.push(`/messages/${data.conversationId}`);
            toast.dismiss(t);
          }}
          className="w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0">
            <MessageSquare size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-blue-600 uppercase tracking-tighter">
              New Message • SD-{data.senderSD}
            </p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {data.senderName || "SureDeal Merchant"}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">
              {data.preview}
            </p>
          </div>
        </div>
      ), {
        duration: 5000,
        position: "top-center",
      });
    });

    return () => {
      socket.off("message_notification");
    };
  }, [socket, router]);

  return null; 
};