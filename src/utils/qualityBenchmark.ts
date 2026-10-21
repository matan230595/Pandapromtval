/**
 * Prompt Quality Benchmark & Stability Score (Prompt-as-Code Evaluation)
 */

export interface BenchmarkResult {
  score: number; // 0 - 100
  level: 'מעולה (Production Grade)' | 'טוב מאוד (Solid)' | 'בינוני (Needs Polish)' | 'בסיסי (Draft)';
  color: string;
  rolePresent: boolean;
  variablesCount: number;
  extractedVariables: string[];
  constraintsPresent: boolean;
  outputFormatPresent: boolean;
  fewShotCount: number;
  suggestions: string[];
}

export function evaluatePromptQuality(content: string, fewShotExamplesCount = 0): BenchmarkResult {
  if (!content || !content.trim()) {
    return {
      score: 0,
      level: 'בסיסי (Draft)',
      color: 'text-slate-400',
      rolePresent: false,
      variablesCount: 0,
      extractedVariables: [],
      constraintsPresent: false,
      outputFormatPresent: false,
      fewShotCount: 0,
      suggestions: ['הכנס תוכן לפרומפט כדי להתחיל בהערכת איכות.']
    };
  }

  const text = content.toLowerCase();
  let score = 20; // base score
  const suggestions: string[] = [];

  // 1. Role / Persona Check (+25 pts)
  const roleRegex = /(אתה|פעל כ|הנך|הגדר את עצמך|act as|you are|role:|system:|as a senior|as an expert|expert in|specialist)/i;
  const rolePresent = roleRegex.test(content);
  if (rolePresent) {
    score += 25;
  } else {
    suggestions.push('הגדר תפקיד ברור למודל (למשל: "אתה מהנדס תוכנה בכיר..." או "Act as a marketing strategist").');
  }

  // 2. Input Variables in {{...}} (+15 pts)
  const varMatches = content.match(/\{\{([a-zA-Z0-9_\u0590-\u05FF\s]+)\}\}/g) || [];
  const extractedVariables = Array.from(new Set(varMatches.map(v => v.replace(/[{}]/g, '').trim())));
  const variablesCount = extractedVariables.length;
  if (variablesCount > 0) {
    score += 15;
  } else {
    suggestions.push('הוסף משתנים דינמיים בתבנית {{variable_name}} כדי להפוך את הפרומפט לרב-פעמי.');
  }

  // 3. Clear Output Format Specification (+20 pts)
  const formatRegex = /(פורמט|פלט|json|markdown|טבלה|טבלאות|רשימה|סעיפים|output format|in json|return a table|bullet points|schema)/i;
  const outputFormatPresent = formatRegex.test(content);
  if (outputFormatPresent) {
    score += 20;
  } else {
    suggestions.push('ציין מבנה פלט מבוקש (למשל: "החזר תשובה במבנה JSON" או "הצג כטבלת Markdown").');
  }

  // 4. Negative Constraints / Guardrails (+15 pts)
  const constraintRegex = /(אל ת|ללא|הימנע מ|אל תמציא|הגבל|do not|never|avoid|without|do not invent|exclude|strictly|constraint)/i;
  const constraintsPresent = constraintRegex.test(content);
  if (constraintsPresent) {
    score += 15;
  } else {
    suggestions.push('הגדר מגבלות שליליות למניעת הזיות (למשל: "אל תמציא עובדות שלא הוזכרו", "ללא הקדמות מיותרות").');
  }

  // 5. Few-Shot Examples (+10 pts)
  const fewShotInTextRegex = /(דוגמה:|קלט:|פלט:|example:|input:|output:|sample:)/i;
  const hasFewShotInText = fewShotInTextRegex.test(content);
  const totalFewShot = Math.max(fewShotExamplesCount, hasFewShotInText ? 1 : 0);
  if (totalFewShot > 0) {
    score += 10;
  } else {
    suggestions.push('הוסף דוגמה אחת לפחות (Few-Shot Demonstration) לקלט ופלט לדוגמה כדי לייצב את התוצאה.');
  }

  // Length and depth check (+5 pts)
  if (content.length > 120) {
    score += 5;
  }

  const finalScore = Math.min(100, Math.max(10, score));

  let level: BenchmarkResult['level'] = 'בסיסי (Draft)';
  let color = 'text-red-500';

  if (finalScore >= 85) {
    level = 'מעולה (Production Grade)';
    color = 'text-emerald-500';
  } else if (finalScore >= 65) {
    level = 'טוב מאוד (Solid)';
    color = 'text-blue-500';
  } else if (finalScore >= 45) {
    level = 'בינוני (Needs Polish)';
    color = 'text-amber-500';
  }

  return {
    score: finalScore,
    level,
    color,
    rolePresent,
    variablesCount,
    extractedVariables,
    constraintsPresent,
    outputFormatPresent,
    fewShotCount: totalFewShot,
    suggestions
  };
}
