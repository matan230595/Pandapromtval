const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import { onAuthStateChanged, User } from "firebase/auth";`,
  `import { onAuthStateChanged, User } from "firebase/auth";\nimport { Language, getTranslation } from "./i18n";`
);

const stateInsert = `
  const [appLanguage, setAppLanguage] = useState<Language>(() => {
    return (localStorage.getItem("promptvault_lang") as Language) || 'he';
  });

  useEffect(() => {
    document.documentElement.dir = appLanguage === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = appLanguage;
    localStorage.setItem("promptvault_lang", appLanguage);
  }, [appLanguage]);

  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(appLanguage, key);
`;
code = code.replace(/type ThemeMode = 'light' \| 'dark' \| 'system' \| 'scheduled';/, `type ThemeMode = 'light' | 'dark' | 'system' | 'scheduled';` + stateInsert);

fs.writeFileSync('src/App.tsx', code);
