const fs = require('fs');
let code = fs.readFileSync('src/components/InsightsDashboard.tsx', 'utf8');

const importRechartsRegex = /import \{ PieChart([^}]+)\} from 'recharts';/;
code = code.replace(importRechartsRegex, "import { PieChart$1, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';");

const newImports = "import { Star } from 'lucide-react';\n";
if (!code.includes('import { Star } from')) {
    code = code.replace("import { motion", newImports + "import { motion");
}

const radarCode = `
  const radarData = useMemo(() => {
    // Generate some meaningful metrics from prompt data
    let avgSuccess = 0;
    let avgLength = 0;
    let avgTags = 0;
    let completionQuality = 0;
    
    if (prompts.length > 0) {
      avgSuccess = prompts.reduce((acc, p) => acc + (p.successRating || 3), 0) / prompts.length;
      avgLength = Math.min(100, (prompts.reduce((acc, p) => acc + (p.content?.length || 0), 0) / prompts.length) / 10);
      avgTags = Math.min(100, (prompts.reduce((acc, p) => acc + (p.tags?.length || 0), 0) / prompts.length) * 20);
      completionQuality = prompts.reduce((acc, p) => acc + (p.exampleOutput ? 100 : 0) + (p.notes ? 100 : 0), 0) / (prompts.length * 2);
    }
    
    return [
      { subject: 'דירוג הצלחה', A: (avgSuccess / 5) * 100, fullMark: 100 },
      { subject: 'איכות השלמה', A: completionQuality, fullMark: 100 },
      { subject: 'אורך ממוצע', A: avgLength, fullMark: 100 },
      { subject: 'עושר תגיות', A: avgTags, fullMark: 100 },
      { subject: 'שימוש חוזר', A: Math.min(100, avgUsage * 10), fullMark: 100 },
    ];
  }, [prompts, avgUsage]);
`;

code = code.replace('return (', radarCode + '\n  return (');

const radarUI = `
        {/* Prompt Quality Radar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-white dark:bg-[#151515] border border-slate-200 dark:border-white/5 p-6 md:p-8 rounded-3xl h-[400px] flex flex-col shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">איכות ואפקטיביות</h3>
            <Star className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex-1 min-h-0 relative" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(100,116,139,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} />
                <Radar name="Quality" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    backgroundColor: 'rgba(15,15,15,0.95)',
                    color: '#fff',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                    textAlign: 'right' 
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
`;

code = code.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">',
  '<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">'
);
code = code.replace(
  '        {/* Folder Distribution */}',
  radarUI + '\n        {/* Folder Distribution */}'
);

fs.writeFileSync('src/components/InsightsDashboard.tsx', code);
