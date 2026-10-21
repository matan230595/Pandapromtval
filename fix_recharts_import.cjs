const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  "import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid } from 'recharts';",
  "import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid, ScatterChart, Scatter, ZAxis } from 'recharts';"
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
