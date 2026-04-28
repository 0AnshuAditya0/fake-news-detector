"use client";

import Link from 'next/link';
import { ShieldCheck, Activity, BrainCircuit, TableProperties } from 'lucide-react';

export default function MetricsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="max-w-[1440px] mx-auto flex h-16 items-stretch">
          <div className="flex items-center px-8 border-r border-border gap-3">
             <Activity className="w-5 h-5 text-primary" />
            <Link href="/" className="mono-data font-bold text-sm tracking-widest uppercase hover:text-primary transition-colors">XAI_CORE</Link>
          </div>
          <nav className="flex-grow flex items-stretch">
            <Link href="/" className="flex items-center px-8 hover:bg-primary/10 transition-colors border-r border-border mono-data text-xs uppercase tracking-widest">
              Index
            </Link>
            <div className="flex items-center px-8 border-r border-border mono-data text-xs font-bold tracking-widest text-primary bg-primary/5">
              Metrics
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-[1440px] mx-auto p-12 lg:p-16">
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight uppercase">Base Model Telemetry</h1>
          </div>
          <p className="max-w-2xl text-lg font-light opacity-70 leading-relaxed">
            Performance analytics from the primary Custom Logistic Regression model trained on 72,000+ WELFake dataset samples.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Classification Report */}
          <div className="border border-border bg-card">
            <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/20">
              <TableProperties className="w-5 h-5 text-primary" />
              <h2 className="mono-data font-bold tracking-widest uppercase">Classification Report</h2>
            </div>
            <div className="p-8">
              <table className="w-full text-left mono-data text-sm">
                <thead>
                  <tr className="border-b border-border opacity-50 uppercase tracking-widest">
                    <th className="pb-4 font-normal">Class</th>
                    <th className="pb-4 font-normal">Precision</th>
                    <th className="pb-4 font-normal">Recall</th>
                    <th className="pb-4 font-normal">F1-Score</th>
                    <th className="pb-4 font-normal text-right">Support</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="py-4">0 (Real)</td>
                    <td className="py-4 font-bold">0.96</td>
                    <td className="py-4 font-bold">0.95</td>
                    <td className="py-4 font-bold">0.96</td>
                    <td className="py-4 text-right">7,025</td>
                  </tr>
                  <tr>
                    <td className="py-4 text-primary">1 (Fake)</td>
                    <td className="py-4 text-primary font-bold">0.97</td>
                    <td className="py-4 text-primary font-bold">0.97</td>
                    <td className="py-4 text-primary font-bold">0.97</td>
                    <td className="py-4 text-right">7,402</td>
                  </tr>
                  <tr className="border-t-2 border-border bg-muted/10">
                    <td className="py-4 font-bold">Accuracy</td>
                    <td className="py-4"></td>
                    <td className="py-4"></td>
                    <td className="py-4 font-bold text-success text-xl">0.9603</td>
                    <td className="py-4 text-right">14,427</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix */}
          <div className="border border-border bg-card">
            <div className="p-6 border-b border-border flex items-center gap-3 bg-muted/20">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="mono-data font-bold tracking-widest uppercase">Confusion Matrix</h2>
            </div>
            <div className="p-8 flex items-center justify-center min-h-[300px]">
              <div className="grid grid-cols-3 gap-0 mono-data text-sm border border-border max-w-sm w-full">
                {/* Header row */}
                <div className="p-4 flex items-center justify-center bg-muted/30 border-b border-r border-border opacity-50 uppercase text-[10px] tracking-widest text-center">
                  True \ Pred
                </div>
                <div className="p-4 flex items-center justify-center bg-muted/30 border-b border-r border-border font-bold">
                  0 (Real)
                </div>
                <div className="p-4 flex items-center justify-center bg-muted/30 border-b border-border font-bold text-primary">
                  1 (Fake)
                </div>
                
                {/* True 0 Row */}
                <div className="p-4 flex items-center justify-center bg-muted/30 border-r border-b border-border font-bold">
                  0 (Real)
                </div>
                <div className="p-8 flex items-center justify-center border-r border-b border-border bg-success/20 text-success text-3xl font-black">
                  6680
                </div>
                <div className="p-8 flex items-center justify-center border-b border-border bg-destructive/10 text-destructive text-xl font-bold">
                  345
                </div>

                {/* True 1 Row */}
                <div className="p-4 flex items-center justify-center bg-muted/30 border-r border-border font-bold text-primary">
                  1 (Fake)
                </div>
                <div className="p-8 flex items-center justify-center border-r border-border bg-destructive/10 text-destructive text-xl font-bold">
                  228
                </div>
                <div className="p-8 flex items-center justify-center bg-primary/20 text-primary text-3xl font-black">
                  7174
                </div>
              </div>
            </div>
            <div className="px-8 pb-8 text-xs font-light mono-data opacity-60 text-center uppercase tracking-widest leading-relaxed">
              * Test set derived from 20% holdout of 72,134 full dataset <br/>
              * LR model parameters: C=1.0, max_iter=1000
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
