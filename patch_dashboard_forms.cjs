const fs = require('fs');
let c = fs.readFileSync('src/pages/DashboardPage.jsx', 'utf8');

const importReplacement = `import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CheckSquare, FileText, Calendar as CalendarIcon, Clock, Plus, X } from 'lucide-react';
import { playPlum, playPop, playPaper } from '../utils/sounds';`;
c = c.replace(/import \{ CheckSquare[\s\S]*?'lucide-react';/, importReplacement);

// Add the separate form states
const statesReplacement = `  const [activeModal, setActiveModal] = useState(null);
  
  // Quick add forms data
  const [taskData, setTaskData] = useState({ title: '', description: '', priority: 'Średni', assigned_to: '', due_date: format(new Date(), 'yyyy-MM-dd') });
  const [eventData, setEventData] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '12:00', reminder: '15 minut przed' });
  const [noteData, setNoteData] = useState({ title: '', content: '', dedication: 'both', color: '#a855f7' });`;
c = c.replace(/const \[activeModal, setActiveModal\] = useState\(null\);[\s\S]*?const \[formData, setFormData\] = useState\(\{ title: '', description: '' \}\);/, statesReplacement);

// Replace handleQuickAdd with specific handlers
const handlersReplacement = `  const submitTask = async (e) => {
    e.preventDefault();
    if (!taskData.title) return;
    try {
      await api.post('/tasks', { ...taskData, status: 'todo' });
      playPop();
      setActiveModal(null);
      setTaskData({ title: '', description: '', priority: 'Średni', assigned_to: '', due_date: format(new Date(), 'yyyy-MM-dd') });
      fetchData();
    } catch(e) {}
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    if (!eventData.title) return;
    try {
      await api.post('/calendar', eventData);
      playPop();
      setActiveModal(null);
      setEventData({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '12:00', reminder: '15 minut przed' });
      fetchData();
    } catch(e) {}
  };

  const submitNote = async (e) => {
    e.preventDefault();
    if (!noteData.title) return;
    try {
      await api.post('/notes', noteData);
      playPaper();
      setActiveModal(null);
      setNoteData({ title: '', content: '', dedication: 'both', color: '#a855f7' });
      fetchData();
    } catch(e) {}
  };
  
  const getPriorityColor = (p) => {
    switch(p) {
      case 'Niski': return 'bg-[var(--success)]/20 text-[var(--success)] border-[var(--success)]/50';
      case 'Wysoki': return 'bg-[var(--danger)]/20 text-[var(--danger)] border-[var(--danger)]/50';
      default: return 'bg-[var(--warning)]/20 text-[var(--warning)] border-[var(--warning)]/50';
    }
  };`;
c = c.replace(/const handleQuickAdd[\s\S]*?fetchData\(\);\s*\} catch \(error\) \{\s*console\.error\('Error adding item:', error\);\s*\}\s*\};/, handlersReplacement);

// Now the Modals in the return statement
const modalsReplacement = `        {activeModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[var(--bg-primary)] border border-[var(--glass-border)] rounded-[2rem] p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors bg-[var(--glass-bg)] rounded-full">
                <X size={20} />
              </button>
              
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-3">
                {activeModal === 'task' ? <CheckSquare className="text-[var(--accent)]"/> : activeModal === 'note' ? <FileText className="text-[var(--accent)]"/> : <CalendarIcon className="text-[var(--accent)]"/>}
                Now{activeModal === 'note' ? 'a' : 'e'} {activeModal === 'task' ? 'zadanie' : activeModal === 'note' ? 'notatka' : 'wydarzenie'}
              </h2>

              {activeModal === 'task' && (
                <form onSubmit={submitTask} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytuł zadania</label>
                    <input autoFocus type="text" value={taskData.title} onChange={e => setTaskData({...taskData, title: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" required />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Opis</label>
                    <textarea value={taskData.description} onChange={e => setTaskData({...taskData, description: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[80px]" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Priorytet</label>
                    <div className="flex gap-2">
                      {['Niski', 'Średni', 'Wysoki'].map(p => (
                        <button key={p} type="button" onClick={() => setTaskData({...taskData, priority: p})} className={\`flex-1 py-2 rounded-xl border transition-all \${taskData.priority === p ? getPriorityColor(p) + ' shadow-md' : 'border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-muted)]'}\`}>{p}</button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-1 block">Data</label>
                      <input type="date" value={taskData.due_date} onChange={e => setTaskData({...taskData, due_date: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" />
                    </div>
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-1 block">Dla kogo?</label>
                      <select value={taskData.assigned_to} onChange={e => setTaskData({...taskData, assigned_to: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                        <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Wybierz...</option>
                        {profiles && profiles.map(p => <option key={p.id} value={p.id} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-4 rounded-xl shadow-[var(--neon-shadow)] transition-all hover:scale-[1.02]">Dodaj zadanie</button>
                </form>
              )}

              {activeModal === 'event' && (
                <form onSubmit={submitEvent} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytuł wydarzenia</label>
                    <input autoFocus type="text" value={eventData.title} onChange={e => setEventData({...eventData, title: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-1 block">Data</label>
                      <input type="date" value={eventData.date} onChange={e => setEventData({...eventData, date: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" required />
                    </div>
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-1 block">Godzina</label>
                      <input type="time" value={eventData.time} onChange={e => setEventData({...eventData, time: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Opis</label>
                    <textarea value={eventData.description} onChange={e => setEventData({...eventData, description: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[60px]" />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Przypomnienie</label>
                    <select value={eventData.reminder} onChange={e => setEventData({...eventData, reminder: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                      <option value="Brak" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Brak</option>
                      <option value="5 minut przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">5 minut przed</option>
                      <option value="15 minut przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">15 minut przed</option>
                      <option value="1 godzinę przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">1 godzinę przed</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-4 rounded-xl shadow-[var(--neon-shadow)] transition-all hover:scale-[1.02]">Dodaj wydarzenie</button>
                </form>
              )}

              {activeModal === 'note' && (
                <form onSubmit={submitNote} className="flex flex-col gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytuł notatki</label>
                    <input autoFocus type="text" value={noteData.title} onChange={e => setNoteData({...noteData, title: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]" required />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Treść</label>
                    <textarea value={noteData.content} onChange={e => setNoteData({...noteData, content: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[100px]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-1 block">Dla kogo?</label>
                      <select value={noteData.dedication} onChange={e => setNoteData({...noteData, dedication: e.target.value})} className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]">
                        <option value="both" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Dla obojga</option>
                        {profiles && profiles.map(p => <option key={p.name} value={p.name.toLowerCase()} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Dla {p.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[var(--text-secondary)] text-sm mb-1 block">Kolor okładki</label>
                      <input type="color" value={noteData.color} onChange={e => setNoteData({...noteData, color: e.target.value})} className="w-full h-12 bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl p-1 cursor-pointer" />
                    </div>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-4 rounded-xl shadow-[var(--neon-shadow)] transition-all hover:scale-[1.02]">Dodaj notatkę</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }`;
c = c.replace(/\{\s*activeModal && \([\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*\);\s*\}\s*$/, modalsReplacement + '\n}\n');

// Clean up duplicate imports just in case
c = c.replace(/import \{ format \} from 'date-fns';\nimport \{ pl \} from 'date-fns\/locale';\nimport \{ format \} from 'date-fns';\nimport \{ pl \} from 'date-fns\/locale';/, "import { format } from 'date-fns';\nimport { pl } from 'date-fns/locale';");
c = c.replace(/\}\n\}\n$/, "}\n");

fs.writeFileSync('src/pages/DashboardPage.jsx', c, 'utf8');
