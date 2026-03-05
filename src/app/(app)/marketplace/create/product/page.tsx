"use client";

import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  //Camera, 
  X, 
  ChevronLeft, 
  UploadCloud, 
  Loader2, 
  //MapPin, 
  Tag, 
  Info 
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { UploadService } from "@/lib/upload-service";
import Image from "next/image";
  

const CATEGORIES = ["Electronics", "Furniture", "Fashion", "Vehicles", "Real Estate", "Services", "Other"];

const productSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  description: z.string().min(20, "Provide more details (min 20 chars)"),
  price: z.string().regex(/^\d+$/, "Must be a valid number"),
  //city: z.string().min(2, "City is required"),
  category: z.string().min(1, "Select a category"),
  //sdNumber: z.string().min(9, "Valid SD number required (e.g. 254...)"),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function CreateProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  const { control, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: { category: "Electronics" } //{/*, sdNumber: ""*/} 
  });

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 5 - images.length;
      const newImages = filesArray.slice(0, remainingSlots).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!storeId) return alert("Error: Store context missing.");
    if (images.length === 0) return alert("Please add at least one image.");

    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        setUploadProgress(`Uploading ${i + 1}/${images.length}...`);
        const url = await UploadService.uploadMedia(images[i].file, "image");
        uploadedUrls.push(url);
      }

      await apiService.post("/marketplace", {
        type: "PRODUCT",
        ownerType: "STORE",
        storeId: storeId,
        ...data,
        price: parseFloat(data.price),
        currency: "KES",
        //location: { country: "Kenya", city: data.city },
        mediaIds: uploadedUrls,
        status: "ACTIVE",
        stock: 1,
        condition: "USED",
      });

      alert("Product listed successfully!");
      router.push(`/stores/${storeId}`);
    } catch (error: any) {
      alert(error.message || "Failed to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F9FB] py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 font-bold text-sm uppercase transition-colors">
          <ChevronLeft size={20} /> Back
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: IMAGES */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-lg font-black text-gray-900 mb-1">Product Visuals</h2>
              <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-wider">Up to 5 high-quality photos</p>

              <div className="grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-gray-100 group">
                    <Image src={img.preview} alt="Preview" fill className="object-cover" />
                    <button 
                      type="button"
                        aria-label={`remove image ${i + 1}`}
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-white hover:border-blue-300 hover:text-blue-500 transition-all"
                  >
                    <UploadCloud size={24} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Add Photo</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleImagePick} />

              <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex gap-3">
                <Info className="text-blue-500 shrink-0" size={18} />
                <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                  Good lighting and clear angles help buyers trust your listing more.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: FORM DATA */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Tag className="text-blue-600" size={22} /> Listing Details
              </h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Product Title</label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <input 
                        {...field}
                        placeholder="e.g. Sony WH-1000XM5 Headphones"
                        className={`w-full bg-gray-50 border ${errors.title ? 'border-red-500' : 'border-gray-100'} p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all`}
                      />
                    )}
                  />
                  {errors.title && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.title.message}</span>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Price (KES)</label>
                    <Controller
                      control={control}
                      name="price"
                      render={({ field }) => (
                        <input {...field} type="number" placeholder="0.00" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                      )}
                    />
                    {errors.price && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.price.message}</span>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Category</label>
                    <Controller
                      control={control}
                      name="category"
                      render={({ field }) => (
                        <select {...field} className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none cursor-pointer">
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* City 
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">City</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Controller
                        control={control}
                        name="city"
                        render={({ field }) => (
                          <input {...field} placeholder="Nairobi" className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                        )}
                      />
                    </div>
                  </div>*/}

                  {/* SD Number 
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">SD Phone Number</label>
                    <Controller
                      control={control}
                      name="sdNumber"
                      render={({ field }) => (
                        <input {...field} placeholder="254..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                      )}
                    />
                  </div>*/}
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Full Description</label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <textarea 
                        {...field}
                        rows={6}
                        placeholder="Condition, age, why you're selling, features..."
                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                      />
                    )}
                  />
                  {errors.description && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.description.message}</span>}
                </div>
              </div>

              {/* Submit Section */}
              <div className="mt-12">
                {isSubmitting && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Loader2 className="animate-spin text-blue-600" size={20} />
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{uploadProgress}</span>
                  </div>
                )}
                <button
  disabled={isSubmitting || !storeId}
  className={`w-full py-5 ... ${
    isSubmitting || !storeId ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white'
  }`}
>
  {isSubmitting ? 'Processing...' : !storeId ? 'Store ID Missing' : 'Post Listing Now'}
</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}