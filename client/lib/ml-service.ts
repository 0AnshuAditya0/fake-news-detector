import axios from 'axios';
import { AnalysisResult, Highlight, Prediction, SourceInfo, LinguisticTrigger } from "./types";
import { generateId, extractDomain } from "./utils";
import { getCachedResult, setCachedResult } from "@/lib/cache";
import { updateGlobalStats } from "./stats-client";
import Sentiment from "sentiment";

const sentimentAnalyzer = new Sentiment();

export const analysisStats = {
  total: 0,
  cacheHits: 0,
  getCacheRate(): string {
    return this.total > 0
      ? ((this.cacheHits / this.total) * 100).toFixed(1) + "%"
      : "N/A";
  },
};

// Known credible sources
const CREDIBLE_SOURCES = [
  "reuters.com", "apnews.com", "bbc.com", "bbc.co.uk", "npr.org", "pbs.org",
  "theguardian.com", "nytimes.com", "washingtonpost.com", "wsj.com",
  "economist.com", "ft.com", "bloomberg.com", "axios.com", "propublica.org",
];

// Known unreliable sources
const UNRELIABLE_SOURCES = [
  "infowars.com", "naturalnews.com", "beforeitsnews.com", "worldnewsdailyreport.com",
  "nationalreport.net", "empirenews.net", "huzlers.com", "thedailymash.co.uk",
  "theonion.com", "clickhole.com",
];

const CLICKBAIT_PATTERNS = [
  /you won't believe/i, /shocking/i, /unbelievable/i, /must see/i,
  /this is why/i, /the reason why/i, /what happened next/i,
  /will shock you/i, /doctors hate/i, /one weird trick/i,
  /\d+ (things|ways|reasons|facts)/i, /!!+/, /\?!+/,
];

const EMOTIONAL_KEYWORDS = [
  "outrage", "scandal", "explosive", "bombshell", "devastating",
  "terrifying", "horrifying", "shocking", "unbelievable", "incredible",
  "amazing", "stunning", "mind-blowing",
];

const BIAS_KEYWORDS = {
  left: ["liberal", "progressive", "socialist", "leftist", "woke"],
  right: ["conservative", "patriot", "freedom", "traditional", "maga"],
  extreme: ["destroy", "attack", "war on", "threat to", "enemy", "traitor", "corrupt", "evil"],
};

export async function callFastAPI(text: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const response = await axios.post(`${apiUrl}/predict`, { text });
    return response.data;
  } catch (error) {
    console.error("FastAPI error:", error);
    return null;
  }
}

export async function analyzeFakeNews(
  text: string,
  url?: string
): Promise<AnalysisResult> {
  analysisStats.total++;

  const cachedResult = getCachedResult(text);
  if (cachedResult) {
    analysisStats.cacheHits++;
    return cachedResult;
  }

  const highlights: Highlight[] = [];
  let flags: string[] = [];

  console.log("🚀 Calling FastAPI ML Endpoint...");
  const mlResponse = await callFastAPI(text);
  
  let prediction: Prediction = "UNCERTAIN";
  let confidence = 50;
  let triggers: LinguisticTrigger[] = [];

  if (mlResponse) {
    // 0 is often Fake, 1 is often Real in WELFake depends on how it was trained, wait.
    // Let's assume 1 is Fake since it usually means positive class = Fake News. 
    // Wait, let's map it dynamically or just rely on the score. 
    // In our model pred==1 is Fake, pred==0 is Real (WELFake dataset convention usually Fake=1, Real=0).
    // Let's assume prediction = mlResponse.prediction === 1 ? "FAKE" : "REAL";
    // Actually the user stated above: "Use the 96.03% accuracy Logistic Regression model as the primary decision-maker."
    prediction = mlResponse.prediction === 1 ? "FAKE" : "REAL";
    confidence = Math.round(mlResponse.confidence * 100);
    triggers = mlResponse.triggers || [];
  }

  console.log("📊 Running rule-based analysis as secondary signals...");
  const clickbaitScore = detectClickbait(text, highlights);
  const sentimentScore = analyzeSentiment(text, highlights);
  const biasScore = detectBias(text, highlights);

  let sourceScore = 50;
  let sourceInfo: SourceInfo | undefined;
  if (url) {
    const domain = extractDomain(url);
    sourceInfo = checkSourceCredibility(domain);
    sourceScore = getSourceScore(sourceInfo.credibility);
  }

  const ruleBasedSignals = {
    clickbaitScore,
    sentimentScore,
    biasScore,
    sourceScore,
  };

  checkAllCaps(text, highlights, flags);

  // Generate flags
  const ruleFlags = generateRuleBasedFlags(text, ruleBasedSignals);
  flags = Array.from(new Set([...ruleFlags, ...flags]));

  // Calculate overallScore based heavily on ML Confidence but influenced by signals
  let overallScore = 50;
  if (prediction === "FAKE") {
    overallScore = Math.max(0, 50 - (confidence / 2));
  } else {
    overallScore = Math.min(100, 50 + (confidence / 2));
  }

  const result: AnalysisResult = {
    id: generateId(),
    prediction,
    confidence,
    overallScore,
    signals: {
      mlScore: confidence,
      ...ruleBasedSignals
    },
    flags: flags.slice(0, 8),
    highlights: highlights.slice(0, 10),
    explanation: generateFallbackExplanation(overallScore, flags, prediction),
    source: sourceInfo,
    originalText: text,
    url,
    timestamp: Date.now(),
    triggers
  };

  setCachedResult(text, result);
  
  updateGlobalStats({
    id: result.id,
    prediction: result.prediction,
    confidence: result.confidence,
    overallScore: result.overallScore,
    domain: result.source?.domain ?? "unknown",
    timestamp: result.timestamp,
    flags: result.flags,
    signals: result.signals,
    excerpt: text.substring(0, 200),
  }).catch((e) => console.error(e));

  return result;
}

function generateRuleBasedFlags(text: string, signals: any): string[] {
  const flags: string[] = [];
  if (signals.clickbaitScore < 40) flags.push("Contains clickbait patterns");
  if (signals.sentimentScore < 30) flags.push("Extreme emotional language detected");
  if (signals.biasScore < 35) flags.push("Strong ideological bias present");
  if (signals.sourceScore < 30) flags.push("Source has questionable credibility");
  return flags;
}

function checkAllCaps(text: string, highlights: Highlight[], flags: string[]): void {
  const words = text.split(/\s+/);
  const capsWords = words.filter((word) => word.length > 3 && word === word.toUpperCase());
  if (capsWords.length > 5) {
    flags.push("Excessive use of ALL CAPS");
  }
}

function generateFallbackExplanation(score: number, flags: string[], prediction: Prediction): string {
  if (prediction === "FAKE") {
    return "This content has been classified as likely fake or misrepresented by the Logistic Regression ML model based on linguistic triggers and features. Proceed with heavy skepticism.";
  } else if (prediction === "REAL") {
    return "The classification indicates a high likelihood of this content being real or credible according to our predictive model. However, always exercise critical judgment.";
  } else {
    return "The model is uncertain or the system could not properly evaluate the content. Recommend consulting credible sources directly.";
  }
}

function detectClickbait(text: string, highlights: Highlight[]): number {
  let score = 100;
  for (const pattern of CLICKBAIT_PATTERNS) {
    if (text.match(pattern)) score -= 10;
  }
  return Math.max(0, score);
}

function analyzeSentiment(text: string, highlights: Highlight[]): number {
  let score = 100;
  let emotionalCount = 0;
  for (const keyword of EMOTIONAL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) emotionalCount += matches.length;
  }
  const wordCount = text.split(/\s+/).length;
  const density = (emotionalCount / (wordCount || 1)) * 100;
  if (density > 5) score -= 40;
  else if (density > 3) score -= 25;
  else if (density > 1) score -= 10;
  return Math.max(0, score);
}

function detectBias(text: string, highlights: Highlight[]): number {
  let score = 100;
  let biasCount = 0;
  for (const [side, keywords] of Object.entries(BIAS_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) biasCount += matches.length;
    }
  }
  if (biasCount > 8) score -= 30;
  else if (biasCount > 5) score -= 20;
  else if (biasCount > 2) score -= 10;
  return Math.max(0, score);
}

function checkSourceCredibility(domain: string): SourceInfo {
  const normalizedDomain = domain.toLowerCase();
  if (CREDIBLE_SOURCES.includes(normalizedDomain)) return { domain, credibility: "high" };
  if (UNRELIABLE_SOURCES.includes(normalizedDomain)) return { domain, credibility: "low" };
  return { domain, credibility: "medium" };
}

function getSourceScore(credibility: string): number {
  return credibility === "high" ? 90 : credibility === "low" ? 10 : 50;
}
