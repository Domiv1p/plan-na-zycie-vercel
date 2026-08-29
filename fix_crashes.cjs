const fs = require('fs');

// TasksPage
let t = fs.readFileSync('src/pages/TasksPage.jsx', 'utf8');
if (!t.includes('CheckSquare')) {
  t = t.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, CheckSquare} from 'lucide-react';");
  fs.writeFileSync('src/pages/TasksPage.jsx', t, 'utf8');
}

// NotesPage
let n = fs.readFileSync('src/pages/NotesPage.jsx', 'utf8');
if (!n.includes('PenLine')) {
  n = n.replace(/import \{([^}]+)\} from 'lucide-react';/, "import {$1, PenLine} from 'lucide-react';");
  fs.writeFileSync('src/pages/NotesPage.jsx', n, 'utf8');
}
