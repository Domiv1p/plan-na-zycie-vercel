const fs = require('fs');

let cal = fs.readFileSync('src/pages/CalendarPage.jsx', 'utf8');
cal = cal.replace(/useEffect\(\(\) => \{\s*fetchEvents\(\);\s*\}, \[currentMonth\]\);/, `useEffect(() => {\n    fetchEvents();\n    const interval = setInterval(fetchEvents, 10000);\n    return () => clearInterval(interval);\n  }, [currentMonth]);`);
fs.writeFileSync('src/pages/CalendarPage.jsx', cal, 'utf8');

let notif = fs.readFileSync('src/contexts/NotificationContext.jsx', 'utf8');
notif = notif.replace(/setInterval\(fetchNotifications, 30000\)/, 'setInterval(fetchNotifications, 10000)');
fs.writeFileSync('src/contexts/NotificationContext.jsx', notif, 'utf8');
