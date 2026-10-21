import { Prompt } from '../types';

export interface PromptRecommendation {
  prompt: Prompt;
  score: number; // 0 - 100
  reason: string;
  reasonEn: string;
  matchType: 'tag_affinity' | 'favorite_match' | 'platform_affinity' | 'high_usage';
}

/**
 * Recommendation Engine powered by user favorites, usage patterns, and tag affinity.
 * Analyzes favorite and frequently used prompts to find similar and highly relevant prompts.
 */
export function getPersonalizedRecommendations(
  allPrompts: Prompt[],
  currentPromptId?: string,
  limit = 4
): PromptRecommendation[] {
  if (!allPrompts || allPrompts.length === 0) return [];

  // 1. Extract signals from favorite and heavily used prompts
  const prioritizedPrompts = allPrompts.filter(p => p.favorite || (p.useCount || 0) > 0);

  // Calculate tag weights
  const tagWeights = new Map<string, number>();
  const platformWeights = new Map<string, number>();

  prioritizedPrompts.forEach(p => {
    const weight = p.favorite ? 2.5 : 1.2;

    (p.tags || []).forEach(t => {
      const cleanTag = t.trim().toLowerCase();
      if (cleanTag) {
        tagWeights.set(cleanTag, (tagWeights.get(cleanTag) || 0) + weight);
      }
    });

    if (p.platform) {
      const plat = p.platform.toLowerCase();
      platformWeights.set(plat, (platformWeights.get(plat) || 0) + weight);
    }
  });

  const topPlatform = Array.from(platformWeights.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];

  // 2. Score candidate prompts
  const candidates = allPrompts.filter(p => p.id !== currentPromptId);

  const scored: PromptRecommendation[] = candidates.map(p => {
    let score = 25; // baseline
    let reason = 'פרומפט מומלץ בספרייה';
    let reasonEn = 'Recommended prompt in library';
    let matchType: PromptRecommendation['matchType'] = 'high_usage';

    if (p.favorite) {
      score += 25;
      reason = 'פרומפט מועדף שסימנת בכוכב';
      reasonEn = 'Favorited prompt';
      matchType = 'favorite_match';
    }

    // Usage count popularity
    if ((p.useCount || 0) > 3) {
      score += Math.min(25, (p.useCount || 0) * 2);
      if (!p.favorite) {
        reason = `בשימוש תדיר (${p.useCount} פעמים)`;
        reasonEn = `Frequently used (${p.useCount} times)`;
        matchType = 'high_usage';
      }
    }

    // Tag Affinity contribution
    const matchingTags: string[] = [];
    (p.tags || []).forEach(t => {
      const clean = t.trim().toLowerCase();
      if (tagWeights.has(clean)) {
        score += (tagWeights.get(clean) || 0) * 8;
        matchingTags.push(t);
      }
    });

    if (matchingTags.length > 0) {
      reason = `מתאים לנושאים מועדפים: #${matchingTags.slice(0, 2).join(', #')}`;
      reasonEn = `Matches your favorite topics: #${matchingTags.slice(0, 2).join(', #')}`;
      matchType = 'tag_affinity';
    }

    // Platform Affinity contribution
    if (topPlatform && p.platform?.toLowerCase() === topPlatform) {
      score += 15;
      if (matchingTags.length === 0 && !p.favorite) {
        reason = `תואם לפלטפורמת ${p.platform} המועדפת עליך`;
        reasonEn = `Matches your preferred platform ${p.platform}`;
        matchType = 'platform_affinity';
      }
    }

    // Cap score at 99
    const finalScore = Math.min(99, Math.round(score));

    return {
      prompt: p,
      score: finalScore,
      reason,
      reasonEn,
      matchType
    };
  });

  // Sort descending by score and pick top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
