
"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveAnalysis } from '@/lib/utils';

export default function LandingPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        router.push(`/analyze/${targetId}`);
      } else {
        console.error("Analysis failed");
        // Optional: Show error state
      }
    } catch (error) {
      console.error("Error analyzing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">

      <header className="border-b border-ink/10 dark:border-white/10">
        <div className="max-w-[1440px] mx-auto flex h-20 items-stretch">
          <div className="flex items-center px-8 border-r border-ink/10 dark:border-white/10 gap-3">

            <div className="w-8 h-8 relative rounded-full overflow-hidden border border-ink/10">
               <img src="/green_1.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="mono-data font-bold text-lg tracking-tighter">FAKE NEWS DETECTOR</span>
          </div>
          <nav className="flex-grow flex items-stretch">
            <Link href="/" className="flex items-center px-8 hover:bg-primary hover:text-white transition-colors border-r border-ink/10 dark:border-white/10 mono-data text-sm">
              Index
            </Link>
            <Link href="/dashboard" className="flex items-center px-8 hover:bg-primary hover:text-white transition-colors border-r border-ink/10 dark:border-white/10 mono-data text-sm">
              Dashboard
            </Link>
            <Link href="/admin" className="flex items-center px-8 hover:bg-primary hover:text-white transition-colors border-r border-ink/10 dark:border-white/10 mono-data text-sm">
              Admin
            </Link>
          </nav>
          <div className="flex items-center px-8">
            <span className="mono-data text-xs opacity-50">Operational Status: 99.8%</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto min-h-screen">

        <section className="grid grid-cols-12 min-h-[60vh] items-stretch">

          <div className="col-span-7 p-12 pt-8 border-r border-ink/10 dark:border-white/10 flex flex-col justify-center">
            <span className="mono-data text-primary mb-6">[ System Initialization ]</span>
            <h1 className="serif-title text-8xl leading-none mb-12">The Architecture of Veracity.</h1>
            <div className="flex gap-12 items-start">
              <p className="max-w-xs text-lg font-light leading-relaxed">
                A high-fidelity analysis engine designed to dissect misinformation with editorial precision and scientific rigor.
              </p>
              <div className="pt-2">
                <button 
                  onClick={() => document.getElementById('analysis-input')?.focus()}
                  className="bg-primary text-white px-8 py-4 rounded-none mono-data text-sm flex items-center gap-4 hover:bg-ink transition-colors"
                >
                  Initiate Deep Scan
                  <span className="text-xs">→</span>
                </button>
              </div>
            </div>
          </div>
          <div className="col-span-5 flex flex-col h-full">
            <div className="p-12 space-y-8 flex-shrink-0">
              <div className="border-t border-ink/10 dark:border-white/10 pt-4">
                <span className="mono-data text-xs block mb-2 opacity-50">01 / Latency</span>
                <span className="mono-data text-2xl">0.042ms</span>
              </div>
              <div className="border-t border-ink/10 dark:border-white/10 pt-4">
                <span className="mono-data text-xs block mb-2 opacity-50">02 / Neural Confidence</span>
                <span className="mono-data text-2xl">98.4%</span>
              </div>
              <div className="border-t border-ink/10 dark:border-white/10 pt-4">
                <span className="mono-data text-xs block mb-2 opacity-50">03 / Cross-References</span>
                <span className="mono-data text-2xl">1.2M+</span>
              </div>
            </div>
            {/* Image adjusted to fill remaining height properly */}
            <div className="relative flex-grow w-full min-h-[300px] bg-ink/5 dark:bg-white/5 overflow-hidden">
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvxIEyioZT6nDRFciN9J5plLDw98hxbmogDTUQ-gWsoxWJMfpP3SNdQuPvnV-4GL63DxKlkw0TYXv7AziPmIEaybxiofmh9bYgW8_eAMccedVmAVz4vLq57qdDvRchQC8l7nwbXDxou-1M7OeQtK1XNNCI-t541TlN0qWUcwvB8-i9xsiru0cHWqc4B_vdmoPKM_V-Y3PWjiOuP620wuKXmhcSEt7ZUaqlRkhYceIfXrMsL1XnKUooHz0lNJzLaWTaxcc3kPCQ0KU" 
                alt="Abstract digital architecture pattern" 
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-40 mix-blend-multiply"
                data-alt="Microscopic view of high-tech digital circuitry and data patterns"
              />
            </div>
          </div>
        </section>

        {/* Input Section */}
        <section className="border-y border-ink/10 dark:border-white/10">
          <div className="grid grid-cols-12">
            <div className="col-span-2 p-8 border-r border-ink/10 dark:border-white/10 flex items-center">
              <span className="mono-data text-xs">Analysis Target</span>
            </div>
            <div className="col-span-10 p-0 flex items-stretch relative">
              <input 
                id="analysis-input"
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                placeholder="Paste URL or text for precision verification..." 
                className="w-full bg-transparent border-none focus:ring-0 px-8 py-12 text-3xl serif-title placeholder:text-ink/20 dark:placeholder:text-white/20 outline-none"
                disabled={loading}
              />
              <button 
                onClick={handleAnalyze}
                disabled={loading}
                className="bg-ink text-white dark:bg-primary px-12 mono-data hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </section>

        {/* Methodology */}
        <section className="grid grid-cols-12 border-b border-ink/10 dark:border-white/10">
          <div className="col-span-4 p-12 border-r border-ink/10 dark:border-white/10">
            <h2 className="mono-data text-xs text-primary mb-12">Methodology / 04</h2>
            <div className="serif-title text-4xl mb-6">Objective Analysis in an Age of Subjectivity.</div>
            <p className="opacity-70 leading-relaxed">
              Our truth engine operates through three distinct layers of verification, ensuring that every claim is parsed against established factual substrates.
            </p>
          </div>
          <div className="col-span-8 grid grid-cols-2">
            <div className="p-12 border-r border-ink/10 dark:border-white/10 border-b border-ink/10 dark:border-white/10">
              <span className="mono-data text-sm block mb-4">[01] Syntactic Pattern Recognition</span>
              <p className="text-sm opacity-60 leading-relaxed">Detecting linguistic markers often associated with propaganda and manufactured narratives through advanced NLP clusters.</p>
            </div>
            <div className="p-12 border-b border-ink/10 dark:border-white/10">
              <span className="mono-data text-sm block mb-4">[02] Cross-Reference Verification</span>
              <p className="text-sm opacity-60 leading-relaxed">Mapping assertions against a real-time database of 1.2M+ verified journalistic sources and academic papers.</p>
            </div>
            <div className="p-12 border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-sm block mb-4">[03] Temporal Context Tracking</span>
              <p className="text-sm opacity-60 leading-relaxed">Analyzing how news breaks and evolves over time to identify anomalies in the information lifecycle.</p>
            </div>
            <div className="p-12">
              <span className="mono-data text-sm block mb-4">[04] Source Provenance Audit</span>
              <p className="text-sm opacity-60 leading-relaxed">Tracing the physical and digital origin of media assets to verify authentic authorship and location data.</p>
            </div>
          </div>
        </section>

        {/* Dynamic Data Section */}
        <section className="p-12">
          <div className="flex justify-between items-baseline mb-12">
            <h3 className="serif-title text-3xl">Live Feed Analysis</h3>
            <span className="mono-data text-xs border-b border-primary text-primary pb-1 cursor-pointer">View Global Map</span>
          </div>
          <div className="grid grid-cols-4 gap-0 border border-ink/10 dark:border-white/10">
            <div className="p-6 border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Timestamp</span>
              <span className="mono-data text-xs">14:02:11 GMT</span>
            </div>
            <div className="p-6 border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Source Domain</span>
              <span className="mono-data text-xs">reuters.ldn.int</span>
            </div>
            <div className="p-6 border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Integrity Score</span>
              <span className="mono-data text-xs text-primary">99.2 / Verified</span>
            </div>
            <div className="p-6">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Entropy</span>
              <span className="mono-data text-xs">0.0024 Low</span>
            </div>
            {/* Second Row */}
            <div className="p-6 border-t border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Timestamp</span>
              <span className="mono-data text-xs">13:58:45 GMT</span>
            </div>
            <div className="p-6 border-t border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Source Domain</span>
              <span className="mono-data text-xs">un-verified.net/882</span>
            </div>
            <div className="p-6 border-t border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Integrity Score</span>
              <span className="mono-data text-xs text-red-600">12.4 / High Risk</span>
            </div>
            <div className="p-6 border-t border-ink/10 dark:border-white/10">
              <span className="mono-data text-[10px] opacity-50 block mb-2">Entropy</span>
              <span className="mono-data text-xs">0.8922 High</span>
            </div>
          </div>
        </section>

        {/* Source Map Image Placeholder */}
        <section className="h-96 w-full bg-ink relative overflow-hidden">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUMajnlcqMFLZFObH2-Q1OMX7i-AQR2-hydfVQEQLwO8Jx9OBp6ZFs0FWMHpU6EJD_URjJyzFtKiiaFt2h4jTtrzPznxew-U1S_RB3II2xVzHqaqKbLj26USANrVAU7IZto8xxHs_1ZJQXL343xcbzkshGp2IFqkQs9Lld6oNk6iTECwKMKxuSJpgT_ek-S0a28i_AcQ-yuoz9l46Hl-dDzJ1vgAmjnIhgUW_zajJmwhFv8LjTtkj0Q-V4Zlbms-H9N00RINJZ1HQ" 
            alt="Global connectivity map" 
            className="w-full h-full object-cover grayscale opacity-30" 
            data-alt="High contrast global network map with illuminated data points" 
            data-location="Global"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-background-light px-8 py-4 border border-ink/10">
              <span className="mono-data text-xs">Real-time Information Flow: Active Nodes 4,291</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-ink dark:border-white mt-24">
        <div className="max-w-[1440px] mx-auto grid grid-cols-12">
          <div className="col-span-4 p-12 border-r border-ink/10 dark:border-white/10">
            <span className="mono-data text-xl block mb-8">FAKE NEWS DETECTOR</span>
            <p className="text-xs opacity-50 max-w-[200px] leading-relaxed">
              A project by the Editorial Precision Institute. Built to uphold the standards of the International Typographic Style and Digital Veracity.
            </p>
          </div>
          <div className="col-span-8 grid grid-cols-3">
            <div className="p-12 border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-xs mb-6 block font-bold">Protocols</span>
              <ul className="space-y-3 mono-data text-[10px]">
                <li><Link href="#" className="hover:text-primary">SHA-256 Auth</Link></li>
                <li><Link href="#" className="hover:text-primary">Source Trace</Link></li>
                <li><Link href="#" className="hover:text-primary">Bias Filter v2</Link></li>
              </ul>
            </div>
            <div className="p-12 border-r border-ink/10 dark:border-white/10">
              <span className="mono-data text-xs mb-6 block font-bold">Institutional</span>
              <ul className="space-y-3 mono-data text-[10px]">
                <li><Link href="#" className="hover:text-primary">Whitepaper</Link></li>
                <li><Link href="#" className="hover:text-primary">Ethics Board</Link></li>
                <li><Link href="#" className="hover:text-primary">API Documentation</Link></li>
              </ul>
            </div>
            <div className="p-12">
              <span className="mono-data text-xs mb-6 block font-bold">Terminal</span>
              <p className="mono-data text-[10px] opacity-40">
                © 2024 PRECISION NEWS DETECTOR<br/>
                EDITION 4.0.2<br/>
                ALL RIGHTS RESERVED.
              </p>
            </div>
          </div>
        </div>
        <div className="bg-ink text-white p-4 text-center">
          <span className="mono-data text-[9px] tracking-[0.4em]">VERITAS / CLARITAS / INTEGRITAS</span>
        </div>
      </footer>
    </div>
  );
}
