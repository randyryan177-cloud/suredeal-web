"use client";

import { useState } from "react";
import { MoreHorizontal, Heart, MessageCircle, Repeat2, Send } from "lucide-react";
import Image from "next/image";
interface ProductCardProps {
  userName: string;
  userAvatar: string;
  productImage: string;
  productName: string;
  postedAt?: string;
  likes?: number;
}

export function ProductCard({ userName, userAvatar, productImage, productName, postedAt, likes = 0 }: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  return (
    <div className="bg-white w-full border-b border-gray-200">
      {/* Header */}
      <div className="flex items-center p-3">
        <Image src={userAvatar} width={36} height={36} className="w-9 h-9 rounded-full bg-gray-100 object-cover" alt={userName} />
        <div className="ml-3 flex-1">
          <p className="text-sm font-semibold text-gray-900 leading-tight">{userName}</p>
          <p className="text-[11px] text-gray-500">{postedAt}</p>
        </div>
        <button aria-label="menu" className="p-1 hover:bg-gray-50 rounded-full"><MoreHorizontal size={20} className="text-gray-600" /></button>
      </div>

      {/* Image */}
      <div className="aspect-square w-full bg-gray-50 overflow-hidden">
        <Image src={productImage} width={400} height={400} className="w-full h-full object-cover" alt={productName} />
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={() => { setLiked(!liked); setLikeCount(liked ? likeCount - 1 : likeCount + 1); }}>
            <Heart size={26} className={liked ? "fill-red-500 text-red-500" : "text-gray-700 hover:text-red-400"} />
          </button>
          <button aria-label="comment"><MessageCircle size={26} className="text-gray-700 hover:text-blue-500" /></button>
          <button aria-label="share"><Repeat2 size={26} className="text-gray-700 hover:text-green-500" /></button>
          <button className="ml-auto" aria-label="send"><Send size={24} className="text-gray-700 hover:text-blue-500" /></button>
        </div>

        <p className="text-sm font-bold text-gray-900 mb-1">{likeCount.toLocaleString()} likes</p>
        <p className="text-sm text-gray-800 leading-relaxed">
          <span className="font-bold mr-2">{userName}</span>{productName}
        </p>
      </div>
    </div>
  );
}