"use client";

import React, { useState, use } from "react";
import { 
  ChevronLeft, Share2, MapPin, 
  MessageSquare, ShieldCheck, CheckCircle, 
  ChevronRight, Image as ImageIcon, Heart, Send, User
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { toast } from "sonner";

const fetcher = (url: string) => apiService.get(url).then(res => res.data.data || res.data);

interface ListingCategory {
  _id: string;
  name: string;
}

interface ListingOwner {
  name: string;
  logo?: string;
  verified?: boolean;
  sdNumber?: string;
  storeId?: string;
  category?: string; // For store category
}

interface ListingStats {
  likes: number;
  commentCount: number;
  rate?: number;
}

interface ListingData {
  listingId: string;
  title: string;
  description?: string;
  price?: number;
  currency?: string;
  type?: string;
  mediaIds?: string[];
  category?: ListingCategory;
  owner?: ListingOwner;
  store?: ListingOwner;
  stats?: ListingStats;
  isLiked?: boolean;
  location?: { city: string };
  rate?: number; // Some parts use listing.rate directly
}

interface CommentData {
  _id: string;
  content: string;
  createdAt: string;
  user?: {
    name: string;
    profilePhoto?: string;
    displayName?: string;
    userName?: string;
  };
  userName?: string; // Some parts use c.userName
}

export default function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const listingId = resolvedParams.id;
  const router = useRouter();

  const [newComment, setNewComment] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data: listing, error: listingError, mutate: mutateListing } = useSWR<ListingData>(
    listingId ? `/marketplace/listings/${listingId}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const { data: comments, mutate: mutateComments } = useSWR<CommentData[]>(
    listingId ? `/marketplace/listings/${listingId}/comments` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const handleLike = async () => {
    if (!listing) return;
    setIsLiking(true);
    try {
      await apiService.post(`/marketplace/listings/${listingId}/like`);
      // Optimistic update
      mutateListing({
        ...listing,
        stats: { 
          likes: (listing.stats?.likes || 0) + 1,
          commentCount: listing.stats?.commentCount || 0
        }
      }, false);
      toast.success("Added to interests");
    } catch {
      toast.error("Failed to like");
    } finally {
      setIsLiking(false);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Validation
    const trimmedComment = newComment.trim();
    if (!trimmedComment || isCommenting) return;

    setIsCommenting(true);
    try {
      // 2. Check Endpoint: Ensure this matches your backend route exactly
      // Your router shows: router.post("/listings/:listingId/comment", ...)
      // So the full URL is likely /marketplace/listings/${listingId}/comment
      const res = await apiService.post(`/marketplace/listings/${listingId}/comment`, {
        content: trimmedComment
      });

      // 3. Extract the new comment object
      // Backend usually returns { success: true, data: { ...comment } }
      const newlyCreatedComment = res.data?.data || res.data;

      // 4. Update State (Optimistic approach)
      // We prepend the new comment so it appears at the top
      mutateComments([newlyCreatedComment, ...(comments || [])], false);
      
      // 5. Reset UI
      setNewComment("");
      toast.success("Comment posted successfully");
    } catch (err) {
      const error = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
      console.error("Comment Post Error:", error.response?.data || error.message);
      
      // Handle 401/403 (Not logged in)
      if (error.response?.status === 401) {
        toast.error("Please login to post a comment");
      } else {
        toast.error(error.response?.data?.message || "Failed to post comment. Try again.");
      }
    } finally {
      setIsCommenting(false);
    }
  };
  if (!listing && !listingError) return <LoadingScreen />;
  if (!listing) return <div className="p-20 text-center font-bold">Listing not found.</div>;

  const isService = listing.type === "SERVICE";
  const price = isService ? listing.rate : listing.price;
  const images = listing.mediaIds || [];

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-32">
      {/* Navigation Header */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ChevronLeft size={24} className="text-gray-900" />
        </button>
        <div className="flex gap-2">
            <button aria-label="like" onClick={handleLike} className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-full font-bold text-xs">
               <Heart size={16} className={isLiking ? "animate-ping" : ""} />
               {listing.stats?.likes || 0}
            </button>
            <button aria-label="share" onClick={() => {}} className="p-2 bg-gray-100 rounded-full"><Share2 size={18}/></button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left: Images */}
        <div className="lg:col-span-7">
          <div className="relative aspect-[4/3] w-full rounded-[40px] overflow-hidden bg-white shadow-sm border border-gray-100">
            {images.length > 0 ? (
              <Image src={images[activeImageIndex]} alt={listing.title} fill className="object-cover" priority />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300"><ImageIcon size={64} /></div>
            )}
          </div>
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
            {images.map((img: string, i: number) => (
              <button aria-label="image" key={i} onClick={() => setActiveImageIndex(i)} className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${activeImageIndex === i ? 'border-blue-600' : 'border-transparent opacity-50'}`}>
                <Image src={img} alt="Thumb" fill className="object-cover" />
              </button>
            ))}
          </div>

          {/* Comments Section (Desktop/Large screen view) */}
          <div className="mt-12 space-y-6">
             <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                Discussion <span className="text-sm font-bold text-gray-400">({comments?.length || 0})</span>
             </h3>
             <form onSubmit={handlePostComment} className="flex gap-3">
                <div className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-2 flex items-center focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                    <input 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ask a question about this..." 
                        className="w-full bg-transparent outline-none text-sm font-medium"
                    />
                    <button type="submit" disabled={isCommenting} className="text-blue-600 p-1 hover:scale-110 transition-transform">
                        {isCommenting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </div>
             </form>
             <div className="space-y-4">
  {(Array.isArray(comments) ? comments : []).map((c, i) => (
    <div key={c._id || i} className="flex gap-3 p-4 bg-white rounded-2xl border border-gray-50">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
        <User size={18} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs font-black text-gray-900 mb-1">
          {c.user?.displayName || c.userName || "Verified Buyer"}
        </p>
        <p className="text-sm text-gray-600 font-medium">{c.content}</p>
      </div>
    </div>
  ))}
  
  {(!comments || comments.length === 0) && (
    <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase tracking-widest">
      No comments yet. Be the first to comment!
    </p>
  )}
</div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <div>
              <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {listing.store?.category || "General"}
              </span>
              <h1 className="text-3xl font-black text-gray-900 mt-3 leading-tight">{listing.title}</h1>
              <div className="flex items-center gap-4 mt-4">
                <div className="text-2xl font-black text-blue-600">KES {parseFloat(price?.toString() || "0").toLocaleString()}</div>
                <div className="flex items-center gap-1 text-gray-400 text-xs font-bold uppercase"><MapPin size={12} /> {listing.location?.city}</div>
              </div>
            </div>

            <div 
              onClick={() => router.push(`/stores/${listing.store?.storeId}`)}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-all"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
                <Image src={listing.store?.logo || "https://via.placeholder.com/150"} alt="Logo" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 font-bold text-sm text-gray-900">
                    {listing.store?.name} <CheckCircle size={14} className="text-blue-500" />
                </div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Verified Merchant</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </div>

            <p className="text-sm text-gray-600 font-medium leading-relaxed">{listing.description}</p>
            
            <div className="pt-2">
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <button 
                        onClick={() => router.push(`/messages/new?sd=${listing.store?.sdNumber}`)}
                        className="flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        <MessageSquare size={16} /> Chat
                    </button>
                    <button 
                        onClick={() => router.push(`/checkout/${listingId}`)}
                        className={`flex items-center justify-center gap-2 py-3 ${isService ? 'bg-amber-500 shadow-amber-100' : 'bg-blue-600 shadow-blue-100'} text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:brightness-110 transition-all`}
                    >
                        {isService ? "Hire" : "Buy Now"}
                    </button>
                </div>
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-50">
                    <ShieldCheck className="text-emerald-600" size={18} />
                    <p className="text-[10px] text-emerald-800 font-bold uppercase">Escrow Protection Active</p>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const Loader2 = ({ size, className }: any) => <ImageIcon size={size} className={`animate-spin ${className}`} />;