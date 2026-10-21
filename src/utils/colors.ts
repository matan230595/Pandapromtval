export function getTagColor(tag: string): { bg: string; text: string; border: string; category?: string } {
  const clean = tag.toLowerCase().trim();

  // 1. Development & Code
  if (/^(קוד|פיתוח|תכנות|react|python|javascript|typescript|api|sql|backend|frontend|dev|html|css|bug|fix|git|docker)/i.test(clean)) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-200 dark:border-emerald-800/40',
      category: 'code'
    };
  }

  // 2. Marketing, SEO & Sales
  if (/^(שיווק|מכירות|פרסום|קופי|seo|ads|marketing|sales|copywriting|leads|funnel|email|social|facebook|linkedin)/i.test(clean)) {
    return {
      bg: 'bg-teal-50 dark:bg-teal-950/40',
      text: 'text-teal-700 dark:text-teal-300',
      border: 'border-teal-200 dark:border-teal-800/40',
      category: 'marketing'
    };
  }

  // 3. Creative, Writing & Content
  if (/^(כתיבה|בלוג|תוכן|סיפור|מאמר|עריכה|תרגום|writing|content|blog|story|article|novel|poem)/i.test(clean)) {
    return {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800/40',
      category: 'writing'
    };
  }

  // 4. AI Art & Visuals
  if (/^(תמונות|ציור|עיצוב|midjourney|dall-e|flux|art|image|design|photo|render|logo|ui|ux)/i.test(clean)) {
    return {
      bg: 'bg-pink-50 dark:bg-pink-950/40',
      text: 'text-pink-700 dark:text-pink-300',
      border: 'border-pink-200 dark:border-pink-800/40',
      category: 'design'
    };
  }

  // 5. Productivity, Business & Operations
  if (/^(ניהול|עסקים|פרודוקטיביות|משימות|אסטרטגיה|business|productivity|ops|agile|scrum|meeting|strategy|finance)/i.test(clean)) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-700 dark:text-amber-300',
      border: 'border-amber-200 dark:border-amber-800/40',
      category: 'productivity'
    };
  }

  // Fallback hash-based palette
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
    { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40' },
    { bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-700 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800/40' },
    { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40' },
    { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800/40' },
  ];
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
