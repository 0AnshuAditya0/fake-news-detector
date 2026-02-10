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
    <div className="w-full bg-background border border-border">
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Source Selection */}
        <div className="space-y-4">
          <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Where did you find this?
          </label>
          <div className="relative">
            <select
              value={sourceType}
              onChange={(e) => setSourceType(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-background border border-border text-sm font-medium appearance-none cursor-pointer focus:border-primary outline-none transition-colors"
            >
              {SOURCE_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              {React.createElement(
                SOURCE_TYPES.find((t) => t.id === sourceType)?.icon || Search,
                { className: "w-5 h-5 text-primary" }
              )}
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a URL to analyze article content..."
              className="w-full h-12 pl-12 pr-4 bg-muted/50 border border-border text-sm placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
              disabled={loading}
            />
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Content Box */}
        <div className="space-y-4">
          <div className="relative group">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste article text or controversial claims here..."
              rows={6}
              className="w-full p-6 bg-muted/30 border border-border text-sm leading-relaxed placeholder:text-muted-foreground outline-none focus:border-primary transition-colors resize-none"
              disabled={loading}
            />
            {!text && (
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="absolute right-4 bottom-4 px-3 py-1.5 bg-background border border-border text-[10px] font-bold uppercase tracking-widest hover:bg-muted transition-colors opacity-0 group-hover:opacity-100"
              >
                Paste
              </button>
            )}
          </div>
        </div>

        {/* Actions Row */}
        <div className="grid md:grid-cols-2 gap-4">
          <button
            type="button"
            className="flex items-center justify-center gap-3 h-14 border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-muted-foreground group"
            disabled={loading}
          >
            <ImageIcon className="w-5 h-5 group-hover:text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest">Upload Screenshot</span>
          </button>

          <Button
            type="submit"
            disabled={loading}
            className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5" />
                Verify Truth
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-destructive/5 border border-destructive text-destructive text-[10px] font-bold uppercase tracking-widest">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}
