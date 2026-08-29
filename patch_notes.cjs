const fs = require('fs');
let c = fs.readFileSync('src/pages/NotesPage.jsx', 'utf8');

if (!c.includes('playPaper')) {
  c = c.replace(/import \{ Plus, X, Trash2, User \} from 'lucide-react';/, "import { Plus, X, Trash2, User } from 'lucide-react';\nimport { playPaper } from '../utils/sounds';");

  c = c.replace(/const handleSaveNote = async \(e\) => \{/, "const handleSaveNote = async (e) => {\n    playPaper();");
  c = c.replace(/const openAddModal = \(\) => \{/, "const openAddModal = () => {\n    playPaper();");

  // Add 3D flip animation to note cards
  c = c.replace(/initial=\{\{ opacity: 0, scale: 0\.9 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} exit=\{\{ opacity: 0, scale: 0\.9 \}\}/, "initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} transition={{ type: 'spring', damping: 15 }} style={{ transformPerspective: 1000 }}");

  // Fix Polish
  c = c.replace(/Usu/g, 'Usuń');
  c = c.replace(/notatk/g, 'notatkę');
  c = c.replace(/usun/g, 'usunąć');
  c = c.replace(/t /g, 'tę '); // tę notatkę

  fs.writeFileSync('src/pages/NotesPage.jsx', c, 'utf8');
}
