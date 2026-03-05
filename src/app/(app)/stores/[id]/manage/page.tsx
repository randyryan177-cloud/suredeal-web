"use client";

import React, { useEffect, useState } from "react";
import { 
  Settings, 
  Package, 
  History, 
  Trash2, 
  TrendingUp, 
  Handshake, 
  ChevronLeft,
  Plus,
  Edit3,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { toast } from "sonner";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from "recharts";

export default function StoreManagementPage() {
  const { id: storeId } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const fetchData = async () => {
    try {
      const [storeRes, analyticsRes] = await Promise.all([
        apiService.get(`/stores/${storeId}/catalog`),
        apiService.get(`/stores/${storeId}/analytics`),
      ]);
      setStore(storeRes.data.store);
      setAnalytics(analyticsRes.data.analytics);
    } catch (err) {
      toast.error("Management Error", { description: "Failed to load store data." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [storeId]);

  const handleDeleteStore = async () => {
    if (confirm("Permanently delete this store? This cannot be undone.")) {
      try {
        await apiService.delete(`/stores/${storeId}`);
        toast.success("Store deleted");
        router.push("/profile");
      } catch (err) {
        toast.error("Deletion failed");
      }
    }
  };

  if (loading) return <LoadingScreen />;

  // Sample data format for Recharts
  // Recharts expects an array of objects: [{ name: 'Jan', completed: 10, failed: 2 }]
  const chartData = analytics?.chartData || [];

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-20">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button aria-label="go back" onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-black text-gray-900">{store?.name} <span className="text-blue-600 font-medium text-sm ml-2">Dashboard</span></h1>
          </div>
          <button 
            onClick={() => router.push(`/stores/${storeId}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all"
          >
            <Edit3 size={16} /> Edit Store
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* Stats Grid */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <StatCard 
    label="Total Revenue" 
    value={`KES ${analytics?.totalRevenue?.toLocaleString() || 0}`} 
    icon={<TrendingUp className="text-emerald-500" />} 
    trend="+12% this month"
  />
  
  <StatCard 
    label="Active Escrow" 
    value={`KES ${analytics?.activeEscrowValue?.toLocaleString() || 0}`} 
    icon={<Handshake className="text-blue-500" />} 
    trend={`${analytics?.activeDeals || 0} active deals`}
  />

  <StatCard 
    label="Pending Deposits" 
    value={`KES ${analytics?.pendingDepositValue?.toLocaleString() || 0}`} 
    icon={<RefreshCw className="text-amber-500" />} 
    trend={`${analytics?.pendingRequests || 0} waiting for buyer`}
  />
</div>
        {/* Analytics Chart */}
        <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-black text-gray-900">Deal Performance</h2>
              <p className="text-sm text-gray-500">Track your completed vs. disputed deals</p>
            </div>
            <button aria-label="fetch data" onClick={fetchData} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 8 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="failed" 
                  stroke="#ef4444" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
  <ActionCard 
    title="Manage Catalog" 
    desc="View your current listings or add new ones"
    icon={<Package size={24} />} 
    onClick={() => router.push(`/stores/${storeId}/catalog`)} 
  />

  <ActionCard 
    title="Installment Requests" 
    desc="Manage custom Lipa Mdogo applications"
    icon={<Plus size={24} className="text-emerald-600" />} 
    onClick={() => router.push(`/stores/${storeId}/lipa-mdogo`)} 
    // Badge logic from your comment
    badge={analytics?.pendingRequests > 0 ? analytics.pendingRequests : null}
  />

  <ActionCard 
    title="Deal History" 
    desc="Review past and ongoing transactions"
    icon={<History size={24} />} 
    onClick={() => router.push(`/stores/${storeId}/deals`)} 
  />

  <ActionCard 
    title="Store Settings" 
    desc="Visibility, hours and preferences"
    icon={<Settings size={24} />} 
    onClick={() => router.push(`/stores/${storeId}/settings`)} 
  />
</div>

      {/* --- CONTEXTUAL FAB --- */}
<div className="fixed bottom-16 right-8 flex flex-col items-end gap-3 z-50">
  {showAddMenu && (
    <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-4 duration-200">
      {/* Add Product Option */}
      <Link 
        href={`/marketplace/create/product?storeId=${storeId}`}
        className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-blue-50 hover:bg-blue-50 transition-colors group"
      >
        <span className="text-sm font-black text-gray-700">Add Product</span>
        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
          <Package size={20} />
        </div>
      </Link>

      {/* Add Service Option */}
      <Link 
        href={`/marketplace/create/service?storeId=${storeId}`}
        className="flex items-center gap-3 bg-white px-4 py-3 rounded-2xl shadow-xl border border-blue-50 hover:bg-blue-50 transition-colors group"
      >
        <span className="text-sm font-black text-gray-700">Add Service</span>
        <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
          <Handshake size={20} />
        </div>
      </Link>
    </div>
  )}

  <button 
    aria-label="Add product | service"
    onClick={() => setShowAddMenu(!showAddMenu)}
    className={`w-16 h-16 ${showAddMenu ? 'bg-gray-900' : 'bg-blue-600'} text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group`}
  >
    <Plus size={24} className={`transition-transform duration-300 ${showAddMenu ? 'rotate-45' : ''}`} />
  </button>
</div>
       

        {/* Danger Zone */}
        <div className="bg-red-50 border border-red-100 rounded-[32px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-red-900">Danger Zone</h3>
              <p className="text-sm text-red-700">Deleting your store will remove all listings and historical data permanently.</p>
            </div>
          </div>
          <button 
            onClick={handleDeleteStore}
            className="px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-black text-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
          >
            <Trash2 size={18} /> Delete Store
          </button>
        </div>
      </main>
    </div>
  );
}

// --- Sub Components ---

function StatCard({ label, value, icon, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
        {React.cloneElement(icon, { size: 28 })}
      </div>
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        {trend && <p className="text-[10px] font-bold text-emerald-600 mt-1">{trend}</p>}
      </div>
    </div>
  );
}

function ActionCard({ title, desc, icon, onClick, badge }: any) {
  return (
    <button 
      onClick={onClick}
      className="relative bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-left group"
    >
      {badge && (
        <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-lg shadow-rose-200 animate-bounce">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="font-black text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </button>
  );
}





