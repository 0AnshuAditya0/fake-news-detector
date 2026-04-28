"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAnalysisById } from '@/lib/utils';
import { AnalysisResult } from '@/lib/types';
import { Loader2, AlertCircle, ShieldCheck, ShieldAlert, Fingerprint, Activity, FileText, BarChart2 } from 'lucide-react';

export default function AnalysisPage() {
  const params = useParams();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const data = getAnalysisById(params.id as string);
      setAnalysis(data);
      setLoading(false);
    }
  }, [params.id]);

  if (loading) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-4">
             <Activity className="w-12 h-12 text-primary animate-pulse" />
             <span className="mono-data text-xs animate-pulse opacity-60 tracking-widest uppercase">Initializing Neural Link...</span>
          </div>
       </div>
    );
  }

  if (!analysis) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
             <ShieldAlert className="w-12 h-12 text-destructive" />
             <h1 className="text-2xl font-bold tracking-tight">Analysis Protocol Failed</h1>
             <p className="mono-data text-xs opacity-60">
                The requested data packet could not be retrieved from the central archive. 
             </p>
             <Link href="/" className="bg-primary text-primary-foreground px-6 py-3 mono-data text-xs hover:bg-primary/90 transition-colors mt-4 uppercase tracking-widest">
                Return to Index
             </Link>
          </div>
       </div>
    );
  }

  const getScoreDisplay = (score: number | undefined) => {
    if (score === undefined || score === null) return { text: "NOT AVAILABLE/LIMIT EXCEEDED", color: "text-muted-foreground", icon: AlertCircle };
    if (score < 50) return { text: `${score}% / LOW`, color: "text-destructive", icon: ShieldAlert };
    if (score < 80) return { text: `${score}% / MODERATE`, color: "text-warning", icon: Activity };
    return { text: `${score}% / HIGH`, color: "text-success", icon: ShieldCheck };
  };

  const isFake = analysis.prediction === "FAKE";
  const mainStatusColor = isFake ? "text-destructive" : "text-success";
  const bgStatusColor = isFake ? "bg-destructive/10 border-destructive/20" : "bg-success/10 border-success/20";
  const barColor = isFake ? "bg-destructive" : "bg-success";

  const aiPipelines = [
    { name: "Logistic Regression Output", score: analysis.signals?.mlScore, type: "ML_CORE" },
    { name: "Semantic Sentiment Analysis", score: analysis.signals?.sentimentScore, type: "NLP_CORE" },
    { name: "Cross-Reference Verification", score: analysis.signals?.sourceScore, type: "SOURCE_DB" },
    { name: "Bias Detection Engine", score: analysis.signals?.biasScore, type: "BIAS_NET" },
    { name: "Clickbait Probability", score: analysis.signals?.clickbaitScore, type: "META_SCAN" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-[1440px] mx-auto flex h-16 items-stretch">
          <div className="flex items-center px-8 border-r border-border gap-3">
             <Activity className="w-5 h-5 text-primary" />
            <Link href="/" className="mono-data font-bold text-sm tracking-widest uppercase hover:text-primary transition-colors">XAI_CORE</Link>
          </div>
          <nav className="flex-grow flex items-stretch">
            <div className="flex items-center px-8 border-r border-border mono-data text-xs opacity-50 tracking-widest">
              REPORT_ID: {analysis.id}
            </div>
            <div className={`flex items-center px-8 border-r border-border mono-data text-xs font-bold tracking-widest ${mainStatusColor}`}>
              STATUS: {analysis.prediction || "UNKNOWN"}
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto min-h-[calc(100vh-64px)] flex items-stretch">
        <aside className="w-96 border-r border-border flex flex-col shrink-0 min-h-[calc(100vh-64px)]">
          <div className={`p-8 border-b border-border ${bgStatusColor} transition-colors`}>
            <span className="mono-data text-[10px] opacity-70 block mb-4 uppercase tracking-widest">Calculated Confidence</span>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-black tracking-tighter ${mainStatusColor}`}>
                {analysis.confidence || 0}%
              </span>
              <span className="mono-data text-sm opacity-50 uppercase">{analysis.prediction}</span>
            </div>
            <div className="w-full bg-foreground/5 h-1 mt-6">
              <div 
                className={`h-full ${barColor} shadow-[0_0_10px_currentColor]`} 
                style={{ width: `${analysis.confidence}%` }}
              ></div>
            </div>
            <p className="mt-6 text-sm leading-relaxed opacity-80 font-light">
              {analysis.explanation}
            </p>
          </div>
          
          <div className="flex-grow overflow-y-auto">
             <div className="p-4 bg-muted/30 border-b border-border">
                <span className="mono-data text-[10px] opacity-50 block uppercase tracking-wider">Multi-Signal Heuristics</span>
             </div>
             {aiPipelines.map((pipeline, idx) => {
                const { text, color, icon: Icon } = getScoreDisplay(pipeline.score);
                
                return (
                  <div key={idx} className="p-6 border-b border-border hover:bg-muted/10 transition-colors group">
                     <div className="flex justify-between items-start mb-2">
                        <span className="mono-data text-xs font-bold block max-w-[180px] group-hover:text-primary transition-colors">{pipeline.name}</span>
                        <span className="mono-data text-[9px] opacity-40 border border-border px-1.5 py-0.5">{pipeline.type}</span>
                     </div>
                     <div className="flex items-center gap-2 mt-3">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className={`mono-data text-[10px] font-bold tracking-widest ${color}`}>
                           {text}
                        </span>
                     </div>
                  </div>
                );
             })}
          </div>
        </aside>

        <article className="flex-grow flex flex-col h-[calc(100vh-64px)]">
            <div className="p-12 pb-6 border-b border-border">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold tracking-tight">Analyzed Payload</h1>
              </div>
              
              {analysis.url && (
                 <div className="mb-6 p-4 bg-muted/30 border-l-[3px] border-primary mono-data text-xs flex items-center justify-between">
                    <span className="truncate max-w-[500px] opacity-70">SRC: {analysis.url}</span>
                    <a href={analysis.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline uppercase tracking-widest font-bold">Trace Link ↗</a>
                 </div>
              )}
            </div>

            <div className="flex-grow overflow-y-auto p-12 pt-6">
              <div className="bg-card border border-border p-8 mb-12 relative">
                <div className="absolute top-0 right-0 p-4 border-l border-b border-border/50 text-[10px] mono-data uppercase opacity-40 tracking-widest">
                  Extracted Raw Text
                </div>
                {analysis.originalText ? (
                   <p className="whitespace-pre-wrap text-lg leading-relaxed">{analysis.originalText}</p>
                ) : (
                   <p className="italic opacity-50 p-8 text-center">[No textual payload extracted]</p>
                )}
              </div>

              {/* Linguistic Triggers Section */}
              {analysis.triggers && analysis.triggers.length > 0 && (
                <div className="mb-12">
                   <div className="flex items-center gap-3 mb-6">
                     <BarChart2 className="w-5 h-5 text-primary" />
                     <h3 className="text-xl font-bold tracking-tight">Linguistic Triggers</h3>
                   </div>
                   <p className="text-sm font-light opacity-70 mb-6 max-w-2xl">
                     Specific vocabulary coefficients mapped by the Logistic Regression array. Words heavily weighted towards determining the outcome prediction.
                   </p>
                   
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                     {analysis.triggers.map((trigger, i) => {
                       // we map weight to a positive percentage roughly
                       const weightPercent = Math.min(100, Math.abs(trigger.weight) * 50);
                       const isPos = trigger.weight > 0;
                       return (
                         <div key={i} className="border border-border p-4 bg-card/50 flex flex-col justify-between group hover:border-primary/50 transition-colors">
                           <div className="flex justify-between items-start mb-4">
                             <span className="font-mono text-sm font-bold text-primary truncate" title={trigger.word}>
                               {trigger.word}
                             </span>
                             <span className="text-[10px] mono-data opacity-50">
                               {trigger.weight.toFixed(3)}
                             </span>
                           </div>
                           <div className="w-full bg-border h-1">
                             <div 
                               className={`h-full shadow-[0_0_5px_currentColor] ${isPos ? 'bg-destructive' : 'bg-success'}`}
                               style={{ width: `${weightPercent}%` }}
                             ></div>
                           </div>
                           <span className="text-[9px] mono-data opacity-40 mt-2 uppercase text-right tracking-wider">
                             Impact
                           </span>
                         </div>
                       )
                     })}
                   </div>
                </div>
              )}

              <div className="pt-8 border-t border-border grid grid-cols-3 gap-8">
                <div>
                  <span className="mono-data text-[10px] opacity-40 block mb-2 uppercase tracking-widest">Entity Size</span>
                  <span className="mono-data text-sm">{analysis.originalText?.split(/\s+/).length || 0} WORDS</span>
                </div>
                <div>
                  <span className="mono-data text-[10px] opacity-40 block mb-2 uppercase tracking-widest">Process Hash</span>
                  <span className="mono-data text-sm tracking-wider opacity-80">{analysis.id.slice(0,8).toUpperCase()}</span>
                </div>
                 <div>
                   <span className="mono-data text-[10px] opacity-40 block mb-2 uppercase tracking-widest">Engine Engine</span>
                   <span className="mono-data text-sm text-primary">WEL-FAKE-LR-v1</span>
                </div>
              </div>
            </div>
        </article>

        <aside className="w-80 border-l border-border flex flex-col shrink-0 bg-muted/10 h-[calc(100vh-64px)]">
           <div className="p-8 border-b border-border bg-card/50">
            <span className="mono-data text-[10px] opacity-50 block mb-6 uppercase tracking-widest">Origin Trace</span>
             <div className="space-y-6">
               <div className="flex items-center gap-4">
                 <Fingerprint className="w-8 h-8 opacity-40" />
                 <div>
                   <span className="mono-data text-[10px] block opacity-50 mb-1 tracking-wider uppercase">Domain Check</span>
                   <span className="mono-data text-xs font-bold truncate max-w-[180px]">
                      {analysis.source?.domain || "UNVERIFIED"}
                   </span>
                 </div>
               </div>
             </div>
           </div>
           
           <div className="flex-grow p-8 flex flex-col">
             <span className="mono-data text-[10px] opacity-50 block mb-4 uppercase tracking-widest">Diagnostic Flags</span>
             <div className="space-y-3">
               {analysis.flags && analysis.flags.length > 0 ? (
                 analysis.flags.map((flag, idx) => (
                   <div key={idx} className="flex gap-3 text-xs bg-background border border-border p-3 items-start">
                     <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                     <span className="opacity-80 leading-snug">{flag}</span>
                   </div>
                 ))
               ) : (
                 <div className="text-xs opacity-40 mono-data border border-border border-dashed p-4 text-center">
                   NO CRITICAL ANOMALIES DETECTED
                 </div>
               )}
             </div>
           </div>
        </aside>
      </main>
    </div>
  );
}
