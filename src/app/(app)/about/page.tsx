"use client";

import React from "react";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col items-center">
      <header className="w-full bg-white border-b px-8 py-4 flex items-center justify-center relative">
        <button aria-label="back" onClick={() => router.back()} className="absolute left-8 text-gray-400 hover:text-black transition-colors">
          <ChevronLeft size={24} />
        </button>
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">About Platform</span>
      </header>

      <main className="max-w-2xl w-full px-8 py-20 text-center">
        <div className="relative w-32 h-32 mx-auto mb-8 rounded-[32px] overflow-hidden shadow-2xl">
          <Image 
            src="/images/suredeal.png" 
            alt="SureDeal Logo" 
            fill 
            className="object-cover"
          />
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">SureDeal</h1>
        <p className="text-sm font-black text-amber-500 uppercase tracking-widest mb-10">Version 1.0.4 (Beta)</p>

        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm leading-loose">
          <p className="text-gray-600 text-lg font-medium mb-8">
            SureDeal is Kenya&apos;s leading P2P deal protection platform. We utilize Escrow and E2E encryption 
            to ensure every transaction is safe, verified, and secure.
          </p>
          <p className="text-2xl font-black text-gray-900 italic">Africa Ni Yetu!!</p>
        </div>

        <footer className="mt-20">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            © 2026 Raven Productions. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}