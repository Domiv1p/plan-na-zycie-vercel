import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { pl } from 'date-fns/locale';
import useApi from '../hooks/useApi';
import { ChevronLeft, ChevronRight, Plus, X, Clock, Edit2, Trash2 } from 'lucide-react';

export default function CalendarPage() {
  const api = useApi();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '12:00',
    reminder: '15 minut przed'
  });

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/calendar');
      setEvents(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error('Failed to fetch events', error);
    }
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setFormData({ ...formData, date: format(day, 'yyyy-MM-dd') });
  };

  const handleAddClick = () => {
    setFormData({ ...formData, date: format(selectedDay, 'yyyy-MM-dd'), title: '', description: '', time: '12:00', reminder: '15 minut przed' });
    setShowModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!formData.title) return;
    try {
      await api.post('/calendar', formData);
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to save event', error);
    }
  };

  const handleDeleteEvent = async (id) => {
    try {
      await api.del(`/calendar/${id}`);
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event', error);
    }
  };

  // Calendar Math
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // week starts on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const selectedDayEvents = events.filter(e => e.date === format(selectedDay, 'yyyy-MM-dd'));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto flex flex-col h-full">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Kalendarz</h1>
        <button 
          onClick={handleAddClick}
          className="bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-2 px-4 rounded-xl shadow-[var(--neon-shadow)] flex items-center gap-2 transition-transform hover:scale-105"
        >
          <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nowe wydarzenie</span>
        </button>
      </div>

      <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 mb-6">
        {/* Calendar Header */}
        <div className="flex justify-between items-center mb-6">
          <button onClick={prevMonth} className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] transition-colors"><ChevronLeft /></button>
          <h2 className="text-2xl font-bold text-[var(--accent)] capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale: pl })}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-full hover:bg-[var(--bg-card-hover)] text-[var(--text-secondary)] transition-colors"><ChevronRight /></button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 mb-2">
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'].map((d) => (
            <div key={d} className="text-center font-bold text-[var(--text-muted)] text-sm py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {days.map((day, i) => {
            const isSelected = isSameDay(day, selectedDay);
            const isTodayDate = isToday(day);
            const isCurrentMonthDate = isSameMonth(day, monthStart);
            const dayEvents = events.filter(e => e.date === format(day, 'yyyy-MM-dd'));

            return (
              <div 
                key={day.toString()}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square flex flex-col items-center justify-center relative cursor-pointer rounded-xl transition-all
                  ${!isCurrentMonthDate ? 'text-[var(--text-muted)] opacity-50' : 'text-[var(--text-primary)]'}
                  ${isSelected ? 'bg-[var(--bg-card-hover)] border-2 border-[var(--accent)] shadow-[0_0_10px_var(--accent-dim)]' : 'border border-[var(--glass-border)] hover:border-[var(--border-bright)] bg-[var(--bg-card)]'}
                  ${isTodayDate && !isSelected ? 'border-[var(--accent)] text-[var(--accent)] font-bold' : ''}
                `}
              >
                <span className="text-sm sm:text-base">{format(day, dateFormat)}</span>
                {dayEvents.length > 0 && (
                  <div className="absolute bottom-2 flex gap-1">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <div key={idx} className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_5px_var(--accent-glow)]"></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      <div className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 flex-1 min-h-[300px]">
        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-4 border-b border-[var(--glass-border)] pb-2">
          Wydarzenia w dniu {format(selectedDay, 'd MMMM yyyy', { locale: pl })}
        </h3>
        
        <div className="space-y-4">
          {selectedDayEvents.length === 0 ? (
            <div className="text-center text-[var(--text-muted)] py-8">
              Brak wydarzeń w tym dniu
            </div>
          ) : (
            selectedDayEvents.map(event => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                key={event.id}
                className="bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl p-4 hover:border-[var(--accent)] transition-colors relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] text-lg flex items-center gap-2">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)] mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {event.time}</span>
                      {event.creator_name && (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xs">
                          {event.creator_name}
                        </span>
                      )}
                      <span className="text-[var(--warning)] text-xs">🔔 {event.reminder}</span>
                    </div>
                    {event.description && (
                      <p className="mt-2 text-[var(--text-muted)] text-sm">{event.description}</p>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteEvent(event.id)} className="text-[var(--danger)] p-2 hover:bg-[var(--glass-bg)] rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Nowe wydarzenie</h2>
              
              <form onSubmit={handleSaveEvent} className="flex flex-col gap-4">
                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytuł</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                
                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Opis (opcjonalnie)</label>
                  <textarea 
                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Data</label>
                    <input 
                      type="date" required
                      value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                      className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="text-[var(--text-secondary)] text-sm mb-1 block">Godzina</label>
                    <input 
                      type="time" required
                      value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                      className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Przypomnienie</label>
                  <select 
                    value={formData.reminder} onChange={e => setFormData({...formData, reminder: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  >
                    <option value="15 minut przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">15 minut przed</option>
                    <option value="30 minut przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">30 minut przed</option>
                    <option value="1 godzinę przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">1 godzinę przed</option>
                    <option value="1 dzień przed" className="bg-[var(--bg-primary)] text-[var(--text-primary)]">1 dzień przed</option>
                  </select>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-4 bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-3 rounded-xl shadow-[var(--neon-shadow)] transition-transform hover:scale-[1.02]"
                >
                  Zapisz
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


