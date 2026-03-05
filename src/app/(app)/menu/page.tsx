"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  ShieldCheck, 
  Package, 
  Plus, 
  LayoutDashboard, 
  Activity,
  HelpCircle, 
  Info, 
  LogOut, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function MenuPage() {
  const { logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiService.get("profile/me");
        setProfileData(response.data);
      } catch (error) {
        console.error("Menu Profile Fetch Error", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <LoadingScreen />;

  const { profile } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* --- HEADER --- */}
      <div className="bg-blue-600 rounded-b-[40px] px-6 pt-6 pb-10 shadow-lg">
        <button 
          aria-label="go back"
          onClick={() => router.back()}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors mb-4"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex items-center gap-4 bg-white/15 backdrop-blur-md p-4 rounded-3xl border border-white/20">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden relative">
              <Image
                src={profile?.profilePhoto || "/placeholder-avatar.png"}
                alt="Profile"
                fill
                className="object-cover"
              />
            </div>
            {/* Status Dot */}
            <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${profile?.flags?.isFraud ? 'bg-red-500' : 'bg-green-500'}`} />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-extrabold text-lg">{profile?.displayName || "User"}</h2>
              {profile?.flags?.isVerified && <CheckCircle2 size={16} className="text-white" fill="currentColor" />}
            </div>
            <p className="text-white/70 text-sm">@{profile?.username || "user"}</p>
            
            <Link href="/profile" className="flex items-center gap-1 mt-1 text-white text-xs font-bold hover:underline">
              View Profile <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* --- MENU LIST --- */}
      <div className="max-w-2xl mx-auto px-6 mt-6 space-y-6">
        
        {/* Account Section */}
        <MenuSection title="Account">
          <MenuItem 
            icon={<Settings size={20} className="text-gray-500" />}
            label="Settings"
            subLabel="App preferences & security"
            href="/settings"
          />
          <MenuItem 
            icon={<ShieldCheck size={20} className="text-blue-600" />}
            label="Verification"
            subLabel={profile?.flags?.isVerified ? "Status: Verified" : "Verify your identity"}
            badge={!profile?.flags?.isVerified ? "Pending" : null}
            href="/profile/verify"
          />
          <MenuItem 
            icon={<Activity size={20} className="text-gray-500" />}
            label="Status"
            subLabel="View account status"
            href="/settings/status"
          />
        </MenuSection>

        {/* Business Section */}
        <MenuSection title="Business">
          <MenuItem 
            icon={<Package size={20} className="text-green-600" />}
            label="Create Store"
            href="/marketplace/create/store"
          />
          {/*<MenuItem 
            icon={<Plus size={20} className="text-green-600" />}
            label="Add Job"
            href="/create-job"
          />
          <MenuItem 
            icon={<LayoutDashboard size={20} className="text-purple-600" />}
            label="Seller Dashboard"
            href="/dashboard"
          />*/}
        </MenuSection>

        {/* Support Section */}
        <MenuSection title="Support">
          
          <MenuItem 
            icon={<HelpCircle size={20} className="text-blue-500" />}
            label="Help & Support"
            href="/support"
          />
          <MenuItem 
            icon={<Info size={20} className="text-gray-500" />}
            label="About SureDeal"
            subLabel="Version 2.1.0"
            href="/about"
          />
        </MenuSection>

        {/* LOGOUT */}
        <button 
          onClick={logout}
          className="flex items-center gap-4 w-full bg-white p-4 rounded-[20px] border border-red-100 shadow-sm hover:bg-red-50 transition-colors group"
        >
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
            <LogOut size={20} className="text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold text-red-500">Logout</p>
            <p className="text-[11px] text-gray-400">Sign out of your account</p>
          </div>
          <ChevronRight size={20} className="text-red-200" />
        </button>

        <div className="text-center mt-8 space-y-1">
          <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">SureDeal Secure Trading</p>
          <p className="text-[10px] text-gray-200">support@suredeal.com</p>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] ml-2">{title}</h3>
      <div className="bg-white rounded-[25px] overflow-hidden shadow-sm border border-gray-100">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, subLabel, href, badge }: { 
  icon: React.ReactNode; 
  label: string; 
  subLabel?: string; 
  href: string; 
  badge?: string | null;
}) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
    >
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        {subLabel && <p className="text-[11px] text-gray-500 mt-0.5">{subLabel}</p>}
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-md">
            {badge}
          </span>
        )}
        <ChevronRight size={18} className="text-gray-300" />
      </div>
    </Link>
  );
}