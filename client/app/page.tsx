"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAnalysis } from '@/lib/utils';
import { ShieldCheck, Activity, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 800);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    try {
      const isUrl = input.includes("http");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isUrl ? { url: input } : { text: input }),
      });
      
      if (res.ok) {
        const data = await res.json();
        await saveAnalysis(data);
        const targetId = data.id || "latest"; 
        // add a small delay to finish animation
        setTimeout(() => {
          router.push(`/analyze/${targetId}`);
        }, 1000);
      } else {
        console.error("Analysis failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error analyzing:", error);
      setLoading(false);
    }
  };

  const steps = [
    "System Diagnostics Initiated",
    "Step 1: Vectorizing Input Text...",
    "Step 2: Analyzing Coefficients...",
    "Step 3: Calculating ML Confidence..."
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="border-b border-border">
        <div className="max-w-[1440px] mx-auto flex h-20 items-stretch">
          <div className="flex items-center px-8 border-r border-border gap-3">
            <Activity className="w-6 h-6 text-primary" />
            <span className="mono-data font-bold text-lg tracking-widest uppercase">XAI_CORE</span>
          </div>
          <nav className="flex-grow flex items-stretch">
            <Link href="/" className="flex items-center px-8 hover:bg-primary/10 transition-colors border-r border-border mono-data text-sm uppercase tracking-wider">
              Index
            </Link>
            <Link href="/metrics" className="flex items-center px-8 hover:bg-primary/10 transition-colors border-r border-border mono-data text-sm uppercase tracking-wider">
              Metrics
            </Link>
          </nav>
          <div className="flex items-center px-8 text-primary">
            <span className="mono-data text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              SYS.ONLINE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
        <section className="grid grid-cols-12 min-h-[50vh] items-stretch border-b border-border">
          <div className="col-span-8 p-16 flex flex-col justify-center border-r border-border relative overflow-hidden" style={{background: 'radial-gradient(ellipse 80% 60% at 40% 50%, rgba(17,115,212,0.07) 0%, transparent 70%)' }}>
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.04) 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-8">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <span className="mono-data text-primary uppercase text-sm tracking-widest">[ Logistics Regression Pipeline ]</span>
              </div>
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-8">
                Clinical Precision in <br/> Truth Verification.
              </h1>
              <p className="max-w-xl text-lg font-light leading-relaxed mb-10 text-muted-foreground">
                High-fidelity pipeline leveraging an optimized Custom WelFake Dataset Model. Expect rigorous coefficient analysis and multi-signal heuristics.
              </p>

              {loading ? (
                <div
                  className="w-full flex items-center gap-4 px-7 py-5"
                  style={{
                    background: '#0d1117',
                    border: '1px solid rgba(17,115,212,0.45)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 0 1px rgba(17,115,212,0.15), 0 0 32px rgba(17,115,212,0.12), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                >
                  <div className="flex flex-col gap-1.5 flex-1 font-mono text-sm">
                    {steps.map((text, i) => (
                      <div key={i} className={`flex items-center gap-3 transition-all ${i <= scanStep ? 'text-[#1173d4] opacity-100' : 'opacity-0 hidden'}`}>
                        {i <= scanStep && <span className="animate-pulse text-xs">❯</span>}
                        <span className="text-xs tracking-wider">{text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse" style={{background: 'rgba(17,115,212,0.25)', border: '1px solid rgba(17,115,212,0.5)'}}>
                    <ArrowRight className="w-4 h-4 text-[#1173d4]" />
                  </div>
                </div>
              ) : (
                <div
                  className="w-full flex items-center gap-3 px-7 py-1 transition-all duration-300 group"
                  style={{
                    background: '#0d1117',
                    border: '1px solid rgba(17,115,212,0.35)',
                    borderRadius: '9999px',
                    boxShadow: '0 0 0 1px rgba(17,115,212,0.1), 0 0 24px rgba(17,115,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px rgba(17,115,212,0.4), 0 0 40px rgba(17,115,212,0.2), inset 0 1px 0 rgba(255,255,255,0.05)')}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = '0 0 0 1px rgba(17,115,212,0.1), 0 0 24px rgba(17,115,212,0.08), inset 0 1px 0 rgba(255,255,255,0.04)')}
                >
                  <input
                    id="analysis-input"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    placeholder="Paste article text or URL here..."
                    className="flex-1 bg-transparent border-none outline-none text-sm py-4"
                    style={{
                      fontFamily: "'Space Mono', monospace",
                      color: 'rgba(255,255,255,0.85)',
                      caretColor: '#1173d4',
                    }}
                    disabled={loading}
                  />
                  <button
                    id="analyze-button"
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, #1173d4 0%, #0d5faf 100%)',
                      boxShadow: '0 0 16px rgba(17,115,212,0.5), 0 2px 8px rgba(0,0,0,0.4)',
                    }}
                  >
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              <p className="mt-4 text-xs font-mono" style={{color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em'}}>ENTER ↵ to execute &nbsp;·&nbsp; supports raw text or https:// URLs</p>
            </div>
          </div>
          
          <div className="col-span-4 bg-muted/20 p-12 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-border">
                <Activity className="w-5 h-5 text-primary" />
                <span className="mono-data text-sm uppercase tracking-widest text-muted-foreground">Model Telemetry</span>
              </div>
              <div className="space-y-8">
                <div>
                  <span className="mono-data text-xs block mb-1 opacity-50 uppercase tracking-widest">Base Accuracy</span>
                  <span className="mono-data text-3xl font-light text-primary">96.03%</span>
                </div>
                <div>
                  <span className="mono-data text-xs block mb-1 opacity-50 uppercase tracking-widest">Vocabulary Matrix</span>
                  <span className="mono-data text-3xl font-light">120K+</span>
                </div>
                <div>
                  <span className="mono-data text-xs block mb-1 opacity-50 uppercase tracking-widest">Training Corpus</span>
                  <span className="mono-data text-3xl font-light">72,000</span>
                </div>
              </div>
            </div>
            <div className="mt-auto border border-border p-4 bg-card/50">
              <span className="mono-data text-xs block mb-2 text-primary">STATUS: STANDBY</span>
              <div className="w-full h-1 bg-border overflow-hidden">
                <div className="h-full bg-primary w-full animate-pulse opacity-50"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
