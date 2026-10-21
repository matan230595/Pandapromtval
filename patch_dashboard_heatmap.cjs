const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

if (!code.includes('ScatterChart')) {
  code = code.replace(
    'import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";',
    'import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ScatterChart, Scatter, ZAxis } from "recharts";'
  );
}

const heatmapComponent = `
      {/* Usage Heatmap */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" /> מפת חום - פעילות לאורך השבוע
        </h3>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="hour" name="שעה" unit=":00" domain={[0, 23]} tickCount={24} tick={{ fontSize: 10, fill: '#888' }} axisLine={false} tickLine={false} />
              <YAxis type="number" dataKey="day" name="יום" domain={[0, 6]} tickCount={7} tickFormatter={(val) => ['א','ב','ג','ד','ה','ו','ש'][val]} tick={{ fontSize: 12, fill: '#888' }} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="value" range={[20, 400]} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                formatter={(value: number, name: string, props: any) => {
                  return [\`\${value} שימושים\`, \`יום \${['א','ב','ג','ד','ה','ו','ש'][props.payload.day]} שעה \${props.payload.hour}:00\`];
                }}
              />
              <Scatter data={heatmapData} fill="#f43f5e" shape="circle" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
`;

// Now let's calculate heatmapData before the return statement.
const calcLogic = `
  // Heatmap Data calculation
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
  'const totalUses = prompts.reduce((sum, p) => sum + (p.useCount || 0), 0);',
  'const totalUses = prompts.reduce((sum, p) => sum + (p.useCount || 0), 0);\n' + calcLogic
);

code = code.replace(
  '{/* Mini Stats */}',
  heatmapComponent + '\n      {/* Mini Stats */}'
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
