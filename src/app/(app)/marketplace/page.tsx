"use client";

import React, { useState } from "react";
import { 
  Search, 
  Filter, 
  MapPin, 
  ShoppingBag, 
  Briefcase, 
  Loader2,
  Heart
} from "lucide-react";
import useSWR from "swr";
import { useDebounce } from "@/hooks/useDebounce";
import { apiService } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

type ListingType = "PRODUCT" | "SERVICE";

interface MarketplaceListing {
  listingId: string;
  title: string;
  type: string;
  mediaIds?: string[];
  price?: number;
  location?: { city: string };
}

const fetcher = ([url, params]: [string, any]): Promise<MarketplaceListing[]> => 
  apiService.get(url, { params }).then(res => res.data.data || res.data);

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<ListingType>("PRODUCT");
  const [searchQuery, setSearchQuery] = useState("");

  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data: listings = [], isLoading } = useSWR<MarketplaceListing[]>(
    [`marketplace`, { q: debouncedSearch, type: activeTab }],
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  const loading = isLoading && !listings.length;

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* --- STICKY HEADER --- */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Marketplace</h1>
              <p className="text-xs text-gray-500 font-medium">Verified deals secured by SureDeal Escrow</p>
            </div>

            <div className="flex flex-1 max-w-2xl items-center gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text"
                  placeholder={`Search for ${activeTab.toLowerCase()}s...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent border-2 rounded-2xl focus:bg-white focus:border-blue-600 outline-none transition-all text-sm font-medium"
                />
              </div>
              <button aria-label="filter" className="p-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-colors text-gray-700">
                <Filter size={20} />
              </button>
            </div>
          </div>

          {/* --- TABS --- */}
          <div className="flex gap-4 mt-6">
            <TabButton 
              active={activeTab === "PRODUCT"} 
              onClick={() => setActiveTab("PRODUCT")}
              icon={<ShoppingBag size={16} />}
              label="All Products"
              activeColor="bg-blue-600"
            />
            <TabButton 
              active={activeTab === "SERVICE"} 
              onClick={() => setActiveTab("SERVICE")}
              icon={<Briefcase size={16} />}
              label="Services"
              activeColor="bg-amber-500"
            />
          </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="max-w-7xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
            <p className="text-gray-500 font-black text-sm uppercase tracking-widest">Scanning the market...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-gray-200">
            <Search className="mx-auto text-gray-200 mb-4" size={64} />
            <h3 className="text-xl font-black text-gray-900">No {activeTab.toLowerCase()}s found</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">Try adjusting your search or filters to find what you&apos;re looking for.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item) => (
              <ListingCard key={item.listingId} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* --- FAB ---
      <Link 
        href="/marketplace/create"
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group z-30"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform" />
      </Link>
       */}
    </main>
  );
}

// --- SUB-COMPONENTS ---

function TabButton({ active, onClick, icon, label, activeColor }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  activeColor: string; 
}) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
        active 
        ? `${activeColor} text-white shadow-lg` 
        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function ListingCard({ item }: { item: MarketplaceListing }) {
  return (
    <Link href={`/listings/${item.listingId}`} className="group">
      <div className="bg-white rounded-[24px] overflow-hidden border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
        {/* Image wrapper */}
        <div className="relative h-64 w-full bg-gray-100">
          <Image 
            src={item.mediaIds?.[0] || "https://via.placeholder.com/400"} 
            alt={item.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-gray-900 shadow-sm">
              {item.type}
            </span>
          </div>
          <button aria-label="add to favorites" className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
            <Heart size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="p-5">
          <div className="flex items-center gap-1.5 mb-1 text-gray-400">
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.location?.city || "Kenya"}</span>
          </div>
          
          <h3 className="text-gray-900 font-bold text-sm mb-3 line-clamp-2 h-10 leading-tight group-hover:text-blue-600 transition-colors">
            {item.title}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Price</p>
              <p className="text-lg font-black text-gray-900">
                KES {item.price?.toLocaleString() || "TBD"}
              </p>
            </div>
            
            <div className="px-3 py-1.5 bg-blue-50 rounded-lg">
              <span className="text-[10px] font-black text-blue-600 uppercase">View Deal</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}