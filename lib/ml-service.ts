import { AnalysisResult, Highlight, Prediction, SourceInfo } from "./types";
import { generateId, extractDomain } from "./utils";
import { getCachedResult, setCachedResult } from "@/lib/cache";
import { analyzeWithGeminiRetry, getGeminiStatus } from "./gemini-service";
import { updateGlobalStats } from "./stats-client";

// Validate API keys and log status
const geminiStatus = getGeminiStatus();
if (geminiStatus.configured) {
  console.log(`🤖 Google Gemini API Key loaded: ${geminiStatus.keyPreview}`);
  console.log("✨ Primary AI: Google Gemini Pro (90%+ accuracy)");
} else {
  console.warn(
    "⚠️ GEMINI_API_KEY not found - will use rule-based analysis only"
  );
  console.warn("💡 Get free key at: https://makersuite.google.com/app/apikey");
}

// Analysis Statistics for monitoring
export const analysisStats = {
  total: 0,
  geminiSuccess: 0,
  geminiFailed: 0,
  cacheHits: 0,
  ruleBasedOnly: 0,

  getSuccessRate(): string {
    const attempted = this.geminiSuccess + this.geminiFailed;
    return attempted > 0
      ? ((this.geminiSuccess / attempted) * 100).toFixed(1) + "%"
      : "N/A";
  },

  getCacheRate(): string {
    return this.total > 0
      ? ((this.cacheHits / this.total) * 100).toFixed(1) + "%"
      : "N/A";
  },

  getGeminiUsageRate(): string {
    return this.total > 0
      ? ((this.geminiSuccess / this.total) * 100).toFixed(1) + "%"
      : "N/A";
  },
};

// Legacy API stats for backward compatibility
let apiStats = {
  totalCalls: 0,
  cacheHits: 0,
  apiCalls: 0,
  failures: 0,
  lastError: null as string | null,
  lastErrorTime: null as number | null,
};

/**
 * Get API statistics for monitoring
 */
export function getApiStats() {
  return {
    ...apiStats,
    cacheHitRate:
      apiStats.totalCalls > 0
        ? ((apiStats.cacheHits / apiStats.totalCalls) * 100).toFixed(1) + "%"
        : "0%",
    failureRate:
      apiStats.apiCalls > 0
        ? ((apiStats.failures / apiStats.apiCalls) * 100).toFixed(1) + "%"
        : "0%",
  };
}

/**
 * Reset API statistics (useful for testing)
 */
export function resetApiStats() {
  apiStats = {
    totalCalls: 0,
    cacheHits: 0,
    apiCalls: 0,
    failures: 0,
    lastError: null,
    lastErrorTime: null,
  };
}

/**
 * Log detailed error information for debugging
 */
function logDetailedError(error: any, context: string) {
  console.error(`\n${"=".repeat(50)}`);
  console.error(`❌ ERROR in ${context}`);
  console.error(`Message: ${error.message || "Unknown"}`);
  console.error(`Type: ${error.constructor?.name || "Unknown"}`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error(`Body: ${JSON.stringify(error.response.data).slice(0, 200)}`);
  }
  if (error.stack) {
    console.error(`Stack: ${error.stack.slice(0, 200)}`);
  }
  console.error("=".repeat(50) + "\n");
}

/**
 * Call HuggingFace Inference API using fetch with proper model loading
 * Includes wait_for_model to handle cold starts
 */
async function callHuggingFaceAPI(
  text: string,
  modelName: string,
  maxRetries = 3
): Promise<any> {
  const API_URL = `https://api-inference.huggingface.co/models/${modelName}`;
  const truncatedText = text.slice(0, 512); // HuggingFace limit

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(
        `🤖 HuggingFace API [${modelName}] attempt ${attempt + 1}/${maxRetries}`
      );

      if (!process.env.HUGGINGFACE_API_KEY) {
        throw new Error("API key not configured");
      }

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: truncatedText,
          options: {
            wait_for_model: true, // CRITICAL: Wait for model to load
            use_cache: true, // Use HuggingFace's cache if available
          },
        }),
      });

      // Check response status
      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `❌ API returned ${response.status}: ${errorText.slice(0, 200)}`
        );

        // If model is loading (503), wait longer and retry
        if (response.status === 503) {
          console.log("⏳ Model is loading (cold start), waiting 5 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 5000));
          continue; // Retry immediately
        }

        throw new Error(
          `API returned ${response.status}: ${errorText.slice(0, 100)}`
        );
      }

      const result = await response.json();

      // Validate response format
      if (!result || !Array.isArray(result) || result.length === 0) {
        throw new Error("Invalid response format from API");
      }

      console.log(
        `✅ HuggingFace API success:`,
        JSON.stringify(result).slice(0, 150)
      );
      return result;
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      console.error(
        `❌ Attempt ${attempt + 1}/${maxRetries} failed: ${errorMessage}`
      );

      // Update stats
      apiStats.lastError = errorMessage;
      apiStats.lastErrorTime = Date.now();

      if (attempt === maxRetries - 1) {
        console.error("🚫 All retries exhausted for this model");
        logDetailedError(error, `HuggingFace API - ${modelName}`);
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const waitTime = 2000 * Math.pow(2, attempt);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw new Error("Max retries reached");
}

/**
 * Legacy function - no longer used (using Gemini instead)
 * Kept for backward compatibility
 */
async function callHuggingFaceWithModelFallback(
  text: string
): Promise<{ result: any; model: string }> {
  throw new Error(
    "HuggingFace models not configured - using Gemini AI instead"
  );
}

// Known credible sources
const CREDIBLE_SOURCES = [
  "reuters.com",
  "apnews.com",
  "bbc.com",
  "bbc.co.uk",
  "npr.org",
  "pbs.org",
  "theguardian.com",
  "nytimes.com",
  "washingtonpost.com",
  "wsj.com",
  "economist.com",
  "ft.com",
  "bloomberg.com",
  "axios.com",
  "propublica.org",
];

// Known unreliable sources
const UNRELIABLE_SOURCES = [
  "infowars.com",
  "naturalnews.com",
  "beforeitsnews.com",
  "worldnewsdailyreport.com",
  "nationalreport.net",
  "empirenews.net",
  "huzlers.com",
  "thedailymash.co.uk",
  "theonion.com",
  "clickhole.com",
];

// Clickbait indicators
const CLICKBAIT_PATTERNS = [
  /you won't believe/i,
  /shocking/i,
  /unbelievable/i,
  /must see/i,
  /this is why/i,
  /the reason why/i,
  /what happened next/i,
  /will shock you/i,
  /doctors hate/i,
  /one weird trick/i,
  /\d+ (things|ways|reasons|facts)/i,
  /!!+/,
  /\?!+/,
];

// Emotional manipulation keywords
const EMOTIONAL_KEYWORDS = [
  "outrage",
  "scandal",
  "explosive",
  "bombshell",
  "devastating",
  "terrifying",
  "horrifying",
  "shocking",
  "unbelievable",
  "incredible",
  "amazing",
  "stunning",
  "mind-blowing",
];

// Bias indicators
const BIAS_KEYWORDS = {
  left: ["liberal", "progressive", "socialist", "leftist", "woke"],
  right: ["conservative", "patriot", "freedom", "traditional", "maga"],
  extreme: [
    "destroy",
    "attack",
    "war on",
    "threat to",
    "enemy",
    "traitor",
    "corrupt",
    "evil",
  ],
};

export async function analyzeFakeNews(
  text: string,
  url?: string
): Promise<AnalysisResult> {
  // Update statistics
  analysisStats.total++;
  apiStats.totalCalls++;

  // 1. Check cache first
  const cachedResult = getCachedResult(text);
  if (cachedResult) {
    analysisStats.cacheHits++;
    apiStats.cacheHits++;
    console.log(
      `✅ Cache HIT - returning cached result (cache rate: ${analysisStats.getCacheRate()})`
    );
    return cachedResult;
  }

  console.log(`❌ Cache MISS - performing fresh analysis`);
  console.log(
    `📊 Stats: ${
      analysisStats.total
    } total | Gemini: ${analysisStats.getGeminiUsageRate()} | Cache: ${analysisStats.getCacheRate()}`
  );

  const highlights: Highlight[] = [];
  let flags: string[] = [];

  // 2. PRIMARY: Try Google Gemini AI Analysis
  let geminiResult = null;
  let mlScore = 50; // Default neutral
  let apiProvider = "rule-based";

  try {
    console.log("🚀 Attempting Gemini AI analysis...");
    geminiResult = await analyzeWithGeminiRetry(text);

    if (geminiResult) {
      analysisStats.geminiSuccess++;
      mlScore = geminiResult.credibilityScore;
      apiProvider = "gemini";
      console.log(
        `✅ Gemini success! Credibility: ${mlScore}/100 | Prediction: ${geminiResult.prediction}`
      );
    } else {
      analysisStats.geminiFailed++;
      console.log(
        "⚠️ Gemini returned null, falling back to rule-based analysis"
      );
    }
  } catch (error: any) {
    analysisStats.geminiFailed++;
    console.error("🚫 Gemini analysis failed completely:", error.message);
  }

  // 3. SUPPLEMENT: Rule-based analysis (always runs for additional signals)
  console.log("📊 Running rule-based analysis as supplement...");
  const clickbaitScore = detectClickbait(text, highlights);
  const sentimentScore = analyzeSentiment(text, highlights);
  const biasScore = detectBias(text, highlights);

  // Source credibility
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

  // Additional checks
  checkAllCaps(text, highlights, flags);
  checkExcessivePunctuation(text, highlights, flags);
  checkUnverifiedClaims(text, highlights, flags);

  // 4. COMBINE: Gemini + Rule-based scores
  let overallScore: number;
  let signals: any;

  if (geminiResult) {
    // Gemini available: 70% Gemini, 30% rules
    overallScore = Math.round(
      mlScore * 0.7 +
        clickbaitScore * 0.1 +
        sentimentScore * 0.1 +
        biasScore * 0.05 +
        sourceScore * 0.05
    );

    signals = {
      mlScore,
      ...ruleBasedSignals,
    };

    // Merge flags from Gemini and rules
    const ruleFlags = generateRuleBasedFlags(text, ruleBasedSignals);
    flags = [...new Set([...geminiResult.flags, ...ruleFlags, ...flags])]; // Deduplicate
  } else {
    // Pure rule-based fallback
    analysisStats.ruleBasedOnly++;
    overallScore = Math.round(
      clickbaitScore * 0.35 +
        sentimentScore * 0.35 +
        biasScore * 0.2 +
        sourceScore * 0.1
    );

    signals = {
      mlScore: 50, // Neutral
      ...ruleBasedSignals,
    };

    // Generate rule-based flags
    const ruleFlags = generateRuleBasedFlags(text, ruleBasedSignals);
    flags = [...new Set([...ruleFlags, ...flags])];
  }

  // 5. DETERMINE: Final prediction
  let prediction: Prediction;
  let confidence: number;

  if (geminiResult && geminiResult.confidence > 80) {
    // Trust Gemini's high-confidence prediction
    prediction = geminiResult.prediction;
    confidence = geminiResult.confidence;
  } else {
    // Use combined score
    if (overallScore < 35) {
      prediction = "FAKE";
      confidence = Math.min(100, (50 - overallScore) * 2);
    } else if (overallScore > 75) {
      prediction = "REAL";
      confidence = Math.min(100, (overallScore - 50) * 2);
    } else {
      prediction = "UNCERTAIN";
      confidence = 50 + Math.abs(overallScore - 50) / 2;
    }
  }

  // 6. GENERATE: Explanation
  const explanation =
    geminiResult?.reasoning ||
    generateFallbackExplanation(overallScore, flags, prediction);

  // 7. BUILD: Result object
  const result: AnalysisResult = {
    id: generateId(),
    prediction,
    confidence: Math.round(confidence),
    overallScore,
    signals,
    flags: flags.slice(0, 8), // Limit to top 8
    highlights: highlights.slice(0, 10),
    explanation,
    source: sourceInfo,
    originalText: text,
    url,
    timestamp: Date.now(),
    // Additional Gemini-specific fields
    ...(geminiResult && {
      factualConcerns: geminiResult.factualConcerns,
      apiProvider,
      mlUsed: true,
    }),
  };

  // 8. CACHE: Store result for future requests
  setCachedResult(text, result);
  console.log(
    `💾 Result cached | Prediction: ${prediction} (${Math.round(
      confidence
    )}% confidence)`
  );

  // 9. GLOBAL STATS: Push to aggregated dataset (non-blocking)
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
  }).catch((error: unknown) => {
    console.error("Failed to update global stats:", error);
  });

  return result;
}

/**
 * Generate rule-based flags from analysis signals
 */
function generateRuleBasedFlags(text: string, signals: any): string[] {
  const flags: string[] = [];

  if (signals.clickbaitScore < 40) {
    flags.push("Contains clickbait patterns");
  }

  if (signals.sentimentScore < 30) {
    flags.push("Extreme emotional language detected");
  }

  if (signals.biasScore < 35) {
    flags.push("Strong ideological bias present");
  }

  if (signals.sourceScore < 30) {
    flags.push("Source has questionable credibility");
  }

  // ALL CAPS check
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  if (capsRatio > 0.25) {
    flags.push("Excessive use of capital letters");
  }

  // Excessive punctuation
  if (/[!?]{3,}/.test(text)) {
    flags.push("Sensationalist punctuation (!!!)");
  }

  // Conspiracy language
  const conspiracyPatterns = [
    /they don'?t want you to know/i,
    /wake up/i,
    /cover-?up/i,
    /mainstream media (is )?(lying|hiding)/i,
    /the truth about/i,
  ];

  if (conspiracyPatterns.some((pattern) => pattern.test(text))) {
    flags.push("Conspiracy theory language");
  }

  // Urgency manipulation
  if (/\b(share|act|sign) (now|immediately|before|urgent)/i.test(text)) {
    flags.push("Urgency manipulation tactics");
  }

  return flags;
}

/**
 * Generate fallback explanation when Gemini is unavailable
 */
function generateFallbackExplanation(
  score: number,
  flags: string[],
  prediction: Prediction
): string {
  if (prediction === "FAKE") {
    const topFlags = flags.slice(0, 2).join(" and ") || "multiple red flags";
    return `This content shows signs of misinformation including ${topFlags}. The analysis suggests treating this with skepticism and verifying claims through trusted sources.`;
  } else if (prediction === "REAL") {
    return `This content appears to follow standard journalistic practices with minimal red flags. It shows balanced language and credible presentation, though independent verification is always recommended.`;
  } else {
    const mainConcern = flags[0] || "mixed signals";
    return `This content has mixed indicators. While some concerns were detected (${mainConcern}), more context would be needed for a definitive assessment. Consider checking multiple sources.`;
  }
}

function detectClickbait(text: string, highlights: Highlight[]): number {
  let score = 100;
  let deductions = 0;

  for (const pattern of CLICKBAIT_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      deductions += 15;
      highlights.push({
        text: matches[0],
        reason: "Clickbait pattern detected",
        type: "clickbait",
      });
    }
  }

  // Check for numbers in headlines (e.g., "7 things...")
  const numberPattern = /\b\d+\s+(things|ways|reasons|facts|tips)\b/gi;
  const numberMatches = text.match(numberPattern);
  if (numberMatches) {
    deductions += 10 * numberMatches.length;
    numberMatches.forEach((match) => {
      highlights.push({
        text: match,
        reason: "Listicle-style clickbait",
        type: "clickbait",
      });
    });
  }

  return Math.max(0, score - deductions);
}

function analyzeSentiment(text: string, highlights: Highlight[]): number {
  let score = 100;
  let emotionalCount = 0;

  const lowerText = text.toLowerCase();

  for (const keyword of EMOTIONAL_KEYWORDS) {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = text.match(regex);
    if (matches) {
      emotionalCount += matches.length;
      if (matches.length > 0) {
        highlights.push({
          text: matches[0],
          reason: "Emotionally charged language",
          type: "sentiment",
        });
      }
    }
  }

  // Deduct points based on emotional keyword density
  const wordCount = text.split(/\s+/).length;
  const emotionalDensity = (emotionalCount / wordCount) * 100;

  if (emotionalDensity > 5) {
    score -= 40;
  } else if (emotionalDensity > 3) {
    score -= 25;
  } else if (emotionalDensity > 1) {
    score -= 10;
  }

  return Math.max(0, score);
}

function detectBias(text: string, highlights: Highlight[]): number {
  let score = 100;
  let biasCount = 0;

  const lowerText = text.toLowerCase();

  // Check for political bias
  for (const [side, keywords] of Object.entries(BIAS_KEYWORDS)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        biasCount += matches.length;
        if (matches.length > 0 && highlights.length < 20) {
          highlights.push({
            text: matches[0],
            reason: `Politically charged term (${side})`,
            type: "bias",
          });
        }
      }
    }
  }

  // Deduct based on bias keyword count
  if (biasCount > 5) {
    score -= 40;
  } else if (biasCount > 3) {
    score -= 25;
  } else if (biasCount > 1) {
    score -= 15;
  }

  return Math.max(0, score);
}

function checkSourceCredibility(domain: string): SourceInfo {
  const normalizedDomain = domain.toLowerCase();

  if (CREDIBLE_SOURCES.includes(normalizedDomain)) {
    return { domain, credibility: "high" };
  }

  if (UNRELIABLE_SOURCES.includes(normalizedDomain)) {
    return { domain, credibility: "low" };
  }

  return { domain, credibility: "medium" };
}

function getSourceScore(credibility: string): number {
  switch (credibility) {
    case "high":
      return 90;
    case "medium":
      return 50;
    case "low":
      return 10;
    default:
      return 50;
  }
}

function checkAllCaps(
  text: string,
  highlights: Highlight[],
  flags: string[]
): void {
  const words = text.split(/\s+/);
  const capsWords = words.filter(
    (word) => word.length > 3 && word === word.toUpperCase()
  );

  if (capsWords.length > 5) {
    flags.push("Excessive use of ALL CAPS");
    if (capsWords[0]) {
      highlights.push({
        text: capsWords[0],
        reason: "Excessive capitalization",
        type: "clickbait",
      });
    }
  }
}

function checkExcessivePunctuation(
  text: string,
  highlights: Highlight[],
  flags: string[]
): void {
  const excessivePattern = /[!?]{2,}/g;
  const matches = text.match(excessivePattern);

  if (matches && matches.length > 2) {
    flags.push("Excessive punctuation usage");
  }
}

function checkUnverifiedClaims(
  text: string,
  highlights: Highlight[],
  flags: string[]
): void {
  const unverifiedPatterns = [
    /according to sources/i,
    /sources say/i,
    /reportedly/i,
    /allegedly/i,
    /rumors suggest/i,
    /it is believed/i,
  ];

  let unverifiedCount = 0;
  for (const pattern of unverifiedPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      unverifiedCount += matches.length;
    }
  }

  if (unverifiedCount > 3) {
    flags.push("Multiple unverified claims");
  }
}

function generateExplanation(
  prediction: Prediction,
  score: number,
  flags: string[],
  sourceInfo?: SourceInfo
): string {
  let explanation = "";

  if (prediction === "FAKE") {
    explanation = `This content has been classified as likely FAKE NEWS with a credibility score of ${score}/100. `;
  } else if (prediction === "REAL") {
    explanation = `This content appears to be LEGITIMATE with a credibility score of ${score}/100. `;
  } else {
    explanation = `This content is UNCERTAIN with a credibility score of ${score}/100. More verification is recommended. `;
  }

  if (flags.length > 0) {
    explanation += `Key concerns include: ${flags.slice(0, 3).join(", ")}. `;
  }

  if (sourceInfo) {
    if (sourceInfo.credibility === "high") {
      explanation += `The source (${sourceInfo.domain}) is a well-known credible news organization. `;
    } else if (sourceInfo.credibility === "low") {
      explanation += `The source (${sourceInfo.domain}) has a history of publishing unreliable content. `;
    } else {
      explanation += `The source (${sourceInfo.domain}) has not been verified for credibility. `;
    }
  }

  explanation +=
    "Always cross-reference important information with multiple trusted sources.";

  return explanation;
}
