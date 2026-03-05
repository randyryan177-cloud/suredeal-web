"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  X, 
  Briefcase, 
  Store, 
  ShoppingBag, 
  ChevronRight,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { apiService } from "@/lib/api";
import Link from "next/link";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    jobs: any[];
    stores: any[];
    products: any[];
  }>({
    jobs: [],
    stores: [],
    products: [],
  });

  const debouncedQuery = useDebounce(query, 500);

  const handleSearch = useCallback(async (q: string) => {
    const cleanQuery = q.trim().substring(0, 50);
    if (cleanQuery.length < 2) {
      setResults({ jobs: [], stores: [], products: [] });
      return;
    }

    setLoading(true);
    try {
      const res = await apiService.get(`search?q=${encodeURIComponent(cleanQuery)}`);
      setResults(res.data);
      
      // Record search history silently
      apiService.post("search/record", { query: cleanQuery });
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleSearch(debouncedQuery);
  }, [debouncedQuery, handleSearch]);

  return (
    <div className="min-h-screen bg-white">
      {/* --- STICKY SEARCH HEADER --- */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button 
            aria-label="go back"
            onClick={() => router.back()}
            className="p-2 -ml-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex-1 relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              autoFocus
              maxLength={50}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, stores, or goods..."
              className="w-full bg-gray-50 border-none rounded-xl py-2.5 pl-10 pr-10 text-sm focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none"
            />
            {query.length > 0 && (
              <button 
                type="button"
                aria-label="clear query"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <button 
            onClick={() => router.back()}
            className="hidden lg:block text-sm font-bold text-green-600 hover:text-green-700"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* --- RESULTS AREA --- */}
      <div className="max-w-2xl mx-auto p-4 lg:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin text-green-500" />
            <p className="text-xs font-black uppercase tracking-widest">Searching SureDeal...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Jobs Section */}
            {results.jobs.length > 0 && (
              <SearchSection title="Available Jobs" icon={<Briefcase size={16} />}>
                {results.jobs.map((item) => (
                  <ResultItem 
                    key={item._id}
                    href={`/jobs/${item._id}`}
                    title={item.title}
                    subTitle={`${item.location?.city} • ${item.sdNumber}`}
                  />
                ))}
              </SearchSection>
            )}

            {/* Stores Section */}
            {results.stores.length > 0 && (
              <SearchSection title="Verified Stores" icon={<Store size={16} />}>
                {results.stores.map((item) => (
                  <ResultItem 
                    key={item._id}
                    href={`/stores/${item._id}`}
                    title={item.name}
                    subTitle="Verified Merchant"
                    isStore
                  />
                ))}
              </SearchSection>
            )}

            {/* Products Section */}
            {results.products.length > 0 && (
              <SearchSection title="Products & Goods" icon={<ShoppingBag size={16} />}>
                {results.products.map((item) => (
                  <ResultItem 
                    key={item._id}
                    href={`/listings/${item._id}`}
                    title={item.name}
                    price={`KES ${item.price?.toLocaleString()}`}
                  />
                ))}
              </SearchSection>
            )}

            {/* Empty State */}
            {query.length > 2 && !loading && 
             Object.values(results).every(arr => arr.length === 0) && (
              <div className="text-center py-20">
                <p className="text-gray-400 font-medium">
                  No results found for <span className="text-gray-900 font-bold">&quot;{query}&quot;</span>
                </p>
                <p className="text-xs text-gray-400 mt-2 uppercase tracking-tighter">Try checking your spelling or using fewer keywords</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function SearchSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <span className="text-green-500">{icon}</span>
        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function ResultItem({ title, subTitle, price, href, isStore }: any) {
  return (
    <Link 
      href={href}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-gray-900 truncate group-hover:text-green-600 transition-colors">
            {title}
          </p>
          {isStore && (
            <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-1.5 py-0.5 rounded uppercase">Verified</span>
          )}
        </div>
        {subTitle && <p className="text-xs text-gray-500 mt-0.5">{subTitle}</p>}
        {price && <p className="text-sm font-black text-green-600 mt-1">{price}</p>}
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}