"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { AnalysisResult } from "@/lib/types";
import { formatDate, truncateText } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface RecentAnalysesProps {
  analyses: AnalysisResult[];
  limit?: number;
  hideHeader?: boolean;
}

export function RecentAnalyses({ analyses, limit = 10, hideHeader = false }: RecentAnalysesProps) {
  const displayAnalyses = analyses.slice(0, limit);

  if (displayAnalyses.length === 0) {
    return (
      <div className="p-12 text-center bg-background border border-border">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          No analysis reports available in this view.
        </p>
      </div>
    );
  }

  const getStatusColor = (prediction: string) => {
    switch (prediction) {
      case "FAKE": return "border-destructive text-destructive";
      case "REAL": return "border-success text-success";
      default: return "border-warning text-warning";
    }
  };

  return (
    <div className="bg-background">
      {!hideHeader && (
        <div className="p-6 border border-border border-b-0">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Recent Activity</h3>
        </div>
      )}
      <div className="border-t border-border">
        {displayAnalyses.map((analysis) => (
          <Link
            key={analysis.id}
            href={`/analyze/${analysis.id}`}
            className="group flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-x border-border hover:bg-muted/30 transition-colors"
          >
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-0.5 border text-[8px] font-black tracking-tighter uppercase ${getStatusColor(analysis.prediction)}`}>
                  {analysis.prediction}
                </span>
                <span className="text-[10px] font-bold tracking-widest uppercase">
                  Score: {analysis.overallScore}
                </span>
              </div>
              <h4 className="text-sm font-bold tracking-tight line-clamp-1">
                {analysis.source?.domain || truncateText(analysis.originalText, 80)}
              </h4>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                {formatDate(analysis.timestamp)}
              </p>
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <div className="w-10 h-10 flex items-center justify-center border border-border group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
