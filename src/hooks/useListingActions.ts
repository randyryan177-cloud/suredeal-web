// src/hooks/useListingActions.ts

"use client";

import { useState } from "react";
import { apiService } from "@/lib/api";
import { toast } from "react-hot-toast"; 

export function useListingActions(initialLikes: number, initialLiked: boolean, listingId: string, title: string) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikes);
  const [isLiking, setIsLiking] = useState(false);

  const handleToggleLike = async () => {
  if (isLiking) return; 
  
  // Capture snapshot for rollback
  const wasLiked = liked;
  const wasCount = likeCount;

  // 1. Instant UI Feedback
  setLiked(!wasLiked);
  setLikeCount(prev => wasLiked ? prev - 1 : prev + 1);
  setIsLiking(true);

  try {
    // 2. Call the endpoint defined in your Marketplace routes
    const response = await apiService.post(`/marketplace/listings/${listingId}/like`);
    
    // Optional: Sync with server's actual count if returned
    if (response.data?.data?.stats?.likes !== undefined) {
      setLikeCount(response.data.data.stats.likes);
    }
  } catch (error) {
    // 3. Revert to snapshot on failure
    setLiked(wasLiked);
    setLikeCount(wasCount);
    toast.error("Could not update like. Check your connection.");
  } finally {
    setIsLiking(false);
  }
};

  const handleShare = async () => {
    const shareData = {
      title: "SureDeal Marketplace",
      text: `Check out this listing: ${title}`,
      url: window.location.origin + `/marketplace/listing/${listingId}`,
    };

    try {
      // 1. Native Share if mobile
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
      
      // 2. Track on backend
      await apiService.post(`/marketplace/listings/${listingId}/share`);
    } catch (e) {
      console.error("Sharing failed", e);
    }
  };

  return { liked, likeCount, handleToggleLike, handleShare };
}