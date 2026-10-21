const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /useEffect\(\(\) => \{\s*document.documentElement.classList.remove\('light', 'dark'\);/;
const replacement = `
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    const checkDueDates = () => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date();
        now.setHours(0,0,0,0); // compare by day
        const notifiedPrompts = JSON.parse(localStorage.getItem('notifiedPrompts') || '[]');
        let updated = false;
        
        prompts.forEach(p => {
          if (p.dueDate && !notifiedPrompts.includes(p.id)) {
            const dueDate = new Date(p.dueDate);
            dueDate.setHours(0,0,0,0);
            
            if (now >= dueDate) {
              new Notification('תזכורת לפרומפט!', {
                body: \`הפרומפט "\${p.title}" הגיע לתאריך היעד שלו.\`
              });
              notifiedPrompts.push(p.id);
              updated = true;
            }
          }
        });
        if (updated) {
          localStorage.setItem('notifiedPrompts', JSON.stringify(notifiedPrompts));
        }
      }
    };
    checkDueDates();
    const interval = setInterval(checkDueDates, 60000);
    return () => clearInterval(interval);
  }, [prompts]);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/App.tsx', code);
