"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ChevronLeft, 
  Search, 
  User, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ArrowRight,
  Lock,
  Wallet
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

const SYSTEM_AI_SD = "254222111";

export default function TransferPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPinOverlay, setShowPinOverlay] = useState(false);

  // Form States
  const [amount, setAmount] = useState("");
  const [sdNumber, setSdNumber] = useState("");
  const [recipient, setRecipient] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pin, setPin] = useState("");

  const debouncedSdNumber = useDebounce(sdNumber, 600);
  const isAI = sdNumber === SYSTEM_AI_SD;

  const formData = {
    recipientSdNumber: sdNumber,
    amount,
    securePin: pin
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  useEffect(() => {
    if (debouncedSdNumber.length >= 6 && !isAI) {
      lookupRecipient();
    } else {
      setRecipient(null);
    }
  }, [debouncedSdNumber]);

  const fetchBalance = async () => {
    try {
      const res = await apiService.get("/wallet/balance");
      const bal = res.data.wallet?.available || res.data.available || 0;
      setAvailableBalance(parseFloat(bal));
    } catch (e) { console.error(e); }
  };

  const lookupRecipient = async () => {
    setIsSearching(true);
    try {
      const res = await apiService.get(`/wallet/recipient/${debouncedSdNumber}`);
      setRecipient(res.data || null);
    } catch (e) {
      setRecipient(null);
    } finally {
      setIsSearching(false);
    }
  };

  const initiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const valAmount = parseFloat(amount);
    
    if (!recipient && !isAI) return alert("Verify recipient SD number first.");
    if (isNaN(valAmount) || valAmount <= 0) return alert("Enter a valid amount.");
    if (valAmount > availableBalance) return alert("Insufficient funds.");

    setShowPinOverlay(true);
  };

  const handleFinalTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    const payload = {
    recipientSDNumber: formData.recipientSdNumber, // Rename to match backend
    amount: Number(formData.amount),
    pin: formData.securePin, // Rename 'securePin' to 'pin'
  };

    setLoading(true);
    try {
      await apiService.post("/wallet/transfer-p2p", payload);

      alert(`Transfer successful to ${recipient?.displayName || "SureDeal User"}!`);
      router.push("/wallet");
    } catch (error: any) {
      alert(error.response?.data?.message || "Transfer failed.");
      setPin("");
      setShowPinOverlay(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-[3px] text-gray-900">Send Money</h1>
          <div className="w-10" />
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 py-8">
        {/* Source Balance */}
        <div className="flex items-center justify-between bg-white p-6 rounded-[24px] border border-gray-100 mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Wallet size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">From Wallet</p>
              <p className="font-bold text-gray-900">KES {availableBalance.toLocaleString()}</p>
            </div>
          </div>
          <span className="text-[10px] font-black px-3 py-1 bg-gray-100 text-gray-500 rounded-full uppercase">Instant</span>
        </div>

        <form onSubmit={initiateTransfer} className="space-y-8">
          {/* Recipient SD Search */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Recipient SD Number</label>
            <div className={`relative flex items-center rounded-[24px] border-2 transition-all p-2 bg-white ${
              isAI ? 'border-amber-400' : recipient ? 'border-emerald-500' : 'border-gray-100 focus-within:border-blue-500'
            }`}>
              <div className="p-3">
                {isAI ? <Bot size={22} className="text-amber-500" /> : <User size={22} className="text-gray-400" />}
              </div>
              <input 
                value={sdNumber}
                onChange={(e) => setSdNumber(e.target.value.toUpperCase())}
                placeholder="Enter Recipient SD"
                className="flex-1 bg-transparent py-3 font-bold text-lg outline-none placeholder:text-gray-300"
              />
              <div className="px-4">
                {isSearching ? <Loader2 size={20} className="animate-spin text-blue-500" /> : 
                 isAI || recipient ? <CheckCircle2 size={20} className={isAI ? "text-amber-500" : "text-emerald-500"} /> : 
                 <Search size={20} className="text-gray-200" />}
              </div>
            </div>

            {/* Verification Badge */}
            <div className="h-6">
              {isAI && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100 animate-in fade-in duration-300">
                  <span className="text-[10px] font-black uppercase tracking-wider">Official System AI</span>
                </div>
              )}
              {recipient && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 animate-in fade-in duration-300">
                  <span className="text-xs font-bold italic">Paying: {recipient.displayName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block">Amount to Send</label>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-center text-6xl font-black outline-none placeholder:text-gray-100 py-4"
            />
          </div>

          <div className="pt-4">
            <button
              disabled={loading || (!recipient && !isAI)}
              className={`w-full py-5 rounded-[24px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] ${
                isAI 
                  ? 'bg-amber-500 text-white shadow-amber-100 hover:bg-amber-600' 
                  : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 disabled:bg-gray-200 disabled:shadow-none'
              }`}
            >
              {isAI ? "Pay System AI" : "Confirm Transfer"} <ArrowRight size={20} />
            </button>
          </div>
        </form>

        <div className="mt-10 flex items-center justify-center gap-2 text-gray-400 bg-gray-100/50 p-4 rounded-2xl border border-dashed border-gray-200">
          <ShieldCheck size={16} />
          <p className="text-[10px] font-bold uppercase tracking-widest">End-to-End Encrypted Transaction</p>
        </div>
      </main>

      {/* PIN Verification Overlay */}
      {showPinOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">Authorize Payment</h3>
            <p className="text-sm font-medium text-gray-500 mb-8 px-4">
              Sending <span className="text-gray-900 font-bold">KES {amount}</span> to <br/>
              <span className="text-blue-600 font-bold">{recipient?.displayName || "SureDeal User"}</span>
            </p>
            
            <form onSubmit={handleFinalTransfer}>
              <input 
                aria-label="password"
                type="password"
                maxLength={4}
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-4xl tracking-[20px] font-black mb-10 outline-none border-b-2 border-gray-100 focus:border-blue-600 pb-2"
              />
              
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || pin.length < 4}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Confirm & Send"}
                </button>
                <button 
                  type="button"
                  onClick={() => setShowPinOverlay(false)}
                  className="py-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-600"
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