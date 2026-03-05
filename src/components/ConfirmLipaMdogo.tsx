// src/components/ConfirmLipaMdogo.tsx

"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Info, CreditCard, ChevronRight, Lock } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function ConfirmLipaMdogo() {
  const { requestId } = useParams();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch the specific request details to show terms
    apiService.get(`/lipa-mdogo/${requestId}`).then((res) => {
      setRequest(res.data);
    });
  }, [requestId]);

  const handleConfirmPayment = async () => {
    if (pin.length < 4) return toast.error("Please enter your 4-digit PIN");

    setLoading(true);
    try {
      await apiService.post(`/lipa-mdogo/${requestId}/confirm`, { pin });
      
      toast.success("Deposit Paid!", {
        description: "Your instalment plan is now active. View it in your wallet.",
      });
      router.push("/wallet/escrows");
    } catch (error: any) {
      toast.error("Payment Failed", { description: error.response?.data?.message || "Check your balance/PIN" });
    } finally {
      setLoading(false);
    }
  };

  if (!request) return <div className="p-10 text-center">Loading terms...</div>;

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 bg-white min-h-screen">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
          <ShieldCheck className="text-emerald-600" size={32} />
        </div>
        <h1 className="text-2xl font-black">Review & Pay</h1>
        <p className="text-gray-500 text-sm">Review the Merchant&apos;s offer for your {request.productDescription}</p>
      </div>

      {/* The Deal Card */}
      <div className="bg-gray-50 rounded-[32px] p-6 border border-gray-100 space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200">
          <span className="text-gray-500 font-bold text-xs uppercase">Total Price</span>
          <span className="text-xl font-black text-gray-900">KES {request.totalAmount.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 font-bold text-xs uppercase">Initial Deposit</span>
          <span className="text-lg font-black text-emerald-600">KES {request.initialDeposit.toLocaleString()}</span>
        </div>

        <div className="flex justify-between items-center py-2">
          <span className="text-gray-500 font-bold text-xs uppercase">Duration</span>
          <span className="text-sm font-bold">{request.duration}</span>
        </div>
      </div>

      {/* Security Warning */}
      <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 items-start border border-blue-100">
        <Info className="text-blue-500 shrink-0" size={20} />
        <p className="text-[11px] text-blue-800 font-medium">
          By entering your PIN, you authorize SureDeal to lock <strong>KES {request.initialDeposit}</strong> in Escrow. 
          Funds are only released to the seller after you confirm delivery.
        </p>
      </div>

      {/* PIN Input Section */}
      <div className="space-y-4">
        <label className="block text-center text-xs font-black text-gray-400 uppercase tracking-widest">
          Enter Wallet PIN to Authorize
        </label>
        <div className="flex justify-center">
          <input
            type="password"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-40 text-center text-3xl tracking-[1em] font-black border-b-4 border-emerald-500 outline-none pb-2 focus:border-emerald-600 transition-all"
            placeholder="****"
          />
        </div>
      </div>

      <button
        onClick={handleConfirmPayment}
        disabled={loading || pin.length < 4}
        className={`w-full py-5 rounded-2xl font-black text-white text-lg shadow-xl flex items-center justify-center gap-2
          ${loading ? 'bg-gray-400' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100'}`}
      >
        {loading ? "Processing Securely..." : "Confirm & Pay Deposit"}
        {!loading && <Lock size={20} />}
      </button>

      <button onClick={() => router.back()} className="w-full text-gray-400 font-bold text-sm">
        Cancel & Go Back
      </button>
    </div>
  );
}