"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, SquarePen, MessageSquareOff, RefreshCcw
} from "lucide-react";
import { format } from "date-fns";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Link from "next/link";
import Image from "next/image";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/context/auth-context"; // Added useAuth
import { toast } from "sonner";

export default function MessengerPage() {
  const socket = useSocket();
  const { user } = useAuth(); // Get user from auth
  const mySD = user?.sdNumber;
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typingStates, setTypingStates] = useState<Record<string, boolean>>({});

  // 1. Socket Event Listeners for Live Updates
  useEffect(() => {
    if (!socket) return;

    // Listen for New Messages (Updates preview & unread count)
    socket.on("message_notification", (data: any) => {
      setConversations((prev) => prev.map((conv) => {
        if (conv.conversationId === data.conversationId) {
          return {
            ...conv,
            lastMessage: { content: data.preview, createdAt: new Date().toISOString() },
            unreadCount: (conv.unreadCount || 0) + 1,
          };
        }
        return conv;
      }));
      toast.info(`New message from SD-${data.senderSD}`);
    });

    // Listen for Typing Indicators in the Inbox
    socket.on("user_typing", ({ conversationId, isTyping }: any) => {
      setTypingStates(prev => ({ ...prev, [conversationId]: isTyping }));
    });

    // Listen for Online/Offline status changes
    socket.on("user_status_change", ({ sdNumber, online }: any) => {
      setConversations(prev => prev.map(conv => {
        if (conv.recipient?.sdNumber === sdNumber) {
          return { ...conv, recipient: { ...conv.recipient, isOnline: online } };
        }
        return conv;
      }));
    });

    return () => {
      socket.off("message_notification");
      socket.off("user_typing");
      socket.off("user_status_change");
    };
  }, [socket]);

  const fetchConversations = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await apiService.get("messenger/conversations");
      // Use the 'data' field from our consolidated backend response
      setConversations(res.data?.data || []);
    } catch (err) {
      console.error("Inbox Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchConversations(); }, []);

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const target = `${item.recipient?.displayName} ${item.recipient?.sdNumber} ${item.lastMessage?.content}`.toLowerCase();
      return target.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, conversations]);

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-white max-w-2xl mx-auto border-x border-gray-100 pb-20">
      <header className="flex items-center justify-between px-6 py-8 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Messages</h1>
        <div className="flex items-center gap-3">
          <button aria-label="refresh" onClick={() => fetchConversations(true)} className={`p-2 rounded-full hover:bg-gray-50 ${refreshing ? 'animate-spin' : ''}`}>
            <RefreshCcw size={20} className="text-gray-400" />
          </button>
          <Link href="/messages/new" className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 hover:scale-105 transition-transform">
            <SquarePen size={20} />
          </Link>
        </div>
      </header>

      <div className="px-6 mb-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search merchants or deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-[20px] py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500/10 focus:bg-white transition-all outline-none font-medium"
          />
        </div>
      </div>

      <div className="space-y-1">
        {filteredConversations.length === 0 ? (
          <EmptyInbox />
        ) : (
          filteredConversations.map((item) => (
            <ChatCard 
              key={item.conversationId} 
              item={item} 
              isTyping={typingStates[item.conversationId]} 
              mySD={mySD}
            />
          ))
        )}
      </div>
    </main>
  );
}

// Inside your ChatCard component within MessengerPage.tsx

function ChatCard({ item, isTyping, mySD }: { item: any, isTyping: boolean, mySD: string | undefined }) {
  const { recipient, lastMessage, unreadCount } = item;
  
  // Logic: Is the last message from me?
  const isFromMe = lastMessage?.senderSD === mySD;
  // Logic: Should it be highlighted as unread? (Only if I didn't send it)
  const shouldHighlight = unreadCount > 0 && !isFromMe;

  return (
    <Link href={`/messages/${item.conversationId}`} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 border-b border-gray-50">
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-blue-600 flex items-center justify-center text-white text-xl font-black">
          {recipient?.profilePhoto ? (
            <Image src={recipient.profilePhoto} alt="Avatar" fill className="object-cover" />
          ) : recipient?.displayName?.charAt(0)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h4 className={`text-sm truncate ${shouldHighlight ? 'font-black text-gray-900' : 'font-bold text-gray-600'}`}>
            {recipient?.displayName}
          </h4>
          <span className="text-[10px] font-bold text-gray-400">
            {lastMessage?.createdAt ? format(new Date(lastMessage.createdAt), "HH:mm") : ""}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm truncate ${shouldHighlight ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
            {isFromMe && <span className="text-blue-500 font-bold">You: </span>}
            {lastMessage?.content || "Start chatting"}
          </p>
          
          {shouldHighlight && (
            <div className="bg-blue-600 h-5 w-5 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[10px] font-black text-white">{unreadCount}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyInbox() {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-12 text-center">
      <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-6 border border-gray-100">
        <MessageSquareOff size={40} className="text-gray-200" />
      </div>
      <h3 className="text-xl font-black text-gray-900 tracking-tight">Your Inbox is Quiet</h3>
      <p className="text-sm text-gray-400 mt-2 font-medium leading-relaxed">
        Secure deals start with a conversation. <br/>Message a merchant to begin.
      </p>
    </div>
  );
}

