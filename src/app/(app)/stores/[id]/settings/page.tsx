"use client";

import React, { useState, use } from "react";
import { 
  ChevronLeft, Bell, Lock, EyeOff, 
  Trash2, CreditCard, Clock, Globe 
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StoreSettingsPage({ params }: any) {
  const resolvedParams = use(params);
  const storeId = (resolvedParams as any).id;
  const router = useRouter();

  const [settings, setSettings] = useState({
    notifications: true,
    isPublic: true,
    acceptInstallments: true,
  });

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <header className="max-w-2xl mx-auto px-6 py-8 flex items-center gap-4">
        <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Settings</h1>
      </header>

      <main className="max-w-2xl mx-auto px-6 space-y-4">
        {/* Visibility Toggle */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center justify-between shadow-sm">
          <div className="flex gap-4 items-center">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Globe size={20} /></div>
            <div>
              <p className="font-bold text-gray-900">Store Visibility</p>
              <p className="text-xs text-gray-400 font-medium">Allow customers to find your store</p>
            </div>
          </div>
          <button 
            onClick={() => setSettings({...settings, isPublic: !settings.isPublic})}
            className={`w-12 h-6 rounded-full transition-all relative ${settings.isPublic ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.isPublic ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Payments & Escrow</h3>
          
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><CreditCard size={20} /></div>
              <div>
                <p className="font-bold text-gray-900">Accept Lipa Mdogo</p>
                <p className="text-xs text-gray-400 font-medium">Enable partial payments for items</p>
              </div>
            </div>
            <button 
                onClick={() => setSettings({...settings, acceptInstallments: !settings.acceptInstallments})}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.acceptInstallments ? 'bg-amber-500' : 'bg-gray-200'}`}
            >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.acceptInstallments ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12 p-8 bg-rose-50 rounded-[40px] border border-rose-100">
          <h3 className="text-rose-900 font-black mb-2">Danger Zone</h3>
          <p className="text-xs text-rose-700 font-medium mb-6">Once you delete a store, there is no going back. All listings and history will be wiped.</p>
          <button className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest hover:text-rose-800 transition-colors">
            <Trash2 size={16} /> Delete Store Permanently
          </button>
        </div>
      </main>
    </div>
  );
}