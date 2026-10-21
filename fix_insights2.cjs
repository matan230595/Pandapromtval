const fs = require('fs');
let code = fs.readFileSync('src/components/InsightsDashboard.tsx', 'utf8');

// The original import might have had Layers, Zap, PieChart, Tags, Terminal.
code = code.replace(
  "import { BarChart2, TrendingUp, Hash, FolderOpen, Star, Clock, FileText, ArrowRight, Activity, Calendar } from 'lucide-react';",
  "import { BarChart2, TrendingUp, Hash, FolderOpen, Star, Clock, FileText, ArrowRight, Activity, Calendar, Layers, Zap, PieChart as PieChartIcon, Tags, Terminal } from 'lucide-react';"
);

code = code.replace(
  "import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';",
  "import { LineChart, Line, Tooltip as RechartsTooltip, Legend } from 'recharts';"
);

code = code.replace(
  "import { Star } from 'lucide-react';",
  ""
);

fs.writeFileSync('src/components/InsightsDashboard.tsx', code);
