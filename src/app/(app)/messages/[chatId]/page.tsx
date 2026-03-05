"use client";

import React, { useEffect, useRef, useState } from "react";
import { 
  ChevronLeft, 
  Send, 
  Plus, 
  MoreVertical, 
  ShieldCheck,
  Check,
  CheckCheck
} from "lucide-react";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ChatDetailScreen() {
  const router = useRouter();
  const { chatId } = useParams();
  
  // States
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [recipient, setRecipient] = useState<any>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadChatData();
    // Socket.io integration would go here
  }, [chatId]);

  const loadChatData = async () => {
    try {
      // Fetch messages and recipient details (Parallel)
      const [msgRes, chatRes] = await Promise.all([
        apiService.get(`messenger/conversations/${chatId}/messages`),
        apiService.get(`messenger/conversations/${chatId}`) 
      ]);
      
      setMessages(msgRes.data);
      setRecipient(chatRes.data.recipient);
    } catch (err) {
      console.error("Chat Load Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    const textToSend = inputText.trim();
    const tempMessage = {
  _id: Date.now().toString(),
  content: textToSend,
  senderId: "ME",
  isMine: true, 
  createdAt: new Date().toISOString(),
  status: "sending",
};

    // Optimistic Update
    setMessages((prev) => [tempMessage, ...prev]);
    setInputText("");
    setIsSending(true);

    try {
      await apiService.post("messenger/messages/send", {
        conversationId: chatId,
        content: textToSend,
      });
    } catch (err) {
      console.error("Send Error:", err);
      // Remove the message or show error toast
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto bg-gray-50 border-x border-gray-100 shadow-2xl relative">
      
      {/* --- HEADER --- */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center gap-3 flex-1">
          <button aria-label="back" onClick={() => router.back()} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          
          <Link href={`/profile/${recipient?.sdNumber}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-100">
              <Image 
                src={recipient?.avatarUrl || "/placeholder-avatar.png"} 
                alt="Avatar" 
                fill 
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                {recipient?.displayName || `SD-${recipient?.sdNumber}`}
              </span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Active Now</span>
            </div>
          </Link>
        </div>
        
        <button aria-label="more" className="p-2 text-gray-400 hover:text-gray-600 rounded-full">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse scrollbar-hide">
        {/* Safe Trading Tip */}
        <div className="my-8 flex justify-center">
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 max-w-[85%] flex gap-3 items-start">
            <ShieldCheck size={20} className="text-blue-500 shrink-0" />
            <p className="text-[11px] text-blue-800 leading-relaxed">
              <strong>SureDeal Safety:</strong> Always keep payments within the platform. Avoid sharing personal phone numbers until a deal is confirmed.
            </p>
          </div>
        </div>

        {messages.map((msg) => (
          <MessageBubble key={msg._id} msg={msg} isMe={msg.senderId === "ME" || msg.isMine} />
        ))}
        
        <div className="text-center py-6 text-[10px] text-gray-300 font-medium italic">
          Messages are currently unencrypted. End-to-end encryption coming in v2.2
        </div>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={sendMessage} className="flex items-end gap-2">
          <button type="button" aria-label="s" className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mb-0.5">
            <Plus size={24} />
          </button>
          
          <div className="flex-1 bg-gray-100 rounded-[24px] px-4 py-2 border border-transparent focus-within:border-blue-200 focus-within:bg-white transition-all">
            <textarea
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type a message..."
              className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 resize-none max-h-32 scrollbar-hide text-gray-800"
            />
          </div>

          <button 
            type="submit"
            aria-label="send message"
            disabled={!inputText.trim() || isSending}
            className={`p-3 rounded-full transition-all flex items-center justify-center mb-0.5 ${
              inputText.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-100' : 'bg-gray-100 text-gray-400 scale-90'
            }`}
          >
            <Send size={18} fill={inputText.trim() ? "currentColor" : "none"} />
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MESSAGE BUBBLE COMPONENT ---

function MessageBubble({ msg, isMe }: { msg: any; isMe: boolean }) {
  const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex flex-col mb-4 ${isMe ? 'items-end' : 'items-start'}`}>
      <div 
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
          isMe 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
        }`}
      >
        {msg.content}
      </div>
      <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row' : 'flex-row-reverse'}`}>
        <span className="text-[10px] text-gray-400 font-medium">{time}</span>
        {isMe && (
          msg.status === "sending" ? <Check size={10} className="text-gray-300" /> : <CheckCheck size={12} className="text-blue-500" />
        )}
      </div>
    </div>
  );
}