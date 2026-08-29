const fs = require('fs');

let content = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

// 1. Add imports
content = content.replace("import { Bell, ShieldAlert, X, Heart, LogOut } from 'lucide-react';", "import { Bell, ShieldAlert, X, Heart, LogOut, Volume2, VolumeX, Settings } from 'lucide-react';\nimport ConfirmDeleteModal from '../components/ConfirmDeleteModal';\nimport { playPlum } from '../utils/sounds';");

// 2. Add states
content = content.replace("const [pushEnabled, setPushEnabled] = useState(false);", "const [pushEnabled, setPushEnabled] = useState(false);\n  const [soundsEnabled, setSoundsEnabled] = useState(localStorage.getItem('pnz-sounds') !== 'off');\n  const [isDeletingAccount, setIsDeletingAccount] = useState(false);");

// 3. Add handleToggleSounds
const toggleFunc = \
  const handleToggleSounds = () => {
    const newState = !soundsEnabled;
    setSoundsEnabled(newState);
    if (newState) {
      localStorage.removeItem('pnz-sounds');
      playPlum();
    } else {
      localStorage.setItem('pnz-sounds', 'off');
    }
  };
\;
content = content.replace("const handlePushToggle", toggleFunc + "\n\n  const handlePushToggle");

// 4. Add Sounds Section
const soundsSection = \
      {/* Sounds */}
      <section className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          {soundsEnabled ? <Volume2 className="w-6 h-6 text-[var(--accent)]" /> : <VolumeX className="w-6 h-6 text-[var(--text-muted)]" />} Dźwięki aplikacji
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[var(--text-primary)] font-medium">Efekty dźwiękowe</p>
            <p className="text-[var(--text-muted)] text-sm">Odtwarzaj dźwięki przy akcjach (zaznaczanie, zmiana motywu)</p>
          </div>
          <button 
            onClick={handleToggleSounds}
            className={\\\px-6 py-2 rounded-xl font-bold transition-all \\\\\\}
          >
            {soundsEnabled ? 'Włączone' : 'Wyłączone'}
          </button>
        </div>
      </section>
\;
content = content.replace("{/* Push Notifications */}", soundsSection + "\n\n      {/* Push Notifications */}");

// 5. Update header animation
content = content.replace('<h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8">Ustawienia</h1>', '<h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}><Settings className="w-8 h-8 text-[var(--accent)]" /></motion.div>Ustawienia</h1>');

// 6. Update ConfirmDeleteModal
content = content.replace('onClick={handleDeleteAccount}', 'onClick={() => setIsDeletingAccount(true)}');

const modalJSX = \
      <ConfirmDeleteModal 
        isOpen={isDeletingAccount} 
        onClose={() => setIsDeletingAccount(false)} 
        onConfirm={handleDeleteAccount} 
        title="Usuń konto" 
        message="Czy na pewno chcesz usunąć swoje konto? Wszystkie zadania, notatki i wydarzenia zostaną trwale usunięte." 
      />
    </div>
\;
content = content.replace(/<\/div>\s*\);\s*\}\s*$/, modalJSX + "\n  );\n}");

fs.writeFileSync('src/pages/SettingsPage.jsx', content, 'utf8');
console.log('SettingsPage updated!');
