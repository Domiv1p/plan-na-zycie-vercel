import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useApi from '../hooks/useApi';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CheckSquare, FileText, Calendar as CalendarIcon, Clock, Plus, X } from 'lucide-react';
import { playPlum, playPop, playPaper } from '../utils/sounds';

export default function DashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [time, setTime] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [taskStats, setTaskStats] = useState({ todo: 0, in_progress: 0, done: 0, total: 0 });
  
  // Modals state
    const [activeModal, setActiveModal] = useState(null);
  
  // Quick add forms data
  const [taskData, setTaskData] = useState({ title: '', description: '', priority: 'Średni', assigned_to: '', due_date: format(new Date(), 'yyyy-MM-dd') });
  const [eventData, setEventData] = useState({ title: '', description: '', date: format(new Date(), 'yyyy-MM-dd'), time: '12:00', reminder: '15 minut przed' });
  const [noteData, setNoteData] = useState({ title: '', content: '', dedication: 'both', color: '#a855f7' });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, notesRes, eventsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/notes'),
        api.get('/calendar')
      ]);

      const tasks = tasksRes.data || [];
      const notes = notesRes.data || [];
      const events = eventsRes.data || [];

      // Calculate task stats
      const stats = tasks.reduce((acc, task) => {
        acc[task.status]++;
        acc.total++;
        return acc;
      }, { todo: 0, in_progress: 0, done: 0, total: 0 });
      setTaskStats(stats);

      // Merge activities
      const merged = [
        ...tasks.map(t => ({ ...t, type: 'task', date: new Date(t.created_at || t.updated_at || Date.now()) })),
        ...notes.map(n => ({ ...n, type: 'note', date: new Date(n.created_at || n.updated_at || Date.now()) })),
        ...events.map(e => ({ ...e, type: 'event', date: new Date(e.created_at || e.updated_at || Date.now()) }))
      ].sort((a, b) => b.date - a.date).slice(0, 5);

      setActivities(merged);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 5) return 'Dobranoc';
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Dzień dobry';
    return 'Dobry wieczór';
  };

  const getRelativeTime = (date) => {
    const rtf = new Intl.RelativeTimeFormat('pl', { numeric: 'auto' });
    const diff = (date.getTime() - new Date().getTime()) / 1000;
    
    if (Math.abs(diff) < 60) return rtf.format(Math.round(diff), 'second');
    if (Math.abs(diff) < 3600) return rtf.format(Math.round(diff / 60), 'minute');
    if (Math.abs(diff) < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
    return rtf.format(Math.round(diff / 86400), 'day');
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'task': return <CheckSquare className="w-5 h-5 text-[var(--accent)]" />;
      case 'note': return <FileText className="w-5 h-5 text-[var(--success)]" />;
      case 'event': return <CalendarIcon className="w-5 h-5 text-[var(--warning)]" />;
      default: return null;
    }
  };

    const submitTask = async (e) => {
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
  };

  const donePercentage = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashoffset = circumference - (donePercentage / 100) * circumference;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Header & Clock */}
        <motion.div variants={itemVariants} className="md:col-span-12 flex flex-col md:flex-row justify-between items-start md:items-end mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-2">
              Cześć, {user?.name}! 👋
            </h1>
            <p className="text-xl text-[var(--text-secondary)]">
              {getGreeting()} • {format(time, 'EEEE, d MMMM yyyy', { locale: pl })}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-4 shadow-[var(--neon-shadow)] flex items-center gap-3">
            <Clock className="w-6 h-6 text-[var(--accent)]" />
            <span className="text-3xl font-mono font-bold text-[var(--accent)] tracking-wider">
              {format(time, 'HH:mm:ss')}
            </span>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="md:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setActiveModal('task')}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] hover:border-[var(--accent)] rounded-2xl p-6 flex items-center justify-center gap-3 text-lg font-bold text-[var(--text-primary)] hover:shadow-[var(--neon-shadow)] transition-all group"
          >
            <Plus className="w-6 h-6 text-[var(--accent)] group-hover:scale-110 transition-transform" /> Zadanie
          </button>
          <button 
            onClick={() => setActiveModal('note')}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] hover:border-[var(--success)] rounded-2xl p-6 flex items-center justify-center gap-3 text-lg font-bold text-[var(--text-primary)] hover:shadow-[0_0_15px_var(--success)] transition-all group"
          >
            <Plus className="w-6 h-6 text-[var(--success)] group-hover:scale-110 transition-transform" /> Notatka
          </button>
          <button 
            onClick={() => setActiveModal('event')}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] hover:border-[var(--warning)] rounded-2xl p-6 flex items-center justify-center gap-3 text-lg font-bold text-[var(--text-primary)] hover:shadow-[0_0_15px_var(--warning)] transition-all group"
          >
            <Plus className="w-6 h-6 text-[var(--warning)] group-hover:scale-110 transition-transform" /> Wydarzenie
          </button>
        </motion.div>

        {/* Task Progress */}
        <motion.div variants={itemVariants} className="md:col-span-4 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 flex flex-col items-center">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 w-full">Postęp zadań</h2>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} stroke="var(--bg-card-hover)" strokeWidth="12" fill="none" />
              <circle 
                cx="50" cy="50" r={radius} 
                stroke="var(--accent)" strokeWidth="12" fill="none" 
                strokeDasharray={circumference} 
                strokeDashoffset={dashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-bold text-[var(--text-primary)]">{donePercentage}%</span>
              <span className="text-sm text-[var(--text-muted)]">zrobione</span>
            </div>
          </div>
          <div className="w-full mt-6 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--bg-card-hover)]"></span>Do zrobienia</span>
              <span className="font-bold text-[var(--text-primary)]">{taskStats.todo}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--warning)]"></span>W toku</span>
              <span className="font-bold text-[var(--text-primary)]">{taskStats.in_progress}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[var(--accent)]"></span>Zrobione</span>
              <span className="font-bold text-[var(--text-primary)]">{taskStats.done}</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div variants={itemVariants} className="md:col-span-8 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Ostatnia aktywność</h2>
          <div className="space-y-4">
            {activities.length > 0 ? activities.map((activity, idx) => (
              <div key={`${activity.type}-${activity.id}-${idx}`} className="flex items-center gap-4 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--glass-border)] hover:border-[var(--border-bright)] transition-colors">
                <div className="p-3 rounded-full bg-[var(--glass-bg)]">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-[var(--text-primary)] truncate">{activity.title}</p>
                  <p className="text-sm text-[var(--text-muted)] flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-card-hover)] text-xs border border-[var(--glass-border)]">
                      {activity.creator_name || activity.assigned_to_name || 'Ktoś'}
                    </span>
                    • {getRelativeTime(activity.date)}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-[var(--text-muted)]">Brak recent aktywności. Dodaj coś!</div>
            )}
          </div>
        </motion.div>

      </motion.div>

      {/* Modal */}
              {activeModal && (
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
                        <button key={p} type="button" onClick={() => setTaskData({...taskData, priority: p})} className={`flex-1 py-2 rounded-xl border transition-all ${taskData.priority === p ? getPriorityColor(p) + ' shadow-md' : 'border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>{p}</button>
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
                        <option value="" className="bg-[var(--bg-primary)]">Wybierz...</option>
                        {user && <option value={user.id} className="bg-[var(--bg-primary)]">Dla mnie</option>}
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
                      <option value="Brak" className="bg-[var(--bg-primary)]">Brak</option>
                      <option value="5 minut przed" className="bg-[var(--bg-primary)]">5 minut przed</option>
                      <option value="15 minut przed" className="bg-[var(--bg-primary)]">15 minut przed</option>
                      <option value="1 godzinę przed" className="bg-[var(--bg-primary)]">1 godzinę przed</option>
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
                        <option value="both" className="bg-[var(--bg-primary)]">Dla obojga</option>
                        {user && <option value={user.name.toLowerCase()} className="bg-[var(--bg-primary)]">Dla {user.name}</option>}
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
  }
