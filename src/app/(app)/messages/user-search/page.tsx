"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  ArrowLeft, 
  UserPlus, 
  CheckCircle2, 
  ChevronRight, 
  Send,
  Loader2,
  Users
} from "lucide-react";
import { debounce } from "lodash";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";

interface SearchUser {
  id: string;
  sdNumber: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

export default function UserSearchPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  
  const [query, setQuery] = useState("");
  const [recentUsers, setRecentUsers] = useState<SearchUser[]>([]);
  const [remoteResults, setRemoteResults] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. Load Recent Conversations
  useEffect(() => {
    const fetchRecents = async () => {
      try {
        const res = await apiService.get("messenger/conversations");
        // Map conversations to recipients
        const users = res.data.map((conv: any) => conv.recipient);
        setRecentUsers(users);
      } catch (err) {
        console.error("Failed to load recents", err);
      }
    };
    fetchRecents();
  }, []);

  // 2. Debounced Remote Search
  const performRemoteSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (searchQuery.length < 3) {
        setRemoteResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await apiService.get(`messenger/search/users?q=${searchQuery}`);
        setRemoteResults(res.data || []);
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    performRemoteSearch(text);
  };

  // 3. Navigation Logic
  const handleStartChat = async (sdNumber: string) => {
    try {
      const res = await apiService.post("messenger/conversations", {
        recipientSD: sdNumber,
      });
      const chatId = res.data.conversationId || res.data.id;
      router.push(`/messages/${chatId}`);
    } catch (err) {
      toast.error("Unable to reach this user. Check the SD number.");
    }
  };

  // Filtering Logic
  const isRemoteActive = query.length >= 3;
  const displayData = isRemoteActive
    ? remoteResults
    : recentUsers.filter(u => 
        u.sdNumber.includes(query) || 
        u.displayName?.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-8 py-5 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button 
            aria-label="go back"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              autoFocus
              placeholder="Search by SD number or merchant name..."
              className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-amber-500 transition-all text-sm font-medium"
              value={query}
              onChange={handleQueryChange}
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-amber-500" size={18} />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-8">
        {/* Invite/Direct Action Card */}
        {query.length >= 6 && (
          <button 
            onClick={() => handleStartChat(query)}
            className="w-full mb-8 flex items-center gap-4 p-5 bg-amber-50 border border-amber-100 rounded-[24px] hover:bg-amber-100 transition-all group"
          >
            <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <Send size={20} />
            </div>
            <div className="text-left flex-1">
              <p className="font-bold text-amber-900">Direct Chat with SD-{query}</p>
              <p className="text-xs text-amber-700 font-medium">Click to start a secure transaction or invite them</p>
            </div>
            <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        )}

        {/* List Section */}
        <div className="space-y-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 px-2">
            {isRemoteActive ? "Search Results" : "Recent Contacts"}
          </h3>

          {displayData.length > 0 ? (
            displayData.map((user) => (
              <button
                key={user.sdNumber}
                onClick={() => handleStartChat(user.sdNumber)}
                className="w-full flex items-center gap-4 p-4 bg-white border border-transparent hover:border-gray-200 hover:shadow-sm rounded-[24px] transition-all group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
                    <Image 
                      src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=random`} 
                      alt={user.displayName}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                      <CheckCircle2 size={16} className="text-blue-500 fill-blue-50" />
                    </div>
                  )}
                </div>

                <div className="flex-1 text-left">
                  <h4 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    {user.displayName || "SureDeal User"}
                  </h4>
                  <p className="text-xs font-black text-amber-600 tracking-tighter uppercase">SD-{user.sdNumber}</p>
                </div>

                {!isRemoteActive && (
                  <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-1 rounded-md uppercase tracking-widest">
                    Recent
                  </span>
                )}
                <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-400" />
              </button>
            ))
          ) : !loading && (
            <div className="text-center py-20 flex flex-col items-center">
              <div className="bg-gray-100 p-6 rounded-full mb-4">
                <Users size={40} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-900">No users found</p>
              <p className="text-sm text-gray-500 mt-1 max-w-[240px] mx-auto">
                Try searching by a full SD number or the name of a verified merchant.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}