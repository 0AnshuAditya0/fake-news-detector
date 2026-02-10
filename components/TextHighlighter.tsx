"use client";

import React from "react";
import { Highlight } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TextHighlighterProps {
  text: string;
  highlights: Highlight[];
}

export function TextHighlighter({ text, highlights }: TextHighlighterProps) {
  if (highlights.length === 0) {
    return <p className="text-gray-700 leading-relaxed">{text}</p>;
  }

  // Create a map of text positions to highlights
  const highlightMap = new Map<string, Highlight>();
  highlights.forEach((h) => {
    highlightMap.set(h.text.toLowerCase(), h);
  });

  // Split text and highlight matches
  let result: React.ReactNode[] = [];
  let lastIndex = 0;
  const textLower = text.toLowerCase();

  // Find all highlight positions
  const positions: Array<{ start: number; end: number; highlight: Highlight }> = [];
  
  highlights.forEach((highlight) => {
    const searchText = highlight.text.toLowerCase();
    let index = textLower.indexOf(searchText);
    
    while (index !== -1 && positions.length < 20) {
      positions.push({
        start: index,
        end: index + searchText.length,
        highlight,
      });
      index = textLower.indexOf(searchText, index + 1);
    }
  });

  // Sort by position
  positions.sort((a, b) => a.start - b.start);

  // Remove overlapping highlights
  const filteredPositions = positions.filter((pos, i) => {
    if (i === 0) return true;
    return pos.start >= positions[i - 1].end;
  });

  // Build the result
  filteredPositions.forEach((pos, i) => {
    // Add text before highlight
    if (pos.start > lastIndex) {
      result.push(
        <span key={`text-${i}`}>{text.substring(lastIndex, pos.start)}</span>
      );
    }

    // Add highlighted text
    const highlightedText = text.substring(pos.start, pos.end);
    const colorClass = getHighlightColor(pos.highlight.type);

    result.push(
      <TooltipProvider key={`highlight-${i}`}>
        <Tooltip>
          <TooltipTrigger asChild>
            <mark
              className={`${colorClass} px-0.5 border-b-2`}
            >
              {highlightedText}
            </mark>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-bold text-xs uppercase tracking-wider">{pos.highlight.reason}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    lastIndex = pos.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(<span key="text-end">{text.substring(lastIndex)}</span>);
  }

  return <div className="text-foreground leading-relaxed whitespace-pre-wrap break-words">{result}</div>;
}

function getHighlightColor(type: Highlight["type"]): string {
  switch (type) {
    case "fake":
      return "bg-destructive/10 text-destructive border-destructive";
    case "bias":
      return "bg-warning/10 text-warning border-warning";
    case "clickbait":
      return "bg-primary/10 text-primary border-primary";
    case "sentiment":
      return "bg-violet-500/10 text-violet-500 border-violet-500";
    default:
      return "bg-muted text-foreground border-border";
  }
}
