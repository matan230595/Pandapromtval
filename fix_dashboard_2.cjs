const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const chartDataHTML = `
  const platformUsageData = useMemo(() => {
    const usage: Record<string, number> = {};
    prompts.forEach(p => {
      const pName = p.platform || 'General';
      usage[pName] = (usage[pName] || 0) + (p.useCount || 0);
    });
    return Object.entries(usage)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // top 5
  }, [prompts]);
`;

code = code.replace(
  '  const totalUses = useMemo(() => {',
  chartDataHTML + '\n  const totalUses = useMemo(() => {'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
