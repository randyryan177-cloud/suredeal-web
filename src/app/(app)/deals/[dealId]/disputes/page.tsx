"use client";

import React, { useState, useRef } from "react";
import { 
  X, 
  ShieldAlert, 
  Camera, 
  Trash2, 
  AlertCircle,
  ShieldCheck,
  Loader2 
} from "lucide-react";
import { apiService } from "@/lib/api";
import { UploadService } from "@/lib/upload-service";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

const DISPUTE_REASONS = [
  "Item not as described",
  "Seller is unresponsive",
  "Quality issues",
  "Incomplete delivery",
  "Other",
];

export default function DisputeRequestPage() {
  const router = useRouter();
  const { dealId } = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [evidenceFiles, setEvidenceFiles] = useState<{ file: File; preview: string }[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const remainingSlots = 3 - evidenceFiles.length;
      
      const newFiles = filesArray.slice(0, remainingSlots).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));

      setEvidenceFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || !details) return;

    const confirmed = window.confirm(
      "Confirm Dispute? This will freeze the funds in escrow immediately. A SureDeal mediator will review your case."
    );

    if (confirmed) {
      setLoading(true);
      try {
        // 1. Upload Images
        const evidenceUrls = [];
        for (const item of evidenceFiles) {
          const url = await UploadService.uploadMedia(item.file, "image");
          evidenceUrls.push(url);
        }

        // 2. Post Dispute
        await apiService.post(`/deals/${dealId}/dispute`, {
          reason,
          details,
          evidence: evidenceUrls,
        });

        alert("Dispute Opened. Our mediation team has been notified.");
        router.push("/deals");
      } catch (err: any) {
        alert(err.response?.data?.message || "Failed to open dispute.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-gray-100">
        
        {/* --- HEADER --- */}
        <div className="px-8 pt-8 pb-6 flex items-center justify-between border-b border-gray-50">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tighter">Open Dispute</h1>
            <p className="text-sm text-gray-400 font-medium italic">Deal Reference: #{dealId.toString().slice(-6).toUpperCase()}</p>
          </div>
          <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          
          {/* --- WARNING BOX --- */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex gap-4 items-start mb-8">
            <ShieldAlert className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="text-xs font-black text-red-700 uppercase tracking-wider mb-1">Mediation Warning</p>
              <p className="text-[13px] text-red-600 leading-relaxed font-medium">
                Opening a dispute freezes the escrow. Please try to resolve the issue via chat before proceeding.
              </p>
            </div>
          </div>

          {/* --- REASONS --- */}
          <div className="mb-8">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-4">
              Reason for Dispute
            </label>
            <div className="flex flex-wrap gap-2">
              {DISPUTE_REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                    reason === r 
                    ? 'bg-red-600 border-red-600 text-white shadow-md' 
                    : 'bg-white border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* --- EXPLANATION --- */}
          <div className="mb-8">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-4">
              Explain the Issue
            </label>
            <textarea
              required
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Describe exactly what went wrong..."
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-red-100 focus:bg-white transition-all outline-none resize-none"
            />
          </div>

          {/* --- EVIDENCE UPLOAD --- */}
          <div className="mb-10">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] block mb-4">
              Evidence (Max 3)
            </label>
            <div className="flex gap-4">
              {evidenceFiles.map((item, i) => (
                <div key={i} className="relative w-24 h-24 group">
                  <Image 
                    src={item.preview} 
                    alt="Evidence" 
                    fill 
                    className="object-cover rounded-2xl border border-gray-100" 
                  />
                  <button 
                    type="button"
                    aria-label="remove evidence"
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-white text-red-500 rounded-full shadow-lg p-1 hover:scale-110 transition-transform"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              
              {evidenceFiles.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-red-200 hover:text-red-400 transition-all bg-gray-50 hover:bg-white"
                >
                  <Camera size={24} />
                  <span className="text-[9px] font-black uppercase">Add Photo</span>
                </button>
              )}
            </div>
            <input 
              type="file" 
              hidden 
              ref={fileInputRef} 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
            />
          </div>

          {/* --- SUBMIT --- */}
          <button
            type="submit"
            disabled={loading || !reason || !details}
            className={`w-full py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              loading || !reason || !details
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-red-600 text-white shadow-xl shadow-red-100 hover:bg-red-700 active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <AlertCircle size={18} />
                Submit Dispute
              </>
            )}
          </button>
        </form>

        <div className="bg-gray-50 p-6 flex items-center gap-3 justify-center">
          <ShieldCheck size={16} className="text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
            Your safety is our priority. A mediator joins within 24 hours.
          </p>
        </div>
      </div>
    </div>
  );
}