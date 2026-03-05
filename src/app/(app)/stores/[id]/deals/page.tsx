"use client";

import React, { useEffect, useState, use } from "react";
import { ChevronLeft, Search, Filter, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, Package } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiService } from "@/lib/api";

export default function DealHistoryPage({ params }: any) {
  const resolvedParams = use(params);
  const storeId = (resolvedParams as any).id;
  const router = useRouter();
  
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking the fetch - you'll replace this with your actual escrow/transaction endpoint
    const fetchDeals = async () => {
      try {
        const res = await apiService.get(`/stores/${storeId}/deals`);
        setDeals(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchDeals();
  }, [storeId]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-6">
            <button aria-label="go back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-2xl font-black text-gray-900">Deal History</h1>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input placeholder="Search deals..." className="w-full bg-gray-50 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none font-medium border-none focus:ring-2 focus:ring-blue-100" />
            </div>
            <button aria-label="filter" className="p-3 bg-gray-50 rounded-2xl text-gray-600 border border-gray-100"><Filter size={20} /></button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-4">
        {deals.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-sm">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-400 font-bold">No deals recorded yet.</p>
          </div>
        ) : (
          deals.map((deal) => (
            <div key={deal._id} className="bg-white p-5 rounded-3xl border border-gray-50 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${deal.type === 'SALE' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                   {deal.type === 'SALE' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{deal.itemTitle}</h4>
                  <p className="text-xs text-gray-400 font-medium">{new Date(deal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-black text-gray-900">KES {deal.amount.toLocaleString()}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                    {deal.status === 'COMPLETED' ? (
                        <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                            <CheckCircle size={10} /> Paid
                        </span>
                    ) : (
                        <span className="text-[10px] font-black text-amber-500 uppercase flex items-center gap-1">
                            <Clock size={10} /> Escrow
                        </span>
                    )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}