"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CredibilityMeter } from "@/components/CredibilityMeter";
import { ResultCard } from "@/components/ResultCard";
import { TextHighlighter } from "@/components/TextHighlighter";
import { Button } from "@/components/ui/button";
import { AnalysisResult } from "@/lib/types";
import { getAnalysisById, getRecentAnalyses, truncateText, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  Share2,
  Download,
  FileText,
  ExternalLink,
  BarChart3,
  ShieldAlert,
  ArrowUpRight
} from "lucide-react";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [similarAnalyses, setSimilarAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result) return;
    
    const content = `
INTELLIGENCE REPORT
Ref: ${result.id}
Date: ${formatDate(result.timestamp)}
------------------------------------
PREDICTION: ${result.prediction}
CONFIDENCE: ${result.confidence}%
OVERALL SCORE: ${result.overallScore}/100

SUMMARY:
${result.explanation}

VECTOR SCORES:
- ML Model: ${result.signals.mlScore}%
- Sentiment: ${result.signals.sentimentScore}%
- Neutrality: ${result.signals.biasScore}%
- Source Credibility: ${result.signals.sourceScore}%

TEXT EXCERPT:
${truncateText(result.originalText, 500)}
------------------------------------
Verified by Fake News Detector Engine
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `intelligence-report-${result.id.substring(0, 8)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    const loadAnalysis = async () => {
      const id = params.id as string;
      let analysis = getAnalysisById(id);

      if (!analysis) {
        try {
          const response = await fetch("/api/global-stats");
          if (response.ok) {
            const data = await response.json();
            const globalAnalysis = data.recentAnalyses?.find((a: any) => a.id === id);
            
            if (globalAnalysis) {
              analysis = {
                id: globalAnalysis.id,
                originalText: globalAnalysis.excerpt,
                prediction: globalAnalysis.prediction,
                confidence: globalAnalysis.confidence,
                overallScore: globalAnalysis.overallScore,
                flags: globalAnalysis.flags || [],
                signals: globalAnalysis.signals || { mlScore: 50, sentimentScore: 50, clickbaitScore: 50, sourceScore: 50, biasScore: 50 },
                source: { domain: globalAnalysis.domain, credibility: "high" },
                timestamp: globalAnalysis.timestamp,
                highlights: [],
                explanation: "Retrieved from global database",
              };
            }
          }
        } catch (error) {
          console.error("Global fetch failed:", error);
        }
      }

      if (!analysis) {
        router.push("/");
        return;
      }

      setResult(analysis);
      const recent = (await getRecentAnalyses()).filter((a) => a.id !== id).slice(0, 3);
      setSimilarAnalyses(recent);
      setLoading(false);
    };

    loadAnalysis();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-12 h-1 bg-muted overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1s_infinite]" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em]">Processing intelligence signals...</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="min-h-screen bg-background py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-border pb-12">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-3 h-3 mr-2" />
              Reset Engine
            </Link>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Intelligence <span className="text-primary">Report</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Ref: {result.id.substring(0, 8)} // Date: {formatDate(result.timestamp)}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleShare} 
              className="h-12 px-6 border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-all relative overflow-hidden"
              title="Copy link to clipboard"
            >
              {copied ? (
                <span className="text-primary animate-in fade-in slide-in-from-bottom-1 uppercase">Link Copied</span>
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button 
              onClick={handleDownload} 
              className="h-12 px-8 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all border-0 ring-0 outline-none"
            >
              Export Evidence
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 border border-border bg-background flex flex-col items-center justify-center aspect-square">
              <CredibilityMeter score={result.overallScore} size="lg" />
              <div className="mt-6 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Credibility Index</span>
              </div>
            </div>

            <div className="p-8 border border-border bg-background space-y-6">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 border-b border-border pb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                Signal Vectors
              </h3>
              <div className="space-y-6">
                {[
                  { label: "AI Model", score: result.signals.mlScore },
                  { label: "Sentiment", score: result.signals.sentimentScore },
                  { label: "Neutrality", score: result.signals.biasScore }
                ].map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-muted-foreground">{s.label}</span>
                      <span className={s.score === 0 ? "text-primary italic animate-pulse" : ""}>
                        {s.score === 0 ? "SIGNAL LOST" : `${s.score}%`}
                      </span>
                    </div>
                    <div className="h-1 bg-muted">
                      {s.score > 0 && (
                        <div className="h-full bg-primary" style={{ width: `${s.score}%` }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ResultCard result={result} />
            
            {result.highlights.length > 0 && (
              <div className="border border-border bg-background">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Annotation Layer
                  </h3>
                </div>
                <div className="p-8 leading-relaxed font-serif text-lg">
                  <TextHighlighter
                    text={truncateText(result.originalText, 2000)}
                    highlights={result.highlights}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="border border-border">
              <div className="p-6 border-b border-border">
                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">Related Observations</h3>
              </div>
              <div className="divide-y divide-border">
                {similarAnalyses.map((a) => (
                  <Link key={a.id} href={`/analyze/${a.id}`} className="block p-6 hover:bg-muted/30 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-black uppercase italic">{a.prediction}</span>
                      <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-primary" />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground line-clamp-2">
                      {a.source?.domain || "Unknown Vector"}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-8 bg-primary text-primary-foreground space-y-6">
              <ShieldAlert className="w-10 h-10" />
              <h4 className="text-xl font-black uppercase italic leading-none">Stay <br /> Vigilant</h4>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] leading-loose opacity-80 border-t border-primary-foreground/20 pt-4">
                Information warfare remains constant. Verify every vector before signal amplification.
              </p>
              <Link href="/" className="block">
                <button className="w-full h-12 border border-primary-foreground text-[10px] font-bold uppercase tracking-widest hover:bg-primary-foreground hover:text-primary transition-all">
                  New System Scan
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
