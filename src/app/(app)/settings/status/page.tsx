"use client";

import React from "react";
import { useAuth } from "@/context/auth-context";
import { ShieldCheck, ShieldAlert, CheckCircle2, AlertCircle, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountStatusPage() {
  const { user } = useAuth();
  const router = useRouter();

  const isActive = user?.status === "ACTIVE";
  const isFraud = user?.flags?.isFraud;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
       <header className="bg-white border-b px-8 py-4 sticky top-0 z-10 flex items-center gap-4">
        <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ChevronLeft size={20} />
        </button>
        <h1 className="font-black text-sm uppercase tracking-widest">Account Health</h1>
      </header>

      <main className="max-w-xl mx-auto p-8">
        <div className={`p-10 rounded-[40px] text-center mb-8 border-2 ${isFraud ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
          <div className="inline-flex p-4 rounded-full bg-white shadow-sm mb-4">
            {isFraud ? <ShieldAlert size={48} className="text-red-500" /> : <ShieldCheck size={48} className="text-emerald-500" />}
          </div>
          <h2 className={`text-2xl font-black ${isFraud ? 'text-red-900' : 'text-emerald-900'}`}>
            {isFraud ? "Account Restricted" : "Account in Good Standing"}
          </h2>
        </div>

        <div className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
          <StatusRow label="Login Status" value={user?.status || "PENDING"} active={isActive} />
          <StatusRow label="Identity Verification" value={user?.flags?.isVerified ? "Verified" : "Unverified"} active={user?.flags?.isVerified} />
          <StatusRow label="Fraud Analysis" value={isFraud ? "High Risk" : "No Flags"} active={!isFraud} />
        </div>

        {isFraud && (
          <div className="mt-8 p-6 bg-red-600 rounded-2xl flex gap-4 items-center animate-pulse">
            <AlertCircle className="text-white shrink-0" size={24} />
            <p className="text-white text-xs font-bold leading-relaxed">
              WARNING: Your account has been flagged for suspicious activity. Some withdrawal features are currently restricted.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatusRow({ label, value, active }: { label: string; value: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between p-6 border-b last:border-0 border-gray-50">
      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        {active ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-amber-500" />}
        <span className={`font-black text-sm ${active ? 'text-emerald-600' : 'text-gray-900'}`}>{value}</span>
      </div>
    </div>
  );
}