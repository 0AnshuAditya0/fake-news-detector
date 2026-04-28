import { NextRequest, NextResponse } from "next/server";
import { extractDomain } from "@/lib/utils";

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

const UNRELIABLE_SOURCES = [
  "infowars.com",
  "naturalnews.com",
  "beforeitsnews.com",
  "worldnewsdailyreport.com",
  "nationalreport.net",
  "empirenews.net",
  "huzlers.com",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    const domain = extractDomain(url);
    const normalizedDomain = domain.toLowerCase();

    let credibility: "high" | "medium" | "low" = "medium";
    let description = "This source has not been verified for credibility.";

    if (CREDIBLE_SOURCES.includes(normalizedDomain)) {
      credibility = "high";
      description = "This is a well-known credible news organization.";
    } else if (UNRELIABLE_SOURCES.includes(normalizedDomain)) {
      credibility = "low";
      description = "This source has a history of publishing unreliable content.";
    }

    return NextResponse.json(
      {
        domain,
        credibility,
        description,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Source check error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check source" },
      { status: 500 }
    );
  }
}
