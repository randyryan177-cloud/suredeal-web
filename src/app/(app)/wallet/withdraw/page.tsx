"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Smartphone, 
  Building2, 
  Info, 
  Loader2, 
  ArrowRight,
  Lock
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function WithdrawPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPinOverlay, setShowPinOverlay] = useState(false);
  
  // Form States
  const [amount, setAmount] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [method, setMethod] = useState<"mpesa" | "bank">("mpesa");
  const [destination, setDestination] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await apiService.get("wallet/balance");
      const rawBalance = res.data?.wallet?.available ?? res.data?.available ?? "0";
      const cleanBalance = String(rawBalance).replace(/[^0-9.]/g, "");
      setAvailableBalance(parseFloat(cleanBalance) || 0);
    } catch (e) {
      setAvailableBalance(0);
    }
  };

  const initiateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);

    if (isNaN(withdrawAmount) || withdrawAmount < 50) return alert("Minimum withdrawal is 50 KES.");
    if (withdrawAmount > availableBalance) return alert("Insufficient funds.");
    if (!destination) return alert(`Please enter your ${method === 'mpesa' ? 'phone number' : 'bank details'}.`);

    setShowPinOverlay(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setLoading(true);
    try {
      await apiService.post("wallet/withdraw", {
        amount: parseFloat(amount),
        method,
        destination,
        currency: "KES",
        securePin: pin,
      });

      alert("Withdrawal request sent successfully!");
      router.push("/wallet");
    } catch (error: any) {
      alert(error.response?.data?.message || "Transaction denied. Please check your PIN.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-[3px] text-gray-900">Secure Withdrawal</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 mt-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] p-8 text-white mb-8 shadow-xl shadow-gray-200">
          <div className="flex items-center gap-2 mb-2 opacity-60">
            <ShieldCheck size={14} className="text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-widest">Available for Payout</span>
          </div>
          <h2 className="text-4xl font-black">KES {availableBalance.toLocaleString()}</h2>
        </div>

        <form onSubmit={initiateWithdrawal} className="space-y-8">
          {/* Amount Input */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Withdrawal Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400">KES</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white border border-gray-100 p-5 pl-16 rounded-2xl text-xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Method Selector */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Payout Method</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod("mpesa")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  method === "mpesa" ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-gray-100 bg-white text-gray-400"
                }`}
              >
                <Smartphone size={20} />
                <span className="font-bold text-sm">M-Pesa</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod("bank")}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3 ${
                  method === "bank" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-100 bg-white text-gray-400"
                }`}
              >
                <Building2 size={20} />
                <span className="font-bold text-sm">Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* Destination Details */}
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
              {method === "mpesa" ? "M-Pesa Phone Number" : "Bank Account Details"}
            </label>
            <textarea 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={method === "mpesa" ? "e.g. 2547XXXXXXXX" : "Bank Name, Branch, Account Number..."}
              rows={method === "mpesa" ? 1 : 3}
              className="w-full bg-white border border-gray-100 p-5 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm resize-none"
            />
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-4">
            <Info size={20} className="text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-amber-800 leading-relaxed">
              Standard processing times apply. M-Pesa withdrawals are usually instant, while Bank transfers may take up to 24 hours.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Review & Withdraw <ArrowRight size={18} />
          </button>
        </form>
      </main>

      {/* PIN Verification Overlay */}
      {showPinOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Verify Transaction</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">Enter your 4-digit Wallet PIN to authorize this withdrawal.</p>
            
            <form onSubmit={handleFinalSubmit}>
              <input 
                type="password"
                maxLength={4}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-4xl tracking-[20px] font-black mb-10 outline-none border-b-2 border-gray-100 focus:border-blue-600 pb-2 transition-colors"
              />
              
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || pin.length < 4}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Confirm Payout"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPinOverlay(false)}
                  className="py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}