"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, UserPlus, ShieldCheck, Loader2 } from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function NewMessageSearch() {
  const router = useRouter();
  const [sdNumber, setSdNumber] = useState("");
  const [isResolving, setIsResolving] = useState(false);

  const handleStartChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sdNumber.length < 5) return;

    setIsResolving(true);
    try {
      // We hit the 'init' endpoint we discussed earlier
      const res = await apiService.post("/messenger/conversations/init", {
        recipientSD: sdNumber,
      });

      if (res.data?.success) {
        // Redirect to the actual chat detail page
        router.push(`/messages/${res.data.data._id}`);
      }
    } catch (err: any) {
      console.error("Chat Init Error:", err);
      toast.error(err.response?.data?.message || "User not found or invalid SD number.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-2xl mx-auto border-x border-gray-100">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-6 border-b border-gray-50">
        <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">New Message</h1>
      </header>

      <div className="p-6">
        <div className="bg-blue-50/50 rounded-[32px] p-8 text-center border border-blue-100 mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
            <UserPlus className="text-blue-600" size={28} />
          </div>
          <h2 className="text-lg font-black text-gray-900">Start a Conversation</h2>
          <p className="text-sm text-gray-500 font-medium px-4 mt-1">
            Enter a merchant&apos;s SD number to begin a secure transaction chat.
          </p>
        </div>

        <form onSubmit={handleStartChat} className="space-y-6">
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-blue-600 transition-colors">
              SD-
            </div>
            <input 
              type="text"
              placeholder="Enter number (e.g. 254...)"
              maxLength={12}
              value={sdNumber}
              onChange={(e) => setSdNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[24px] py-4 pl-12 pr-4 text-lg font-black tracking-widest outline-none transition-all"
              autoFocus
            />
          </div>

          <button 
            type="submit"
            disabled={sdNumber.length < 5 || isResolving}
            className="w-full bg-gray-900 text-white rounded-[24px] py-4 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] disabled:bg-gray-100 disabled:text-gray-300 shadow-xl shadow-gray-200"
          >
            {isResolving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Search size={20} />
                Find User
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-center gap-3 px-4 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
          <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
          <p className="text-[11px] font-bold text-emerald-800 leading-relaxed uppercase tracking-tight">
            All chats are tracked for your safety. Secure payments via SureDeal are only valid through these conversations.
          </p>
        </div>
      </div>
    </div>
  );
}