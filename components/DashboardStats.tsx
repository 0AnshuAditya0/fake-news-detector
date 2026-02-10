"use client";

import React from "react";
import { DashboardStats as StatsType } from "@/lib/types";
import { BarChart3, AlertTriangle, TrendingUp, Globe, Search } from "lucide-react";

interface DashboardStatsProps {
  stats: StatsType;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      label: "Total Analyses",
      value: stats.totalAnalyses,
      sub: "Network Wide",
      icon: BarChart3,
      color: "text-primary"
    },
    {
      label: "Fake Detected",
      value: `${stats.fakeDetected}%`,
      sub: "Misinformation Rate",
      icon: AlertTriangle,
      color: "text-destructive"
    },
    {
      label: "Avg Confidence",
      value: `${stats.averageConfidence}%`,
      sub: "System Certainty",
      icon: TrendingUp,
      color: "text-success"
    },
    {
      label: "Focus Domain",
      value: stats.mostAnalyzedDomain,
      sub: "Hot Spot",
      icon: Globe,
      color: "text-primary"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-border">
      {items.map((item, i) => (
        <div key={i} className="p-8 border-r border-b border-border bg-background flex flex-col justify-between aspect-square md:aspect-auto md:h-48">
          <div className="flex items-start justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground leading-none">
              {item.label}
            </span>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          
          <div className="space-y-1">
            <div className="text-3xl font-bold tracking-tighter truncate">
              {item.value}
            </div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 leading-none">
              {item.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
