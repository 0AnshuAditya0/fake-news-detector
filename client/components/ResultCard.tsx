"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnalysisResult } from "@/lib/types";
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Target,
  MessageSquare,
  Link as LinkIcon,
  BarChart3,
} from "lucide-react";

interface ResultCardProps {
  result: AnalysisResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const getPredictionIcon = () => {
    switch (result.prediction) {
      case "FAKE":
        return <AlertTriangle className="w-6 h-6" />;
      case "REAL":
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <HelpCircle className="w-6 h-6" />;
    }
  };

  const getPredictionColor = () => {
    switch (result.prediction) {
      case "FAKE":
        return "danger";
      case "REAL":
        return "success";
      default:
        return "warning";
    }
  };

  const getSignalColor = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-6">
      {/* Verdict Section */}
      <div className="bg-background border border-border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-3 text-base sm:text-lg font-bold uppercase tracking-tight">
            {getPredictionIcon()}
            Analysis Verdict
          </div>
          <div className={`text-sm sm:text-lg px-4 py-2 font-bold uppercase border ${
            result.prediction === 'FAKE' ? 'border-destructive text-destructive' : 
            result.prediction === 'REAL' ? 'border-success text-success' : 
            'border-warning text-warning'
          }`}>
            {result.prediction}
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confidence Level</span>
            <span className="text-sm font-bold">{result.confidence}%</span>
          </div>
          <div className="h-2 bg-muted">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${result.confidence}%` }}
            />
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="bg-background border border-border p-6">
        <div className="flex items-center gap-2 mb-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
          <MessageSquare className="w-4 h-4 text-primary" />
          Explanation
        </div>
        <p className="text-foreground leading-relaxed text-sm">{result.explanation}</p>
      </div>

      {/* Red Flags */}
      {result.flags.length > 0 && (
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-2 mb-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            Red Flags Detected
          </div>
          <ul className="space-y-3">
            {result.flags.map((flag, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-destructive mt-1 font-bold">•</span>
                <span className="text-foreground">{flag}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source Info */}
      {result.source && (
        <div className="bg-background border border-border p-6">
          <div className="flex items-center gap-2 mb-4 font-bold uppercase tracking-widest text-xs text-muted-foreground">
            <LinkIcon className="w-4 h-4 text-primary" />
            Source Information
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground">{result.source.domain}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase font-bold tracking-wider">
                Credibility: {result.source.credibility}
              </p>
            </div>
            <div className={`px-2 py-1 text-[10px] font-bold uppercase border ${
              result.source.credibility === "high" ? "border-success text-success" :
              result.source.credibility === "low" ? "border-destructive text-destructive" :
              "border-warning text-warning"
            }`}>
              {result.source.credibility}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
