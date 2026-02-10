/**
 * In-memory caching system for analysis results
 * Implements LRU-style cache with automatic cleanup
 */

import { AnalysisResult } from "./types";
import crypto from "crypto";

interface CacheEntry {
  result: AnalysisResult;
  timestamp: number;
  expiresAt: number;
}

// Cache configuration
const MAX_CACHE_SIZE = 100;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// In-memory cache storage persisted across hot-reloads and requests in dev
// by attaching to globalThis
const globalForCache = globalThis as unknown as {
  __FAKE_NEWS_CACHE__?: Map<string, CacheEntry>;
};

const cache: Map<string, CacheEntry> =
  globalForCache.__FAKE_NEWS_CACHE__ ||
  (globalForCache.__FAKE_NEWS_CACHE__ = new Map<string, CacheEntry>());

/**
 * Generate a cache key from text input (exported for debugging/headers)
 */
function generateCacheKey(text: string): string {
  // Normalize Unicode, collapse whitespace, lowercase, and trim
  const normalized = text
    .normalize("NFKC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

  // Stable hash over the full normalized text
  const hash = crypto
    .createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex")
    .slice(0, 16);

  return `cache_${hash}`;
}

/**
 * Get cached analysis result if available and not expired
 */
export function getCachedResult(text: string): AnalysisResult | null {
  const key = generateCacheKey(text);
  const entry = cache.get(key);

  if (!entry) {
    return null;
  }

  // Check if cache entry has expired
  const now = Date.now();
  if (now > entry.expiresAt) {
    console.log(`🕐 Cache expired for key: ${key}`);
    cache.delete(key);
    return null;
  }

  console.log(
    `✅ Cache HIT for key: ${key} (age: ${Math.round(
      (now - entry.timestamp) / 1000
    )}s)`
  );
  return entry.result;
}

/**
 * Store analysis result in cache
 */
export function setCachedResult(text: string, result: AnalysisResult): void {
  const key = generateCacheKey(text);
  const now = Date.now();

  // Cleanup old entries if cache is full
  if (cache.size >= MAX_CACHE_SIZE) {
    cleanupOldestEntries();
  }

  const entry: CacheEntry = {
    result,
    timestamp: now,
    expiresAt: now + CACHE_TTL,
  };

  cache.set(key, entry);
  console.log(
    `💾 Cached result for key: ${key} (cache size: ${cache.size}/${MAX_CACHE_SIZE})`
  );
}

/**
 * Remove oldest cache entries when limit is reached
 * Removes 20% of entries to avoid frequent cleanup
 */
function cleanupOldestEntries(): void {
  const entriesToRemove = Math.ceil(MAX_CACHE_SIZE * 0.2);
  const sortedEntries = Array.from(cache.entries()).sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  for (let i = 0; i < entriesToRemove && i < sortedEntries.length; i++) {
    cache.delete(sortedEntries[i][0]);
  }

  console.log(`🧹 Cache cleanup: removed ${entriesToRemove} oldest entries`);
}

/**
 * Clear all cached entries (useful for testing/admin)
 */
export function clearCache(): void {
  const size = cache.size;
  cache.clear();
  console.log(`🗑️ Cache cleared: removed ${size} entries`);
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let expiredCount = 0;
  let validCount = 0;

  cache.forEach((entry) => {
    if (now > entry.expiresAt) {
      expiredCount++;
    } else {
      validCount++;
    }
  });

  return {
    totalEntries: cache.size,
    validEntries: validCount,
    expiredEntries: expiredCount,
    maxSize: MAX_CACHE_SIZE,
    utilizationPercent: Math.round((cache.size / MAX_CACHE_SIZE) * 100),
    ttlMinutes: CACHE_TTL / (60 * 1000),
  };
}

/**
 * Remove expired entries (can be called periodically)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let removed = 0;

  cache.forEach((entry, key) => {
    if (now > entry.expiresAt) {
      cache.delete(key);
      removed++;
    }
  });

  if (removed > 0) {
    console.log(`🧹 Removed ${removed} expired cache entries`);
  }

  return removed;
}
