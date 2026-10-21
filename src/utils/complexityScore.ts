export interface ComplexityBreakdown {
  score: number; // 1 to 10
  label: string;
  level: 'beginner' | 'moderate' | 'advanced' | 'master';
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    bar: string;
  };
  metrics: {
    lengthScore: number; // 1-10
    variablesScore: number; // 1-10
    structureScore: number; // 1-10
    wordCount: number;
    variablesCount: number;
    sectionsCount: number;
  };
  features: {
    hasRole: boolean;
    hasVariables: boolean;
    hasOutputFormat: boolean;
    hasDelimitersOrCode: boolean;
    hasInstructionsList: boolean;
    hasNegativeConstraints: boolean;
  };
  suggestions: string[];
}

export function calculatePromptComplexity(content: string, title?: string): ComplexityBreakdown {
  const text = (content || '').trim();
  if (!text) {
    return {
      score: 1,
      label: 'ריק / ללא תוכן',
      level: 'beginner',
      color: {
        bg: 'bg-slate-100 dark:bg-white/5',
        text: 'text-slate-500',
        border: 'border-slate-200 dark:border-white/10',
        badge: 'bg-slate-200 dark:bg-white/10 text-slate-600',
        bar: 'bg-slate-400',
      },
      metrics: {
        lengthScore: 1,
        variablesScore: 1,
        structureScore: 1,
        wordCount: 0,
        variablesCount: 0,
        sectionsCount: 0,
      },
      features: {
        hasRole: false,
        hasVariables: false,
        hasOutputFormat: false,
        hasDelimitersOrCode: false,
        hasInstructionsList: false,
        hasNegativeConstraints: false,
      },
      suggestions: ['הזן תוכן לפרומפט כדי לחשב את רמת המורכבות.'],
    };
  }

  // 1. Length & Token density analysis
  const words = text.match(/\S+/g) || [];
  const wordCount = words.length;
  let lengthScore = 1;
  if (wordCount >= 180) lengthScore = 10;
  else if (wordCount >= 120) lengthScore = 9;
  else if (wordCount >= 80) lengthScore = 8;
  else if (wordCount >= 50) lengthScore = 7;
  else if (wordCount >= 35) lengthScore = 6;
  else if (wordCount >= 20) lengthScore = 5;
  else if (wordCount >= 12) lengthScore = 4;
  else if (wordCount >= 7) lengthScore = 3;
  else lengthScore = 2;

  // 2. Variables & Dynamic Placeholders
  const varMatches = text.match(/\$\([a-zA-Z0-9_\u0590-\u05fe\s]+\)|\{\{[a-zA-Z0-9_\u0590-\u05fe\s]+\}\}|\[[A-Z0-9_]{2,}\]/g) || [];
  const uniqueVars = Array.from(new Set(varMatches));
  const variablesCount = uniqueVars.length;
  let variablesScore = 2;
  if (variablesCount >= 4) variablesScore = 10;
  else if (variablesCount === 3) variablesScore = 8.5;
  else if (variablesCount === 2) variablesScore = 7;
  else if (variablesCount === 1) variablesScore = 5;
  else variablesScore = 2;

  // 3. Structural Depth & Instructions
  const hasRole = /(אתה\s+(מומחה|מהנדס|כותב|יועץ|עוזר|איש|פסיכולוג|עורך)|תפקידך|פעל\s+כ|הגדרת\s+תפקיד|act\s+as|you\s+are\s+a|role:)/i.test(text);
  const hasOutputFormat = /(פורמט|פלט|json|markdown|טבלה|טבלאות|רשימה|סעיפים|במבנה\s+הבא|table|output\s+format|structure)/i.test(text);
  const hasDelimitersOrCode = /(```|"""|###|==|<prompt>|<context>|\$\([A-Z_]+\))/i.test(text);
  const hasInstructionsList = /^\s*([0-9]+\.|\-|\*)\s+/m.test(text);
  const hasNegativeConstraints = /(אל\s+ת|ללא\s+|אל\s+תוסיף|הימנע\s+מ|do\s+not|avoid|never|without)/i.test(text);

  const sections = text.split(/\n\s*\n/).filter(s => s.trim().length > 0);
  const sectionsCount = sections.length;

  let structureScore = 2;
  let structuralFeaturesCount = 0;
  if (hasRole) structuralFeaturesCount++;
  if (hasOutputFormat) structuralFeaturesCount++;
  if (hasDelimitersOrCode) structuralFeaturesCount++;
  if (hasInstructionsList) structuralFeaturesCount++;
  if (hasNegativeConstraints) structuralFeaturesCount++;
  if (sectionsCount >= 3) structuralFeaturesCount++;

  if (structuralFeaturesCount >= 5) structureScore = 10;
  else if (structuralFeaturesCount === 4) structureScore = 8.5;
  else if (structuralFeaturesCount === 3) structureScore = 7;
  else if (structuralFeaturesCount === 2) structureScore = 5.5;
  else if (structuralFeaturesCount === 1) structureScore = 4;
  else structureScore = 2.5;

  // Weighted Total Score (1 - 10)
  const weighted = (lengthScore * 0.3) + (variablesScore * 0.35) + (structureScore * 0.35);
  const finalScore = Math.max(1, Math.min(10, Math.round(weighted * 10) / 10));

  // Determine Level & Styling
  let level: ComplexityBreakdown['level'] = 'beginner';
  let label = 'פשוט ובסיסי';
  let color = {
    bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/25 dark:border-emerald-800/40',
    badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300',
    bar: 'bg-emerald-500',
  };

  if (finalScore >= 8.0) {
    level = 'master';
    label = 'מומחה ומתוחכם';
    color = {
      bg: 'bg-purple-500/10 dark:bg-purple-950/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500/25 dark:border-purple-800/40',
      badge: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
      bar: 'bg-gradient-to-r from-indigo-500 to-purple-600',
    };
  } else if (finalScore >= 6.0) {
    level = 'advanced';
    label = 'מתקדם ורב-שלבי';
    color = {
      bg: 'bg-blue-500/10 dark:bg-blue-950/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-500/25 dark:border-blue-800/40',
      badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
      bar: 'bg-blue-500',
    };
  } else if (finalScore >= 4.0) {
    level = 'moderate';
    label = 'מאוזן ומובנה';
    color = {
      bg: 'bg-amber-500/10 dark:bg-amber-950/30',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-500/25 dark:border-amber-800/40',
      badge: 'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300',
      bar: 'bg-amber-500',
    };
  }

  // Generate actionable optimization suggestions in Hebrew
  const suggestions: string[] = [];
  if (!hasRole) {
    suggestions.push('הגדר פרסונה ברורה (למשל: "אתה מומחה בכיר ל...") להעלאת דיוק התשובות.');
  }
  if (variablesCount === 0) {
    suggestions.push('הוסף משתנים דינמיים כגון $(נושא) או $(טקסט) כדי להפוך את הפרומפט לתבנית רב-פעמית.');
  }
  if (!hasOutputFormat) {
    suggestions.push('הגדר אילוצי פלט מפורשים (למשל: "החזר בפורמט Markdown עם טבלה וסעיפים").');
  }
  if (!hasDelimitersOrCode) {
    suggestions.push('השתמש בתוחמים מובלטים (``` או """) כדי להפריד בין ההוראות למידע המשתמש.');
  }
  if (!hasNegativeConstraints) {
    suggestions.push('הגדר סייגים שליליים (למשל: "אל תמציא עובדות", "הימנע ממבואות מיותרים").');
  }
  if (wordCount < 25) {
    suggestions.push('הרחב מעט את פירוט ההקשר ושלבי הביצוע להפחתת עמימות התוצאה.');
  }
  if (suggestions.length === 0) {
    suggestions.push('פרומפט מובנה ומלוטש ברמה הגבוהה ביותר! עומד בכל תקני ההנדסה המתקדמים.');
  }

  return {
    score: finalScore,
    label,
    level,
    color,
    metrics: {
      lengthScore: Math.round(lengthScore * 10) / 10,
      variablesScore: Math.round(variablesScore * 10) / 10,
      structureScore: Math.round(structureScore * 10) / 10,
      wordCount,
      variablesCount,
      sectionsCount,
    },
    features: {
      hasRole,
      hasVariables: variablesCount > 0,
      hasOutputFormat,
      hasDelimitersOrCode,
      hasInstructionsList,
      hasNegativeConstraints,
    },
    suggestions,
  };
}
