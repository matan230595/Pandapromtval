export function detectLanguage(text: string): 'he' | 'en' {
  if (!text) return 'he';
  const hebrewChars = text.match(/[\u0590-\u05FF]/g);
  const englishChars = text.match(/[a-zA-Z]/g);
  const heCount = hebrewChars ? hebrewChars.length : 0;
  const enCount = englishChars ? englishChars.length : 0;
  return heCount >= enCount ? 'he' : 'en';
}

export function getLanguageFlag(lang: 'he' | 'en'): string {
  return lang === 'he' ? '🇮🇱' : '🇺🇸';
}
