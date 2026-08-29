const fs = require('fs');

// TasksPage
let t = fs.readFileSync('src/pages/TasksPage.jsx', 'utf8');
t = t.replace('<h1 className="text-3xl font-bold text-[var(--text-primary)]">Zadania</h1>', '<h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3"><motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}><CheckSquare className="w-8 h-8 text-[var(--accent)]" /></motion.div>Zadania</h1>');
if (!t.includes('CheckSquare')) {
  t = t.replace(/CheckCircle2 \} from 'lucide-react';/, "CheckCircle2, CheckSquare } from 'lucide-react';");
}
fs.writeFileSync('src/pages/TasksPage.jsx', t, 'utf8');

// CalendarPage
let c = fs.readFileSync('src/pages/CalendarPage.jsx', 'utf8');
c = c.replace('<h1 className="text-3xl font-bold text-[var(--text-primary)]">Kalendarz</h1>', '<h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3"><motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}><Calendar className="w-8 h-8 text-[var(--accent)]" /></motion.div>Kalendarz</h1>');
if (!c.includes('Calendar {') && !c.includes('Calendar,')) {
  c = c.replace(/Trash2 \} from 'lucide-react';/, "Trash2, Calendar } from 'lucide-react';");
}
fs.writeFileSync('src/pages/CalendarPage.jsx', c, 'utf8');

// NotesPage
let n = fs.readFileSync('src/pages/NotesPage.jsx', 'utf8');
n = n.replace('<h1 className="text-3xl font-bold text-[var(--text-primary)]">Notatki</h1>', '<h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3"><motion.div animate={{ rotate: [0, 5, 0, -5, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}><PenLine className="w-8 h-8 text-[var(--accent)]" /></motion.div>Notatki</h1>');
if (!n.includes('PenLine')) {
  n = n.replace(/User \} from 'lucide-react';/, "User, PenLine } from 'lucide-react';");
}
fs.writeFileSync('src/pages/NotesPage.jsx', n, 'utf8');

// DashboardPage
let d = fs.readFileSync('src/pages/DashboardPage.jsx', 'utf8');
d = d.replace(/\{\/\* Szybkie akcje \*\/\}/, '/* removed old quick actions */ {');
d = d.replace(/<div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">[\s\S]*?<\/div>\n\s*\{\/\* Statystyki \*\/\}/, '{/* Statystyki */}');
fs.writeFileSync('src/pages/DashboardPage.jsx', d, 'utf8');

// BottomDock
let dock = fs.readFileSync('src/components/BottomDock.jsx', 'utf8');
dock = dock.replace(/rotateY: \[0, 180, 360\]/, 'scale: [1, 1.15, 1]');
dock = dock.replace(/rotate: \[0, -10, 10, -10, 0\]/, 'scale: [1, 1.15, 1]');
dock = dock.replace(/y: \[0, -5, 0\]/, 'scale: [1, 1.15, 1]');
fs.writeFileSync('src/components/BottomDock.jsx', dock, 'utf8');
