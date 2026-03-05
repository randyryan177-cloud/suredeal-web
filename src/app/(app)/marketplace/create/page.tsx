"use client";

import React from "react";
import { 
  X, 
  Store, 
  ShoppingBag, 
  Wrench, 
  ChevronRight, 
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CHOICES = [
  {/*
    id: "store",
    title: "Open a Store",
    description: "Create a professional brand profile to sell multiple items and services with a dedicated URL.",
    icon: <Store size={32} />,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "hover:border-blue-200",
    href: "/marketplace/create/store",
  */},
  {
    id: "product",
    title: "Sell a Product",
    description: "List physical goods, gadgets, or digital items. Perfect for one-off sales or inventory items.",
    icon: <ShoppingBag size={32} />,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "hover:border-emerald-200",
    href: "/marketplace/create/product",
  },
  {
    id: "service",
    title: "Offer a Service",
    description: "Professional skills, consulting, or freelance work. Protected by our milestones & E2EE chat.",
    icon: <Wrench size={32} />,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "hover:border-amber-200",
    href: "/marketplace/create/service",
  },
];

export default function CreateListingChoicePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Navigation */}
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft size={18} />
          Back to Marketplace
        </button>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">
            What are you listing today?
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl leading-relaxed">
            Choose the best category for your post. Each category has tailored tools to help you 
            close deals faster and securely.
          </p>
        </div>

        {/* Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CHOICES.map((item) => (
            <Link 
              key={item.id} 
              href={item.href}
              className={`group relative bg-white border-2 border-transparent p-8 rounded-[32px] shadow-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${item.borderColor}`}
            >
              <div className={`${item.bgColor} ${item.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>
              
              <h3 className="text-xl font-black text-gray-900 mb-3 flex items-center justify-between">
                {item.title}
                <ChevronRight className="text-gray-300 group-hover:text-gray-900 transition-colors" size={20} />
              </h3>
              
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                {item.description}
              </p>

              {/* Decorative background element */}
              <div className={`absolute bottom-0 right-0 w-24 h-24 ${item.bgColor} opacity-0 group-hover:opacity-10 rounded-tl-[64px] transition-opacity`} />
            </Link>
          ))}
        </div>

        {/* Trust Footer */}
        <div className="mt-12 bg-white/50 backdrop-blur-sm border border-white p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 uppercase tracking-tighter">SureDeal Protection Guaranteed</p>
            <p className="text-xs text-gray-500 font-medium">
              Every listing is integrated with our escrow smart-logic. You only get paid when the buyer confirms receipt, and buyers only pay when the item is verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}