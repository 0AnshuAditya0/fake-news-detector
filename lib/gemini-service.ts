export interface GeminiAnalysis {
  prediction: 'FAKE' | 'REAL' | 'UNCERTAIN';
  confidence: number;
  reasoning: string;
  flags: string[];
  factualConcerns: string[];
  credibilityScore: number;
}

let lastSuccessfulModel: string | null = null;
const modelCooldowns = new Map<string, number>();


const geminiStats = {
  totalCalls: 0,
  cacheHits: 0,
  apiCalls: 0,
  failures: 0,
  lastError: null as string | null,
  lastErrorTime: null as number | null,
};

function getPreferredModels(): string[] {
  const allModels = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
    "gemini-pro-latest"
  ];
  const now = Date.now();

  const availableModels = allModels.filter(m => {
    const cooldownEnd = modelCooldowns.get(m) || 0;
    return now > cooldownEnd;
  });

  if (lastSuccessfulModel && availableModels.includes(lastSuccessfulModel)) {
    return [lastSuccessfulModel, ...availableModels.filter(m => m !== lastSuccessfulModel)];
  }

  return availableModels.length > 0 ? availableModels : allModels;
}


function extractJson(text: string): any {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    return null;
  }

  const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
  try {
    return JSON.parse(jsonCandidate);
  } catch (e) {
    return null;
  }
}

/**
 * Analyze text using Google Gemini
 */
export async function analyzeWithGemini(
  text: string,
  modelName: string
): Promise<GeminiAnalysis | null> {
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return null;
  }

  try {
    geminiStats.apiCalls++;
    const apiVersion = 'v1beta';

    console.log(`🤖 Calling Gemini API [${modelName}] via ${apiVersion}...`);

    const prompt = `You are an expert fact-checker/fake news detector. Analyze the following text.
    
TEXT: "${text.slice(0, 3000)}"

Respond with ONLY valid JSON (no markdown, no backticks):
{"prediction":"FAKE","confidence":85,"reasoning":"Brief explanation","flags":["flag1","flag2"],"factualConcerns":["concern1"],"credibilityScore":75}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || response.statusText;
      console.error(`❌ Gemini API [${modelName}] error (${response.status}): ${message}`);

      // Track failure
      geminiStats.failures++;
      geminiStats.lastError = message;
      geminiStats.lastErrorTime = Date.now();

      // Handle Quota/Rate Limit
      if (response.status === 429) {
        console.log(`⏳ Model ${modelName} is rate limited. Cooling down for 60s.`);
        modelCooldowns.set(modelName, Date.now() + 60000);
      }

      return null;
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.warn(`⚠️ Gemini [${modelName}] empty response. FinishReason: ${data.candidates?.[0]?.finishReason || 'Unknown'}`);
      geminiStats.failures++;
      return null;
    }

    const result = extractJson(generatedText);
    if (!result) {
      console.warn(`⚠️ Gemini [${modelName}] could not parse JSON from response: ${generatedText.substring(0, 200)}...`);
      geminiStats.failures++;
      return null;
    }

    lastSuccessfulModel = modelName;
    return result;

  } catch (error: any) {
    console.error(`❌ Gemini [${modelName}] call failed:`, error.message);
    geminiStats.failures++;
    geminiStats.lastError = error.message;
    geminiStats.lastErrorTime = Date.now();
    return null;
  }
}

/**
 * Retry wrapper that cycles through available models intelligently
 */
export async function analyzeWithGeminiRetry(text: string): Promise<GeminiAnalysis | null> {
  geminiStats.totalCalls++;
  const modelsToTry = getPreferredModels();

  for (const model of modelsToTry) {
    try {
      const result = await analyzeWithGemini(text, model);
      if (result) {
        console.log(`✅ Gemini success using model: ${model}`);
        return result;
      }
      console.log(`⚠️ Model ${model} failed, trying next...`);
    } catch (error) {
      continue;
    }
  }

  return null;
}

/**
 * Get Gemini API status for monitoring
 */
export function getGeminiStatus() {
  const configured = !!process.env.GEMINI_API_KEY;
  return {
    configured,
    lastModel: lastSuccessfulModel || 'None',
    cooldowns: Array.from(modelCooldowns.entries())
      .filter(([_, time]) => Date.now() < time)
      .map(([m]) => m)
  };
}

/**
 * Get Gemini statistics for API monitoring
 */
export function getGeminiStats() {
  return {
    totalCalls: geminiStats.totalCalls,
    cacheHits: geminiStats.cacheHits,
    apiCalls: geminiStats.apiCalls,
    failures: geminiStats.failures,
    lastError: geminiStats.lastError,
    lastErrorTime: geminiStats.lastErrorTime,
    cacheHitRate: geminiStats.totalCalls > 0
      ? ((geminiStats.cacheHits / geminiStats.totalCalls) * 100).toFixed(1) + '%'
      : '0%',
    failureRate: geminiStats.apiCalls > 0
      ? ((geminiStats.failures / geminiStats.apiCalls) * 100).toFixed(1) + '%'
      : '0%',
  };
}


export function incrementTotalCalls() {
  geminiStats.totalCalls++;
}

export function incrementCacheHits() {
  geminiStats.cacheHits++;
}

export function incrementApiCalls() {
  geminiStats.apiCalls++;
}

export function incrementFailures() {
  geminiStats.failures++;
}


export function resetGeminiStats() {
  geminiStats.totalCalls = 0;
  geminiStats.cacheHits = 0;
  geminiStats.apiCalls = 0;
  geminiStats.failures = 0;
  geminiStats.lastError = null;
  geminiStats.lastErrorTime = null;
}