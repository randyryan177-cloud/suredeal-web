"use client";

import React, { useEffect, useState, useRef } from "react";
import { 
  ShieldCheck, 
  Wallet, 
  Upload, 
  CheckCircle2, 
  ChevronLeft, 
  Loader2, 
  Camera,
  AlertCircle,
  FileText
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { apiService } from "@/lib/api";
import { UploadService } from "@/lib/upload-service";
import { toast } from "sonner";

export default function VerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: Payment, 3: KYC
  const [loading, setLoading] = useState(false);
  const [fee, setFee] = useState(0);
  
  // KYC Files
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        const res = await apiService.get("verification/rules");
        setFee(res.data.fee || 500);
      } catch (e) {
        setFee(500); // Fallback
      }
    };
    fetchFee();
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Initiate verification record
      const initRes = await apiService.post("verification");
      const verificationId = initRes.data._id;

      // 2. Confirm Payment
      await apiService.post("verification/confirm", {
        verificationId,
        txId: `INT-WEB-${Date.now()}`,
      });

      toast.success("Payment Successful", {
        description: "Fee deducted from wallet. Proceed to ID upload."
      });
      setStep(3);
    } catch (error: any) {
      if (error.response?.data?.code === "SD_WALLET_INSUFFICIENT") {
        toast.error("Insufficient Balance", {
          description: `You need ${fee} KES. Head to your wallet to top up.`,
          action: {
            label: "Top Up",
            onClick: () => router.push("/wallet")
          },
        });
      } else {
        toast.error("Payment failed", { description: error.response?.data?.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File) => void, previewSetter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setter(file);
      previewSetter(URL.createObjectURL(file));
    }
  };

  const submitKYC = async () => {
    if (!idFront || !selfie) {
      return toast.error("Missing Files", { description: "Please upload both images." });
    }
    
    setLoading(true);
    try {
      // Upload to Cloudinary via Web Files
      const frontUrl = await UploadService.uploadMedia(idFront, "image");
      const selfieUrl = await UploadService.uploadMedia(selfie, "image");

      await apiService.post("verification/submit-kyc", {
        idFront: frontUrl,
        selfie: selfieUrl,
        idType: "NATIONAL_ID",
        idNumber: "ID-NUMBER-PENDING", 
      });

      toast.success("KYC Submitted!", {
        description: "Review typically takes 24 hours."
      });
      router.push("/profile");
    } catch (e) {
      toast.error("Upload Error", { description: "Failed to submit documents." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="max-w-xl mx-auto px-6 pt-8 flex items-center justify-between">
        <button aria-label="go back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        <div className="flex items-center gap-4">
          <ProgressDot active={step >= 1} label="Info" />
          <div className={`w-8 h-[2px] ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`} />
          <ProgressDot active={step >= 2} label="Pay" />
          <div className={`w-8 h-[2px] ${step >= 3 ? 'bg-blue-600' : 'bg-gray-100'}`} />
          <ProgressDot active={step >= 3} label="KYC" />
        </div>
        <div className="w-10" />
      </div>

      <main className="max-w-xl mx-auto px-6 mt-12">
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[32px] flex items-center justify-center mb-6">
              <ShieldCheck size={48} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-4">Get Verified</h1>
            <p className="text-gray-500 leading-relaxed mb-10">
              Verified accounts gain a Blue Badge, higher transaction limits, and enhanced trust within the SureDeal community.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Confirm Payment</h2>
            <p className="text-gray-500 mb-8 text-sm">Verification fee is a one-time charge for manual document review.</p>
            
            <div className="bg-gray-50 rounded-[32px] p-10 flex flex-col items-center border border-gray-100 mb-8">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Total Amount</span>
              <span className="text-5xl font-black text-gray-900">{fee} KES</span>
            </div>

            <button 
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-black transition-all"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Wallet size={20} />}
              {loading ? "Processing..." : "Pay from Wallet"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Identity Verification</h2>
            <p className="text-gray-500 mb-8 text-sm">Upload clear photos of your National ID and a selfie holding it.</p>

            <div className="space-y-4">
              <UploadBox 
                label="ID Front View" 
                preview={idFrontPreview} 
                onClick={() => frontInputRef.current?.click()} 
              />
              <UploadBox 
                label="Selfie with ID" 
                preview={selfiePreview} 
                onClick={() => selfieInputRef.current?.click()} 
              />
            </div>

            <input aria-label="file" type="file" ref={frontInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setIdFront, setIdFrontPreview)} />
            <input aria-label="file" type="file" ref={selfieInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, setSelfie, setSelfiePreview)} />

            <button 
              onClick={submitKYC}
              disabled={loading}
              className="w-full mt-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100"
            >
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              {loading ? "Uploading..." : "Submit Documents"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Sub Components ---

function ProgressDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full transition-all duration-500 ${active ? 'bg-blue-600 scale-125 shadow-lg shadow-blue-200' : 'bg-gray-200'}`} />
      <span className={`text-[10px] font-black uppercase tracking-tighter ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}

function UploadBox({ label, preview, onClick }: { label: string; preview: string | null; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full h-40 rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center overflow-hidden hover:border-blue-400 hover:bg-blue-50/30 transition-all group relative"
    >
      {preview ? (
        <>
          <Image src={preview} alt="preview" fill className="object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
            <Camera className="text-white" size={32} />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload size={28} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
          <span className="text-sm font-bold text-gray-400 group-hover:text-blue-600">{label}</span>
        </div>
      )}
    </button>
  );
}