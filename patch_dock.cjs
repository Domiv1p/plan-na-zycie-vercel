const fs = require('fs');
let c = fs.readFileSync('src/components/BottomDock.jsx', 'utf8');

const navItemsReplacement = `const navItems = [
  { 
    id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: BarChart3, 
    activeAnimation: { 
      y: [0, -4, 0], scale: [1, 1.15, 1], rotate: [0, -5, 5, 0],
      transition: { repeat: Infinity, duration: 2, ease: "easeInOut" } 
    } 
  },
  { 
    id: 'calendar', path: '/calendar', label: 'Kalendarz', icon: CalendarDays, 
    activeAnimation: { 
      rotateY: [0, 180, 360], scale: [1, 0.85, 1],
      transition: { repeat: Infinity, duration: 3, ease: "easeInOut" } 
    } 
  },
  { 
    id: 'tasks', path: '/tasks', label: 'Zadania', icon: CheckSquare, 
    activeAnimation: { 
      scale: [1, 1.25, 0.9, 1.05, 1], rotate: [0, -12, 12, -5, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 0.5 } 
    } 
  },
  { 
    id: 'notes', path: '/notes', label: 'Notatki', icon: PenLine, 
    activeAnimation: { 
      x: [0, 3, -2, 4, -1, 0], y: [0, -3, 2, -1, 1, 0], rotate: [0, 15, -10, 12, -5, 0],
      transition: { repeat: Infinity, duration: 2.5, ease: "easeInOut" } 
    } 
  },
  { 
    id: 'settings', path: '/settings', label: 'Ustawienia', icon: Settings, 
    activeAnimation: { 
      rotate: [0, 90, 180, 270, 360], scale: [1, 1.1, 1, 1.1, 1],
      transition: { repeat: Infinity, duration: 4, ease: "linear" } 
    } 
  },
];`;

c = c.replace(/const navItems = \([\s\S]*?\];/m, navItemsReplacement);
// Wait, my regex might fail if it's not a multiline match. Let's use a more robust replace.
const oldNavItemsStart = c.indexOf('const navItems = [');
const oldNavItemsEnd = c.indexOf('];', oldNavItemsStart) + 2;
c = c.slice(0, oldNavItemsStart) + navItemsReplacement + c.slice(oldNavItemsEnd);

fs.writeFileSync('src/components/BottomDock.jsx', c, 'utf8');
