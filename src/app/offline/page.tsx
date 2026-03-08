"use client";

import { WifiOff, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mb-6 border border-gray-100">
        <WifiOff size={40} className="text-gray-300" />
      </div>
      
      <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
        Connection Lost
      </h1>
      <p className="text-gray-500 font-medium mb-10 max-w-[280px]">
        SureDeal requires an internet connection to sync transactions and secure messages.
      </p>

      <div className="w-full space-y-3">
        <button 
          onClick={() => window.location.reload()}
          className="w-full bg-gray-900 text-white rounded-[24px] py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <RefreshCw size={18} />
          Try Again
        </button>
        
        <Link 
          href="/"
          className="w-full bg-gray-100 text-gray-600 rounded-[24px] py-4 font-black uppercase tracking-widest flex items-center justify-center gap-2"
        >
          <Home size={18} />
          Go Home
        </Link>
      </div>

      <p className="mt-12 text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em]">
        SureDeal v2.1 • Nairobi, Kenya
      </p>
    </div>
  );
}