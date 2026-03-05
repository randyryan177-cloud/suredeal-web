"use client";

import React, { useEffect, useState, use } from "react";
import { 
  MapPin, MessageSquare, CheckCircle2, ChevronLeft, 
  Calendar, Package, ShoppingBag 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { toast } from "sonner";

interface StorePageProps {
  params: Promise<{ id: string }>;
}

const InlineProductCard = ({ item, storeName }: { item: any, storeName: string }) => {
  const router = useRouter();
  return (
    <div 
      onClick={() => router.push(`/listing/${item.listingId}`)}
      className="bg-white rounded-[24px] border border-gray-100 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="relative aspect-square">
        <Image 
          src={item.mediaIds?.[0] || "/placeholder.png"} 
          alt={item.title} 
          fill 
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur px-3 py-1 rounded-full shadow-sm">
          <p className="text-[10px] font-black text-white uppercase">
            {item.currency || "KES"} {item.price?.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="p-4">
        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{storeName}</p>
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</h3>
      </div>
    </div>
  );
};

export default function StoreProfilePage({ params }: StorePageProps) {
  const resolvedParams = use(params);
  const storeId = resolvedParams.id;
  const router = useRouter();
  
  const [store, setStore] = useState<any | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId || storeId.includes("anonymous")) return;

    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const [storeRes, catalogRes] = await Promise.all([
          apiService.get(`/stores/${storeId}`),
          apiService.get(`/stores/${storeId}/catalog`).catch(() => ({ data: { data: [] } }))
        ]);

        const storeResult = storeRes.data?.data;

        if (storeResult && storeResult._id) {
          setStore(storeResult);
          // Try to find listings in either the catalog response or the store response
          const catalogResult = catalogRes.data?.data || storeResult.listings || [];
          setListings(Array.isArray(catalogResult) ? catalogResult : []);
        }
      } catch (error: any) {
        console.error("Store Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  if (loading) return <LoadingScreen />;
  
  if (!store) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <ShoppingBag className="text-gray-200 mb-4" size={64} />
      <h1 className="text-xl font-black text-gray-900">Store Not Found</h1>
      <button onClick={() => router.back()} className="mt-4 text-sm font-bold text-blue-600">Go Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="relative h-44 bg-gray-900">
        <Image
          src={store.coverPhoto || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1000"}
          alt="Cover"
          fill
          className="object-cover opacity-60"
        />
        <button aria-label="back" onClick={() => router.back()} className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-lg rounded-full">
          <ChevronLeft size={20} className="text-white" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <div className="relative flex flex-col items-center -mt-12">
          <div className="relative w-28 h-28 rounded-[32px] border-4 border-white bg-white shadow-xl overflow-hidden">
            <Image src={store.logoUrl || "/placeholder.png"} alt={store.name} fill className="object-cover" />
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <h1 className="text-2xl font-black text-gray-900">{store.name}</h1>
              {store.verified && <CheckCircle2 size={18} className="text-blue-500 fill-blue-50" />}
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 font-bold uppercase tracking-widest">
              <MapPin size={12} className="text-blue-500" />
              <span>{store.location?.city || "Kenya"}</span>
            </div>
            <p className="mt-4 text-sm text-gray-500 font-medium max-w-lg mx-auto">{store.description}</p>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button onClick={() => router.push(`/messenger/new?sd=${store.sdNumber}`)} className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <MessageSquare size={16} /> Message
            </button>
            <button onClick={() => router.push(`/escrow/partial?storeId=${storeId}`)} className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Calendar size={16} /> Lipa Mdogo
            </button>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Package size={18} className="text-blue-600" />
              <h2 className="text-lg font-black text-gray-900">Store Catalog</h2>
            </div>
            <span className="text-[10px] font-black text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">
              {listings.length} Items
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((item) => (
              <InlineProductCard key={item._id} item={item} storeName={store.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}