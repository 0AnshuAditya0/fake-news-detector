export type Prediction = "FAKE" | "REAL" | "UNCERTAIN";

export type CredibilityLevel = "high" | "medium" | "low";

export interface AnalysisSignals {
  mlScore: number;
  sentimentScore: number;
  clickbaitScore: number;
  sourceScore: number;
  biasScore: number;
}

export interface Highlight {
  text: string;
  reason: string;
  type: "fake" | "bias" | "clickbait" | "sentiment";
}

export interface SourceInfo {
  domain: string;
  credibility: CredibilityLevel;
}

export interface AnalysisResult {
  id: string;
  prediction: Prediction;
  confidence: number;
  overallScore: number;
  signals: AnalysisSignals;
  flags: string[];
  highlights: Highlight[];
  explanation: string;
  source?: SourceInfo;
  originalText: string;
  url?: string;
  timestamp: number;
  customML?: {
    prediction: string;
    confidence: number;
  };
}

export interface AnalysisRequest {
  text: string;
  url?: string;
}

export interface DashboardStats {
  totalAnalyses: number;
  fakeDetected: number;
  averageConfidence: number;
  mostAnalyzedDomain: string;
}

export interface AnalysisHistory {
  analyses: AnalysisResult[];
}
