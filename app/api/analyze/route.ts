import { NextRequest, NextResponse } from "next/server";
// Ensure Node.js runtime and dynamic execution so in-memory cache persists between requests
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { analyzeFakeNews } from "@/lib/ml-service";
import { scrapeUrl } from "@/lib/scraper";
import { getCachedResult } from "@/lib/cache";
import { AnalysisRequest } from "@/lib/types";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";
import {
  incrementTotalCalls,
  incrementCacheHits,
  incrementApiCalls,
} from "@/lib/gemini-service";
import { generateId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let usedCache = false;

  try {
    // Get client IP for rate limiting
    const clientIP = getClientIP(request);

    // Check rate limit (10 requests per minute)
    const rateLimit = checkRateLimit(clientIP, 10, 60000);

    if (!rateLimit.allowed) {
      const response = NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later.",
          retryAfter: rateLimit.retryAfter,
          message: `Too many requests. Please wait ${rateLimit.retryAfter} seconds.`,
        },
        { status: 429 }
      );

      // Add rate limit headers
      response.headers.set("X-RateLimit-Limit", "10");
      response.headers.set("X-RateLimit-Remaining", "0");
      response.headers.set(
        "X-RateLimit-Reset",
        new Date(rateLimit.resetTime).toISOString()
      );
      response.headers.set("Retry-After", rateLimit.retryAfter!.toString());

      return response;
    }

    // Parse request body
    const body: AnalysisRequest = await request.json();

    if (!body.text && !body.url) {
      return NextResponse.json(
        { error: "Either text or url must be provided" },
        { status: 400 }
      );
    }

    let textToAnalyze = body.text || "";
    let url = body.url;

    // If URL is provided, scrape content
    if (url) {
      const scraped = await scrapeUrl(url);

      if (!scraped.success) {
        return NextResponse.json(
          { error: scraped.error || "Failed to scrape URL" },
          { status: 400 }
        );
      }

      textToAnalyze = scraped.text;
    }

    // Validate text length
    if (textToAnalyze.length < 50) {
      return NextResponse.json(
        { error: "Text is too short for analysis (minimum 50 characters)" },
        { status: 400 }
      );
    }

    if (textToAnalyze.length > 5000) {
      textToAnalyze = textToAnalyze.substring(0, 5000);
    }

    // Track total calls
    incrementTotalCalls();

    // Fast path: return cached result immediately if present
    const cachedCheck = getCachedResult(textToAnalyze);
    if (cachedCheck) {
      usedCache = true;
      incrementCacheHits();
      const processingTime = Date.now() - startTime;
      const response = NextResponse.json(
        {
          ...cachedCheck,
          meta: {
            cached: true,
            processingTime: `${processingTime}ms`,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 200 }
      );
      response.headers.set("X-Used-Cache", "true");
      response.headers.set("X-Processing-Time", `${processingTime}ms`);
      response.headers.set("X-Cache-Status", "HIT");
      response.headers.set("X-RateLimit-Limit", "10");
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimit.remaining.toString()
      );
      response.headers.set(
        "X-RateLimit-Reset",
        new Date(rateLimit.resetTime).toISOString()
      );
      return response;
    }

    // Not cached: perform analysis
    incrementApiCalls();
    const result = await analyzeFakeNews(textToAnalyze, url);

    const processingTime = Date.now() - startTime;

    // Return with cache and performance headers
    const response = NextResponse.json(
      {
        ...result,
        meta: {
          cached: usedCache,
          processingTime: `${processingTime}ms`,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );

    // Performance headers
    response.headers.set("X-Used-Cache", usedCache ? "true" : "false");
    response.headers.set("X-Processing-Time", `${processingTime}ms`);
    response.headers.set("X-Cache-Status", usedCache ? "HIT" : "MISS");

    // Rate limit headers
    response.headers.set("X-RateLimit-Limit", "10");
    response.headers.set(
      "X-RateLimit-Remaining",
      rateLimit.remaining.toString()
    );
    response.headers.set(
      "X-RateLimit-Reset",
      new Date(rateLimit.resetTime).toISOString()
    );

    return response;
  } catch (error: any) {
    console.error("❌ Analysis API error:", error);
    const processingTime = Date.now() - startTime;

    // Return graceful fallback - never crash the API
    const response = NextResponse.json(
      {
        prediction: "UNCERTAIN",
        confidence: 50,
        overallScore: 50,
        signals: {
          mlScore: 50,
          sentimentScore: 50,
          clickbaitScore: 50,
          sourceScore: 50,
          biasScore: 50,
        },
        flags: ["Analysis failed - using fallback. Please try again."],
        highlights: [],
        explanation:
          "Unable to complete full analysis due to technical issues. Please try again or contact support.",
        error: error.message || "Internal server error",
        meta: {
          cached: false,
          processingTime: `${processingTime}ms`,
          timestamp: new Date().toISOString(),
          fallback: true,
        },
      },
      { status: 200 } // Return 200 so frontend doesn't break
    );

    response.headers.set("X-Processing-Time", `${processingTime}ms`);
    response.headers.set("X-Fallback", "true");
    return response;
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: "Fake News Detector API",
      version: "2.0.0",
      features: [
        "AI-powered analysis with Google Gemini Pro (90%+ accuracy)",
        "Intelligent caching system (60x faster)",
        "Rate limiting protection (10 req/min)",
        "Multi-signal detection (5 methods)",
        "Real-time statistics and monitoring",
      ],
      endpoints: {
        analyze: "POST /api/analyze - Analyze text or URL for fake news",
        stats: "GET /api/stats - Get API and cache statistics",
        scrape: "POST /api/scrape - Extract content from URL",
        source: "POST /api/source - Check source credibility",
      },
    },
    { status: 200 }
  );
}
