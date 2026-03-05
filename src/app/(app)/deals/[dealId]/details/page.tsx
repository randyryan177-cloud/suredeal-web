"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Wallet, 
  Lock, 
  Truck, 
  BadgeCheck, // Replaced CheckDecagram with available BadgeCheck
  AlertOctagon, 
  ShieldCheck, 
  Gavel, 
  Clock,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/hooks/useSocket";
import { apiService } from "@/lib/api"; 
import { toast } from "sonner";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

type DealState = 'AWAITING_PAYMENT' | 'IN_ESCROW' | 'DELIVERED' | 'COMPLETED' | 'DISPUTED';

interface Deal {
  id: string;
  title: string;
  amount: number;
  description: string;
  state: DealState;
  buyerId: string;
  sellerId: string;
  type: string;
  paidAmount: number;
  disputeReason?: string;
  disputedBy?: string;
  hasDefended?: boolean;
}

// Next.js 15+ way to handle dynamic params
export default function DealDetailsPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const socket = useSocket();

  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [defenseText, setDefenseText] = useState("");

  const fetchDeal = useCallback(async () => {
    if (!dealId) return;
    try {
      const response = await apiService.get(`/deals/${dealId}`);
      setDeal(response.data.deal);
    } catch {
      toast.error("Could not load deal details");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }, [dealId, router]);

  useEffect(() => {
    fetchDeal();
    if (!socket) return;

    socket.on("deal_updated", ({ dealId: updatedId }: { dealId: string }) => {
      if (updatedId === dealId) fetchDeal();
    });

    return () => { socket.off("deal_updated"); };
  }, [dealId, socket, fetchDeal]);

  const handleAction = async (action: 'pay' | 'approve' | 'delivered') => {
    setIsProcessing(true);
    try {
      if (action === 'delivered') {
        await apiService.post(`/deals/${dealId}/delivered`);
        toast.success("Marked as delivered!");
      } else {
        const pin = window.prompt("Enter your 4-digit Security PIN:");
        if (!pin) return;
        await apiService.post(`/deals/${dealId}/${action}`, { pin });
        toast.success(action === 'pay' ? "Payment processed!" : "Funds released!");
      }
      fetchDeal();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Action failed";
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !deal) return <LoadingScreen />;

  const isBuyer = user?.id === deal.buyerId;
  const amIPlaintiff = user?.id === deal.disputedBy;
  
  const statusConfig = {
    AWAITING_PAYMENT: { color: "text-amber-600", bg: "bg-amber-50", icon: Wallet, label: "Awaiting Payment" },
    IN_ESCROW: { color: "text-blue-600", bg: "bg-blue-50", icon: Lock, label: "In Escrow" },
    DELIVERED: { color: "text-purple-600", bg: "bg-purple-50", icon: Truck, label: "Delivered" },
    COMPLETED: { color: "text-emerald-600", bg: "bg-emerald-50", icon: BadgeCheck, label: "Completed" },
    DISPUTED: { color: "text-red-600", bg: "bg-red-50", icon: AlertOctagon, label: "Disputed" },
  }[deal.state];

  return (
    <div className="min-h-screen bg-[#F8F9FB] pb-20 text-gray-900">
      <header className="bg-white border-b sticky top-0 z-10 px-8 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center text-gray-500 hover:text-black transition-colors">
            <ChevronLeft size={24} />
            <span className="font-bold text-sm ml-1 uppercase tracking-tighter">Back</span>
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Secure Escrow ID: {dealId?.slice(-8)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${statusConfig.bg} ${statusConfig.color}`}>
              <statusConfig.icon size={16} />
              <span className="text-xs font-black uppercase tracking-widest">{statusConfig.label}</span>
            </div>
            
            <h1 className="text-4xl font-black mb-2">{deal.title}</h1>
            <p className="text-gray-500 leading-relaxed mb-8">{deal.description || "No specific terms provided."}</p>

            <div className="grid grid-cols-2 gap-4 border-t pt-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Value</p>
                <p className="text-2xl font-black">KES {deal.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Payment Type</p>
                <p className="text-lg font-bold text-amber-600">{deal.type === 'LIPA_MDOGO' ? 'Installments' : 'One-time Payment'}</p>
              </div>
            </div>
          </div>

          {deal.state === "DISPUTED" && (
            <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[32px] space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <Gavel size={28} />
                <h3 className="text-xl font-black">Dispute Resolution Active</h3>
              </div>
              <p className="text-red-800 text-sm"><strong>Reason:</strong> {deal.disputeReason}</p>
              
              {!amIPlaintiff && !deal.hasDefended ? (
                <div className="space-y-3 mt-4">
                  <textarea 
                    className="w-full p-4 rounded-2xl border-2 border-red-100 outline-none focus:border-red-400 text-sm"
                    rows={4}
                    placeholder="Provide your defense details..."
                    value={defenseText}
                    onChange={(e) => setDefenseText(e.target.value)}
                  />
                  <button className="bg-red-600 text-white w-full py-4 rounded-xl font-black hover:bg-red-700 transition-all">
                    SUBMIT EVIDENCE
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-500 py-4 italic text-sm">
                  <Clock size={16} />
                  <span>Waiting for SureDeal Mediator review...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-black text-white p-8 rounded-[32px] shadow-xl">
            <p className="text-[10px] font-black text-gray-500 uppercase mb-6 tracking-widest">Required Action</p>
            
            {isBuyer && deal.state === 'AWAITING_PAYMENT' && (
              <button onClick={() => handleAction('pay')} disabled={isProcessing} className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black">
                {isProcessing ? "Processing..." : "FUND ESCROW"}
              </button>
            )}

            {!isBuyer && deal.state === 'IN_ESCROW' && (
              <button onClick={() => handleAction('delivered')} className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black">
                CONFIRM DELIVERY
              </button>
            )}

            {isBuyer && deal.state === 'DELIVERED' && (
              <button onClick={() => handleAction('approve')} className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black">
                APPROVE & RELEASE
              </button>
            )}

            {deal.state === 'COMPLETED' && (
              <div className="text-center py-4">
                <BadgeCheck size={48} className="text-emerald-500 mx-auto mb-4" />
                <p className="font-black text-xl">Finished</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function PartyRow({ label, active }: { label: string, active: boolean }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
      <span className="text-xs font-black uppercase text-gray-600">{label}</span>
      {active && <span className="bg-amber-100 text-amber-600 text-[10px] font-black px-2 py-1 rounded">YOU</span>}
    </div>
  );
}