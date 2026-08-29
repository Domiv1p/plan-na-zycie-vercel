const fs = require('fs');
let c = fs.readFileSync('src/pages/CalendarPage.jsx', 'utf8');

if (!c.includes('playPop')) {
  c = c.replace(/import \{ ChevronLeft, ChevronRight, Plus, X, Clock, Edit2, Trash2 \} from 'lucide-react';/, "import { ChevronLeft, ChevronRight, Plus, X, Clock, Edit2, Trash2 } from 'lucide-react';\nimport { playPop, playPlum } from '../utils/sounds';");

  c = c.replace(/const handleDayClick = \(day\) => \{/, "const handleDayClick = (day) => {\n    playPop();");
  c = c.replace(/const handleSaveEvent = async \(e\) => \{/, "const handleSaveEvent = async (e) => {\n    playPlum();");

  const animatedRing = `                  <span className=\"text-sm sm:text-base z-10\">{format(day, dateFormat)}</span>
                  {isSelected && (
                    <motion.div 
                      layoutId=\"selectedDayRing\"
                      className=\"absolute inset-0 border-2 border-red-500 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.5)] z-0\"
                      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    />
                  )}`;
  
  c = c.replace(/<span className=\"text-sm sm:text-base\">\{format\(day, dateFormat\)\}<\/span>/, animatedRing);
  
  c = c.replace(/border-2 border-\[var\(--accent\)\] shadow-\[0_0_10px_var\(--accent-dim\)\\]/, 'bg-[var(--glass-bg)]');

  // Fix Polish
  c = c.replace(/Usu/g, 'Usuń');
  c = c.replace(/usun/g, 'usunąć');

  fs.writeFileSync('src/pages/CalendarPage.jsx', c, 'utf8');
}
