const fs = require('fs');

function patchPolling(filePath, fetchFnName) {
  let c = fs.readFileSync(filePath, 'utf8');
  // Find useEffect(() => { fetchFnName(); }, []);
  const regex = new RegExp(`useEffect\\(\\(\\) => \\{\\s*${fetchFnName}\\(\\);\\s*\\}, \\[\\]\\);`);
  const replacement = `useEffect(() => {
    ${fetchFnName}();
    const interval = setInterval(${fetchFnName}, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);`;
  
  if (c.match(regex)) {
    c = c.replace(regex, replacement);
    fs.writeFileSync(filePath, c, 'utf8');
    console.log(`Patched ${filePath}`);
  } else {
    // Maybe it has other things in useEffect, let's search for fetchFnName(); inside useEffect
    console.log(`Could not find exact match in ${filePath}`);
  }
}

patchPolling('src/pages/DashboardPage.jsx', 'fetchData');
patchPolling('src/pages/TasksPage.jsx', 'fetchTasks');
patchPolling('src/pages/NotesPage.jsx', 'fetchNotes');
patchPolling('src/pages/CalendarPage.jsx', 'fetchEvents');
patchPolling('src/contexts/NotificationContext.jsx', 'fetchNotifications');

