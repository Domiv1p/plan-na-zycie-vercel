import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useApi from '../hooks/useApi';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Plus, X, Trash2, Edit, PenLine } from 'lucide-react';

export default function NotesPage() {
  const api = useApi();
  const [notes, setNotes] = useState([]);
  const [filter, setFilter] = useState('Wszystkie');
  const [showModal, setShowModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    dedication: 'Dla obojga'
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notes', error);
    }
  };

  const handleSaveNote = async (e) => {
    playPaper();
    e.preventDefault();
    if (!formData.title) return;
    try {
      if (editingId) {
        await api.patch(`/api/notes/${editingId}`, formData);
      } else {
        await api.post('/notes', formData);
      }
      setShowModal(false);
      resetForm();
      fetchNotes();
    } catch (error) {
      console.error('Failed to save note', error);
    }
  };

  const handleDeleteNote = async (id, e) => {
    e.stopPropagation();
    try {
      await api.del(`/api/notes/${id}`);
      fetchNotes();
    } catch (error) {
      console.error('Failed to delete note', error);
    }
  };

  const openEditModal = (note) => {
    setEditingId(note.id);
    setFormData({ title: note.title, content: note.content, dedication: note.dedication });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: '', content: '', dedication: 'Dla obojga' });
  };

  const getDedicationStyle = (dedication) => {
    if (dedication === 'Dla Miki') return 'bg-purple-500/20 text-purple-400 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.4)]';
    if (dedication === 'Dla Adi') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.4)]';
    return 'bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-white border-white/30 shadow-[0_0_10px_rgba(255,255,255,0.2)]';
  };

  const filteredNotes = notes.filter(n => filter === 'Wszystkie' || n.dedication === filter);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <h1 className="text-3xl font-bold text-[var(--text-primary)] flex items-center gap-3"><motion.div animate={{ rotate: [0, 5, 0, -5, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}><PenLine className="w-8 h-8 text-[var(--accent)]" /></motion.div>Notatki</h1>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['Wszystkie', 'Dla Miki', 'Dla Adi', 'Dla obojga'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === f ? 'bg-[var(--accent)] text-white shadow-[var(--neon-shadow)]' : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--accent)]'}`}
            >
              {f}
            </button>
          ))}
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="ml-auto bg-[var(--accent)] hover:bg-[var(--accent-bright)] text-white font-bold py-2 px-4 rounded-full shadow-[var(--neon-shadow)] flex items-center gap-2 transition-transform hover:scale-105"
          >
            <Plus className="w-5 h-5" /> <span className="hidden sm:inline">Nowa notatka</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredNotes.map(note => (
            <motion.div
              layout
              initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} transition={{ type: 'spring', damping: 15 }} style={{ transformPerspective: 1000 }}
              key={note.id}
              onClick={() => openEditModal(note)}
              className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 relative group cursor-pointer hover:border-[var(--accent)] hover:shadow-lg transition-all flex flex-col h-64"
            >
              <div className="absolute top-4 right-4">
                <span className={`text-xs px-3 py-1 rounded-full border ${getDedicationStyle(note.dedication)}`}>
                  {note.dedication}
                </span>
              </div>
              
              <h3 className="font-bold text-[var(--accent)] text-xl mb-4 pr-24 line-clamp-2">{note.title}</h3>
              
              <div className="flex-1 overflow-hidden">
                <p className="text-[var(--text-primary)] text-sm whitespace-pre-wrap line-clamp-4">{note.content}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex justify-between items-center text-xs text-[var(--text-muted)]">
                <span>{note.creator_name}</span>
                <span>{format(new Date(note.created_at || Date.now()), 'd MMM yyyy, HH:mm', { locale: pl })}</span>
              </div>

              <button 
                onClick={(e) => handleDeleteNote(note.id, e)}
                className="absolute bottom-4 right-4 text-[var(--danger)] p-2 bg-[var(--bg-card)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredNotes.length === 0 && (
          <div className="col-span-full text-center py-12 text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)]">
            Brak notatek do wyświetlenia.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                {editingId ? 'Edytuj notatk' : 'Nowa notatka'}
              </h2>
              
              <form onSubmit={handleSaveNote} className="flex flex-col gap-4">
                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Tytuł</label>
                  <input 
                    type="text" required
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                  />
                </div>
                
                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-1 block">Treść</label>
                  <textarea 
                    required
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}
                    className="w-full bg-[var(--bg-card)] border border-[var(--glass-border)] rounded-xl py-3 px-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] min-h-[200px] resize-y"
                  />
                </div>

                <div>
                  <label className="text-[var(--text-secondary)] text-sm mb-2 block">Dla kogo</label>
                  <div className="flex gap-4">
                    {['Dla Miki', 'Dla Adi', 'Dla obojga'].map(d => (
                      <button
                        key={d} type="button"
                        onClick={() => setFormData({...formData, dedication: d})}
                        className={`flex-1 py-3 rounded-xl border transition-all ${formData.dedication === d ? getDedicationStyle(d) + ' scale-[1.02]' : 'border-[var(--glass-border)] bg-[var(--bg-card)] text-[var(--text-muted)]'}`}
                      >
                        {d}
                      </button>
                    ))}
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
        onConfirm={() => {
          if (itemToDelete) {
            deleteNote(itemToDelete);
            setItemToDelete(null);
          }
        }} 
        title="Usuń notatkę" 
        message="Czy na pewno chcesz usunąć tę notatkę?" 
      />
    </div>
  );
}