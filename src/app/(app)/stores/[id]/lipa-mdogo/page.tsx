"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiService } from "@/lib/api";
import { ChevronLeft, MessageSquare, Clock, ArrowRight, Package } from "lucide-react";
import Image from "next/image";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function StoreLipaMdogoRequests() {
  const { id: storeId } = useParams();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.get(`/lipa-mdogo/store/${storeId}/requests`)
      .then((res) => setRequests(res.data))
      .finally(() => setLoading(false));
  }, [storeId]);

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gray-50">
      <div className="flex items-center gap-4 mb-8">
        <button aria-label="back" onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-black">Lipa Mdogo Requests</h1>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">No active installment requests yet.</p>
          </div>
        ) : (
          requests.map((req: any) => (
            <div 
              key={req._id}
              onClick={() => router.push(`/stores/${storeId}/lipa-mdogo/${req._id}`)}
              className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:border-emerald-500 transition-all cursor-pointer flex justify-between items-center group"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden">
                  {req.referenceImages?.[0] ? (
                    <Image src={req.referenceImages[0]} alt="Product" className="w-full h-full object-cover" width={48} height={48} />
                  ) : (
                    <Package className="m-auto mt-3 text-gray-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{req.productDescription}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {req.status}
                    </span>
                    <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                      <Clock size={12} /> {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <ArrowRight className="text-gray-300 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}