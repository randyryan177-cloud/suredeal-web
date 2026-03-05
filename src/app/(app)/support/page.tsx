"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  LifeBuoy, 
  Send, 
  MessageCircle, 
  Mail, 
  Clock, 
  ChevronLeft,
  AlertCircle
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function SupportPage() {
  const router = useRouter();
  const [issue, setIssue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (issue.length < 10) {
      toast.error("Please describe the issue in more detail (at least 10 characters).");
      return;
    }

    setLoading(true);
    try {
      await apiService.post("/support/report", { message: issue });
      toast.success("Report received! We'll contact you via email.");
      router.back();
    } catch (err) {
      toast.error("Failed to send report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-gray-500 hover:text-black transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="font-bold text-sm ml-1 uppercase tracking-tighter">Back</span>
          </button>
          <div className="flex items-center gap-2 text-amber-500">
            <LifeBuoy size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Help Center</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h1 className="text-3xl font-black text-gray-900 mb-2">Report a Problem</h1>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Facing an issue with a transaction or your account? Describe it below and our 
              moderation team will investigate.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-2">
                  Issue Description
                </label>
                <textarea
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-2xl p-5 min-h-[200px] outline-none transition-all text-gray-900 placeholder:text-gray-400"
                  placeholder="Tell us what happened... e.g., 'The buyer hasn't released funds for deal #123...'"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-100"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={18} />
                    <span>SUBMIT REPORT</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Info Cards */}
        <div className="space-y-4">
          <div className="bg-black text-white p-6 rounded-[28px] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Clock size={20} className="text-amber-400" />
              <h3 className="font-bold">Typical Response</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              Our support team is active 24/7. We usually respond within <span className="text-white">2 hours</span> for urgent transaction disputes.
            </p>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-[28px] space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Other Channels</h4>
            
            <a href="mailto:support@suredeal.com" className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors group">
              <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Email Support</p>
                <p className="text-[10px] text-gray-500 font-medium tracking-tight">support@suredeal.com</p>
              </div>
            </a>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-lg flex items-center justify-center">
                <MessageCircle size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Live Chat</p>
                <p className="text-[10px] text-gray-500 font-medium tracking-tight">Available for VIP Merchants</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-red-50 border border-red-100 rounded-[28px]">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-red-700 leading-normal font-medium italic">
                Never share your 4-digit PIN with anyone, including SureDeal staff. We will never ask for it.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}