"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon, FileText, Clipboard, Search, Image as ImageIcon, Globe, Share2, MessageSquare } from "lucide-react";
import { isValidUrl, saveAnalysis } from "@/lib/utils";

const SOURCE_TYPES = [
  { id: "social", label: "Social Media (General)", icon: Share2 },
  { id: "news", label: "News Article / Website", icon: Globe },
  { id: "messaging", label: "Messaging App (WhatsApp/Telegram)", icon: MessageSquare },
  { id: "other", label: "Other Source", icon: Search },
];

export function AnalysisForm() {
  const router = useRouter();
  const [sourceType, setSourceType] = useState("social");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
    } catch (err) {
      console.error("Failed to read clipboard:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!text.trim() && !url.trim()) {
      setError("Please provide either an article URL or the content text");
      return;
    }

    if (url && !isValidUrl(url)) {
      setError("Please enter a valid URL (starting with http:// or https://)");
      return;
    }

    if (text && text.trim().length < 20) {
      setError("Text content is too short for reliable analysis");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url || undefined,
          text: text || undefined,
          sourceType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      await saveAnalysis(data);
      router.push(`/analyze/${data.id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis");
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-8 font-mono text-xs md:text-sm">
        {/* Source Selection */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-neonGreen/70">
            SOURCE_ORIGIN
          </label>
          <div className="relative">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-black/60 border border-neonGreen/40 text-[11px] uppercase tracking-[0.15em] text-neonGreen appearance-none cursor-pointer outline-none focus:border-neonGreen focus:ring-0 transition-colors"
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-neonGreen">
              {React.createElement(
                SOURCE_TYPES.find((t) => t.id === sourceType)?.icon || Search,
                { className: "w-4 h-4" }
              )}
            </div>
          </div>
        </div>

        {/* URL Input – primary lie detector prompt */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neonGreen font-mono text-sm">
              &gt;
            </span>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="ENTER SOURCE URL..."
              className="w-full bg-black/60 border border-neonGreen/40 p-4 pl-9 text-sm md:text-base font-mono tracking-[0.15em] uppercase text-neonGreen placeholder:text-neonGreen/20 outline-none focus:border-neonGreen focus:ring-0 transition-all"
              disabled={loading}
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-neonGreen text-black font-black uppercase text-sm md:text-base px-8 md:px-12 py-4 md:py-0 hover:shadow-neon-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 min-h-[3.25rem]"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">radar</span>
                ANALYZE
              </>
            )}
          </Button>
        </div>

        {/* Content Box – optional deeper text analysis */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-neonBlue/70">
            OPTIONAL_TEXT_PAYLOAD
          </label>
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="PASTE ARTICLE TEXT OR CLAIMS HERE FOR DEEP SCAN..."
              rows={5}
              className="w-full p-4 md:p-5 bg-terminalGray/70 border border-neonGreen/25 text-xs md:text-sm leading-relaxed text-white placeholder:text-white/30 outline-none focus:border-neonGreen focus:ring-0 transition-colors resize-none"
              disabled={loading}
            />
            {!text && (
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="absolute right-4 bottom-3 px-3 py-1.5 bg-black/70 border border-neonGreen/40 text-[9px] font-bold uppercase tracking-[0.25em] text-neonGreen hover:bg-neonGreen/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                PASTE
              </button>
            )}
          </div>
        </div>

        {/* Secondary actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-3 h-12 md:h-14 border border-dashed border-neonGreen/40 hover:border-neonGreen hover:bg-neonGreen/5 transition-all text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-white/70 group"
            disabled={loading}
          >
            <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-neonGreen group-hover:scale-110 transition-transform" />
            Upload_Screenshot (Beta)
          </button>
        </div>

        {error && (
          <div className="p-4 bg-neonPink/10 border border-neonPink text-neonPink text-[10px] font-bold uppercase tracking-widest">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
