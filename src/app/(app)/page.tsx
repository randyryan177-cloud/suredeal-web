"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { ListingCard } from "@/components/home/ListingCard"; 
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { Sparkles, RefreshCcw, PackageSearch } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchFeed = async (quiet = false) => {
    try {
      if (!quiet) setIsLoading(true);
      const response = await apiService.get("/discovery/feed");
      
      if (response.data && response.data.success) {
        setPosts(response.data.data);
      }
    } catch (err) {
      console.error("Feed error:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => { fetchFeed(); }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-[#fafafa] pb-28">
      <div className="max-w-xl mx-auto pt-4 px-2 md:px-0">
        <button 
          onClick={() => { setIsRefreshing(true); fetchFeed(true); }}
          className="flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-400 mx-auto mb-6 hover:text-blue-600 transition-all uppercase"
        >
          <RefreshCcw size={14} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Refreshing Feed..." : "Pull to Refresh"}
        </button>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-400">
            <PackageSearch size={48} className="mb-4 opacity-20" />
            <p className="font-bold text-sm">No new deals in your area.</p>
          </div>
        ) : (
          posts.map((item) => (
            <ListingCard
              key={item._id}
              id={item.listingId}
              // UPDATED MAPPING: Using Store Data
              userName={item.owner?.name || "SureDeal Merchant"}
              userAvatar={item.owner?.logo}
              verified={item.owner?.verified} // If your ListingCard supports a badge
              
              mediaUrl={item.mediaIds?.[0] || "/placeholder.png"}
              title={item.title}
              price={item.price} // Ensure your Card displays the price
              currency={item.currency}
              createdAt={item.createdAt}
              
              likes={item.stats?.likes || 0}
              isLiked={item.isLiked || false}
              commentCount={item.stats?.commentCount || 0}
              
              // Action Handlers
              onMessagePress={() => router.push(`/messages/new?sd=${item.owner?.sdNumber}`)}
              onCommentPress={() => router.push(`/listings/${item.listingId}#comments`)}
              onStorePress={() => router.push(`/stores/${item.owner?.storeId}`)}
            />
          ))
        )}
      </div>

      <Link
        href="/agent"
        className="fixed bottom-24 right-6 p-4 bg-black text-white rounded-full shadow-xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center gap-2 group"
      >
        <Sparkles size={22} className="group-hover:text-amber-400 transition-colors" />
        <span className="hidden group-hover:block font-bold text-xs pr-2">Ask AI Agent</span>
      </Link>
    </main>
  );
}