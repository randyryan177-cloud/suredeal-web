"use client";

import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Camera, 
  X, 
  ChevronLeft, 
  Briefcase, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  //MapPin,
  Loader2
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { UploadService } from "@/lib/upload-service";
import Image from "next/image";

const CATEGORIES = ["Creative", "Tech", "Legal", "Marketing", "Writing", "Repair", "Other"];

const serviceSchema = z.object({
  title: z.string().min(10, "Title must be descriptive"),
  description: z.string().min(30, "Please describe your service in detail"),
  rate: z.string().regex(/^\d+$/, "Rate must be a number"),
  category: z.string().min(2, "Select a category"),
  //location: z.string().min(2, "City/Location is required"),
  //sdNumber: z.string().min(9, "Valid SD number required"),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

export default function CreateServicePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [rateType, setRateType] = useState<"fixed" | "hourly">("fixed");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingState, setUploadingState] = useState("");
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId");

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { category: "Creative", title: "", description: "" },
  });

  const selectedCategory = watch("category");

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remaining = 3 - images.length;
      const newImages = filesArray.slice(0, remaining).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages([...images, ...newImages]);
    }
  };

  const onSubmit = async (data: ServiceFormData) => {
    if (!storeId) return alert("Error: Store context missing.");
    if (images.length === 0) return alert("Add at least one portfolio image.");

    setIsSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        setUploadingState(`Uploading ${i + 1}/${images.length}...`);
        const url = await UploadService.uploadMedia(images[i].file, "image");
        uploadedUrls.push(url);
      }

      await apiService.post("/marketplace", {
        type: "SERVICE",
        ownerType: "STORE",
        storeId: storeId,
        ...data,
        price: parseFloat(data.rate),
        currency: "KES",
        mediaIds: uploadedUrls,
        status: "ACTIVE",
        //location: { country: "Kenya", city: data.location },
        durationDays: 1,
      });

      alert("Service Published!");
      router.push(`/stores/${storeId}`);
    } catch (error: any) {
      alert(error.message || "Failed to create service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCF9F1] py-12 px-4"> {/* Slight gold tint bg */}
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-amber-700/60 hover:text-amber-900 mb-6 font-bold text-sm uppercase tracking-widest transition-colors">
          <ChevronLeft size={20} /> Back
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Portfolio Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-[32px] shadow-sm border border-amber-100 sticky top-8">
              <h2 className="text-lg font-black text-gray-900 mb-1">Service Portfolio</h2>
              <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-wider">Showcase your best work (Max 3)</p>

              <div className="space-y-3">
                {images.map((img, i) => (
                  <div key={i} className="relative h-40 w-full rounded-2xl overflow-hidden border border-gray-100 group">
                    <Image src={img.preview} alt="Work" fill className="object-cover" />
                    <button 
                      type="button"
                        aria-label={`remove image ${i + 1}`}
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {images.length < 3 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="h-40 w-full rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/30 flex flex-col items-center justify-center gap-2 text-amber-600 hover:bg-amber-50 hover:border-amber-400 transition-all"
                  >
                    <Camera size={28} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">Add Project Image</span>
                  </button>
                )}
              </div>
              <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleImagePick} />

              <div className="mt-8 p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                <div className="flex items-center gap-2 mb-2 text-amber-700">
                  <ShieldCheck size={18} />
                  <span className="text-xs font-black uppercase">Escrow Protected</span>
                </div>
                <p className="text-[11px] text-amber-800/70 leading-relaxed font-medium">
                  Service payments are held securely. Buyers release funds based on your agreed milestones.
                </p>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Briefcase className="text-amber-500" size={22} /> Service Info
              </h2>

              <div className="space-y-6">
                {/* Category Chips */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-3 px-1">Specialization</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setValue("category", cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                          selectedCategory === cat 
                          ? 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100' 
                          : 'bg-gray-50 border-gray-100 text-gray-500 hover:border-amber-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Service Title</label>
                  <Controller
                    control={control}
                    name="title"
                    render={({ field }) => (
                      <input {...field} placeholder="e.g. Senior Mobile App Developer" className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all" />
                    )}
                  />
                  {errors.title && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.title.message}</span>}
                </div>

                {/* Pricing & Billing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Starting Rate (KES)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Controller
                        control={control}
                        name="rate"
                        render={({ field }) => (
                          <input {...field} type="number" placeholder="5,000" className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all" />
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Billing Model</label>
                    <div className="flex bg-gray-100 p-1.5 rounded-2xl h-[58px]">
                      <button
                        type="button"
                        onClick={() => setRateType("fixed")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-black transition-all ${rateType === "fixed" ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        FIXED
                      </button>
                      <button
                        type="button"
                        onClick={() => setRateType("hourly")}
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-black transition-all ${rateType === "hourly" ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400 hover:text-gray-600'}`}
                      >
                        <Clock size={14} /> HOURLY
                      </button>
                    </div>
                  </div>
                </div>

                {/* Location & SD 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Primary Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <Controller
                        control={control}
                        name="location"
                        render={({ field }) => (
                          <input {...field} placeholder="Nairobi or Remote" className="w-full bg-gray-50 border border-gray-100 pl-11 pr-4 py-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all" />
                        )}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Verified SD Number</label>
                    <Controller
                      control={control}
                      name="sdNumber"
                      render={({ field }) => (
                        <input {...field} placeholder="254..." className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all" />
                      )}
                    />
                  </div>
                </div>*/}

                {/* Description */}
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-2 px-1">Expertise & Scope of Work</label>
                  <Controller
                    control={control}
                    name="description"
                    render={({ field }) => (
                      <textarea 
                        {...field}
                        rows={6}
                        placeholder="Describe your experience, what tools you use, and what a client receives..."
                        className="w-full bg-gray-50 border border-gray-100 p-4 rounded-2xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-amber-100 outline-none transition-all resize-none"
                      />
                    )}
                  />
                  {errors.description && <span className="text-red-500 text-[10px] font-bold mt-1 ml-1 uppercase">{errors.description.message}</span>}
                </div>
              </div>

              {/* Submit */}
              <div className="mt-12">
                {isSubmitting && (
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Loader2 className="animate-spin text-amber-600" size={20} />
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">{uploadingState}</span>
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