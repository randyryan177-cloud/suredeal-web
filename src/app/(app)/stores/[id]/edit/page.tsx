"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Camera, Store, MapPin, 
  Globe, Info, Save, Loader2, Trash2 
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Image from "next/image";

export default function EditStorePage({ params }: any) {
  const resolvedParams = use(params);
  const storeId = (resolvedParams as any).id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    logo: "",
    banner: "",
    location: { city: "", address: "" },
    contactEmail: "",
    contactPhone: ""
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await apiService.get(`/stores/${storeId}`);
        const data = res.data.data || res.data;
        setFormData({
          name: data.name || "",
          description: data.description || "",
          category: data.category || "General",
          logo: data.logo || "",
          banner: data.banner || "",
          location: data.location || { city: "", address: "" },
          contactEmail: data.contactEmail || "",
          contactPhone: data.contactPhone || ""
        });
      } catch (err) {
        toast.error("Failed to load store profile");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, [storeId, router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Logic assumes you'll add router.patch("/:storeId") to your backend
      await apiService.patch(`/stores/${storeId}`, formData);
      toast.success("Store profile updated!");
      router.push(`/stores/${storeId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update store");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button aria-label="go back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Store Settings</h1>
          <button 
            form="store-form"
            disabled={isSaving}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black disabled:bg-gray-200 transition-all"
          >
            {isSaving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 mt-8">
        <form id="store-form" onSubmit={handleUpdate} className="space-y-8">
          
          {/* Visual Identity Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-2">Visual Identity</h3>
            <div className="relative group">
              {/* Banner Upload */}
              <div className="h-40 w-full bg-gray-200 rounded-[32px] overflow-hidden relative border-4 border-white shadow-sm">
  {formData.banner ? (
    <Image 
      src={formData.banner} 
      fill // Change this
      className="object-cover" 
      alt="Banner" 
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold uppercase text-[10px]">No Banner Set</div>
  )}
                <button aria-label="button" type="button" className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                  <Camera className="text-white" />
                </button>
              </div>

              {/* Logo Upload */}
              <div className="absolute -bottom-6 left-8 w-24 h-24 bg-white rounded-[28px] p-1 shadow-xl border border-gray-100 group/logo">
                <div className="w-full h-full bg-gray-50 rounded-[24px] overflow-hidden relative">
    <Image 
      src={formData.logo || "/placeholder-store.png"} 
      fill // Change this
      className="object-cover" 
      alt="Logo" 
    />
                  <button aria-label="button" type="button" className="absolute inset-0 bg-black/40 opacity-0 group/logo-hover:opacity-100 flex items-center justify-center text-white transition-all">
                    <Camera size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 grid grid-cols-1 gap-6">
            {/* Store Name & Category */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Store Brand Name</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input 
                        aria-label="store name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 rounded-2xl py-4 pl-12 pr-6 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Bio / Description</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-medium text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                    placeholder="Tell your customers about your business..."
                  />
               </div>
            </div>

            {/* Location & Contact */}
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
               <h3 className="text-sm font-black text-gray-900 flex items-center gap-2">
                  <MapPin size={18} className="text-blue-500" /> Physical Presence
               </h3>
               
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">City</label>
                    <input 
                        aria-label="city"
                      value={formData.location.city}
                      onChange={(e) => setFormData({...formData, location: {...formData.location, city: e.target.value}})}
                      className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Category</label>
                    <select 
                      aria-label="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full bg-gray-50 rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none appearance-none"
                    >
                       <option value="Electronics">Electronics</option>
                       <option value="Fashion">Fashion</option>
                       <option value="Services">Services</option>
                       <option value="Home">Home</option>
                    </select>
                  </div>
               </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}