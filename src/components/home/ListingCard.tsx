

"use client";

import React from "react";
import Image from "next/image";
import { 
  MessageCircle, 
  Heart, 
  Share2, 
  CheckCircle2, 
  Store, 
  Clock 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useListingActions } from "@/hooks/useListingActions"; 

interface ListingCardProps {
  id: string; // This is the listingId
  userName: string;
  userAvatar?: string;
  verified?: boolean;
  mediaUrl: string;
  title: string;
  price?: number;
  currency?: string;
  createdAt: string;
  likes: number;     // initial likes from feed
  isLiked: boolean;  // initial status from feed
  commentCount: number;
  onMessagePress: () => void;
  onCommentPress: () => void;
  onStorePress?: () => void;
}

export function ListingCard(props: ListingCardProps) {
  // 1. INTEGRATE THE HOOK
  const { liked, likeCount, handleToggleLike, handleShare } = useListingActions(
    props.likes,
    props.isLiked,
    props.id,
    props.title
  );
  return (
    <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm mb-6 overflow-hidden transition-all hover:shadow-md">
      {/* ... Merchant Header (Same as before) ... */}
      <div className="p-4 flex items-center justify-between">
        <div onClick={props.onStorePress} className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
            <Image src={props.userAvatar || "/placeholder-store.png"} alt={props.userName} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{props.userName}</h3>
              {props.verified && <CheckCircle2 size={14} className="text-blue-500 fill-blue-50" />}
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
              <Clock size={10} />
              {formatDistanceToNow(new Date(props.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
        {/* 2. WIRE UP SHARE */}
        <button aria-label="share" onClick={handleShare} className="p-2 text-gray-400 hover:text-gray-600">
          <Share2 size={18} />
        </button>
      </div>

      {/* ... Media & Price (Same as before) ... */}
      <div className="relative aspect-square w-full bg-gray-100">
        <Image src={props.mediaUrl} alt={props.title} fill className="object-cover" />
        {props.price && (
          <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl">
            <span className="text-[10px] font-black uppercase opacity-60 mr-1">{props.currency}</span>
            <span className="text-lg font-black tracking-tight">{props.price.toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="text-lg font-bold text-gray-900 leading-tight mb-4">{props.title}</h2>

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-6">
            {/* 3. WIRE UP TOGGLE LIKE */}
            <button onClick={handleToggleLike} className="flex items-center gap-2 group">
              <Heart 
                size={22} 
                className={liked ? "fill-red-500 text-red-500 scale-110" : "text-gray-400 group-hover:text-red-500"} 
              />
              <span className="text-xs font-black text-gray-400">{likeCount}</span>
            </button>
            <button onClick={props.onCommentPress} className="flex items-center gap-2 group">
              <MessageCircle size={22} className="text-gray-400 group-hover:text-blue-500" />
              <span className="text-xs font-black text-gray-400">{props.commentCount}</span>
            </button>
          </div>

          <button onClick={props.onMessagePress} className="flex items-center gap-2 bg-emerald-500 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
            <Store size={16} />
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
