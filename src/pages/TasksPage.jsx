import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useApi from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import { Plus, X, ArrowLeft, ArrowRight, Trash2, Calendar, User } from 'lucide-react';

export default function TasksPage() {
  const api = useApi();
  const { profiles } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('Wszyscy');
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: '≈öredni',
    assigned_to: '',
    due_date: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch tasks', error);
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    try {
      await api.post('/tasks', { ...formData, status: 'todo' });
      setShowModal(false);
      setFormData({ title: '', description: '', priority: '≈öredni', assigned_to: '', due_date: '' });
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task', error);
    }
  };

  const updateTaskStatus = async (id, currentStatus, direction) => {
    const statuses = ['todo', 'in_progress', 'done'];
    const currentIndex = statuses.indexOf(currentStatus);
    let newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex > 2) return;
    
    const newStatus = statuses[newIndex];
    try {
      await api.patch(`/tasks/${id}`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.del(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === 'Niski') return 'text-[var(--success)] border-[var(--success)] bg-[var(--success)]/10';
    if (priority === '≈öredni') return 'text-[var(--warning)] border-[var(--warning)] bg-[var(--warning)]/10';
    return 'text-[var(--danger)] border-[var(--danger)] bg-[var(--danger)]/10';
  };

  const getColumnStyle = (status) => {
    if (status === 'todo') return 'border-l-4 border-l-[var(--accent)]';
    if (status === 'in_progress') return 'border-l-4 border-l-[var(--warning)]';
    return 'border-l-4 border-l-[var(--success)]';
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'Wszyscy') return true;
    return t.assigned_to_name === filter;
  });

  const columns = [
    { id: 'todo', title: 'Do zrobienia' },
    { id: 'in_progress', title: 'W toku' },
    { id: 'done', title: 'Zrobione' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-80px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Zadania</h1>
        
        <div className="flex gap-4 items-center w-full sm:w-auto">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl px-4 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
          >
            <option value="Wszyscy" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Wszyscy</option>
            {profiles && profiles.map(p => <option key={p.id} value={p.name} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">{p.name}</option>)}
          </select>

          <button 
            onClick={() => setShowModal(true)}
            className="bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-2 px-4 rounded-xl shadow-[var(--neon-shadow)] flex items-center gap-2 transition-transform hover:scale-105 ml-auto"
          >
            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nowe zadanie</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {columns.map((col) => (
          <div key={col.id} className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-4 flex flex-col h-full overflow-hidden">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 pb-2 border-b border-[var(--glass-border)]">
              {col.title} <span className="text-[var(--text-muted)] text-sm ml-2">({filteredTasks.filter(t => t.status === col.id).length})</span>
            </h2>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
              <AnimatePresence>
                {filteredTasks.filter(t => t.status === col.id).map(task => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                    key={task.id}
                    className={`bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl p-4 ${getColumnStyle(task.status)} relative group hover:shadow-lg transition-all`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-[var(--text-primary)] text-lg leading-tight">{task.title}</h3>
                      <button onClick={() => setItemToDelete(task.id)} className="text-[var(--text-muted)] hover:text-[var(--danger)] opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {task.description && (
                      <p className="text-[var(--text-muted)] text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`text-xs px-2 py-1 rounded-md border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.assigned_to_name && (
                        <span className="text-xs px-2 py-1 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] flex items-center gap-1">
                          <User className="w-3 h-3" /> {task.assigned_to_name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-xs px-2 py-1 rounded-md bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(task.due_date).toLocaleDateString('pl-PL')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--glass-border)]">
                      <div className="text-[10px] text-[var(--text-muted)]">
                        Utworzone przez {task.creator_name}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          disabled={task.status === 'todo'}
                          onClick={() => updateTaskStatus(task.id, task.status, -1)}
                          className="p-1.5 rounded bg-[var(--bg-card-hover)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--bg-card-hover)] disabled:hover:text-inherit transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button 
                          disabled={task.status === 'done'}
                          onClick={() => updateTaskStatus(task.id, task.status, 1)}
                          className="p-1.5 rounded bg-[var(--bg-card-hover)] hover:bg-[var(--accent)] hover:text-white disabled:opacity-30 disabled:hover:bg-[var(--bg-card-hover)] disabled:hover:text-inherit transition-colors"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Nowe zadanie</h2>
              
              <form onSubmit={handleSaveTask} className="flex flex-col gap-4">
                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytu≈Ç</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                
                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Opis</label>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Priorytet</label>
                  <div className="flex gap-2">
                    {['Niski', '≈öredni', 'Wysoki'].map(p => (
                      <button
                        key={p} type="button"
                        onClick={() => setFormData({...formData, priority: p})}
                        className={`flex-1 py-2 rounded-xl border transition-all ${formData.priority === p ? getPriorityColor(p) + ' shadow-md' : 'border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-muted)]'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Przypisz do</label>
                    <select 
                      value={formData.assigned_to} onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                      className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    >
                      <option value="" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">Wybierz...</option>
                      {profiles && profiles.map(p => <option key={p.id} value={p.id} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Termin</label>
                    <input 
                      type="date"
                      value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})}
                      className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-3 rounded-xl shadow-[var(--neon-shadow)] transition-transform hover:scale-[1.02]">
                  Zapisz
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
          <ConfirmDeleteModal 
        isOpen={!!itemToDelete} 
        onClose={() => setItemToDelete(null)} 
        onConfirm={() => deleteTask(itemToDelete)} 
        title="UsuÒ zadanie" 
        message="Czy na pewno chcesz trwale usunπÊ to zadanie? Tej operacji nie moøna cofnπÊ." 
      />
    </div>
  );
}

