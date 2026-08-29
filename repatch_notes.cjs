const fs = require('fs');
let c = fs.readFileSync('src/pages/NotesPage.jsx', 'utf8');

c = "import ConfirmDeleteModal from '../components/ConfirmDeleteModal';\n" + c;

c = c.replace(/import \{ Plus, X, Trash2, User \} from 'lucide-react';/, "import { Plus, X, Trash2, User } from 'lucide-react';\nimport { playPaper } from '../utils/sounds';");

c = c.replace(/const \[showModal, setShowModal\] = useState\(false\);/, "const [showModal, setShowModal] = useState(false);\n  const [itemToDelete, setItemToDelete] = useState(null);");

c = c.replace(/const handleSaveNote = async \(e\) => \{/, "const handleSaveNote = async (e) => {\n    playPaper();");
c = c.replace(/const openAddModal = \(\) => \{/, "const openAddModal = () => {\n    playPaper();");

c = c.replace(/<button onClick=\{\(\) => deleteNote\(note\.id\)\}/, "  <button onClick={(e) => { e.stopPropagation(); setItemToDelete(note.id); }}");

c = c.replace(/initial=\{\{ opacity: 0, scale: 0\.9 \}\} animate=\{\{ opacity: 1, scale: 1 \}\} exit=\{\{ opacity: 0, scale: 0\.9 \}\}/, "initial={{ opacity: 0, rotateY: 90 }} animate={{ opacity: 1, rotateY: 0 }} exit={{ opacity: 0, rotateY: -90 }} transition={{ type: 'spring', damping: 15 }} style={{ transformPerspective: 1000 }}");

const deleteModal = `
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
    </div>`;

c = c.replace(/<\/div>\s*\);\s*\}\s*$/, deleteModal + "\n  );\n}");

fs.writeFileSync('src/pages/NotesPage.jsx', c, 'utf8');
