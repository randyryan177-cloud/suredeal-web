"use client";

import React, { useEffect, useState } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  Star, 
  Package, 
  Heart, 
  Edit3, 
  Settings, 
  Share2, 
  PlusCircle, 
  ChevronRight,
  LogOut,
  BadgeCheck,
  AlertOctagon,
  Bot,
  RefreshCcw,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

// --- TYPES ---
interface ProfileStats {
  rating?: string;
  completedDeals?: number | string;
  activeListings?: number | string;
  reviewCount?: number | string;
}

interface ProfileData {
  profile: {
    displayName?: string;
    username?: string;
    profilePhoto?: string;
    location?: string;
    sdNumber?: string;
    bio?: string;
    flags?: {
      isFraud?: boolean;
      isVerified?: boolean;
    };
  };
  badges?: string[];
  stats?: ProfileStats;
}

interface MerchantStore {
  _id: string;
  name: string;
  logoUrl?: string;
  location?: { city: string };
  stats?: { listingCount: number };
}

export default function ProfilePage() {
  const { logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"listings" | "saved" | "reviews">("listings");
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [myStores, setMyStores] = useState<MerchantStore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const [profileRes, storesRes] = await Promise.all([
        apiService.get("profile/me"),
        apiService.get("stores/me"),
      ]);
      setProfileData(profileRes.data);
      setMyStores(storesRes.data.data || []);
    } catch (error) {
      console.error("Profile Fetch Error", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!profileData) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <AlertOctagon size={64} className="text-red-500 mb-4" />
      <h2 className="text-xl font-bold text-gray-900">Failed to load profile</h2>
      <button 
        onClick={fetchProfile}
        className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
      >
        <RefreshCcw size={18} /> Try Again
      </button>
    </div>
  );

  const { profile = {}, badges = [], stats = {} } = profileData;

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      <div className="h-48 bg-blue-600 w-full relative">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-end justify-end pb-4 gap-3">
          <button aria-label="share" className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all">
            <Share2 size={20} />
          </button>
          <button aria-label="settings" onClick={() => router.push('/profile/settings')} className="p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all">
            <Settings size={20} />
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8 -mt-16">
          
          <div className="w-full lg:w-1/3 space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
              <div className="relative w-32 h-32 mb-6">
                <Image 
                  src={profile.profilePhoto || "https://via.placeholder.com/150"} 
                  className="w-full h-full rounded-[40px] object-cover border-4 border-white shadow-md"
                  alt="Avatar"
                  width={128} // Fixed the missing width/height
                  height={128}
                  priority
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-white ${profile?.flags?.isFraud ? 'bg-red-500' : 'bg-green-500'}`} />
              </div>

              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-gray-900">{profile.displayName || "User"}</h1>
                {profile?.flags?.isVerified && <BadgeCheck size={22} className="text-blue-600" />}
              </div>
              <p className="text-gray-500 font-medium mb-4">@{profile.username || "user"}</p>
              
              <div className="flex flex-wrap gap-3 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-bold text-gray-600">
                  <MapPin size={14} /> {profile.location || "Kenya"}
                </div>
                <div className="px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-bold text-blue-600">
                  SD: {profile.sdNumber}
                </div>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed mb-8">
                {profile.bio || "Passionate about secure trading. Verified SureDeal user."}
              </p>

              <button 
                onClick={() => router.push('/profile/edit')}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
              >
                <Edit3 size={18} /> Edit Profile
              </button>

              <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-gray-50">
                <StatItem label="Rating" value={stats?.rating || "5.0"} icon={<Star size={14} className="fill-amber-400 text-amber-400" />} />
                <StatItem label="Deals" value={stats?.completedDeals || "0"} />
                <StatItem label="Listings" value={stats?.activeListings || "0"} />
                <StatItem label="Reviews" value={stats?.reviewCount || "0"} />
              </div>
            </div>

            <div className="bg-amber-50/50 rounded-[32px] p-6 border border-amber-100">
              <div className="flex items-center gap-2 mb-4 text-amber-700">
                <ShieldCheck size={20} />
                <h3 className="font-black text-sm uppercase tracking-wider">Trust Score</h3>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <TrustBadge label="Verified" color="bg-amber-100 text-amber-700" />
                {badges?.includes("GREEN_30_DEALS") && <TrustBadge label="Top Seller" color="bg-blue-100 text-blue-700" />}
                <TrustBadge label="Early Adopter" color="bg-purple-100 text-purple-700" />
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-black text-gray-900 uppercase tracking-widest text-xs">My Merchant Stores</h3>
                <button onClick={() => router.push('/marketplace/create/store')} className="text-blue-600 hover:underline text-xs font-bold">Manage All</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myStores.length > 0 ? (
                  myStores.map((store) => (
                    <div 
                      key={store._id}
                      onClick={() => router.push(`/stores/${store._id}/manage`)}
                      className="group bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-md transition-all cursor-pointer"
                    >
                      <Image 
                        src={store.logoUrl || "https://via.placeholder.com/60"} 
                        className="w-14 h-14 rounded-2xl object-cover" 
                        alt="logo" 
                        width={60} // Fixed missing props
                        height={60} 
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{store.name}</h4>
                        <p className="text-xs text-gray-500">{store.location?.city} • {store.stats?.listingCount || 0} Items</p>
                      </div>
                      <ChevronRight size={18} className="text-gray-300" />
                    </div>
                  ))
                ) : (
                  <button 
                    onClick={() => router.push('/marketplace/create/store')}
                    className="col-span-full border-2 border-dashed border-gray-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-all bg-white/50"
                  >
                    <PlusCircle size={32} />
                    <span className="font-bold">Open a Merchant Store</span>
                  </button>
                )}
              </div>
            </section>

            <section className="bg-white rounded-[40px] shadow-sm border border-gray-100 min-h-[500px] overflow-hidden">
              <div className="flex border-b border-gray-50 p-2">
                <TabButton active={activeTab === "listings"} onClick={() => setActiveTab("listings")} label="Listings" icon={<Package size={18}/>} />
                <TabButton active={activeTab === "saved"} onClick={() => setActiveTab("saved")} label="Saved" icon={<Heart size={18}/>} />
                <TabButton active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} label="Reviews" icon={<Star size={18}/>} />
              </div>
              
              <div className="p-12 flex flex-col items-center justify-center text-center opacity-40">
                <Package size={64} className="mb-4 text-gray-300" />
                <h4 className="text-lg font-bold">No {activeTab} yet</h4>
                <p className="text-sm">When you have {activeTab}, they&apos;ll appear here.</p>
              </div>
            </section>

            <button 
              onClick={logout}
              className="w-full py-4 rounded-2xl border border-red-100 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-50 transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={16} /> Log Out Account
            </button>
          </div>
        </div>
      </main>

      <button 
        aria-label="AI Help"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        onClick={() => router.push('/ai-help')}
      >
        <Bot size={32} />
      </button>
    </div>
  );
}

// --- SUB-COMPONENTS (With Types) ---

function StatItem({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="text-center lg:text-left">
      <div className="flex items-center justify-center lg:justify-start gap-1 mb-0.5">
        {icon}
        <span className="text-lg font-black text-gray-900">{value}</span>
      </div>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function TrustBadge({ label, color }: { label: string; color: string }) {
  return (
    <span className={`shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight ${color}`}>
      {label}
    </span>
  );
}

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-3xl transition-all ${active ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-400 hover:text-gray-600'}`}
    >
      {icon}
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}