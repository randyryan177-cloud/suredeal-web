"use client";

import React, { useEffect, useMemo, useState } from "react";
import { 
  ShieldCheck, 
  Trash2, 
  ArrowRight, 
  Receipt, 
  AlertCircle,
  Calendar,
  ChevronLeft,
  RefreshCw
} from "lucide-react";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type DealStatus = "ongoing" | "completed" | "cancelled";

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DealStatus>("ongoing");

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const res = await apiService.get("deals");
      setDeals(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      if (activeTab === "ongoing") return !["COMPLETED", "CANCELLED"].includes(deal.status);
      if (activeTab === "completed") return deal.status === "COMPLETED";
      if (activeTab === "cancelled") return deal.status === "CANCELLED";
      return true;
    });
  }, [deals, activeTab]);

  const handleAction = async (dealId: string, action: string, confirmMsg: string) => {
    if (window.confirm(confirmMsg)) {
      try {
        await apiService.post(`/deals/${dealId}/${action}`);
        fetchDeals();
      } catch (err: any) {
        alert(err.response?.data?.message || "Action failed");
      }
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        
        {/* --- HEADER --- */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter">My Deals</h1>
              <p className="text-sm text-gray-500 font-medium">Manage your active escrow transactions</p>
            </div>
          </div>
        </header>

        {/* --- TABS --- */}
        <div className="flex p-1 bg-gray-200/50 rounded-2xl mb-8">
          {(["ongoing", "completed", "cancelled"] as DealStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
                activeTab === tab 
                ? (tab === 'ongoing' ? 'bg-blue-600 text-white shadow-lg' : tab === 'completed' ? 'bg-green-600 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg')
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- DEALS LIST --- */}
        <div className="space-y-4">
          {filteredDeals.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300">
              <Receipt size={48} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-500 font-bold">No {activeTab} deals found.</p>
            </div>
          ) : (
            filteredDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} activeTab={activeTab} onAction={handleAction} />
            ))
          )}
        </div>
      </div>

      {/* --- FLOATING DISPUTE BUTTON --- */}
      <Link 
        href="/dispute/new"
        className="fixed bottom-17 right-10 bg-black text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 z-30"
      >
        <AlertCircle size={20} className="text-red-500" />
        <span className="text-xs font-black uppercase tracking-widest">Open Dispute</span>
      </Link>
    </main>
  );
}

// --- SUB-COMPONENT: DEAL CARD ---

function DealCard({ deal, activeTab, onAction }: { deal: any; activeTab: string; onAction: Function }) {
  const isBuyer = deal.role === "BUYER";
  const isPartial = deal.type === "LIPA_MDOGO";
  const progress = deal.progress || 0;

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-lg font-black text-gray-900 leading-tight">{deal.title}</h3>
            {isPartial && (
              <span className="bg-green-50 text-green-600 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter border border-green-100">
                Lipa Mdogo
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 font-medium">
            {deal.description || (isPartial ? "Installment Payment Plan" : "Escrow Protected")}
          </p>
        </div>
        <button
          aria-label="delete deal" 
          onClick={() => onAction(deal.id, "delete", "Remove this deal record from your view?")}
          className="p-2 text-gray-300 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Participants */}
      <div className="flex items-center justify-between bg-gray-50 rounded-2xl p-4 mb-6">
        <UserMiniProfile label="Buyer" name={deal.buyerName} avatar={deal.buyerAvatar} />
        <ArrowRight size={16} className="text-gray-300" />
        <UserMiniProfile label="Seller" name={deal.sellerName} avatar={deal.sellerAvatar} align="end" />
      </div>

      {/* Financial Info & Status */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${isPartial ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <p className="text-[9px] uppercase font-black text-gray-400 tracking-widest">
              {isPartial ? "Total Payable" : "Escrow Secured"}
            </p>
            <p className="text-lg font-black text-gray-900">KES {deal.amount.toLocaleString()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-1 text-gray-400 mb-1">
            <Calendar size={12} />
            <span className="text-[10px] font-bold">{new Date(deal.createdAt).toLocaleDateString()}</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
            activeTab === 'ongoing' ? 'bg-blue-50 text-blue-600' : activeTab === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {deal.status}
          </span>
        </div>
      </div>

      {/* Progress Bar (Ongoing only) */}
      {activeTab === "ongoing" && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {isPartial ? "Payment Progress" : "Deal Progress"}
            </span>
            <span className="text-xs font-black text-green-600">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end items-center gap-4">
        {isBuyer && deal.status === "PENDING" && (
          <button 
            onClick={() => onAction(deal.id, "cancel", "Are you sure you want to cancel?")}
            className="text-sm font-bold text-red-500 hover:underline"
          >
            Cancel Deal
          </button>
        )}
        
        {isBuyer && isPartial && progress < 100 && (
          <button className="bg-green-600 text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
            Pay Installment
          </button>
        )}

        {isBuyer && deal.status === "DELIVERED" && (
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Release Funds
          </button>
        )}

        {!isBuyer && deal.status === "ESCROW_HELD" && (
          <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Confirm Delivery
          </button>
        )}
      </div>
    </div>
  );
}

function UserMiniProfile({ label, name, avatar, align = "start" }: any) {
  return (
    <div className={`flex flex-col ${align === 'end' ? 'items-end' : 'items-start'}`}>
      <span className="text-[9px] font-black text-gray-400 uppercase mb-1">{label}</span>
      <div className={`flex items-center gap-2 ${align === 'end' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden relative border border-white">
          <Image src={avatar || "/placeholder.png"} alt={name} fill className="object-cover" />
        </div>
        <span className="text-xs font-bold text-gray-800 truncate max-w-[80px]">{name}</span>
      </div>
    </div>
  );
}