"use client";

import React, { useState, use } from "react";
import { 
  Camera, 
  X, 
  ShieldCheck, 
  ChevronLeft, 
  Info, 
  Calendar,
  User,
  Hash,
  ShoppingBag
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { UploadService } from "@/lib/upload-service";

export default function EscrowPartialPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  // Get store details from URL search params
  const storeId = searchParams.get("storeId");
  const storeName = searchParams.get("storeName") || "the Merchant";

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [form, setForm] = useState({
    productDescription: "",
    duration: "", 
    deliveryConditions: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedFiles = [...images, ...newFiles].slice(0, 2);
      setImages(updatedFiles);

      const newPreviews = updatedFiles.map(file => URL.createObjectURL(file));
      setPreviews(newPreviews);
    }
  };

  const removeImage = (index: number) => {
    const updatedFiles = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedFiles);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.productDescription || !form.duration) {
      return toast.error("Missing Information", { 
        description: "Please describe the product and payment duration." 
      });
    }

    setLoading(true);
    try {
      // 1. Upload Images using the new UploadService
      const uploadedUrls: string[] = [];
      
      for (const file of images) {
        // We specify "image" as the type for Cloudinary resource routing
        const url = await UploadService.uploadMedia(file, "image");
        uploadedUrls.push(url);
      }

      // 2. Send Request to your Backend
      const payload = {
        storeId,
        type: "LIPA_MDOGO_REQUEST",
        details: {
          ...form,
          fullName: user?.displayName,
          sdNumber: user?.sdNumber,
          referenceImages: uploadedUrls, // Now contains Cloudinary secure_urls
        },
      };

      await apiService.post(`/lipa-mdogo/request`, payload);

      toast.success("Request Sent!", {
        description: `Your Lipa Mdogo request has been sent to ${storeName}.`,
      });
      
      // Cleanup previews to free up memory
      previews.forEach(url => URL.revokeObjectURL(url));
      
      router.push(`/stores/${storeId}`);
    } catch (error: any) {
      console.error("Submission Error:", error);
      toast.error("Submission failed", { 
        description: error.message || "Please check your internet connection and try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900">Lipa Mdogo Application</h1>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Store: {storeName}</p>
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Identity Section (Read Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyField label="Your Name" value={user?.displayName || "User"} icon={<User size={16}/>} />
            <ReadOnlyField label="SD Number" value={user?.sdNumber || "Not Set"} icon={<Hash size={16}/>} />
          </div>

          {/* Form Fields */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Product You Want
              </label>
              <textarea
                required
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[100px] transition-all"
                placeholder="Specify the item (e.g. Samsung A54, 128GB, Black)"
                value={form.productDescription}
                onChange={(e) => setForm({...form, productDescription: e.target.value})}
              />
            </div>

            {/* Image Uploader */}
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Reference Images (Max 2)
              </label>
              <div className="flex gap-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-28 h-28 rounded-2xl overflow-hidden group">
                    <Image src={src} alt="Preview" fill className="object-cover" />
                    <button 
                      aria-label="Remove Image"
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {images.length < 2 && (
                  <label className="w-28 h-28 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-500 hover:bg-emerald-50 transition-all text-gray-400 hover:text-emerald-600">
                    <Camera size={28} />
                    <span className="text-[10px] font-bold">Add Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Preferred Payment Duration
              </label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  required
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="e.g. 3 Months / 12 Weeks"
                  value={form.duration}
                  onChange={(e) => setForm({...form, duration: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Delivery & Other Conditions
              </label>
              <textarea
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none min-h-[80px] transition-all"
                placeholder="e.g. Pick up at shop / Delivery to Westlands..."
                value={form.deliveryConditions}
                onChange={(e) => setForm({...form, deliveryConditions: e.target.value})}
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[24px] flex gap-4">
            <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
              This request is <strong>non-binding</strong>. If the seller accepts, a secure SureDeal Escrow 
              agreement will be created for you to begin your installment payments.
            </p>
          </div>

          <button
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-black text-white text-lg transition-all shadow-xl
              ${loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100 active:scale-[0.98]'}`}
          >
            {loading ? "Processing..." : "Submit Application"}
          </button>
        </form>
      </main>
    </div>
  );
}

function ReadOnlyField({ label, value, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}