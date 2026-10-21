const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

if (!code.includes('BarChart')) {
  code = code.replace(
    "import { motion } from 'motion/react';",
    "import { motion } from 'motion/react';\nimport { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';"
  );
}

// Data prep for chart
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

if (!code.includes('platformUsageData')) {
  code = code.replace(
    "const totalUses = prompts.reduce((acc, p) => acc + (p.useCount || 0), 0);",
    "const totalUses = prompts.reduce((acc, p) => acc + (p.useCount || 0), 0);\n" + chartDataHTML
  );
}

// Chart render HTML
const chartHTML = `
      {/* Platform Usage Bar Chart */}
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-indigo-500" /> שימוש לפי פלטפורמות AI (Top 5)
        </h3>
        <div className="h-64 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformUsageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" opacity={0.1} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" name="שימושים" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
`;

code = code.replace(
  '      {/* Mini Stats */}',
  chartHTML + '\n      {/* Mini Stats */}'
);

if (!code.includes('BarChart2')) {
  code = code.replace(
    "Calendar, Bot } from 'lucide-react';",
    "Calendar, Bot, BarChart2 } from 'lucide-react';"
  );
}

fs.writeFileSync('src/components/DashboardView.tsx', code);
