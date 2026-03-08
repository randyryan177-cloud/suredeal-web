"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ChevronLeft, 
  Search, 
  UserPlus, 
  ShieldCheck, 
  Loader2, 
  AlertCircle,
  ArrowRight,
  Store
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function NewMessageSearch() {
  const router = useRouter();
  
  // State
  const [sdNumber, setSdNumber] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // 1. Live Resolve Logic: Search for the user as the dev types
  useEffect(() => {
    const lookupUser = async () => {
      // Start searching once we have a reasonable SD length
      if (sdNumber.length >= 8) {
        setIsSearching(true);
        setError(null);
        try {
          const res = await apiService.get(`/messenger/recipient/${sdNumber}`);
          if (res.data?.success && res.data.data) {
            setPreview(res.data.data);
          } else {
            setPreview(null);
          }
        } catch (err: any) {
          setPreview(null);
          // Only show error if the user has typed enough for a full number
          if (sdNumber.length >= 9) {
            setError("User not found. Check the number and try again.");
          }
        } finally {
          setIsSearching(false);
        }
      } else {
        setPreview(null);
        setError(null);
      }
    };

    const timer = setTimeout(lookupUser, 600); // Debounce
    return () => clearTimeout(timer);
  }, [sdNumber]);

  // 2. Initialize Chat
  const handleStartChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Safety check: Use preview.sdNumber if we have it, otherwise fallback to input
    const targetSD = preview?.sdNumber || sdNumber;

    if (targetSD.length < 5 || isResolving) return;

    setIsResolving(true);
    try {
      const res = await apiService.post("/messenger/conversation/init", {
        recipientSD: targetSD, // Sending the validated number
      });

      if (res.data?.success) {
        // Handle the dynamic ID returning from backend fix
        const cid = res.data.data.conversationId || res.data.data.id || res.data.data._id;
        router.push(`/messages/${cid}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not start conversation.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white max-w-2xl mx-auto border-x border-gray-100 pb-10">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-6 border-b border-gray-50 sticky top-0 bg-white/80 backdrop-blur-md z-20">
        <button 
          aria-label="back"
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-black text-gray-900 tracking-tight">New Message</h1>
      </header>

      <div className="p-6">
        {/* Branding/Visual Guide */}
        <div className="bg-blue-600 rounded-[32px] p-8 text-center text-white mb-8 shadow-xl shadow-blue-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10 -mr-4 -mt-4">
                <UserPlus size={120} />
            </div>
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 relative z-10">
            <UserPlus className="text-white" size={28} />
          </div>
          <h2 className="text-lg font-black italic relative z-10">Secure Messenger</h2>
          <p className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1 opacity-80 relative z-10">
            Always verify identity before transacting.
          </p>
        </div>

        <form onSubmit={handleStartChat} className="space-y-6">
          <div className="relative group">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-blue-600 transition-colors">
              SD-
            </div>
            <input 
              type="text"
              placeholder="Recipient Number"
              maxLength={12}
              value={sdNumber}
              onChange={(e) => setSdNumber(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-[24px] py-5 pl-14 pr-12 text-xl font-black tracking-widest outline-none transition-all shadow-inner"
              autoFocus
            />
            {isSearching && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <Loader2 className="animate-spin text-blue-600" size={20} />
              </div>
            )}
          </div>

          {/* Real-time Recipient Preview Card */}
          {preview && (
            <div 
              onClick={() => handleStartChat()}
              className="bg-white border-2 border-blue-500 p-5 rounded-[28px] flex items-center gap-4 animate-in zoom-in-95 duration-300 cursor-pointer hover:bg-blue-50/30 transition-all shadow-lg shadow-blue-50"
            >
              <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden relative border border-gray-100 shrink-0">
                <Image 
                  src={preview.profilePhoto || preview.logo || `https://ui-avatars.com/api/?name=${preview.displayName || 'User'}&background=0066FF&color=fff`} 
                  alt="User" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-900 text-lg truncate">
                    {preview.displayName || preview.name || `SD-${preview.sdNumber}`}
                </h3>
                <div className="flex items-center gap-1.5">
                  {preview.isVerified ? (
                      <ShieldCheck size={14} className="text-blue-600" />
                  ) : (
                      <Store size={14} className="text-gray-400" />
                  )}
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">
                    {preview.type === 'STORE' ? 'Verified Merchant' : 'SureDeal User'}
                  </p>
                </div>
              </div>
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-md shrink-0">
                <ArrowRight size={20} />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center gap-3 px-5 py-4 bg-red-50 rounded-2xl border border-red-100 animate-in shake-1">
              <AlertCircle className="text-red-600 shrink-0" size={18} />
              <p className="text-xs font-bold text-red-800 uppercase tracking-tight">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={sdNumber.length < 5 || isResolving || isSearching}
            className={`w-full rounded-[24px] py-5 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl
              ${preview 
                ? 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700' 
                : 'bg-gray-900 text-white shadow-gray-200 hover:bg-black disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none'
              }`}
          >
            {isResolving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <Search size={20} />
                {preview ? "Start Chat" : "Find Recipient"}
              </>
            )}
          </button>
        </form>

        <div className="mt-12 flex items-start gap-4 px-6 py-6 bg-gray-50 rounded-[32px] border border-gray-100">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <ShieldCheck className="text-blue-600" size={24} />
          </div>
          <div>
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-1">Secure Interaction</h4>
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
              Always chat within the app. Conversations are encrypted and tracked to ensure your funds are safe during escrow transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
