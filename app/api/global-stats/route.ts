import { NextRequest, NextResponse } from "next/server";
// Ensure Node.js runtime and no caching for dynamic stats
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { promises as fs } from "fs";
import path from "path";

// Path to store global stats
const STATS_FILE = path.join("/tmp", "global-stats.json");

interface StoredSignals {
  mlScore: number;
  sentimentScore: number;
  clickbaitScore: number;
  sourceScore: number;
  biasScore: number;
}

interface StoredAnalysis {
  id: string;
  prediction: string;
  confidence: number;
  overallScore: number;
  domain: string;
  timestamp: number;
  flags: string[];
  signals: StoredSignals;
  excerpt: string;
}

interface GlobalStats {
  totalAnalyses: number;
  fakeCount: number;
  realCount: number;
  uncertainCount: number;
  totalConfidence: number;
  domainCounts: Record<string, number>;
  analyses: StoredAnalysis[];
}

// Initialize default stats
const defaultStats: GlobalStats = {
  totalAnalyses: 0,
  fakeCount: 0,
  realCount: 0,
  uncertainCount: 0,
  totalConfidence: 0,
  domainCounts: {},
  analyses: [],
};

// Load stats from file
async function loadStats(): Promise<GlobalStats> {
  try {
    const data = await fs.readFile(STATS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return default stats
    return { ...defaultStats };
  }
}

// Save stats to file
async function saveStats(stats: GlobalStats): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(STATS_FILE);
    await fs.mkdir(dataDir, { recursive: true });
    
    // Write stats to file
    await fs.writeFile(STATS_FILE, JSON.stringify(stats, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save stats to file:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      prediction,
      confidence,
      overallScore,
      domain,
      timestamp,
      flags = [],
      signals,
      excerpt = "",
    } = body;

    // Load current stats from file
    const globalStats = await loadStats();

    // Add to global stats
    globalStats.totalAnalyses++;
    globalStats.totalConfidence += confidence;

    if (prediction === "FAKE") globalStats.fakeCount++;
    else if (prediction === "REAL") globalStats.realCount++;
    else globalStats.uncertainCount++;

    if (domain && domain !== "unknown") {
      globalStats.domainCounts[domain] = (globalStats.domainCounts[domain] || 0) + 1;
    }

    // Keep last 100 analyses
    const storedSignals: StoredSignals = signals || {
      mlScore: 50,
      sentimentScore: 50,
      clickbaitScore: 50,
      sourceScore: 50,
      biasScore: 50,
    };

    globalStats.analyses.push({
      id: id || `${timestamp}`,
      prediction,
      confidence,
      overallScore: overallScore ?? 0,
      domain: domain || "unknown",
      timestamp,
      flags: Array.isArray(flags) ? flags.slice(0, 10) : [],
      signals: storedSignals,
      excerpt,
    });
    if (globalStats.analyses.length > 100) {
      globalStats.analyses = globalStats.analyses.slice(-100);
    }

    // Save updated stats to file
    await saveStats(globalStats);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error saving global stats:", error);
    return NextResponse.json(
      { error: "Failed to save stats" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Load current stats from file
    const globalStats = await loadStats();

    const mostAnalyzedDomain =
      Object.keys(globalStats.domainCounts).length > 0
        ? Object.entries(globalStats.domainCounts).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

    const averageConfidence =
      globalStats.totalAnalyses > 0
        ? Math.round(globalStats.totalConfidence / globalStats.totalAnalyses)
        : 0;

    const fakePercentage =
      globalStats.totalAnalyses > 0
        ? Math.round((globalStats.fakeCount / globalStats.totalAnalyses) * 100)
        : 0;

    const topFlags = computeTopFlags(globalStats.analyses);
    const averageSignals = computeAverageSignals(globalStats.analyses);

    return NextResponse.json({
      totalAnalyses: globalStats.totalAnalyses,
      fakeDetected: fakePercentage,
      fakeCount: globalStats.fakeCount,
      realCount: globalStats.realCount,
      uncertainCount: globalStats.uncertainCount,
      realDetected: globalStats.realCount,
      uncertainDetected: globalStats.uncertainCount,
      averageConfidence,
      mostAnalyzedDomain,
      recentAnalyses: globalStats.analyses.slice(-10).reverse(),
      topFlags,
      averageSignals,
    });
  } catch (error: any) {
    console.error("Error fetching global stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

function computeTopFlags(analyses: StoredAnalysis[], limit = 5) {
  const flagCounts: Record<string, number> = {};

  analyses.forEach((analysis) => {
    analysis.flags.forEach((flag) => {
      flagCounts[flag] = (flagCounts[flag] || 0) + 1;
    });
  });

  return Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([text, count]) => ({ text, count }));
}

function computeAverageSignals(analyses: StoredAnalysis[]) {
  if (analyses.length === 0) return [];

  const totals: StoredSignals = analyses.reduce(
    (acc, analysis) => ({
      mlScore: acc.mlScore + (analysis.signals?.mlScore ?? 0),
      sentimentScore: acc.sentimentScore + (analysis.signals?.sentimentScore ?? 0),
      clickbaitScore: acc.clickbaitScore + (analysis.signals?.clickbaitScore ?? 0),
      sourceScore: acc.sourceScore + (analysis.signals?.sourceScore ?? 0),
      biasScore: acc.biasScore + (analysis.signals?.biasScore ?? 0),
    }),
    { mlScore: 0, sentimentScore: 0, clickbaitScore: 0, sourceScore: 0, biasScore: 0 }
  );

  const count = analyses.length;

  return [
    { name: "ML Model", score: Math.round(totals.mlScore / count) },
    { name: "Sentiment", score: Math.round(totals.sentimentScore / count) },
    { name: "Clickbait", score: Math.round(totals.clickbaitScore / count) },
    { name: "Source", score: Math.round(totals.sourceScore / count) },
    { name: "Bias", score: Math.round(totals.biasScore / count) },
  ];
}
