import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import useApi from '../hooks/useApi';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CheckSquare, FileText, Calendar as CalendarIcon, Clock, Plus, X } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const [time, setTime] = useState(new Date());
  const [activities, setActivities] = useState([]);
  const [taskStats, setTaskStats] = useState({ todo: 0, in_progress: 0, done: 0, total: 0 });
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'task', 'note', 'event', null
  const [formData, setFormData] = useState({ title: '', description: '' });

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

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (activeModal === 'task') {
        await api.post('/tasks', { ...formData, status: 'todo', priority: 'Niski' });
      } else if (activeModal === 'note') {
        await api.post('/notes', { ...formData, dedication: 'Dla obojga' });
      } else if (activeModal === 'event') {
        await api.post('/calendar', { ...formData, date: new Date().toISOString().split('T')[0], time: '12:00' });
      }
      setActiveModal(null);
      setFormData({ title: '', description: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding item:', error);
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
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
            className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
          >
            <button 
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
              Now{activeModal === 'note' ? 'a' : 'e'} {activeModal === 'task' ? 'zadanie' : activeModal === 'note' ? 'notatka' : 'wydarzenie'}
            </h2>
            <form onSubmit={handleQuickAdd} className="flex flex-col gap-4">
              <div>
                <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytuł</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  autoFocus
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-3 rounded-xl shadow-[var(--neon-shadow)] transition-all hover:scale-[1.02]"
              >
                Dodaj
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
