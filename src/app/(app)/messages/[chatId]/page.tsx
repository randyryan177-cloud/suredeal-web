"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { 
  ChevronLeft, Send, Plus, MoreVertical, ShieldCheck, 
  CheckCheck, Wallet, ArrowUpRight, TrendingUp, Info
} from "lucide-react";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/hooks/useSocket";
import Image from "next/image";
import Link from "next/link";

// --- TYPES ---
interface IMessage {
  _id: string;
  messageId?: string;
  content: string;
  senderSD: string; // Used for "isMe" comparison
  senderId?: string;
  type: "TEXT" | "SYSTEM";
  systemType?: "WALLET_TRANSACTION" | "PROMOTION" | "ESCROW_UPDATE";
  metadata?: any;
  createdAt: string;
  status?: "sending" | "sent" | "delivered";
}

export default function ChatDetailScreen() {
  const router = useRouter();
  const socket = useSocket();
  const { chatId } = useParams();
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState<any>(null);
  const [recipientStatus, setRecipientStatus] = useState<string>("Active Now");

  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    scrollRef.current?.scrollIntoView({ behavior });
  };

  // 1. Mark as read logic
  const markRead = useCallback(async () => {
    try { 
      await apiService.patch(`messenger/conversations/${chatId}/read`); 
    } catch (e) { 
      /* Silent fail to avoid UI disruption */ 
    }
  }, [chatId]);

  // 2. Load Initial Context
  const loadChatContext = useCallback(async () => {
    try {
      const res = await apiService.get(`messenger/conversations/${chatId}/context`);
      if (res.data?.success) {
        setMessages(res.data.data.messages);
        setRecipient(res.data.data.recipient);
        markRead();
      }
    } catch (err) {
      console.error("Context Load Error:", err);
    } finally {
      setLoading(false);
      // Small timeout to ensure DOM has rendered before scrolling
      setTimeout(() => scrollToBottom("auto"), 100);
    }
  }, [chatId, markRead]);

  useEffect(() => { loadChatContext(); }, [loadChatContext]);

  // 3. Socket Integration (Messaging + Typing)
  useEffect(() => {
    if (!socket || !chatId || !user) return;
    
    socket.emit("join_conversation", chatId);

    socket.on("new_message", (msg: IMessage) => {
      setMessages((prev) => [msg, ...prev]);
      markRead(); // Mark as read since user is actively in this chat
      setTimeout(() => scrollToBottom("smooth"), 100);
    });

    socket.on("user_typing", ({ sdNumber, isTyping }: any) => {
       if (sdNumber === recipient?.sdNumber) {
         setRecipientStatus(isTyping ? "typing..." : "Active Now");
       }
    });

    return () => {
      socket.off("new_message");
      socket.off("user_typing");
    };
  }, [socket, chatId, user, recipient?.sdNumber, markRead]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !user) return;

    const content = inputText.trim();
    setInputText("");

    try {
      // Backend typically emits the socket event 'new_message' to everyone in the room
      await apiService.post("messenger/messages/send", {
        conversationId: chatId,
        type: "TEXT",
        content,
        recipientSD: recipient?.sdNumber
      });
    } catch (err) {
      console.error("Send Error:", err);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-[#F8F9FB] border-x border-gray-100 relative overflow-hidden">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          
          <Link href={`/profile/${recipient?.sdNumber}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-600 flex items-center justify-center text-white font-black text-lg">
              {recipient?.profilePhoto ? (
                <Image src={recipient.profilePhoto} alt="Avatar" fill className="object-cover" />
              ) : recipient?.displayName?.charAt(0)}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                  {recipient?.displayName}
                </span>
                {recipient?.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
              </div>
              <span className={`text-[10px] font-bold uppercase ${recipientStatus === 'typing...' ? 'text-blue-500 animate-pulse' : 'text-emerald-500'}`}>
                {recipientStatus}
              </span>
            </div>
          </Link>
        </div>
        <button aria-label="options" className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse space-y-reverse space-y-4">
        {/* Scroll Anchor */}
        <div ref={scrollRef} className="h-1" /> 

        {messages.map((msg) => (
          <MessageRenderer key={msg._id} msg={msg} mySD={user?.sdNumber} />
        ))}

        {/* Safety Notice (Shown at the "top" of history) */}
        <div className="py-6 flex justify-center">
          <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-sm flex gap-3 items-center max-w-[90%]">
            <div className="bg-emerald-50 p-2 rounded-lg">
              <ShieldCheck className="text-emerald-600" size={18} />
            </div>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight leading-none">
              Encryption Active • Transactions Secured
            </p>
          </div>
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <button 
            aria-label="attach" 
            type="button" 
            className="p-2.5 bg-gray-50 text-gray-500 rounded-2xl hover:bg-gray-100 transition-colors"
          >
            <Plus size={22} />
          </button>
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-gray-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button 
            aria-label="submit"
            type="submit"
            disabled={!inputText.trim()}
            className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MessageRenderer({ msg, mySD }: { msg: IMessage, mySD: string | undefined }) {
  const isMe = msg.senderSD === mySD;

  if (msg.type === "SYSTEM") {
    return <SystemMessage msg={msg} />;
  }

  return (
    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm font-medium shadow-sm leading-relaxed ${
        isMe 
          ? 'bg-blue-600 text-white rounded-tr-none' 
          : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
      }`}>
        {msg.content}
      </div>
      <span className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">
        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
  );
}

function SystemMessage({ msg }: { msg: IMessage }) {
  // 1. Wallet Transaction Style
  if (msg.systemType === "WALLET_TRANSACTION") {
    const { amount, transactionId, ref } = msg.metadata || {};
    return (
      <div className="mx-auto w-full max-w-[280px] bg-white border border-emerald-100 rounded-3xl overflow-hidden shadow-md my-2">
        <div className="bg-emerald-600 p-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-lg"><Wallet size={16} /></div>
            <span className="text-[10px] font-black uppercase tracking-widest">Receipt</span>
          </div>
          <ArrowUpRight size={18} />
        </div>
        <div className="p-5 text-center">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{ref || "Transfer"}</p>
          <h4 className="text-2xl font-black text-gray-900">KES {amount?.toLocaleString()}</h4>
          <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
             <span className="text-[9px] font-bold text-gray-400 uppercase">Ref: {transactionId?.slice(-8)}</span>
             <div className="flex items-center gap-1 text-emerald-600 font-black text-[9px] uppercase">
               <CheckCheck size={12} /> Confirmed
             </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Promotion Style
  if (msg.systemType === "PROMOTION") {
    return (
      <div className="mx-auto w-[90%] bg-blue-900 rounded-2xl p-4 flex gap-3 items-center text-white shadow-lg my-2">
        <TrendingUp className="text-blue-300" size={24} />
        <div className="flex-1">
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest">Special Offer</p>
          <p className="text-xs font-bold leading-tight">{msg.content}</p>
        </div>
      </div>
    );
  }

  // 3. Standard System Info
  return (
    <div className="flex justify-center my-2">
      <div className="bg-gray-100 px-3 py-1.5 rounded-full flex items-center gap-2">
        <Info size={12} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">
          {msg.content}
        </span>
      </div>
    </div>
  );
}