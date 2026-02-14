"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAnalysisById } from '@/lib/utils';
import { AnalysisResult } from '@/lib/types';
import { Loader2, AlertCircle, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

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
       <div className="min-h-screen flex items-center justify-center bg-background-light text-ink">
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
             <span className="mono-data text-xs animate-pulse">Initializing Neural Link...</span>
          </div>
       </div>
    );
  }

  if (!analysis) {
    return (
       <div className="min-h-screen flex items-center justify-center bg-background-light text-ink">
          <div className="flex flex-col items-center gap-4 max-w-md text-center">
             <AlertCircle className="w-12 h-12 text-disputed" />
             <h1 className="serif-title text-2xl">Analysis Protocol Failed</h1>
             <p className="mono-data text-xs opacity-60">
                The requested data packet could not be retrieved from the central archive. 
                It may have been purged or never existed.
             </p>
             <Link href="/" className="bg-ink text-white px-6 py-3 mono-data text-xs hover:bg-primary transition-colors mt-4">
                Return to Index
             </Link>
          </div>
       </div>
    );
  }

  const getScoreDisplay = (score: number | undefined) => {
    if (score === undefined || score === null) return { text: "NOT AVAILABLE/LIMIT EXCEEDED", color: "text-ink/30", icon: HelpCircle };
    if (score < 50) return { text: `${score}% / LOW`, color: "text-disputed", icon: XCircle };
    if (score < 80) return { text: `${score}% / MODERATE`, color: "text-primary", icon: AlertCircle };
    return { text: `${score}% / HIGH`, color: "text-verified", icon: CheckCircle };
  };

  const aiPipelines = [
    { name: "Syntactic Pattern Recognition", score: analysis.signals?.mlScore, type: "ML_ENGINE" },
    { name: "Semantic Sentiment Analysis", score: analysis.signals?.sentimentScore, type: "NLP_CORE" },
    { name: "Cross-Reference Verification", score: analysis.signals?.sourceScore, type: "SOURCE_BS" },
    { name: "Bias Detection Engine", score: analysis.signals?.biasScore, type: "BIAS_NET" },
    { name: "Clickbait Probability", score: analysis.signals?.clickbaitScore, type: "META_SCAN" },
  ];

  return (
    <div className="min-h-screen bg-background-light text-ink">
      <header className="border-b border-ink/10 sticky top-0 bg-paper/80 backdrop-blur-md z-50">
        <div className="max-w-[1440px] mx-auto flex h-16 items-stretch">
          <div className="flex items-center px-8 border-r border-ink/10 gap-3">
             <div className="w-6 h-6 relative rounded-full overflow-hidden border border-ink/10">
               <img src="/green_1.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <Link href="/" className="mono-data font-bold text-lg tracking-tighter hover:text-primary transition-colors">FAKE NEWS DETECTOR</Link>
          </div>
          <nav className="flex-grow flex items-stretch">
            <div className="flex items-center px-8 border-r border-ink/10 mono-data text-xs opacity-50">
              Report ID: {analysis.id}
            </div>
            <div className="flex items-center px-8 border-r border-ink/10 mono-data text-xs font-bold text-primary">
              Status: {analysis.prediction || "UNKNOWN"}
            </div>
          </nav>
          <div className="flex items-center px-8 gap-4">
            <Link href="/dashboard" className="mono-data text-[10px] opacity-50 hover:opacity-100">Dashboard</Link>
            <span className="mono-data text-[10px] opacity-20">|</span>
             <Link href="/admin" className="mono-data text-[10px] opacity-50 hover:opacity-100">Admin</Link>
          </div>
        </div>
      </header>


      <div className="w-full border-b border-ink/10 bg-background-light z-40 sticky top-16">
        <div className="max-w-[1440px] mx-auto px-8 py-6">
            <div className="flex items-stretch gap-8">
              {[
                { label: "GEMINI 2.0 FLASH", score: analysis.signals?.mlScore, id: "alpha" },
                { label: "FND-XGBOOST v1", score: analysis.customML?.confidence, id: "beta" },
                { label: "LINGUISTIC ENGINE", score: analysis.signals ? Math.round((analysis.signals.sentimentScore + analysis.signals.biasScore) / 2) : 0, id: "gamma" },
                { label: "SOURCE INTEL", score: analysis.signals?.sourceScore, id: "delta" }
              ].map((model, i) => (
                <div key={model.id} className={`flex-1 ${i !== 3 ? 'border-r border-ink/10' : ''} pr-4`}>
                   <span className="mono-data text-[9px] opacity-40 block mb-2 uppercase tracking-wider">{model.label}</span>
                   <div className="flex items-center gap-3">
                      <span className="serif-title text-3xl tracking-tight">
                        {model.score !== undefined && model.score !== null ? model.score : "NA"}
                      </span>
                      <div className="h-1.5 w-12 bg-ink/10 relative overflow-hidden">
                        {model.score !== undefined && model.score !== null && (
                          <div 
                            className={`h-full ${model.score < 50 ? 'bg-disputed' : 'bg-verified'}`} 
                            style={{ width: `${model.score}%` }}
                          ></div>
                        )}
                      </div>
                   </div>
                </div>
              ))}
              
              <div className="bg-ink text-white dark:bg-white dark:text-ink px-8 py-2 flex flex-col justify-center min-w-[200px] relative overflow-hidden group ml-auto">
                 <div className="relative z-10">
                    <span className="text-[9px] opacity-60 block mb-1 uppercase tracking-wider mono-data">Overall Report Score</span>
                    <div className="flex items-baseline gap-2">
                       <span className="serif-title text-4xl">{analysis.overallScore}</span>
                       <span className="text-[10px] opacity-40 mono-data">/ 100</span>
                    </div>
                 </div>
                 <div className="absolute right-[-20px] top-[-20px] opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <img src="/green_1.jpeg" className="w-24 h-24 rounded-full mix-blend-overlay" />
                 </div>
              </div>

              <div className="flex flex-col justify-center items-end pl-4 border-l border-ink/10">
                 <span className="mono-data text-[9px] opacity-40 block mb-1 uppercase tracking-wider text-right">Consensus Engine</span>
                 <div className="flex items-center gap-2">
                    <span className="mono-data text-xs font-bold uppercase">Multi-Model Aggregate</span>
                     <div className="flex gap-1">
                        {[1,2,3,4,5].map(dots => (
                           <div key={dots} className="w-1 h-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${dots * 0.1}s`}}></div>
                        ))}
                     </div>
                 </div>
              </div>
            </div>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto min-h-screen flex items-stretch">
        <aside className="w-96 border-r border-ink/10 flex flex-col shrink-0 min-h-[calc(100vh-64px)]">
          <div className="p-8 border-b border-ink/10">
            <span className="mono-data text-[10px] opacity-50 block mb-4">Aggregate Veracity Score</span>
            <div className="flex items-baseline gap-2">
              <span className={`mono-data text-5xl font-bold ${analysis.overallScore < 50 ? 'text-disputed' : 'text-verified'}`}>
                {analysis.overallScore || 0}
              </span>
              <span className="mono-data text-sm opacity-50">/ 100</span>
            </div>
            <div className="w-full bg-ink/5 h-1 mt-4">
              <div 
                className={`h-full ${analysis.overallScore < 50 ? 'bg-disputed' : 'bg-verified'}`} 
                style={{ width: `${analysis.overallScore}%` }}
              ></div>
            </div>
            <p className="mt-4 text-[11px] leading-relaxed opacity-60">
              {analysis.explanation || "No detailed explanation available for this analysis."}
            </p>
          </div>
          
          <div className="flex-grow overflow-y-auto">
             <div className="p-4 bg-ink/5 border-b border-ink/10">
                <span className="mono-data text-[10px] opacity-50 block uppercase tracking-wider">Active AI Pipelines</span>
             </div>
             {aiPipelines.map((pipeline, idx) => {
                const { text, color, icon: Icon } = getScoreDisplay(pipeline.score);
                const isAvailable = pipeline.score !== undefined && pipeline.score !== null;
                
                return (
                  <div key={idx} className="p-6 border-b border-ink/10 hover:bg-ink/5 transition-colors group">
                     <div className="flex justify-between items-start mb-2">
                        <span className="mono-data text-xs font-bold block max-w-[180px] group-hover:text-primary transition-colors">{pipeline.name}</span>
                        <span className="mono-data text-[9px] opacity-30 border border-ink/20 px-1 rounded">{pipeline.type}</span>
                     </div>
                     <div className="flex items-center gap-2 mt-3">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className={`mono-data text-[10px] ${color}`}>
                           {text}
                        </span>
                     </div>
                  </div>
                );
             })}
          </div>
        </aside>

        <article className="flex-grow p-16 overflow-y-auto h-[calc(100vh-64px)] scrollbar-hide">


          <div className="max-w-3xl mx-auto">
            <span className="mono-data text-[10px] text-primary mb-4 block">[ Subject Material For Analysis ]</span>
            <h1 className="serif-title text-5xl leading-tight mb-8 break-words text-ink">
               {analysis.source?.domain ? `Analysis of: ${analysis.source.domain}` : "Text Analysis Report"}
            </h1>
            
            {analysis.url && (
               <div className="mb-12 p-4 bg-ink/5 border-l-2 border-primary mono-data text-xs text-ink/70 flex items-center justify-between">
                  <span className="truncate max-w-[500px]">{analysis.url}</span>
                  <a href={analysis.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OPEN LINK ↗</a>
               </div>
            )}

            <div className="prose prose-lg prose-headings:font-serif prose-p:font-sans py-8 border-t border-ink/10">
               <h3 className="mono-data text-xs text-ink/40 uppercase mb-8">Extracted Content Content</h3>
              {analysis.originalText ? (
                 <p className="whitespace-pre-wrap font-serif text-xl leading-relaxed opacity-80">{analysis.originalText}</p>
              ) : (
                 <p className="italic opacity-50 border border-dashed border-ink/20 p-8 text-center">[No textual content could be successfully extracted from the target]</p>
              )}
            </div>

            <div className="mt-20 pt-12 border-t border-ink/10">
              <span className="mono-data text-[10px] opacity-40 block mb-6">Metadata & Signals</span>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <span className="mono-data text-[10px] opacity-60 block mb-2">Word Count</span>
                  <span className="mono-data text-sm">{analysis.originalText?.split(' ').length || 0}</span>
                </div>
                <div>
                  <span className="mono-data text-[10px] opacity-60 block mb-2">Process Time</span>
                  <span className="mono-data text-sm">{(analysis.timestamp ? (Date.now() - analysis.timestamp) / 1000 : 0.42).toFixed(2)}s</span>
                </div>
                <div>
                   <span className="mono-data text-[10px] opacity-60 block mb-2">Model Version</span>
                   <span className="mono-data text-sm">FND-v1.0.4</span>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside className="w-80 border-l border-ink/10 flex flex-col shrink-0 bg-ink/5 h-[calc(100vh-64px)]">
           <div className="p-8 border-b border-ink/10 bg-paper">
            <span className="mono-data text-[10px] opacity-50 block mb-4">Source Integrity</span>
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${analysis.source?.credibility === 'high' ? 'bg-verified' : 'bg-disputed'}`}></div>
                 <span className="mono-data text-xs">
                    Credibility: {(analysis.source?.credibility || "UNKNOWN").toUpperCase()}
                 </span>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="mono-data text-xs truncate max-w-[180px]">
                     {analysis.source?.domain || "Unknown Domain"}
                  </span>
               </div>
             </div>
           </div>
           
           <div className="flex-grow relative overflow-hidden flex flex-col">
             <div className="absolute inset-0 z-0">
               <img 
                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvxIEyioZT6nDRFciN9J5plLDw98hxbmogDTUQ-gWsoxWJMfpP3SNdQuPvnV-4GL63DxKlkw0TYXv7AziPmIEaybxiofmh9bYgW8_eAMccedVmAVz4vLq57qdDvRchQC8l7nwbXDxou-1M7OeQtK1XNNCI-t541TlN0qWUcwvB8-i9xsiru0cHWqc4B_vdmoPKM_V-Y3PWjiOuP620wuKXmhcSEt7ZUaqlRkhYceIfXrMsL1XnKUooHz0lNJzLaWTaxcc3kPCQ0KU" 
                 alt="Network visualization" 
                 className="object-cover w-full h-full grayscale opacity-20 mix-blend-multiply" 
               />
             </div>
             <div className="relative z-10 p-8 mt-auto bg-gradient-to-t from-background-light to-transparent">
               <span className="mono-data text-[10px] opacity-50 block mb-2">Visualization Module</span>
               <div className="border border-ink/20 bg-white/50 backdrop-blur-sm p-4 text-center aspect-video flex items-center justify-center">
                  <span className="mono-data text-[9px] opacity-60">Wait for Node Propagation...</span>
               </div>
             </div>
           </div>
        </aside>
      </main>
    </div>
  );
}
