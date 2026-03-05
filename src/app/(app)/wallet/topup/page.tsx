"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Smartphone, 
  CreditCard, 
  ArrowRight, 
  Loader2,
  Lock,
  CheckCircle2
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

type PaymentMethod = "mpesa" | "card";

export default function TopUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPinOverlay, setShowPinOverlay] = useState(false);

  // Form States
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("mpesa");
  const [pin, setPin] = useState("");

  const initiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const valAmount = parseFloat(amount);
    
    if (!amount || valAmount <= 0) return alert("Please enter a valid amount.");
    if (method === "mpesa" && (!phone || phone.length < 10)) {
      return alert("Please enter a valid M-Pesa number.");
    }

    setShowPinOverlay(true);
  };

  const handleFinalPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setShowPinOverlay(false);
    setLoading(true);

    try {
      if (method === "mpesa") {
        await apiService.post("wallet/deposit", {
          amount: parseFloat(amount),
          phoneNumber: phone.trim(),
          currency: "KES",
          pin,
        });

        alert("M-Pesa prompt sent! Check your phone to complete the payment.");
        router.push("/wallet");
      } else {
        await apiService.post("/payments/card/initiate", {
          amount: parseFloat(amount),
          pin,
        });
        // On web, you'd typically redirect to a checkout session or internal Stripe view
        router.push("/wallet/topup/card-checkout");
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "Transaction failed. Please check your PIN.");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" />
            <h1 className="text-[10px] font-black uppercase tracking-[3px] text-gray-400">Secure Channel</h1>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-black text-gray-900 mb-8 tracking-tighter">Add Funds</h2>

        <form onSubmit={initiatePayment} className="space-y-10">
          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount to Deposit</label>
            <div className="relative group">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-300 text-2xl group-focus-within:text-blue-500 transition-colors">KES</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-6 pl-20 rounded-[24px] text-3xl font-black outline-none transition-all"
              />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Method</label>
            
            {/* M-Pesa Method */}
            <div 
              onClick={() => setMethod("mpesa")}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                method === "mpesa" ? "border-emerald-500 bg-emerald-50/50" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'mpesa' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <Smartphone size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">M-Pesa STK Push</p>
                  <p className="text-xs text-gray-500 font-medium">Direct prompt to your phone</p>
                </div>
              </div>
              {method === "mpesa" && <CheckCircle2 className="text-emerald-500" size={24} />}
            </div>

            {/* Card Method */}
            <div 
              onClick={() => setMethod("card")}
              className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                method === "card" ? "border-blue-500 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${method === 'card' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  <CreditCard size={24} />
                </div>
                <div>
                  <p className="font-bold text-gray-900 leading-tight">Debit / Credit Card</p>
                  <p className="text-xs text-gray-500 font-medium">Visa, Mastercard, Amex</p>
                </div>
              </div>
              {method === "card" && <CheckCircle2 className="text-blue-500" size={24} />}
            </div>
          </div>

          {/* Conditional Phone Input */}
          {method === "mpesa" && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">M-Pesa Number</label>
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="2547XXXXXXXX"
                className="w-full bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white p-5 rounded-2xl font-bold text-lg outline-none transition-all shadow-inner"
              />
            </div>
          )}

          <div className="pt-6">
            <button
              disabled={loading}
              className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black uppercase tracking-widest hover:bg-black active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Top Up Now <ArrowRight size={20} /></>}
            </button>
          </div>
        </form>
      </main>

      {/* PIN Verification Overlay */}
      {showPinOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 text-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Deposit</h3>
            <p className="text-sm font-medium text-gray-500 mb-8 px-4">Authorizing a deposit of <span className="text-gray-900 font-bold">KES {amount}</span></p>
            
            <form onSubmit={handleFinalPayment}>
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
                  disabled={pin.length < 4}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all"
                >
                  Verify PIN
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPinOverlay(false)}
                  className="py-2 text-xs font-black uppercase tracking-widest text-gray-400"
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