// src/components/ui/LoadingScreen.tsx
"use client";

import React from "react";

export const LoadingScreen = () => {
  const brand = [
    { char: "s", color: "text-[#3498db]" }, // Blue
    { char: "u", color: "text-[#f1c40f]" }, // Gold
    { char: "r", color: "text-[#2ecc71]" }, // Green
    { char: "e", color: "text-[#3498db]" },
    { char: "d", color: "text-[#f1c40f" },
    { char: "e", color: "text-[#2ecc71]" },
    { char: "a", color: "text-[#3498db]" },
    { char: "l", color: "text-[#f1c40f" },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
      <div className="animate-suredeal relative flex items-center justify-center">
        
        {/* FULL WORD: SUREDEAL */}
        <div className="word-container flex space-x-0.5">
          {brand.map((item, idx) => (
            <span
              key={idx}
              className={`text-4xl font-black tracking-tighter ${item.color}`}
            >
              {item.char}
            </span>
          ))}
        </div>

        {/* SINGLE LOGO: S */}
        <div className="s-container">
          <span className="text-7xl font-black text-[#3498db] tracking-tighter">
            S
          </span>
        </div>

      </div>
    </div>
  );
};