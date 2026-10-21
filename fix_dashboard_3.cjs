const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  'Calendar, Bot, BarChart2 } from \'lucide-react\';',
  'Calendar, Bot, BarChart as BarChart2 } from \'lucide-react\';' // actually we just need BarChart from lucide-react? The icon is BarChart2 in lucide-react. Let me check if BarChart2 is available.
);

if (!code.includes('import { Plus, Clock, Heart, ArrowLeft, Terminal, TrendingUp, Star, Zap, Search, Activity, Calendar, Bot, BarChart2 } from \'lucide-react\';')) {
   code = code.replace(
      'Calendar, Bot } from \'lucide-react\';',
      'Calendar, Bot, BarChart2 } from \'lucide-react\';'
   )
}

// wait, the error was "Cannot find name 'BarChart2'". 
// Let's just import it from lucide-react properly
const regex = /import \{[\s\S]*?\} from 'lucide-react';/;
code = code.replace(regex, (match) => {
   if (!match.includes('BarChart2')) {
      return match.replace('} from', ', BarChart2 } from');
   }
   return match;
});

fs.writeFileSync('src/components/DashboardView.tsx', code);
