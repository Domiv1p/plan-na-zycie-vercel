const fs = require('fs');
let t = fs.readFileSync('src/pages/TasksPage.jsx', 'utf8');
t = t.replace(/import \{ Plus, X, ArrowLeft, ArrowRight, Trash2, Calendar, User, CheckCircle2 \} from 'lucide-react';/, "import { Plus, X, ArrowLeft, ArrowRight, Trash2, Calendar, User, CheckCircle2, CheckSquare } from 'lucide-react';");
fs.writeFileSync('src/pages/TasksPage.jsx', t, 'utf8');

let n = fs.readFileSync('src/pages/NotesPage.jsx', 'utf8');
n = n.replace(/import \{ Plus, X, Trash2, Edit \} from 'lucide-react';/, "import { Plus, X, Trash2, Edit, PenLine } from 'lucide-react';");
fs.writeFileSync('src/pages/NotesPage.jsx', n, 'utf8');
