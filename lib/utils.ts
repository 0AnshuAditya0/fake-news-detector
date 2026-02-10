import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { AnalysisResult, DashboardStats } from "./types";
import { supabase, SupabaseAnalysis, getOrCreateAnonymousUser } from "./supabase";

// Shared storage configuration
const SHARED_STORAGE_KEY = 'fake-news-analyses-shared';
const SYNC_INTERVAL = 30000; // 30 seconds

// Shared storage utilities fo
class SharedStorage {
  private static instance: SharedStorage;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSync = 0;

  static getInstance(): SharedStorage {
    if (!SharedStorage.instance) {
      SharedStorage.instance = new SharedStorage();
    }
    return SharedStorage.instance;
  }

  // Initialize sync
  init() {
    if (typeof window === 'undefined') return;

    // Start periodic sync
    this.startPeriodicSync();

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', this.handleStorageEvent.bind(this));

    // Initial sync
    this.syncFromSharedStorage();
  }

  // Start periodic sync with shared storage
  private startPeriodicSync() {
    this.syncInterval = setInterval(() => {
      this.syncToSharedStorage();
      this.syncFromSharedStorage();
    }, SYNC_INTERVAL);
  }

  // Handle storage events from other tabs
  private handleStorageEvent(event: StorageEvent) {
    if (event.key === SHARED_STORAGE_KEY) {
      this.syncFromSharedStorage();
    }
  }

  // Sync local analyses to shared storage (public method)
  syncToSharedStorage() {
    if (typeof window === 'undefined') return;

    try {
      const localAnalyses = this.getLocalAnalyses();
      if (localAnalyses.length > 0) {
        const sharedData = {
          analyses: localAnalyses,
          lastUpdated: Date.now(),
          deviceId: this.getDeviceId()
        };
        localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(sharedData));
      }
    } catch (error) {
      console.error('Failed to sync to shared storage:', error);
    }
  }

  // Sync from shared storage to local
  private syncFromSharedStorage() {
    if (typeof window === 'undefined') return;

    try {
      const sharedDataStr = localStorage.getItem(SHARED_STORAGE_KEY);
      if (!sharedDataStr) return;

      const sharedData = JSON.parse(sharedDataStr);
      const localAnalyses = this.getLocalAnalyses();

      // Only sync if shared data is newer and from different device
      if (sharedData.lastUpdated > this.lastSync &&
        sharedData.deviceId !== this.getDeviceId()) {

        // Merge analyses (keep local ones, add new shared ones)
        const mergedAnalyses = [...localAnalyses];
        sharedData.analyses.forEach((sharedAnalysis: AnalysisResult) => {
          const exists = mergedAnalyses.find(a => a.id === sharedAnalysis.id);
          if (!exists) {
            mergedAnalyses.push(sharedAnalysis);
          }
        });

        // Save merged data locally
        localStorage.setItem('analyses', JSON.stringify(mergedAnalyses));
        this.lastSync = sharedData.lastUpdated;

        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('analysesUpdated'));
      }
    } catch (error) {
      console.error('Failed to sync from shared storage:', error);
    }
  }

  // Get local analyses
  private getLocalAnalyses(): AnalysisResult[] {
    if (typeof window === 'undefined') return [];

    try {
      const data = localStorage.getItem('analyses');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get local analyses:', error);
      return [];
    }
  }

  // Get unique device ID
  private getDeviceId(): string {
    if (typeof window === 'undefined') return '';

    let deviceId = localStorage.getItem('device-id');
    if (!deviceId) {
      deviceId = `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('device-id', deviceId);
    }
    return deviceId;
  }

  // Clean up
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    window.removeEventListener('storage', this.handleStorageEvent.bind(this));
  }
}

// Initialize shared storage
const sharedStorage = SharedStorage.getInstance();
if (typeof window !== 'undefined') {
  sharedStorage.init();
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// LocalStorage utilities for data persistence
export async function saveAnalysis(analysis: AnalysisResult): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Ensure analysis has an ID and timestamp
    const analysisWithId = {
      ...analysis,
      id: analysis.id || generateId(),
      timestamp: analysis.timestamp || Date.now()
    };

    // Save to localStorage first
    const existing = getRecentAnalysesSync();
    const updated = [analysisWithId, ...existing].slice(0, 50); // Keep last 50
    localStorage.setItem("analyses", JSON.stringify(updated));

    // Save to Supabase for cross-device sync
    try {
      const userId = await getOrCreateAnonymousUser();

      const supabaseAnalysis: Omit<SupabaseAnalysis, 'created_at'> = {
        id: analysisWithId.id,
        user_id: userId,
        original_text: analysisWithId.originalText,
        prediction: analysisWithId.prediction,
        confidence: analysisWithId.confidence,
        overall_score: analysisWithId.overallScore,
        flags: analysisWithId.flags || [],
        signals: {
          ml_score: analysisWithId.signals?.mlScore || 50,
          sentiment_score: analysisWithId.signals?.sentimentScore || 50,
          clickbait_score: analysisWithId.signals?.clickbaitScore || 50,
          source_score: analysisWithId.signals?.sourceScore || 50,
          bias_score: analysisWithId.signals?.biasScore || 50,
        },
        source_domain: analysisWithId.source?.domain,
        source_credibility: analysisWithId.source?.credibility,
        url: analysisWithId.url
      };

      const { error } = await supabase
        .from('analyses')
        .upsert(supabaseAnalysis, { onConflict: 'id' });

      if (error) {
        console.error('Error saving to Supabase:', error);
      }
    } catch (supabaseError) {
      console.error('Supabase save failed, continuing with localStorage:', supabaseError);
    }

    // Sync to shared storage
    sharedStorage.syncToSharedStorage();

    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('analysesUpdated'));
  } catch (error) {
    console.error("Failed to save analysis:", error);
  }
}

export async function getRecentAnalyses(): Promise<AnalysisResult[]> {
  if (typeof window === "undefined") return [];

  try {
    // First try to load from Supabase
    try {
      const userId = await getOrCreateAnonymousUser();

      const { data: supabaseAnalyses, error } = await supabase
        .from('analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && supabaseAnalyses && supabaseAnalyses.length > 0) {
        // Convert Supabase format to local format
        const convertedAnalyses: AnalysisResult[] = supabaseAnalyses.map((sa: SupabaseAnalysis) => ({
          id: sa.id,
          originalText: sa.original_text,
          prediction: sa.prediction as any,
          confidence: sa.confidence,
          overallScore: sa.overall_score,
          flags: sa.flags || [],
          signals: {
            mlScore: sa.signals.ml_score,
            sentimentScore: sa.signals.sentiment_score,
            clickbaitScore: sa.signals.clickbait_score,
            sourceScore: sa.signals.source_score,
            biasScore: sa.signals.bias_score,
          },
          source: sa.source_domain ? {
            domain: sa.source_domain,
            credibility: (sa.source_credibility as any) || "high"
          } : undefined,
          url: sa.url,
          timestamp: new Date(sa.created_at).getTime(),
          highlights: [],
          explanation: ""
        }));

        // Also save to localStorage for offline access
        localStorage.setItem("analyses", JSON.stringify(convertedAnalyses));

        return convertedAnalyses;
      }
    } catch (supabaseError) {
      console.error('Supabase load failed, falling back to localStorage:', supabaseError);
    }

    // Fall back to localStorage
    const data = localStorage.getItem("analyses");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get analyses:", error);
    return [];
  }
}

// Synchronous version for immediate access (used in some components)
export function getRecentAnalysesSync(): AnalysisResult[] {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem("analyses");
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get analyses:", error);
    return [];
  }
}

export function getAnalysisById(id: string): AnalysisResult | null {
  const analyses = getRecentAnalysesSync();
  return analyses.find((a) => a.id === id) || null;
}

export async function getStats(): Promise<DashboardStats> {
  const analyses = await getRecentAnalyses();

  if (analyses.length === 0) {
    return {
      totalAnalyses: 0,
      fakeDetected: 0,
      averageConfidence: 0,
      mostAnalyzedDomain: "N/A",
    };
  }

  const fakeCount = analyses.filter((a) => a.prediction === "FAKE").length;
  const totalConfidence = analyses.reduce((sum, a) => sum + a.confidence, 0);

  // Find most analyzed domain
  const domainCounts: Record<string, number> = {};
  analyses.forEach((a) => {
    if (a.source?.domain) {
      domainCounts[a.source.domain] = (domainCounts[a.source.domain] || 0) + 1;
    }
  });

  const mostAnalyzedDomain = Object.keys(domainCounts).length > 0
    ? Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0][0]
    : "N/A";

  return {
    totalAnalyses: analyses.length,
    fakeDetected: Math.round((fakeCount / analyses.length) * 100),
    averageConfidence: Math.round(totalConfidence / analyses.length),
    mostAnalyzedDomain,
  };
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCredibilityColor(score: number): string {
  if (score < 40) return "text-destructive";
  if (score < 70) return "text-warning";
  return "text-success";
}

export function getCredibilityBgColor(score: number): string {
  if (score < 40) return "bg-destructive/5 border border-destructive";
  if (score < 70) return "bg-warning/5 border border-warning";
  return "bg-success/5 border border-success";
}

export function getCredibilityLabel(score: number): string {
  if (score < 40) return "UNRELIABLE";
  if (score < 70) return "POTENTIALLY BIASED";
  return "HIGHLY RELIABLE";
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace("www.", "");
  } catch {
    return "";
  }
}
