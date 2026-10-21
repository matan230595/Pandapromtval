const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const notifCode = `
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const checkDueDates = () => {
      if ("Notification" in window && Notification.permission === "granted") {
        const notified = JSON.parse(localStorage.getItem('notified_prompts') || '{}');
        const now = new Date();
        
        prompts.forEach(p => {
          if (p.dueDate) {
            const dueDate = new Date(p.dueDate);
            if (dueDate <= now && !notified[p.id]) {
              new Notification("תזכורת: פרומפט דורש טיפול", {
                body: p.title,
                icon: "/logo.png"
              });
              notified[p.id] = true;
            }
          }
        });
        localStorage.setItem('notified_prompts', JSON.stringify(notified));
      }
    };

    checkDueDates();
    const interval = setInterval(checkDueDates, 60000);
    return () => clearInterval(interval);
  }, [prompts]);
`;

code = code.replace(
  '  useEffect(() => {\n    if (user) {',
  notifCode + '\n  useEffect(() => {\n    if (user) {'
);

fs.writeFileSync('src/App.tsx', code);
