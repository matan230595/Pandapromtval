/**
 * Real-Time Token & Cost Estimator for AI Prompt Engineering (2025/2026 pricing standards)
 */

export interface CostEstimate {
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  totalTokens: number;
  costUSD: number;
  costILS: number;
  formattedUSD: string;
  formattedILS: string;
  provider: string;
  model: string;
}

// Approximate character-to-token ratio (Hebrew & English blended: ~3.2 chars/token for Hebrew, ~4 chars/token for English)
export function estimateTokenCount(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  
  // Count Hebrew chars vs Latin chars
  const hebrewMatches = text.match(/[\u0590-\u05FF]/g) || [];
  const latinMatches = text.match(/[a-zA-Z0-9]/g) || [];
  const otherMatches = text.length - hebrewMatches.length - latinMatches.length;

  // Hebrew tokenization tends to use slightly more tokens per char than English
  const tokens = (hebrewMatches.length / 3.0) + (latinMatches.length / 4.0) + (otherMatches / 2.5);
  return Math.max(1, Math.ceil(tokens));
}

// Model pricing per 1M tokens ($)
export const MODEL_PRICING: Record<string, { name: string; inputPerM: number; outputPerM: number; provider: string }> = {
  'gemini-3.8-flash': {
    name: 'Gemini 1.5 Flash / 3.8 Flash',
    inputPerM: 0.075,
    outputPerM: 0.30,
    provider: 'Google'
  },
  'gemini-3.1-pro-preview': {
    name: 'Gemini 1.5 Pro / 3.1 Pro',
    inputPerM: 1.25,
    outputPerM: 5.00,
    provider: 'Google'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    inputPerM: 2.50,
    outputPerM: 10.00,
    provider: 'OpenAI'
  },
  'claude-3-5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    inputPerM: 3.00,
    outputPerM: 15.00,
    provider: 'Anthropic'
  }
};

const USD_TO_ILS_RATE = 3.65;

export function calculateExecutionCost(
  inputText: string,
  outputText: string = '',
  modelKey: string = 'gemini-3.8-flash'
): CostEstimate {
  const modelInfo = MODEL_PRICING[modelKey] || MODEL_PRICING['gemini-3.8-flash'];
  
  const inTokens = estimateTokenCount(inputText);
  // If output is not yet generated, estimate output as ~1.5x input or minimum 250 tokens
  const outTokens = outputText 
    ? estimateTokenCount(outputText) 
    : Math.max(200, Math.round(inTokens * 1.2));
  
  const totalTokens = inTokens + outTokens;
  const inCost = (inTokens / 1_000_000) * modelInfo.inputPerM;
  const outCost = (outTokens / 1_000_000) * modelInfo.outputPerM;
  const costUSD = inCost + outCost;
  const costILS = costUSD * USD_TO_ILS_RATE;

  return {
    estimatedInputTokens: inTokens,
    estimatedOutputTokens: outTokens,
    totalTokens,
    costUSD,
    costILS,
    formattedUSD: costUSD < 0.0001 ? '<$0.0001' : `$${costUSD.toFixed(4)}`,
    formattedILS: costILS < 0.0005 ? '<₪0.001' : `₪${costILS.toFixed(4)}`,
    provider: modelInfo.provider,
    model: modelInfo.name
  };
}
