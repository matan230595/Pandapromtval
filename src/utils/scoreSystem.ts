export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'prompts' | 'favorites' | 'community' | 'features';
  points: number;
  target: number;
  current: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  points: number;
  progress: number;
  target: number;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresIn?: string;
}

export interface ScoreState {
  points: number;
  level: number;
  levelTitle: string;
  levelProgress: number; // 0 to 100
  nextLevelPoints: number;
  unlockedAchievements: string[];
  claimedChallenges: string[];
  stats: {
    promptsSaved: number;
    promptsFavorited: number;
    promptsPublished: number;
    cardsExported: number;
    readAloudUsed: number;
    templatesFilled: number;
  };
  recentActivity: Array<{
    id: string;
    title: string;
    points: number;
    timestamp: string;
  }>;
}

const STORAGE_KEY = 'promptvault_user_score_v2';

const LEVELS = [
  { level: 1, min: 0, max: 150, title: 'יוצר מתחיל (Prompt Novice)' },
  { level: 2, min: 151, max: 400, title: 'משתמש מתקדם (Prompt Crafter)' },
  { level: 3, min: 401, max: 850, title: 'מהנדס פרומפטים (Prompt Engineer)' },
  { level: 4, min: 851, max: 1600, title: 'ארכיטקט AI מוסמך (AI Architect)' },
  { level: 5, min: 1601, max: 3000, title: 'מאסטר Vault עליון (Vault Master)' }
];

export function calculateLevel(points: number) {
  const current = LEVELS.find(l => points >= l.min && points <= l.max) || LEVELS[LEVELS.length - 1];
  const next = LEVELS.find(l => l.level === current.level + 1);
  const nextLevelPoints = next ? next.min : current.max;
  const range = (next ? next.min : current.max) - current.min;
  const progressInLevel = points - current.min;
  const progressPercent = Math.min(100, Math.max(0, Math.round((progressInLevel / (range || 1)) * 100)));

  return {
    level: current.level,
    levelTitle: current.title,
    levelProgress: progressPercent,
    nextLevelPoints
  };
}

const DEFAULT_STATE: ScoreState = {
  points: 0,
  level: 1,
  levelTitle: 'יוצר מתחיל (Prompt Novice)',
  levelProgress: 0,
  nextLevelPoints: 151,
  unlockedAchievements: [],
  claimedChallenges: [],
  stats: {
    promptsSaved: 0,
    promptsFavorited: 0,
    promptsPublished: 0,
    cardsExported: 0,
    readAloudUsed: 0,
    templatesFilled: 0
  },
  recentActivity: []
};

export function getScoreState(): ScoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    const lvl = calculateLevel(parsed.points || 0);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      ...lvl,
      stats: {
        ...DEFAULT_STATE.stats,
        ...(parsed.stats || {})
      },
      recentActivity: parsed.recentActivity || []
    };
  } catch (e) {
    return DEFAULT_STATE;
  }
}

export function saveScoreState(state: ScoreState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('promptvault_score_updated', { detail: state }));
  } catch (e) {
    console.error('Failed to save score state:', e);
  }
}

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'current' | 'isUnlocked'>[] = [
  {
    id: 'first_prompt',
    title: 'הפרומפט הראשון',
    description: 'שמור את הפרומפט הראשון שלך ב-Vault',
    icon: 'Sparkles',
    category: 'prompts',
    points: 50,
    target: 1
  },
  {
    id: 'prompts_10',
    title: 'אספן מתמיד',
    description: 'שמור 10 פרומפטים בספרייה האישית שלך',
    icon: 'Folder',
    category: 'prompts',
    points: 100,
    target: 10
  },
  {
    id: 'prompts_25',
    title: 'מומחה ארגון',
    description: 'שמור 25 פרומפטים בספרייה',
    icon: 'Box',
    category: 'prompts',
    points: 250,
    target: 25
  },
  {
    id: 'prompts_50',
    title: 'מאסטר פרומפטים',
    description: 'שמור 50 פרומפטים מגוונים',
    icon: 'Award',
    category: 'prompts',
    points: 500,
    target: 50
  },
  {
    id: 'prompts_100',
    title: 'אגדת ה-Vault (100 פרומפטים)',
    description: 'הגעת לציון דרך של 100 פרומפטים שמורים!',
    icon: 'Crown',
    category: 'prompts',
    points: 1000,
    target: 100
  },
  {
    id: 'first_favorite',
    title: 'סימון מועדף ראשון',
    description: 'סמן פרומפט ראשון כמועדף בכוכב',
    icon: 'Star',
    category: 'favorites',
    points: 30,
    target: 1
  },
  {
    id: 'favorites_10',
    title: 'אוסף מובחר',
    description: 'סמן 10 פרומפטים מועדפים',
    icon: 'Bookmark',
    category: 'favorites',
    points: 150,
    target: 10
  },
  {
    id: 'favorites_30',
    title: 'אוצר הפרומפטים (30 מועדפים)',
    description: 'סימנת 30 פרומפטים מועדפים לשליפה מהירה!',
    icon: 'Heart',
    category: 'favorites',
    points: 400,
    target: 30
  },
  {
    id: 'first_publish',
    title: 'תורם לקהילה',
    description: 'פרסם פרומפט שימושי לקהילה הציבורית',
    icon: 'Share2',
    category: 'community',
    points: 80,
    target: 1
  },
  {
    id: 'card_export',
    title: 'מעצב כרטיסיות (html2canvas)',
    description: 'ייצא כרטיס פרומפט כתמונת PNG/JPEG לשיתוף',
    icon: 'Camera',
    category: 'features',
    points: 50,
    target: 1
  },
  {
    id: 'read_aloud',
    title: 'מאזין חכם (Read Aloud)',
    description: 'השתמש בהקראה קולית לקריאת פרומפט',
    icon: 'Volume2',
    category: 'features',
    points: 35,
    target: 1
  },
  {
    id: 'template_engine',
    title: 'אשף התבניות והשדות',
    description: 'השתמש במנוע התבניות למילוי שדות דינמיים',
    icon: 'SlidersHorizontal',
    category: 'features',
    points: 40,
    target: 1
  }
];

export function getFullAchievements(state: ScoreState): Achievement[] {
  return ALL_ACHIEVEMENTS.map(ach => {
    let current = 0;
    if (ach.id.startsWith('prompt') || ach.id === 'first_prompt') {
      current = state.stats.promptsSaved;
    } else if (ach.id.startsWith('fav') || ach.id === 'first_favorite') {
      current = state.stats.promptsFavorited;
    } else if (ach.id === 'first_publish') {
      current = state.stats.promptsPublished;
    } else if (ach.id === 'card_export') {
      current = state.stats.cardsExported;
    } else if (ach.id === 'read_aloud') {
      current = state.stats.readAloudUsed;
    } else if (ach.id === 'template_engine') {
      current = state.stats.templatesFilled;
    }

    const isUnlocked = state.unlockedAchievements.includes(ach.id) || current >= ach.target;

    return {
      ...ach,
      current: Math.min(current, ach.target),
      isUnlocked
    };
  });
}

export function getActiveChallenges(state: ScoreState): Challenge[] {
  return [
    {
      id: 'daily_save_3',
      title: 'אתגר יומי: שדרוג הספרייה',
      description: 'שמור לפחות 2 פרומפטים חדשים היום',
      points: 40,
      progress: Math.min(state.stats.promptsSaved % 10, 2),
      target: 2,
      isCompleted: (state.stats.promptsSaved % 10) >= 2,
      isClaimed: state.claimedChallenges.includes('daily_save_3'),
      expiresIn: 'היום בחצות'
    },
    {
      id: 'daily_favorite_2',
      title: 'אתגר יומי: סימון מועדפים',
      description: 'סמן לפחות 2 פרומפטים כמועדפים',
      points: 30,
      progress: Math.min(state.stats.promptsFavorited, 2),
      target: 2,
      isCompleted: state.stats.promptsFavorited >= 2,
      isClaimed: state.claimedChallenges.includes('daily_favorite_2'),
      expiresIn: 'היום בחצות'
    },
    {
      id: 'weekly_export_card',
      title: 'אתגר שבועי: ייצוא תמונת כרטיס',
      description: 'ייצא כרטיס פרומפט מעוצב (PNG/JPEG)',
      points: 60,
      progress: Math.min(state.stats.cardsExported, 1),
      target: 1,
      isCompleted: state.stats.cardsExported >= 1,
      isClaimed: state.claimedChallenges.includes('weekly_export_card'),
      expiresIn: 'עוד 3 ימים'
    }
  ];
}

export interface RecordActionResult {
  newPoints: number;
  pointsEarned: number;
  unlockedAchievements: Achievement[];
  message: string;
}

export function recordScoreAction(
  action: 'save_prompt' | 'favorite_prompt' | 'publish_prompt' | 'export_card' | 'read_aloud' | 'fill_template',
  customCount?: number
): RecordActionResult {
  const state = getScoreState();
  let basePoints = 0;
  let actionTitle = '';

  switch (action) {
    case 'save_prompt':
      basePoints = 20;
      actionTitle = 'שמירת פרומפט ב-Vault';
      state.stats.promptsSaved = customCount !== undefined ? customCount : state.stats.promptsSaved + 1;
      break;
    case 'favorite_prompt':
      basePoints = 15;
      actionTitle = 'סימון פרומפט כמועדף';
      state.stats.promptsFavorited = customCount !== undefined ? customCount : state.stats.promptsFavorited + 1;
      break;
    case 'publish_prompt':
      basePoints = 50;
      actionTitle = 'פרסום פרומפט לקהילה';
      state.stats.promptsPublished += 1;
      break;
    case 'export_card':
      basePoints = 25;
      actionTitle = 'ייצוא כרטיס תמונה (html2canvas)';
      state.stats.cardsExported += 1;
      break;
    case 'read_aloud':
      basePoints = 15;
      actionTitle = 'שימוש בהקראה קולית (Read Aloud)';
      state.stats.readAloudUsed += 1;
      break;
    case 'fill_template':
      basePoints = 20;
      actionTitle = 'מילוי והעתקת תבנית פרומפט';
      state.stats.templatesFilled += 1;
      break;
  }

  let totalPointsEarned = basePoints;
  const newlyUnlocked: Achievement[] = [];

  // Check all achievements
  const allAch = getFullAchievements(state);
  for (const ach of allAch) {
    if (ach.isUnlocked && !state.unlockedAchievements.includes(ach.id)) {
      state.unlockedAchievements.push(ach.id);
      totalPointsEarned += ach.points;
      newlyUnlocked.push(ach);
    }
  }

  state.points += totalPointsEarned;
  const lvl = calculateLevel(state.points);
  state.level = lvl.level;
  state.levelTitle = lvl.levelTitle;
  state.levelProgress = lvl.levelProgress;
  state.nextLevelPoints = lvl.nextLevelPoints;

  // Add to recent activity
  state.recentActivity.unshift({
    id: Date.now().toString(),
    title: actionTitle,
    points: totalPointsEarned,
    timestamp: new Date().toISOString()
  });

  if (state.recentActivity.length > 25) {
    state.recentActivity = state.recentActivity.slice(0, 25);
  }

  saveScoreState(state);

  return {
    newPoints: state.points,
    pointsEarned: totalPointsEarned,
    unlockedAchievements: newlyUnlocked,
    message: newlyUnlocked.length > 0 
      ? `כל הכבוד! צברת +${totalPointsEarned} נק' ונפתח הישג: "${newlyUnlocked[0].title}"! 🏆`
      : `+${totalPointsEarned} נקודות נוספו לחשבונך! ⭐`
  };
}

export function claimChallengeReward(challengeId: string): { success: boolean; points: number } {
  const state = getScoreState();
  if (state.claimedChallenges.includes(challengeId)) {
    return { success: false, points: 0 };
  }

  const challenges = getActiveChallenges(state);
  const targetChallenge = challenges.find(c => c.id === challengeId);
  if (!targetChallenge || !targetChallenge.isCompleted) {
    return { success: false, points: 0 };
  }

  state.claimedChallenges.push(challengeId);
  state.points += targetChallenge.points;

  const lvl = calculateLevel(state.points);
  state.level = lvl.level;
  state.levelTitle = lvl.levelTitle;
  state.levelProgress = lvl.levelProgress;
  state.nextLevelPoints = lvl.nextLevelPoints;

  state.recentActivity.unshift({
    id: Date.now().toString(),
    title: `השלמת אתגר: ${targetChallenge.title}`,
    points: targetChallenge.points,
    timestamp: new Date().toISOString()
  });

  saveScoreState(state);
  return { success: true, points: targetChallenge.points };
}
