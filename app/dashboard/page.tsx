"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getRecentAnalyses, getStats } from "@/lib/utils";
import { AnalysisResult, DashboardStats as StatsType } from "@/lib/types";

export default function DashboardPage() {
  const [view, setView] = useState<"global" | "personal">("global");
  
  useEffect(() => {
    const savedView = localStorage.getItem("dashboard-view");
    if (savedView === "global" || savedView === "personal") {
      setView(savedView);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("dashboard-view", view);
  }, [view]);

  const [personalStats, setPersonalStats] = useState<StatsType>({
    totalAnalyses: 0,
    fakeDetected: 0,
    averageConfidence: 0,
    mostAnalyzedDomain: "N/A",
  });
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const response = await fetch("/api/global-stats");
        const data = await response.json();
        setGlobalStats(data);
      } catch (error) {
        console.error("Failed to load global stats:", error);
      }
    };

    const loadPersonalData = async () => {
      const stats = await getStats();
      const loadedAnalyses = await getRecentAnalyses();
      setPersonalStats(stats);
      setAnalyses(loadedAnalyses);
    };

    Promise.all([loadGlobalStats(), loadPersonalData()]).finally(() => setLoading(false));
  }, []);

  const currentStats = view === "global" ? {
    totalAnalyses: globalStats?.totalAnalyses || 0,
    fakeDetected: globalStats?.fakeDetected || 0,
    averageConfidence: globalStats?.averageConfidence || 0,
    mostAnalyzedDomain: globalStats?.mostAnalyzedDomain || "N/A"
  } : personalStats;

  const currentAnalyses = view === "global" ? (globalStats?.recentAnalyses || []) : analyses;

  return (
    <div className="min-h-screen bg-background-light text-ink">
      {/* Header Navigation */}
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
            <div className="flex items-center px-8 border-r border-ink/10 dark:border-white/10 mono-data text-xs opacity-50">
               Dashboard / {view === "global" ? "Global Mode" : "Personal Mode"}
            </div>
          </nav>
          <div className="flex items-center px-8 gap-4">
             <button 
               onClick={() => setView("global")}
               className={`mono-data text-[10px] border px-3 py-1 transition-all ${view === 'global' ? 'bg-ink text-white border-ink' : 'border-ink/20 hover:bg-ink hover:text-white'}`}
             >
               GLOBAL
             </button>
             <button 
               onClick={() => setView("personal")}
               className={`mono-data text-[10px] border px-3 py-1 transition-all ${view === 'personal' ? 'bg-ink text-white border-ink' : 'border-ink/20 hover:bg-ink hover:text-white'}`}
             >
               PERSONAL
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-0 border border-ink/10 mb-12">
           <div className="p-8 border-r border-ink/10">
             <span className="mono-data text-[10px] opacity-50 block mb-4">Total Analyses</span>
             <span className="serif-title text-5xl block">{currentStats.totalAnalyses.toLocaleString()}</span>
           </div>
           <div className="p-8 border-r border-ink/10">
             <span className="mono-data text-[10px] opacity-50 block mb-4">Fake Content Detected</span>
             <span className="serif-title text-5xl block text-disputed">{currentStats.fakeDetected}%</span>
           </div>
           <div className="p-8 border-r border-ink/10">
             <span className="mono-data text-[10px] opacity-50 block mb-4">Average Confidence</span>
             <span className="serif-title text-5xl block text-primary">{currentStats.averageConfidence}%</span>
           </div>
           <div className="p-8">
             <span className="mono-data text-[10px] opacity-50 block mb-4">Top Domain</span>
             <span className="serif-title text-2xl block truncate mt-4">{currentStats.mostAnalyzedDomain}</span>
           </div>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Recent Activity List */}
          <div className="col-span-8">
             <h3 className="mono-data text-xs text-primary mb-6 border-b border-primary pb-2 inline-block">Recent Activity Log</h3>
             <div className="border border-ink/10">
                {currentAnalyses.length > 0 ? (
                  currentAnalyses.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 border-b border-ink/10 last:border-0 flex items-center justify-between hover:bg-ink/5 transition-colors">
                       <div className="flex flex-col gap-1">
                          <span className="mono-data text-[10px] opacity-40">{new Date(item.timestamp || Date.now()).toLocaleString()}</span>
                          <span className="serif-title text-lg truncate max-w-md">{item.excerpt || item.title || item.originalText?.substring(0, 60) || "No content preview"}...</span>
                       </div>
                       <div className="flex items-center gap-4">
                          <span className="mono-data text-xs">{item.source?.domain || "Unknown Source"}</span>
                          <span className={`mono-data text-xs px-2 py-1 ${item.prediction === 'FAKE' ? 'bg-disputed text-white' : item.prediction === 'REAL' ? 'bg-verified text-white' : 'bg-ink/10'}`}>
                             {item.prediction}
                          </span>
                       </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center opacity-50 mono-data text-sm">No analysis data available. Initiate a scan.</div>
                )}
             </div>
          </div>

          {/* Side Panel */}
          <div className="col-span-4 space-y-8">
             <div className="p-8 bg-ink text-white">
                <span className="mono-data text-[10px] opacity-50 block mb-4">System Status</span>
                <div className="space-y-4">
                   <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="mono-data text-xs">API Latency</span>
                      <span className="mono-data text-xs text-primary">0.04s</span>
                   </div>
                   <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="mono-data text-xs">Cache Hit Rate</span>
                      <span className="mono-data text-xs text-primary">89.2%</span>
                   </div>
                   <div className="flex justify-between border-b border-white/20 pb-2">
                      <span className="mono-data text-xs">Active Nodes</span>
                      <span className="mono-data text-xs">4,291</span>
                   </div>
                </div>
             </div>

             <div className="border border-ink/10 p-8">
                <span className="mono-data text-[10px] opacity-50 block mb-4">Threat Map (Region)</span>
                <div className="h-48 bg-ink/5 flex items-center justify-center">
                   <span className="mono-data text-xs opacity-30">[ Map Visualization Module ]</span>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
