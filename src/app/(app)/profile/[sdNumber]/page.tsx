"use client";

import React, { useEffect, useState } from "react";
import { 
  ChevronLeft, ShieldCheck, MapPin, Calendar, 
  Package, MessageCircle, Star, ShieldAlert,
  Share2, Award
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Image from "next/image";

export default function PublicProfilePage() {
  const { sdNumber } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Use the endpoint we refactored earlier that checks both Stores & Profiles
        const res = await apiService.get(`messenger/recipient/${sdNumber}`);
        if (res.data?.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error("Profile Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [sdNumber]);

  if (loading) return <LoadingScreen />;
  if (!data) return <div className="p-10 text-center font-bold">User Not Found</div>;

  const isStore = data.type === 'STORE';

  return (
    <main className="min-h-screen bg-[#F8F9FB] max-w-2xl mx-auto border-x border-gray-100 pb-20">
      {/* --- HEADER --- */}
      <div className="relative h-48 bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute top-6 left-6 flex gap-3">
          <button aria-label="back" onClick={() => router.back()} className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all">
            <ChevronLeft size={22} />
          </button>
        </div>
        <div className="absolute top-6 right-6">
          <button aria-label="share" className="p-2.5 bg-white/20 backdrop-blur-md text-white rounded-2xl">
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* --- PROFILE CARD --- */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-gray-200/50 border border-white">
          <div className="flex flex-col items-center text-center">
            <div className="relative w-28 h-28 rounded-[35px] overflow-hidden bg-blue-600 border-4 border-white shadow-lg mb-4">
              {data.profilePhoto ? (
                <Image src={data.profilePhoto} alt="Avatar" fill className="object-cover" />
              ) : (
                <span className="text-white text-4xl font-black flex items-center justify-center h-full">
                  {data.displayName?.charAt(0)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter">{data.displayName}</h1>
              {data.isVerified && <ShieldCheck size={20} className="text-blue-500" />}
            </div>
            
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-4">
              SD-{data.sdNumber}
            </p>

            <div className="flex items-center gap-4 w-full justify-center">
                <button 
                  onClick={() => router.push(`/messages/init?to=${data.sdNumber}`)}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  <MessageCircle size={18} /> Message
                </button>
                <button aria-label="shield" className="p-4 bg-gray-50 text-gray-400 rounded-2xl border border-gray-100">
                  <ShieldAlert size={20} />
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- TRUST STATS --- */}
      <div className="px-6 mt-6 grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-[24px] border border-gray-100">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Award size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Trust Score</span>
          </div>
          <h3 className="text-xl font-black text-gray-900">98%</h3>
        </div>
        <div className="bg-white p-5 rounded-[24px] border border-gray-100">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Package size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Deals</span>
          </div>
          <h3 className="text-xl font-black text-gray-900">142+</h3>
        </div>
      </div>

      {/* --- DETAILS SECTION --- */}
      <section className="px-6 mt-8">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Information</h3>
        <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden">
          <div className="p-5 flex items-center gap-4 border-b border-gray-50">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><MapPin size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Location</p>
              <p className="text-sm font-bold text-gray-700">Nairobi, Kenya</p>
            </div>
          </div>
          <div className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Calendar size={20} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase">Joined SureDeal</p>
              <p className="text-sm font-bold text-gray-700">January 2026</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- RECENT REVIEWS --- */}
      <section className="px-6 mt-8">
        <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Verified Reviews</h3>
            <span className="text-xs font-bold text-blue-600">See all</span>
        </div>
        <div className="bg-white p-5 rounded-[28px] border border-gray-100">
          <div className="flex items-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-amber-400 text-amber-400" />)}
          </div>
          <p className="text-sm text-gray-600 leading-relaxed font-medium">
            &ldquo;Extremely reliable {isStore ? 'merchant' : 'buyer'}. The escrow process was smooth and delivery was on time.&rdquo;
          </p>
        </div>
      </section>
    </main>
  );
}