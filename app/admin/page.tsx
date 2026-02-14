"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RefreshCw, TrendingUp, Database, AlertCircle, CheckCircle } from "lucide-react";

interface ApiStats {
  totalCalls: number;
  cacheHits: number;
  apiCalls: number;
  failures: number;
  cacheHitRate: string;
  failureRate: string;
  lastError: string | null;
  lastErrorTime: string | null;
}

interface CacheStats {
  totalEntries: number;
  validEntries: number;
  expiredEntries: number;
  maxSize: number;
  utilizationPercent: number;
  ttlMinutes: number;
}

interface StatsResponse {
  api: ApiStats;
  cache: CacheStats;
  health: {
    status: string;
    message: string;
  };
  timestamp: string;
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background-light text-ink">
      <header className="border-b border-ink/10 dark:border-white/10 bg-paper/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto flex h-16 items-stretch">
          <div className="flex items-center px-8 border-r border-ink/10 dark:border-white/10 gap-3">
             <div className="w-6 h-6 relative rounded-full overflow-hidden border border-ink/10">
               <img src="/green_1.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="mono-data font-bold text-lg tracking-tighter">FAKE NEWS DETECTOR</span>
          </div>
          <nav className="flex-grow flex items-stretch">
            <Link href="/" className="flex items-center px-8 hover:bg-primary hover:text-white transition-colors border-r border-ink/10 dark:border-white/10 mono-data text-xs">
              Index
            </Link>
            <Link href="/dashboard" className="flex items-center px-8 hover:bg-primary hover:text-white transition-colors border-r border-ink/10 dark:border-white/10 mono-data text-xs">
              Dashboard
            </Link>
            <div className="flex items-center px-8 border-r border-ink/10 dark:border-white/10 mono-data text-xs opacity-50 bg-ink/5 text-ink">
               Admin Console
            </div>
          </nav>
        </div>
      </header>
      
      <main className="max-w-[1440px] mx-auto p-12">
        <div className="flex justify-between items-end mb-12">
           <div>
             <span className="mono-data text-primary mb-2 block">[ System Administration ]</span>
             <h1 className="serif-title text-4xl">Platform Diagnostics</h1>
           </div>
           <button 
             onClick={fetchStats} 
             disabled={loading}
             className="mono-data text-xs flex items-center gap-2 border border-ink/20 px-4 py-2 hover:bg-ink hover:text-white transition-colors"
           >
             <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
             Refresh Telemetry
           </button>
        </div>

        {error && (
          <div className="p-8 border border-disputed/20 bg-disputed/5 mb-12">
            <span className="mono-data text-disputed text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> System Error: {error}
            </span>
          </div>
        )}

        {stats && (
           <div className="space-y-12">
             {/* Key Metrics */}
             <section className="grid grid-cols-4 gap-0 border border-ink/10">
                <div className="p-8 border-r border-ink/10">
                  <span className="mono-data text-[10px] opacity-50 block mb-2">Operational Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stats.health.status === 'healthy' ? 'bg-verified' : 'bg-disputed'}`}></span>
                    <span className="mono-data text-sm uppercase">{stats.health.status}</span>
                  </div>
                </div>
                <div className="p-8 border-r border-ink/10">
                  <span className="mono-data text-[10px] opacity-50 block mb-2">Total Requests</span>
                  <span className="serif-title text-3xl block">{stats.api.totalCalls}</span>
                </div>
                <div className="p-8 border-r border-ink/10">
                  <span className="mono-data text-[10px] opacity-50 block mb-2">Cache Hit Rate</span>
                  <span className="serif-title text-3xl block text-primary">{stats.api.cacheHitRate}</span>
                </div>
                <div className="p-8">
                  <span className="mono-data text-[10px] opacity-50 block mb-2">Failure Rate</span>
                  <span className={`serif-title text-3xl block ${parseFloat(stats.api.failureRate) > 5 ? 'text-disputed' : 'text-verified'}`}>
                    {stats.api.failureRate}
                  </span>
                </div>
             </section>

             {/* Detailed Stats */}
             <div className="grid grid-cols-2 gap-12">
                <section>
                   <h3 className="mono-data text-xs text-primary mb-6 border-b border-primary pb-2 inline-block">Cache Performance</h3>
                   <div className="border border-ink/10 p-8 space-y-6">
                      <div className="flex justify-between items-center">
                         <span className="mono-data text-xs opacity-60">Utilization ({stats.cache.utilizationPercent}%)</span>
                         <span className="mono-data text-xs">{stats.cache.validEntries} / {stats.cache.maxSize} Entries</span>
                      </div>
                      <div className="w-full bg-ink/5 h-1">
                         <div className="bg-primary h-full" style={{ width: `${stats.cache.utilizationPercent}%` }}></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-ink/10">
                         <div>
                            <span className="mono-data text-[10px] opacity-40 block">Expired Entries</span>
                            <span className="mono-data text-lg">{stats.cache.expiredEntries}</span>
                         </div>
                         <div>
                            <span className="mono-data text-[10px] opacity-40 block">TTL Configuration</span>
                            <span className="mono-data text-lg">{stats.cache.ttlMinutes} min</span>
                         </div>
                      </div>
                   </div>
                </section>

                <section>
                   <h3 className="mono-data text-xs text-primary mb-6 border-b border-primary pb-2 inline-block">API Reliability</h3>
                   <div className="border border-ink/10">
                      <div className="p-6 border-b border-ink/10 flex items-center justify-between">
                         <span className="mono-data text-xs">Gemini Pro API Calls</span>
                         <span className="mono-data text-lg font-bold">{stats.api.apiCalls}</span>
                      </div>
                      <div className="p-6 border-b border-ink/10 flex items-center justify-between">
                         <span className="mono-data text-xs">Failed Requests</span>
                         <span className={`mono-data text-lg font-bold ${stats.api.failures > 0 ? 'text-disputed' : 'text-verified'}`}>{stats.api.failures}</span>
                      </div>
                      <div className="p-6 bg-ink/5">
                         <span className="mono-data text-[10px] opacity-50 block mb-2">Last Error Log</span>
                         <p className="mono-data text-xs text-disputed truncate">
                           {stats.api.lastError ? `[${stats.api.lastErrorTime}] ${stats.api.lastError}` : "No recent errors logged."}
                         </p>
                      </div>
                   </div>
                </section>
             </div>
           </div>
        )}
      </main>
    </div>
  );
}
