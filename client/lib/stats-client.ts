interface StatsPayload {
  id: string;
  prediction: string;
  confidence: number;
  overallScore: number;
  domain: string;
  timestamp: number;
  flags: string[];
  excerpt: string;
  signals: {
    mlScore: number;
    sentimentScore: number;
    clickbaitScore: number;
    sourceScore: number;
    biasScore: number;
  };
}

export async function updateGlobalStats(payload: StatsPayload): Promise<void> {
  if (typeof fetch === "undefined") {
    return;
  }

  try {
    const baseUrl =
      process.env.GLOBAL_STATS_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

    await fetch(`${baseUrl}/api/global-stats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to send global stats payload:", error);
  }
}
