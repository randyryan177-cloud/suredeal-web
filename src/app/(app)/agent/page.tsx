"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Menu, 
  X, 
  Sparkles, 
  ChevronRight,
  MapPin,
  Loader2
} from "lucide-react";
import { apiService } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

// --- Sub-component: AgentActionCard ---
const AgentActionCard = ({ data }: { data: any }) => {
  if (!data) return null;

  const listingId = data.listingId || data._id || data.id;

  return (
    <Link 
    href={listingId ? `/listings/${listingId}` : "#"}
    onClick={(e) => !listingId && e.preventDefault()}
      className="flex items-center gap-4 p-3 mt-2 bg-white border border-gray-100 rounded-xl hover:border-green-200 transition-all shadow-sm group"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={data.mediaIds?.[0] || "/placeholder-product.png"}
          alt={data.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-bold text-gray-900 truncate">{data.title}</h4>
        <p className="text-green-600 font-extrabold text-sm">
          KES {data.price?.toLocaleString() || "Negotiable"}
        </p>
        <div className="flex items-center text-[10px] text-gray-400 mt-1">
          <MapPin size={10} className="mr-1" />
          {data.location?.city || "Kenya"}
        </div>
      </div>
      <ChevronRight size={18} className="text-gray-300 group-hover:text-green-500 transition-colors" />
    </Link>
  );
};

export default function AgentPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const fetchHistory = async () => {
    try {
      const res = await apiService.get("ai/history");
      setChatHistory(res.data);
    } catch (err) {
      console.error("Failed to load history");
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setCurrentThreadId(null);
    setIsSidebarOpen(false);
  };

  const loadThread = async (threadId: string) => {
    setIsTyping(true);
    try {
      const res = await apiService.get(`ai/thread/${threadId}`);
      setCurrentThreadId(threadId);
      const formatted = res.data.messages.map((m: any, idx: number) => ({
        id: idx.toString(),
        role: m.role,
        text: m.content,
        metadata: m.suggestedActions?.length > 0 
          ? { type: "PRODUCT", data: m.suggestedActions[0] } 
          : null,
      }));
      setMessages(formatted);
      setIsSidebarOpen(false);
    } catch (err) {
      alert("Could not load chat");
    } finally {
      setIsTyping(false);
    }
  };

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now().toString(), role: "user", text: inputText };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await apiService.post("ai/chat", {
        message: inputText,
        threadId: currentThreadId,
      });

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        role: "model",
        text: response.data.response,
        metadata: response.data.tools?.length > 0 
          ? { type: "PRODUCT", data: response.data.tools[0] } 
          : null,
      };

      if (!currentThreadId) {
        setCurrentThreadId(response.data.threadId);
        fetchHistory();
      }
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      alert("Agent is offline.");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* --- Sidebar (History) --- */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gray-50 border-r transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex flex-col h-full p-4">
          <button 
            onClick={startNewChat}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-green-500 text-green-600 font-bold rounded-xl hover:bg-green-50 transition-colors mb-6"
          >
            <Plus size={18} /> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Recent Chats</h3>
            {chatHistory.map((chat) => (
              <button
                key={chat._id}
                onClick={() => loadThread(chat._id)}
                className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-gray-200 text-left transition-colors group"
              >
                <MessageSquare size={16} className="text-gray-400" />
                <span className="flex-1 truncate text-sm font-semibold text-gray-700">{chat.title}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* --- Main Chat Area --- */}
      <main className="flex-1 flex flex-col relative h-full">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b bg-white">
          <button aria-label="open sidebar" onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2">
            <Menu />
          </button>
          <div className="flex flex-col items-center flex-1 lg:items-start lg:ml-0">
            <h1 className="text-lg font-black text-gray-900 tracking-tight">SureDeal Agent</h1>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-green-600">ONLINE</span>
            </div>
          </div>
          <button aria-label="new chat" onClick={startNewChat} className="p-2 hover:bg-gray-100 rounded-full">
            <Plus size={22} />
          </button>
        </header>

        {/* Message Feed */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {messages.length === 0 && !isTyping && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="text-green-600" size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">How can I help you today?</h2>
              <p className="text-gray-500 text-sm mt-2">I can find the best deals, jobs, or services across Kenya in seconds.</p>
            </div>
          )}

          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div key={msg.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] lg:max-w-[70%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                  <div className={`
                    px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${isUser ? "bg-green-600 text-white font-medium shadow-md shadow-green-100" : "bg-gray-100 text-gray-800"}
                  `}>
                    {msg.text}
                  </div>
                  {msg.metadata?.data && (
                    <div className="w-full">
                      <AgentActionCard data={msg.metadata.data} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-3 rounded-2xl flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-green-600" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-4 lg:p-6 bg-white border-t">
          <form onSubmit={sendMessage} className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about deals, jobs or services..."
              className="flex-1 bg-transparent px-4 py-2 outline-none text-sm"
            />
            <button 
              type="submit"
              onClick={sendMessage}
              aria-label="submit message"
              disabled={!inputText.trim() || isTyping}
              className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:hover:bg-green-600 transition-colors shadow-lg shadow-green-200"
            >
              <Send size={18} />
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}