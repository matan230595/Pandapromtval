const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

const calcLogic = `
  const heatmapData = useMemo(() => {
    const dataMap: Record<string, number> = {};
    prompts.forEach(p => {
      (p.usageHistory || []).forEach(iso => {
        const d = new Date(iso);
        const day = d.getDay();
        const hour = d.getHours();
        const key = \`\${day}-\${hour}\`;
        dataMap[key] = (dataMap[key] || 0) + 1;
      });
    });
    const result = [];
    for(let day=0; day<7; day++) {
      for(let hour=0; hour<24; hour++) {
        const val = dataMap[\`\${day}-\${hour}\`];
        if (val) {
          result.push({ day, hour, value: val });
        }
      }
    }
    return result;
  }, [prompts]);
`;

code = code.replace(
  'const timeSaved = useMemo(() => {',
  calcLogic + '\n  const timeSaved = useMemo(() => {'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
