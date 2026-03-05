"use client";

import React, { useEffect, useState, use } from "react";
import { 
  Plus, Edit3, Trash2, Package, Search, 
  ExternalLink, MoreVertical, AlertCircle, Loader2,
  ChevronLeft, LayoutGrid, List
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function StoreCatalogPage({ params }: any) {
  const resolvedParams = use(params);
  const storeId = (resolvedParams as any).id;
  const router = useRouter();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const fetchCatalog = async () => {
    try {
      setLoading(true);
      // We use the /me/all endpoint as per your backend router to get owned listings
      const res = await apiService.get("/marketplace/me/all");
      // Filtering for this specific store in case the user has multiple
      const allListings = res.data.data || res.data || [];
      setListings(allListings.filter((l: any) => l.storeId === storeId));
    } catch (error) {
      toast.error("Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCatalog(); }, [storeId]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This listing will be removed from the marketplace.")) return;
    
    try {
      await apiService.delete(`/marketplace/${id}`);
      setListings(prev => prev.filter(item => item._id !== id));
      toast.success("Listing deleted");
    } catch (err) {
      toast.error("Could not delete listing");
    }
  };

  const filteredListings = listings.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Header Area */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button aria-label="go back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ChevronLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Catalog</h1>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{listings.length} Active Items</p>
              </div>
            </div>
            <button 
              aria-label="add new listing"
              onClick={() => router.push(`/marketplace/create?storeId=${storeId}`)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
            >
              <Plus size={18} strokeWidth={3} /> Add New
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                placeholder="Search your inventory..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button aria-label="grid view" onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><LayoutGrid size={20}/></button>
                <button aria-label="list view" onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}><List size={20}/></button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {filteredListings.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-gray-100">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <h3 className="text-lg font-black text-gray-900">No listings found</h3>
            <p className="text-sm text-gray-400 font-medium">Start adding items to your store catalog.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredListings.map((item) => (
              <CatalogItem 
                key={item._id} 
                item={item} 
                viewMode={viewMode}
                onDelete={() => handleDelete(item._id)}
                onEdit={() => router.push(`/marketplace/edit/${item._id}`)}
                onView={() => router.push(`/marketplace/${item._id}`)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// --- SUB-COMPONENT: CATALOG ITEM ---

function CatalogItem({ item, viewMode, onEdit, onDelete, onView }: any) {
  if (viewMode === 'grid') {
    return (
      <div className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="relative aspect-video bg-gray-50">
          <Image src={item.mediaIds?.[0] || "/placeholder.png"} alt={item.title} fill className="object-cover" />
          <div className="absolute top-3 right-3 flex gap-2">
            <button aria-label="edit" onClick={onEdit} className="p-2 bg-white/90 backdrop-blur rounded-xl text-gray-700 hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Edit3 size={16}/></button>
          </div>
        </div>
        <div className="p-5">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900 truncate pr-4">{item.title}</h3>
            <span className="text-xs font-black text-blue-600">KES {item.price.toLocaleString()}</span>
          </div>
          <div className="flex gap-2 mt-4">
             <button aria-label="view" onClick={onView} className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all">View Public</button>
             <button aria-label="delete" onClick={onDelete} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16}/></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4 hover:shadow-sm transition-all group">
      <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
        <Image src={item.mediaIds?.[0] || "/placeholder.png"} alt={item.title} fill className="object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-black text-gray-900 truncate">{item.title}</h3>
        <p className="text-xs font-bold text-blue-600 mt-1">KES {item.price.toLocaleString()}</p>
        <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.category}</span>
            <span className="w-1 h-1 bg-gray-200 rounded-full" />
            <span className={`text-[10px] font-black uppercase ${item.stock > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {item.stock > 0 ? `${item.stock} in stock` : 'Out of Stock'}
            </span>
        </div>
      </div>
      <div className="flex gap-2">
        <button aria-label="edit" onClick={onEdit} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"><Edit3 size={20}/></button>
        <button aria-label="delete" onClick={onDelete} className="p-3 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"><Trash2 size={20}/></button>
      </div>
    </div>
  );
}