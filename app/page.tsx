import { AnalysisForm } from "@/components/AnalysisForm";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";
import { Shield, Zap, CheckCircle, BarChart3, Globe, Target } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto px-4 py-8 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">Fake News Detector</span>
        </div>
      </header>

      <section className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-[0.9]">
            Verify <br />
            <span className="text-primary">Truth</span> with <br />
            AI Precision
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl mx-auto mb-12 font-bold uppercase tracking-[0.3em] leading-loose">
            High-fidelity analysis engine for real-time misinformation detection. Built for accuracy.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-foreground border border-border">
              <CheckCircle className="w-4 h-4 text-primary" />
              90% Accuracy
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-foreground border border-border">
              <Zap className="w-4 h-4 text-primary" />
              Real-time Analysis
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-muted text-foreground border border-border">
              <BarChart3 className="w-4 h-4 text-primary" />
              Detailed Reports
            </div>
          </div>
        </div>

        <div className="relative border border-border bg-card">
          <AnalysisForm />
        </div>
      </section>

      <section className="bg-muted/30 py-24 border-y border-border/50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border border-primary/20">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Unbiased Detection</h3>
              <p className="text-muted-foreground leading-relaxed">
                Advanced algorithms identify emotional manipulation and factual inconsistencies.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border border-primary/20">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Global Sources</h3>
              <p className="text-muted-foreground leading-relaxed">
                Cross-references information across trusted news sources and domain databases.
              </p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center border border-primary/20">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Privacy First</h3>
              <p className="text-muted-foreground leading-relaxed">
                Your news searches are private. We don't store personal data or link analysis history.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-24 border-t border-border/50">
        <div className="container mx-auto px-4 flex flex-col items-center gap-12">
          <ScrollToTopButton />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Fake News Detector. Simple. Accurate. Free.
          </p>
        </div>
      </footer>
    </div>
  );
}
