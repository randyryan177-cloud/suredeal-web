"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { toast } from "sonner";

export default function ProposeTermsPage() {
  const { id: storeId, requestId } = useParams();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handlePropose = async () => {
    if (!amount || !deposit) return toast.error("Please fill all fields");
    
    setSubmitting(true);
    try {
      await apiService.post(`/lipa-mdogo/${requestId}/propose`, {
        storeId,
        totalAmount: Number(amount),
        initialDeposit: Number(deposit)
      });
      toast.success("Proposal sent to buyer!");
      router.push(`/stores/${storeId}/lipa-mdogo`);
    } catch (err) {
      toast.error("Failed to send proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-black">Propose Terms</h1>
      
      <div className="space-y-4">
        <div>
          <label className="text-xs font-black uppercase text-gray-400">Total Product Price (KES)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold"
            placeholder="e.g. 50000"
          />
        </div>

        <div>
          <label className="text-xs font-black uppercase text-gray-400">Required Deposit (KES)</label>
          <input 
            type="number" 
            value={deposit} 
            onChange={(e) => setDeposit(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-emerald-500 text-lg font-bold"
            placeholder="e.g. 5000"
          />
          <p className="text-[10px] text-gray-400 mt-2 font-medium italic">
            * Recommended minimum 10% (KES {Number(amount) * 0.1 || 0})
          </p>
        </div>
      </div>

      <button
        onClick={handlePropose}
        disabled={submitting}
        className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-black transition-all"
      >
        {submitting ? "Sending Offer..." : "Send Offer to Buyer"}
      </button>
    </div>
  );
}