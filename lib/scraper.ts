import * as cheerio from "cheerio";
import axios from "axios";

export interface ScrapedContent {
  title: string;
  text: string;
  domain: string;
  success: boolean;
  error?: string;
}

export async function scrapeUrl(url: string): Promise<ScrapedContent> {
  try {
    // Validate URL
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");

    // Fetch the page
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    // Parse HTML
    const $ = cheerio.load(response.data);

    // Remove script, style, and nav elements
    $("script, style, nav, header, footer, aside").remove();

    // Extract metadata
    const title = $("title").text().trim() ||
      $('meta[property="og:title"]').attr("content") ||
      $("h1").first().text().trim() ||
      "";

    const author = $('meta[name="author"]').attr("content") ||
      $('.author').first().text().trim() ||
      "Unknown Source";

    const date = $('meta[property="article:published_time"]').attr("content") ||
      $('meta[name="publish-date"]').attr("content") ||
      "";

    // Extract main content
    let text = "";

    // Improved content selectors
    const contentSelectors = [
      "article",
      'main',
      '.article-body',
      '.article-content',
      '.story-content',
      '.post-content',
      '.entry-content',
      '[itemprop="articleBody"]',
      '#article-content',
    ];

    for (const selector of contentSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        // Remove known junk inside content
        el.find("script, style, .ad, .social-share, .recommended, footer, nav").remove();
        const content = el.text().trim();
        if (content.length > text.length) {
          text = content;
        }
      }
    }

    // Fallback logic
    if (!text || text.length < 200) {
      // Try finding the largest paragraph container
      let bestBlock = "";
      $("div, section").each((_, el) => {
        const pCount = $(el).find("p").length;
        if (pCount > 3) {
          const t = $(el).text().trim();
          if (t.length > bestBlock.length) bestBlock = t;
        }
      });
      text = bestBlock || $("body").text().trim();
    }

    // Professional cleaning
    text = text
      .replace(/\s+/g, " ")
      .replace(/Share on (Twitter|Facebook|LinkedIn).*/gi, "")
      .replace(/Read more.*/gi, "")
      .trim();

    if (text.length > 5000) text = text.substring(0, 5000);

    return {
      title,
      text: `${title}. By ${author}. ${text}`,
      domain,
      success: true,
    };
  } catch (error: any) {
    return {
      title: "",
      text: "",
      domain: "",
      success: false,
      error: error.message || "Failed to scrape URL",
    };
  }
}
