"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { 
  Search, 
  SquarePen, 
  MessageSquareOff, 
  RefreshCcw,
  CheckCheck,
  Circle
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Link from "next/link";
import Image from "next/image";

export default function MessengerPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchConversations = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      const res = await apiService.get("messenger/conversations");
      const data = Array.isArray(res.data) ? res.data : res.data?.conversations || [];
      setConversations(data);
    } catch (err) {
      console.error("Inbox Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchConversations(true);
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter((item) => {
      const recipientName = item.recipient?.displayName || "";
      const sdNumber = item.recipient?.sdNumber || "";
      const lastMsg = item.lastMessage?.content || "";
      const target = `${recipientName} ${sdNumber} ${lastMsg}`.toLowerCase();
      return target.includes(searchQuery.toLowerCase());
    });
  }, [searchQuery, conversations]);

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isToday(date)) return format(date, "HH:mm");
    if (isYesterday(date)) return "Yesterday";
    return format(date, "dd/MM/yy");
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-white max-w-2xl mx-auto border-x border-gray-100">
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-6 py-6 bg-white sticky top-0 z-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Messenger</h1>
        <div className="flex items-center gap-2">
          <button 
            aria-label="refresh"
            disabled={refreshing}
            onClick={onRefresh}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${refreshing ? 'animate-spin' : ''}`}
          >
            <RefreshCcw size={20} className="text-gray-400" />
          </button>
          <Link 
            href="/messages/new"
            className="p-2.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
          >
            <SquarePen size={22} />
          </Link>
        </div>
      </header>

      {/* --- SEARCH BAR --- */}
      <div className="px-6 pb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search messages or SD numbers"
            
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      {/* --- CONVERSATION LIST --- */}
      <div className="divide-y divide-gray-50">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-12 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquareOff size={40} className="text-gray-200" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No conversations yet</h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Search for a user to begin chatting.
            </p>
          </div>
        ) : (
          filteredConversations.map((item) => (
            <ChatCard 
              key={item.id || item._id} 
              item={item} 
              formatTime={formatTime} 
            />
          ))
        )}
      </div>
    </main>
  );
}

// --- SUB-COMPONENT: CHAT CARD ---

function ChatCard({ item, formatTime }: { item: any, formatTime: Function }) {
  const isUnread = item.unreadCount > 0;
  const recipient = item.recipient || {};

  return (
    <Link 
      href={`/messages/${item.id || item._id}`}
      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors group"
    >
      {/* Avatar Container */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 relative border border-gray-100">
          <Image
            src={recipient.avatarUrl || "/public/profile.png"}
            alt={recipient.displayName}
            fill
            className="object-cover"
          />
        </div>
        {recipient.isOnline && (
          <div className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full border-[3px] border-white" />
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h4 className={`text-[15px] truncate transition-colors ${isUnread ? 'font-black text-black' : 'font-bold text-gray-800'}`}>
            {recipient.displayName || `SD-${recipient.sdNumber}`}
          </h4>
          <span className={`text-[11px] whitespace-nowrap ${isUnread ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
            {formatTime(item.lastMessage?.createdAt)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <p className={`text-sm truncate mr-4 ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
            {item.lastMessage?.content || "No messages yet"}
          </p>
          
          {isUnread ? (
            <div className="bg-blue-600 min-w-[20px] h-5 rounded-full px-1.5 flex items-center justify-center shadow-sm shadow-blue-100">
              <span className="text-[10px] font-black text-white">{item.unreadCount}</span>
            </div>
          ) : (
            <CheckCheck size={16} className="text-gray-300" />
          )}
        </div>
      </div>
    </Link>
  );
}