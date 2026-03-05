"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, Save, ImageIcon, 
  Trash2, Plus, Loader2, Info 
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Image from "next/image";

export default function EditListingPage({ params }: any) {
  const resolvedParams = use(params);
  const listingId = (resolvedParams as any).id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [issaving, setIsSaving] = useState(false);
  
  // Form State matching createListingSchema
  const [formData, setFormData] = useState<any>({
    title: "",
    description: "",
    price: 0,
    category: "",
    type: "PRODUCT",
    mediaIds: [],
    stock: 0,
    condition: "NEW"
  });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await apiService.get(`/marketplace/${listingId}`);
        const data = res.data.data || res.data;
        setFormData({
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          type: data.type,
          mediaIds: data.mediaIds || [],
          stock: data.stock || 0,
          condition: data.condition || "NEW"
        });
      } catch (err) {
        toast.error("Could not load listing details");
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [listingId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Sending PATCH as per your router
      await apiService.patch(`/marketplace/${listingId}`, formData);
      toast.success("Listing updated successfully!");
      router.push(`/stores/${formData.storeId || 'me'}/catalog`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update listing");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <header className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between sticky top-0 bg-[#FDFDFF]/80 backdrop-blur-md z-30">
        <button 
          aria-label="go back"
          onClick={() => router.back()} 
          className="p-2 hover:bg-gray-100 rounded-full transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-black text-gray-900 uppercase tracking-tighter">Edit Listing</h1>
        <button 
          aria-label="save changes"
          form="edit-form"
          type="submit"
          disabled={issaving}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-lg shadow-blue-100"
        >
          {issaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </header>

      <main className="max-w-3xl mx-auto px-6">
        <form id="edit-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Media Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <ImageIcon size={16} /> Gallery
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {formData.mediaIds.map((url: string, idx: number) => (
                <div key={idx} className="relative aspect-square rounded-3xl overflow-hidden border border-gray-100 group">
                  <Image src={url} alt="Listing" fill className="object-cover" />
                  <button 
                    aria-label="remove image"
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaIds: formData.mediaIds.filter((_: any, i: number) => i !== idx) })}
                    className="absolute inset-0 bg-rose-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
              <button 
                aria-label="add image"
                type="button"
                className="aspect-square rounded-3xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all"
              >
                <Plus size={24} />
                <span className="text-[10px] font-black uppercase mt-2">Add</span>
              </button>
            </div>
          </section>

          {/* Details Section */}
          <section className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info size={16} /> Product Information
            </h3>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Listing Title</label>
              <input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                placeholder="e.g. DJI Mavic 3 Classic"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Price (KES)</label>
                <input 
                  aria-label="number"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Stock Level</label>
                <input 
                  aria-label="number"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-bold text-gray-900 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Description</label>
              <textarea 
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-gray-50 border-none rounded-2xl py-4 px-6 font-medium text-gray-600 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                placeholder="Describe the product or service in detail..."
              />
            </div>
          </section>

          {/* Safety Notice */}
          <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm text-amber-600">
               <Info size={20} />
            </div>
            <p className="text-[11px] text-amber-900 font-bold leading-relaxed uppercase">
              Updates are reflected instantly. Ensure your stock levels and pricing are accurate to maintain your SureDeal Merchant Trust Score.
            </p>
          </div>
        </form>
      </main>
    </div>
  );
}