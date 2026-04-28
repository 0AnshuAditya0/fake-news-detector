"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { saveAnalysis } from '@/lib/utils';
import { ShieldCheck, Activity, Fingerprint, Terminal } from 'lucide-react';

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
          <div className="col-span-8 p-16 flex flex-col justify-center border-r border-border relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5 pattern-grid-lg mix-blend-overlay"></div>
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
              
              <div className="bg-card border border-border p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Terminal className="w-5 h-5 text-primary" />
                  <span className="mono-data text-sm tracking-wider uppercase">Input Buffer</span>
                </div>
                
                {loading ? (
                  <div className="py-8 px-4 border border-border bg-background space-y-4">
                    <div className="flex flex-col gap-2 font-mono text-sm">
                      {steps.map((text, i) => (
                        <div key={i} className={`flex items-center gap-3 ${i <= scanStep ? 'text-primary' : 'text-muted/30 hidden'}`}>
                          {i <= scanStep && <span className="animate-pulse">❯</span>}
                          <span>{text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-stretch border border-border bg-background focus-within:ring-1 focus-within:ring-primary transition-all">
                    <input 
                      id="analysis-input"
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                      placeholder="Enter target content payload..." 
                      className="w-full bg-transparent border-none focus:ring-0 px-6 py-4 mono-data placeholder:text-muted-foreground outline-none text-sm"
                      disabled={loading}
                    />
                    <button 
                      onClick={handleAnalyze}
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 mono-data text-sm uppercase tracking-wider font-bold transition-colors border-l border-border disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Fingerprint className="w-4 h-4" />
                      Execute
                    </button>
                  </div>
                )}
              </div>
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
