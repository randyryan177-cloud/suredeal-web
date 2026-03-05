"use client";

import React, { useState, useRef } from "react";
import { 
  Camera, 
  ChevronLeft, 
  Info, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/auth-context";
import { apiService } from "@/lib/api";
import { UploadService } from "@/lib/upload-service"; 
import { toast } from "sonner"; 

export default function EditProfilePage() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large", { description: "Please upload an image under 5MB" });
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload to Cloudinary (Ensure UploadService.uploadMedia accepts File)
      const imageUrl = await UploadService.uploadMedia(file, "image");
      setProfilePhoto(imageUrl);
      toast.success("Photo uploaded successfully");
    } catch (error: any) {
      toast.error("Upload failed", { description: error.message || "Could not upload image." });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast.error("Validation Error", { description: "Display name is required" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        profilePhoto: profilePhoto,
      };

      // Step 2: Patch backend
      const response = await apiService.patch("profile/me", payload);

      // Step 3: Update Auth Context
      if (setUser) {
        setUser(response.data.user || response.data);
      }

      toast.success("Profile updated!");
      router.back();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to update profile";
      toast.error("Update Error", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Sticky Top Nav */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button 
            aria-label="go back"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Edit Profile</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8">
        <form onSubmit={handleSave} className="space-y-8">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden border-4 border-white shadow-lg bg-gray-200">
                <Image
                  src={profilePhoto || "/images/default-avatar.png"}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-sm">
                    <Loader2 className="animate-spin text-white" size={32} />
                  </div>
                )}
              </div>
              
              <button
                type="button"
                aria-label="Change Profile Photo"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl border-4 border-gray-50 shadow-xl hover:bg-blue-700 transition-all active:scale-90"
              >
                <Camera size={20} />
              </button>
            </div>
            
            <input 
              type="file" 
              aria-label="file"
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange} 
            />
            
            <p className="mt-4 text-sm font-bold text-blue-600">
              {uploading ? "Uploading to Cloudinary..." : "Change Profile Photo"}
            </p>
          </div>

          {/* Form Fields */}
          <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Dan Wema"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[2px] mb-2 px-1">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                rows={4}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:border-blue-500 focus:bg-white outline-none transition-all text-gray-900 font-medium resize-none"
              />
            </div>

            {/* Verification Info Box */}
            <div className="flex gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <Info size={20} className="text-blue-500 shrink-0" />
              <p className="text-xs leading-relaxed text-blue-700 font-medium">
                Personal details like your <span className="font-bold">SD Number</span> and <span className="font-bold">Verification Badges</span> are tied to your identity and cannot be changed manually.
              </p>
            </div>
          </div>

          {/* Save Action */}
          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-2xl font-black text-lg shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <CheckCircle2 size={24} />
                Save Changes
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}