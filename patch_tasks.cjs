const fs = require('fs');
let c = fs.readFileSync('src/pages/TasksPage.jsx', 'utf8');

if (!c.includes('playDing')) {
  c = c.replace(/import \{ Plus, X, ArrowLeft, ArrowRight, Trash2, Calendar, User \} from 'lucide-react';/, "import { Plus, X, ArrowLeft, ArrowRight, Trash2, Calendar, User, CheckCircle2 } from 'lucide-react';\nimport { playDing } from '../utils/sounds';");

  c = c.replace(/const updateTaskStatus = async \(id, currentStatus, direction\) => \{/, "const updateTaskStatus = async (id, currentStatus, direction) => {\n    const statuses = ['todo', 'in_progress', 'done'];\n    const newStatus = statuses[statuses.indexOf(currentStatus) + direction];\n    if (newStatus === 'done') playDing();");

  const checkmarkHtml = `                <h3 className="font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">\n                  {task.title}\n                  {task.status === 'done' && (\n                    <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', damping: 12, stiffness: 200 }}>\n                      <CheckCircle2 className="w-5 h-5 text-[var(--success)]" />\n                    </motion.div>\n                  )}\n                </h3>`;
  
  c = c.replace(/<h3 className="font-bold text-\[var\(--text-primary\)\] mb-1">\{task\.title\}<\/h3>/, checkmarkHtml);
  
  // Fix corrupted Polish characters in TasksPage.jsx just in case
  c = c.replace(/redni/g, 'Średni');
  c = c.replace(/Tytu/g, 'Tytuł');
  c = c.replace(/zrobi/g, 'zrobić');
  c = c.replace(/Usu/g, 'Usuń');
  c = c.replace(/usun/g, 'usunąć');
  c = c.replace(/mona/g, 'można');
  c = c.replace(/cofn/g, 'cofnąć');

  fs.writeFileSync('src/pages/TasksPage.jsx', c, 'utf8');
}
