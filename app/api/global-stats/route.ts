import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
<<<<<<< HEAD
=======
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
>>>>>>> 819ae402c8682fee5ae696d21fc21286a8362d85

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
      url = ""
    } = body;

    // Insert into Supabase 'analyses' table
    const { error } = await supabase.from('analyses').insert({
      id: (id && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) ? id : undefined,
      user_id: '00000000-0000-0000-0000-000000000000', // Anonymous placeholder
      prediction,
      confidence,
      overall_score: overallScore,
      source_domain: domain || "unknown",
      flags,
      signals: {
        ml_score: signals?.mlScore || 50,
        sentiment_score: signals?.sentimentScore || 50,
        clickbait_score: signals?.clickbaitScore || 50,
        source_score: signals?.sourceScore || 50,
        bias_score: signals?.biasScore || 50,
      },
      original_text: excerpt,
      url,
      created_at: new Date(timestamp || Date.now()).toISOString()
    });

    if (error) {
      console.error("Supabase insert error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

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
    // Fetch stats from Supabase
    // We aggregate data from the 'analyses' table
    const { data: analyses, error } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    if (!analyses || analyses.length === 0) {
      return NextResponse.json({
        totalAnalyses: 0,
        fakeDetected: 0,
        fakeCount: 0,
        realCount: 0,
        uncertainCount: 0,
        averageConfidence: 0,
        mostAnalyzedDomain: "N/A",
        recentAnalyses: [],
        topFlags: [],
        averageSignals: []
      });
    }

    const totalAnalyses = analyses.length;
    const fakeCount = analyses.filter(a => a.prediction === 'FAKE').length;
    const realCount = analyses.filter(a => a.prediction === 'REAL').length;
    const uncertainCount = analyses.filter(a => a.prediction === 'UNCERTAIN').length;

    const totalConfidence = analyses.reduce((sum, a) => sum + (a.confidence || 0), 0);
    const averageConfidence = Math.round(totalConfidence / totalAnalyses);
    const fakePercentage = Math.round((fakeCount / totalAnalyses) * 100);

    // Domain counts
    const domainCounts: Record<string, number> = {};
    analyses.forEach(a => {
      const d = a.source_domain || 'unknown';
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });

    const mostAnalyzedDomain = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Top flags
    const flagCounts: Record<string, number> = {};
    analyses.forEach(a => {
      if (Array.isArray(a.flags)) {
        a.flags.forEach((f: string) => {
          flagCounts[f] = (flagCounts[f] || 0) + 1;
        });
      }
    });

    const topFlags = Object.entries(flagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([text, count]) => ({ text, count }));

    // Average signals
    const signalsTotal = analyses.reduce((acc, a) => ({
      ml: acc.ml + (a.signals?.ml_score || 50),
      sentiment: acc.sentiment + (a.signals?.sentiment_score || 50),
      clickbait: acc.clickbait + (a.signals?.clickbait_score || 50),
      source: acc.source + (a.signals?.source_score || 50),
      bias: acc.bias + (a.signals?.bias_score || 50),
    }), { ml: 0, sentiment: 0, clickbait: 0, source: 0, bias: 0 });

    const averageSignals = [
      { name: "ML Model", score: Math.round(signalsTotal.ml / totalAnalyses) },
      { name: "Sentiment", score: Math.round(signalsTotal.sentiment / totalAnalyses) },
      { name: "Clickbait", score: Math.round(signalsTotal.clickbait / totalAnalyses) },
      { name: "Source", score: Math.round(signalsTotal.source / totalAnalyses) },
      { name: "Bias", score: Math.round(signalsTotal.bias / totalAnalyses) },
    ];

    return NextResponse.json({
      totalAnalyses,
      fakeDetected: fakePercentage,
      fakeCount,
      realCount,
      uncertainCount,
      averageConfidence,
      mostAnalyzedDomain,
      recentAnalyses: analyses.slice(0, 10),
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
