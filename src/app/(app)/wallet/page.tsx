"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowDownLeft, 
  ArrowUpRight, 
  History, 
  ChevronLeft,
  Loader2,
  Lock,
  Search,
  Plus,
  ArrowRightLeft,
  Banknote
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 Minutes

const TransactionDetailModal = ({ tx, onClose }: { tx: any; onClose: () => void }) => {
  if (!tx) return null;
  const isCredit = tx.type === "credit";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8 sm:hidden" />
        
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-[30%] mx-auto flex items-center justify-center mb-4 ${
            isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {isCredit ? <ArrowDownLeft size={40} /> : <ArrowUpRight size={40} />}
          </div>
          <h3 className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">
            {isCredit ? "Funds Received" : "Payment Sent"}
          </h3>
          <p className="text-4xl font-black text-gray-900 tracking-tighter">
            {isCredit ? "+" : "-"} KES {parseFloat(tx.amount).toLocaleString()}
          </p>
        </div>

        <div className="space-y-4 bg-gray-50 rounded-[32px] p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Status</span>
            <span className="px-3 py-1 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100 shadow-sm">
              {tx.status}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Description</span>
            <span className="text-sm font-bold text-gray-900">{tx.description || "SureDeal Transaction"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Date</span>
            <span className="text-sm font-bold text-gray-900">{new Date(tx.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase">Reference</span>
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">{tx._id.slice(-12)}</span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95"
        >
          Close Receipt
        </button>
      </div>
    </div>
  );
};

// --- Sub-components ---
const ActionButton = ({ icon: Icon, label, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 group transition-all"
  >
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className="text-white" strokeWidth={2.5} />
    </div>
    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</span>
  </button>
);

const TransactionRow = ({ tx }: { tx: any }) => {
  const isCredit = tx.type === "credit";
  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isCredit ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
        }`}>
          {isCredit ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
        </div>
        <div>
          <p className="font-bold text-gray-900 leading-none mb-1">{tx.description || "Transaction"}</p>
          <p className="text-xs text-gray-400 font-medium">
            {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : "Recent"}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-black ${isCredit ? 'text-emerald-600' : 'text-gray-900'}`}>
          {isCredit ? "+" : "-"} KES {parseFloat(tx.amount || 0).toLocaleString()}
        </p>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-tighter">{tx.status}</p>
      </div>
    </div>
  );
};

export default function WalletPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [hasPin, setHasPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [hideBalance, setHideBalance] = useState(true);

  const [balance, setBalance] = useState({ available: "0.00", escrow: "0.00" });
  const [transactions, setTransactions] = useState([]);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  // --- Session Logic ---
  const updateSession = useCallback(() => {
    const expiryTime = Date.now() + SESSION_TIMEOUT;
    sessionStorage.setItem("sd_wallet_expiry", expiryTime.toString());
  }, []);

  const fetchWalletData = useCallback(async () => {
    try {
      const [balRes, transRes] = await Promise.all([
        apiService.get("wallet/balance"),
        apiService.get("wallet/history"),
      ]);
      setBalance(balRes.data.wallet || balRes.data);
      setTransactions(transRes.data.transactions || transRes.data || []);
      setIsLocked(false);
      updateSession(); 
    } catch (error) {
      setIsLocked(true);
    }
  }, [updateSession]);

  const checkPinStatus = useCallback(async () => {
    try {
      setInitializing(true);
      await apiService.get("wallet/balance");
      setHasPin(true);
    } catch (error: any) {
      if (error.response?.status === 403 && error.response?.data?.needsPinSetup) {
        setHasPin(false);
      } else {
        setHasPin(true); 
      }
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    const sessionExpiry = sessionStorage.getItem("sd_wallet_expiry");
    const isSessionActive = sessionExpiry && Date.now() < parseInt(sessionExpiry);
    
    if (isSessionActive) {
      setIsLocked(false);
      fetchWalletData();
      setInitializing(false);
    } else {
      checkPinStatus();
    }
  }, [fetchWalletData, checkPinStatus]);

  // --- Handlers ---
  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) return;
    setLoading(true);
    try {
      if (!hasPin) {
        await apiService.post("wallet/set-pin", { pin: pinInput });
        setHasPin(true);
        setPinInput("");
        toast.success("PIN Created!");
      } else {
        await apiService.post("wallet/verify-pin", { pin: pinInput });
        updateSession(); 
        await fetchWalletData();
      }
    } catch (error) {
      toast.error("Incorrect PIN");
      setPinInput("");
    } finally {
      setLoading(false);
    }
  };

  const handleManualLock = () => {
    sessionStorage.removeItem("sd_wallet_expiry");
    setIsLocked(true);
    setPinInput("");
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[30%] flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ShieldCheck size={40} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">
            {hasPin ? "Unlock Wallet" : "Secure Your Funds"}
          </h1>
          <p className="text-gray-500 font-medium mb-10 px-8 leading-relaxed">
            {hasPin ? "Enter your 4-digit PIN to access your balance." : "Create a 4-digit PIN to secure your merchant earnings."}
          </p>
          <form onSubmit={handlePinSubmit} className="space-y-8">
            <input 
              type="password"
              maxLength={4}
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              autoFocus
              className="w-40 text-center text-5xl tracking-[15px] font-black border-b-4 border-gray-100 focus:border-blue-500 outline-none pb-2 transition-colors placeholder:text-gray-200"
            />
            <button
              disabled={loading || pinInput.length < 4}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold uppercase tracking-widest disabled:bg-gray-100 disabled:text-gray-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : "Continue"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="bg-blue-600 pt-12 pb-32 px-6 rounded-b-[48px] shadow-2xl shadow-blue-200">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between text-white mb-10">
            <button aria-label="back" onClick={() => router.back()} className="hover:bg-white/20 p-2 rounded-xl transition-colors">
              <ChevronLeft size={28} />
            </button>
            <h2 className="text-sm font-black uppercase tracking-[4px]">Financial Hub</h2>
            <button aria-label="lock"
              onClick={handleManualLock}
              className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all"
            >
              <Lock size={18} className="text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-xl mx-auto px-6 -mt-24">
        <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200 mb-8 border border-white">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Available Balance</p>
          <div className="flex items-center justify-between">
            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
              {hideBalance ? "••••••" : `KES ${parseFloat(balance.available).toLocaleString()}`}
            </h3>
            <button 
              onClick={() => setHideBalance(!hideBalance)}
              className="w-12 h-12 bg-gray-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors"
            >
              {hideBalance ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center mb-10 px-2">
          <ActionButton icon={Plus} label="Deposit" color="bg-emerald-500" onClick={() => router.push("/wallet/topup")} />
          <ActionButton icon={ArrowRightLeft} label="Transfer" color="bg-blue-500" onClick={() => router.push("/wallet/transfer")} />
          <ActionButton icon={Banknote} label="Withdraw" color="bg-orange-500" onClick={() => router.push("/wallet/withdraw")} />
        </div>

        <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100 mb-10">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <History size={18} className="text-blue-600" />
              <h4 className="font-black uppercase text-xs tracking-widest text-gray-400">Activity</h4>
            </div>
            <div className="relative">
               <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
               <input 
                placeholder="Search..." 
                className="bg-gray-50 border-none pl-9 pr-4 py-2 rounded-full text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all w-24 focus:w-32"
               />
            </div>
          </div>

          <div className="divide-y divide-gray-50">
            {transactions.length > 0 ? (
              transactions.map((tx: any, idx: number) => (
                <div key={tx._id || idx} onClick={() => setSelectedTx(tx)} className="cursor-pointer">
     <TransactionRow tx={tx} />
  </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <History className="text-gray-200" size={32} />
                </div>
                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No Recent Activity</p>
              </div>
            )}
          </div>
        </div>

        <TransactionDetailModal 
    tx={selectedTx} 
    onClose={() => setSelectedTx(null)} 
  />

        <div className="pb-10 flex items-center justify-center gap-2 text-gray-400">
          <ShieldCheck size={14} />
          <p className="text-[10px] font-black uppercase tracking-[2px]">Secured by SureDeal Vault</p>
        </div>
      </main>
    </div>
  );
}