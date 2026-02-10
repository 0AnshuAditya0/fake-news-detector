"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "@/components/DashboardStats";
import { RecentAnalyses } from "@/components/RecentAnalyses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecentAnalyses, getStats } from "@/lib/utils";
import { AnalysisResult, DashboardStats as StatsType } from "@/lib/types";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { BarChart3, Globe, User, ShieldCheck } from "lucide-react";

export default function DashboardPage() {
  const [view, setView] = useState<"global" | "personal">("global");
  
  // Load saved preference
  useEffect(() => {
    const savedView = localStorage.getItem("dashboard-view");
    if (savedView === "global" || savedView === "personal") {
      setView(savedView);
    }
  }, []);

  // Save preference
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

  const chartData = view === "global" ? [
    { name: "Fake", value: globalStats?.fakeCount || 0, color: "#EF4444" },
    { name: "Real", value: globalStats?.realCount || 0, color: "#22C55E" },
    { name: "Uncertain", value: globalStats?.uncertainCount || 0, color: "#64748B" },
  ] : [
    { name: "Fake", value: analyses.filter(a => a.prediction === "FAKE").length, color: "#EF4444" },
    { name: "Real", value: analyses.filter(a => a.prediction === "REAL").length, color: "#22C55E" },
    { name: "Uncertain", value: analyses.filter(a => a.prediction === "UNCERTAIN").length, color: "#64748B" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 font-sans">
      <div className="container mx-auto max-w-6xl">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter uppercase italic">
              Insight <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
              {view === "global" ? "Public Community Intelligence" : "Your Personal Analysis History"}
            </p>
          </div>

          <div className="flex bg-muted p-1 border border-border">
            <button
              onClick={() => setView("global")}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === "global" ? "bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Global Stats
            </button>
            <button
              onClick={() => setView("personal")}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                view === "personal" ? "bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              My Activity
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-12">
          <DashboardStats stats={currentStats} />
        </div>

        {/* Community & Insights Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Distribution Chart */}
          <div className="lg:col-span-1 bg-background border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Verdict Distribution</h3>
              <BarChart3 className="w-4 h-4 text-primary" />
            </div>
            <div className="p-6 h-[300px]">
              {chartData.some(d => d.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Top Flags */}
          <div className="lg:col-span-1 bg-background border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Common Red Flags</h3>
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="p-6 space-y-3">
              {(view === "global" ? (globalStats?.topFlags || []) : getTopFlags(analyses)).length > 0 ? (
                (view === "global" ? globalStats.topFlags : getTopFlags(analyses)).map((flag: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 border border-border">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{flag.text}</span>
                    <span className="text-[10px] text-primary font-bold">{flag.count}x</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  No flags detected
                </div>
              )}
            </div>
          </div>

          {/* Domain Trust/Signals */}
          <div className="lg:col-span-1 bg-background border border-border">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Signal Averages</h3>
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div className="p-6 space-y-4">
              {(view === "global" ? (globalStats?.averageSignals || []) : getAverageSignals(analyses)).map((signal: any, i: number) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{signal.name}</span>
                    <span className="text-[10px] font-bold">{signal.score}%</span>
                  </div>
                  <div className="w-full h-1 bg-muted">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${signal.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global/Personal Table */}
        <div className="bg-background border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">
              {view === "global" ? "Global Feed" : "Personal Records"}
            </h3>
            <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              Latest Entries
            </span>
          </div>
          <div className="overflow-x-auto">
            <RecentAnalyses analyses={currentAnalyses} limit={10} hideHeader />
          </div>
        </div>
      </div>
    </div>
  );
}

function getTopFlags(analyses: AnalysisResult[]): any[] {
  const flagCounts: Record<string, number> = {};
  analyses.forEach((a) => a.flags.forEach((f) => flagCounts[f] = (flagCounts[f] || 0) + 1));
  return Object.entries(flagCounts).sort((a,b) => b[1]-a[1]).slice(0, 5).map(([text, count]) => ({ text, count }));
}

function getAverageSignals(analyses: AnalysisResult[]): any[] {
  if (analyses.length === 0) return [];
  const totals = analyses.reduce((acc, a) => ({
    ml: acc.ml + a.signals.mlScore,
    sentiment: acc.sentiment + a.signals.sentimentScore,
    clickbait: acc.clickbait + a.signals.clickbaitScore,
    source: acc.source + a.signals.sourceScore,
    bias: acc.bias + a.signals.biasScore,
  }), { ml: 0, sentiment: 0, clickbait: 0, source: 0, bias: 0 });
  const n = analyses.length;
  return [
    { name: "Prediction", score: Math.round(totals.ml / n) },
    { name: "Confidence", score: Math.round(totals.sentiment / n) },
    { name: "Language", score: Math.round(totals.clickbait / n) },
    { name: "Integrity", score: Math.round(totals.source / n) },
    { name: "Neutrality", score: Math.round(totals.bias / n) },
  ];
}
