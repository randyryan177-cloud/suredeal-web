"use client";

import React, { useState } from "react";
import { 
  Shield, 
  ChevronLeft, 
  Key, 
  Fingerprint, 
  EyeOff, 
  Bell, 
  Trash2, 
  ChevronRight,
  Lock,
  Loader2
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function WalletSettingsPage() {
  const router = useRouter();
  
  // Settings States
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);
  const [hideBalanceDefault, setHideBalanceDefault] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // PIN Change States
  const [showPinGate, setShowPinGate] = useState(false);
  const [pinStep, setPinStep] = useState<"old" | "new" | "confirm">("old");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [pinInput, setPinInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length < 4) return;

    if (pinStep === "old") {
      setOldPin(pinInput);
      setPinInput("");
      setPinStep("new");
    } else if (pinStep === "new") {
      setNewPin(pinInput);
      setPinInput("");
      setPinStep("confirm");
    } else if (pinStep === "confirm") {
      if (pinInput !== newPin) {
        alert("New PINs do not match. Try again.");
        setPinInput("");
        setPinStep("new");
        return;
      }

      setLoading(true);
      try {
        await apiService.post("wallet/update-pin", {
          oldPin: oldPin,
          newPin: pinInput,
        });
        alert("Your Wallet PIN has been updated.");
        resetPinFlow();
      } catch (error: any) {
        alert(error.response?.data?.message || "Could not update PIN.");
        resetPinFlow();
      } finally {
        setLoading(false);
      }
    }
  };

  const resetPinFlow = () => {
    setShowPinGate(false);
    setPinStep("old");
    setOldPin("");
    setNewPin("");
    setPinInput("");
  };

  // UI Component for Toggle
  const Toggle = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'left-7' : 'left-1'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button aria-label="back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-sm font-black uppercase tracking-[3px] text-gray-900">Wallet Settings</h1>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Security Section */}
        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Security</h2>
          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
            
            {/* Change PIN */}
            <button 
              onClick={() => setShowPinGate(true)}
              className="w-full p-5 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50"
            >
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                <Key size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-gray-900">Change Wallet PIN</p>
                <p className="text-xs text-gray-500 font-medium">For withdrawals and transfers</p>
              </div>
              <ChevronRight size={18} className="text-gray-300" />
            </button>

            {/* Biometrics */}
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                <Fingerprint size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Web Biometrics</p>
                <p className="text-xs text-gray-500 font-medium">Use TouchID/Windows Hello</p>
              </div>
              <Toggle enabled={isBiometricEnabled} onToggle={() => setIsBiometricEnabled(!isBiometricEnabled)} />
            </div>
          </div>
        </section>

        {/* Privacy & Preferences */}
        <section>
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-2">Preferences</h2>
          <div className="bg-white rounded-[24px] border border-gray-100 overflow-hidden shadow-sm">
            
            <div className="p-5 flex items-center gap-4 border-b border-gray-50">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                <EyeOff size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Hide Balance</p>
                <p className="text-xs text-gray-500 font-medium">Mask balance on dashboard</p>
              </div>
              <Toggle enabled={hideBalanceDefault} onToggle={() => setHideBalanceDefault(!hideBalanceDefault)} />
            </div>

            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-xl flex items-center justify-center">
                <Bell size={20} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">Transaction Alerts</p>
                <p className="text-xs text-gray-500 font-medium">Email & Push notifications</p>
              </div>
              <Toggle enabled={alertsEnabled} onToggle={() => setAlertsEnabled(!alertsEnabled)} />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <h2 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4 ml-2">Danger Zone</h2>
          <div className="bg-white rounded-[24px] border border-red-50 overflow-hidden shadow-sm">
            <button 
              onClick={() => confirm("This will reset your wallet settings. Continue?")}
              className="w-full p-5 flex items-center gap-4 hover:bg-red-50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-bold text-red-600">Reset Wallet Security</p>
                <p className="text-xs text-red-400 font-medium">Clear history and reset security pins</p>
              </div>
              <ChevronRight size={18} className="text-red-200" />
            </button>
          </div>
        </section>

      </main>

      {/* PIN Change Modal Overlay */}
      {showPinGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/95 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[40px] w-full max-w-sm p-10 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock size={32} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2">
              {pinStep === "old" ? "Current PIN" : pinStep === "new" ? "New PIN" : "Confirm PIN"}
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              {pinStep === "old" ? "Enter your current 4-digit PIN" : "Choose a secure 4-digit code"}
            </p>
            
            <form onSubmit={handlePinSubmit}>
              <input 
                type="password"
                maxLength={4}
                autoFocus
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-4xl tracking-[20px] font-black mb-10 outline-none border-b-2 border-gray-100 focus:border-blue-600 pb-2"
              />
              
              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading || pinInput.length < 4}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center"
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Continue"}
                </button>
                <button 
                  type="button"
                  onClick={resetPinFlow}
                  className="py-2 text-xs font-black uppercase tracking-widest text-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}