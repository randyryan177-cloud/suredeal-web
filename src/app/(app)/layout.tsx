"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Handshake, Store, Wallet, Bell, Menu, Search } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Messages", href: "/messages", icon: MessageSquare },
    { name: "Deals", href: "/deals", icon: Handshake },
    { name: "Market", href: "/marketplace", icon: Store },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Alerts", href: "/alerts", icon: Bell },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xl">S</div>
          <span className="text-xl font-extrabold text-gray-900">SureDeal</span>
        </div>
        <div className="flex gap-4">
          <Link href="/search" className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Search Marketplace" title="search"><Search size={22} /></Link>
          <Link href="/menu" className="p-2 hover:bg-gray-100 rounded-full transition" aria-label="Open Menu" title="menu"><Menu size={22} /></Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom Navigation (Mobile) / Side Nav (Desktop logic can be added) */}
      <nav className="fixed bottom-0 w-full bg-white border-t flex justify-around items-center h-16 md:h-20 z-50">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1 group">
              <Icon className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-600"} size={24} />
              <span className={`text-[10px] font-medium ${isActive ? "text-blue-600" : "text-gray-400"}`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}