import { NextResponse } from "next/server";
import { getGeminiStats } from "@/lib/gemini-service";
import { getCacheStats } from "@/lib/cache";


export async function GET() {
  try {
    const geminiStats = getGeminiStats();
    const cacheStats = getCacheStats();

    return NextResponse.json(
      {
        api: {
          totalCalls: geminiStats.totalCalls,
          cacheHits: geminiStats.cacheHits,
          apiCalls: geminiStats.apiCalls,
          failures: geminiStats.failures,
          cacheHitRate: geminiStats.cacheHitRate,
          failureRate: geminiStats.failureRate,
          lastError: geminiStats.lastError,
          lastErrorTime: geminiStats.lastErrorTime
            ? new Date(geminiStats.lastErrorTime).toISOString()
            : null,
        },
        cache: {
          totalEntries: cacheStats.totalEntries,
          validEntries: cacheStats.validEntries,
          expiredEntries: cacheStats.expiredEntries,
          maxSize: cacheStats.maxSize,
          utilizationPercent: cacheStats.utilizationPercent,
          ttlMinutes: cacheStats.ttlMinutes,
        },
        health: {
          status: geminiStats.failureRate === "0%" || parseFloat(geminiStats.failureRate) < 50
            ? "healthy"
            : "degraded",
          message: geminiStats.failures === 0
            ? "All systems operational"
            : `${geminiStats.failures} API failures detected`,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Stats endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve stats" },
      { status: 500 }
    );
  }
}