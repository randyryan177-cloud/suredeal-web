"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  Camera, 
  Plus, 
  Image as ImageIcon, 
  MapPin, 
  Store, 
  Calendar,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { apiService } from "@/lib/api";
import { UploadService } from "@/lib/upload-service";
import Image from "next/image";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CreateStorePage() {
  const router = useRouter();
  const galleryRef = useRef<HTMLInputElement>(null);

  // Loading States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingStatus, setUploadingStatus] = useState("");

  const [isLocating, setIsLocating] = useState(false);
  const [geoData, setGeoData] = useState({
    type: "Point",
    coordinates: [36.8219, -1.2921], // Default Nairobi
  });

  // Media States
  const [logo, setLogo] = useState<{ file: File; preview: string } | null>(null);
  const [cover, setCover] = useState<{ file: File; preview: string } | null>(null);
  const [gallery, setGallery] = useState<{ file: File; preview: string }[]>([]);

  // Form States
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
  });
  const [openDays, setOpenDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thu", "Fri"]);

  // Image Handlers
  const handleMediaPick = (e: React.ChangeEvent<HTMLInputElement>, target: "logo" | "cover" | "gallery") => {
    if (!e.target.files?.length) return;
    
    if (target === "gallery") {
      const remaining = 5 - gallery.length;
      const files = Array.from(e.target.files).slice(0, remaining).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setGallery(prev => [...prev, ...files]);
    } else {
      const file = e.target.files[0];
      const data = { file, preview: URL.createObjectURL(file) };
      target === "logo" ? setLogo(data) : setCover(data);
    }
  };

  const toggleDay = (day: string) => {
    setOpenDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // HIGH-END: REVERSE GEOCODING LOGIC
  const handleAutoLocate = () => {
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { longitude, latitude } = pos.coords;
      
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await res.json();
        
        const city = data.address.city || data.address.town || data.address.suburb || "Nairobi";
        const country = data.address.country || "Kenya";

        // Update Form Display
        setForm(prev => ({ ...prev, location: `${city}, ${country}` }));
        
        // Update Internal GeoJSON for Backend
        setGeoData({
          type: "Point",
          coordinates: [longitude, latitude], // [lng, lat] standard
        });

        toast.success(`Located in ${city}!`);
      } catch (err) {
        toast.error("Failed to fetch address details.");
      } finally {
        setIsLocating(false);
      }
    }, () => {
      setIsLocating(false);
      toast.error("Location permission denied.");
    });
  };


  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.description || !logo || !cover) {
      return alert("Please provide a name, description, logo, and cover photo.");
    }

    setIsSubmitting(true);
    try {
      // 1. Sequential Uploads
      setUploadingStatus("Uploading Brand Assets...");
      const logoUrl = await UploadService.uploadMedia(logo.file, "image");
      const coverUrl = await UploadService.uploadMedia(cover.file, "image");

      const galleryUrls: string[] = []; // Explicit type to satisfy ESLint
      for (let i = 0; i < gallery.length; i++) {
        setUploadingStatus(`Uploading Gallery ${i + 1}/${gallery.length}...`);
        const gUrl = await UploadService.uploadMedia(gallery[i].file, "image");
        galleryUrls.push(gUrl);
      }

      // 2. Prepare Payload
      const locationParts = form.location.split(",").map(s => s.trim());
      const payload = {
        name: form.name,
        description: form.description,
        logoUrl,
        coverPhoto: coverUrl,
        gallery: galleryUrls,
        openDays,
        category: form.category,
        location: {
          city: locationParts[0] || "Unknown City",
          country: locationParts[1] || "Kenya",
          geo: geoData, // Sending the correct GeoJSON object
        },
      };

      // 3. Capture the response to get the new ID
      const response = await apiService.post("stores", payload);
      
      
      const newStoreId = response.data?.data?._id || response.data?._id;

      if (newStoreId) {
        alert("Success! Your merchant store is now open.");
        router.push(`/stores/${newStoreId}`);
      } else {
        // Fallback if ID is missing for some reason
        router.push("/profile"); 
      }
      
    } catch (error: unknown) { // Using 'unknown' instead of 'any' for better TS practice
      const message = error instanceof Error ? error.message : "Failed to create store.";
      alert(message);
    } finally {
      setIsSubmitting(false);
      setUploadingStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={24} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tight">Setup Merchant Store</h1>
          </div>
          {isSubmitting && (
            <div className="flex items-center gap-3 text-emerald-600 animate-pulse">
              <Loader2 className="animate-spin" size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{uploadingStatus}</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <form onSubmit={handleCreateStore} className="space-y-8">
          
          {/* Visual Identity Section */}
          <section className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
            <div className="relative h-64 bg-gray-200 group">
              {cover ? (
                <Image src={cover.preview} alt="Cover" fill className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ImageIcon size={48} strokeWidth={1} />
                  <p className="text-xs font-bold uppercase mt-2">Add Cover Photo</p>
                </div>
              )}
              <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                <input type="file" hidden accept="image/*" onChange={(e) => handleMediaPick(e, "cover")} />
                <div className="bg-white px-6 py-3 rounded-full text-sm font-black shadow-xl">Change Cover</div>
              </label>

              {/* Overlapping Logo */}
              <div className="absolute -bottom-12 left-10 group/logo">
                <div className="w-32 h-32 rounded-full border-8 border-white bg-gray-100 overflow-hidden shadow-lg relative">
                  {logo ? (
                    <Image src={logo.preview} alt="Logo" fill className="object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-emerald-500">
                      <Camera size={32} />
                    </div>
                  )}
                  <label className="absolute inset-0 cursor-pointer bg-black/40 opacity-0 group-hover/logo:opacity-100 flex items-center justify-center transition-opacity">
                    <input type="file" hidden accept="image/*" onChange={(e) => handleMediaPick(e, "logo")} />
                    <Plus className="text-white" size={32} />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-20 pb-10 px-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Store Name *</label>
                    <input 
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g. Rambo's Electronics" 
                      className="w-full bg-gray-50 border-none p-4 rounded-2xl text-lg font-bold focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                    <input 
                      value={form.category}
                      onChange={e => setForm({...form, category: e.target.value})}
                      placeholder="e.g. Electronics & Tech" 
                      className="w-full bg-gray-50 border-none p-4 rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
        Store Location *
      </label>
      <div className="relative group/loc">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" size={18} />
        <input 
          value={form.location}
          onChange={e => setForm({...form, location: e.target.value})}
          placeholder="Detecting location..." 
          className="w-full bg-gray-50 border-none pl-12 pr-32 py-4 rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
        />
        <button
          type="button"
          onClick={handleAutoLocate}
          disabled={isLocating}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight shadow-sm border border-gray-100 hover:bg-gray-50 active:scale-95 transition-all text-emerald-600 disabled:opacity-50"
        >
          {isLocating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            "Auto-Detect"
          )}
        </button>
      </div>
      <p className="text-[9px] text-gray-400 mt-2 ml-2 italic">
        Coordinates: {geoData.coordinates[0].toFixed(4)}, {geoData.coordinates[1].toFixed(4)}
      </p>
    </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Store Bio / Description *</label>
                    <textarea 
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                      rows={1}
                      placeholder="What makes your store special?" 
                      className="w-full bg-gray-50 border-none p-4 rounded-2xl font-medium focus:ring-2 focus:ring-emerald-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Operational Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <ImageIcon size={16} /> Store Gallery
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {gallery.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group">
                    <Image src={img.preview} alt="Gallery" fill className="object-cover" />
                    <button 
                      type="button" 
                      aria-label={`remove gallery image ${i + 1}`}
                      onClick={() => setGallery(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {gallery.length < 5 && (
                  <button 
                    type="button"
                    aria-label="add gallery images"
                    onClick={() => galleryRef.current?.click()}
                    className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:border-emerald-500 hover:text-emerald-500 transition-all"
                  >
                    <Plus size={32} />
                  </button>
                )}
              </div>
              <input type="file" ref={galleryRef} hidden multiple accept="image/*" onChange={(e) => handleMediaPick(e, "gallery")} />
            </section>

            {/* Operating Hours */}
            <section className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <Calendar size={16} /> Operating Days
              </h3>
              <div className="flex flex-wrap gap-3">
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`flex-1 min-w-[60px] h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                      openDays.includes(day) 
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                      : 'bg-gray-50 text-gray-400 border border-gray-100 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-[10px] font-black uppercase tracking-tighter">{day}</span>
                    {openDays.includes(day) && <CheckCircle2 size={12} className="mt-1" />}
                  </button>
                ))}
              </div>
            </section>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-6 rounded-[24px] text-sm font-black uppercase tracking-[4px] transition-all shadow-xl ${
              isSubmitting 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.98] shadow-emerald-100'
            }`}
          >
            {isSubmitting ? 'Opening your store...' : 'Launch Merchant Store'}
          </button>
        </form>
      </main>
    </div>
  );
}