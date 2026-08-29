const fs = require('fs');
let c = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

c = c.replace(/import \{ Bell/, "import ConfirmDeleteModal from '../components/ConfirmDeleteModal';\nimport { playPlum } from '../utils/sounds';\nimport { Bell");
c = c.replace(/Bell, ShieldAlert, X, Heart, LogOut/, "Bell, ShieldAlert, X, Heart, LogOut, Volume2, VolumeX, Settings");
c = c.replace(/const \[pushEnabled, setPushEnabled\] = useState\(false\);/, "const [pushEnabled, setPushEnabled] = useState(false);\n  const [soundsEnabled, setSoundsEnabled] = useState(localStorage.getItem('pnz-sounds') !== 'off');\n  const [isDeletingAccount, setIsDeletingAccount] = useState(false);");
c = c.replace(/const handlePushToggle/, "const handleToggleSounds = () => { const newState = !soundsEnabled; setSoundsEnabled(newState); if (newState) { localStorage.removeItem('pnz-sounds'); playPlum(); } else { localStorage.setItem('pnz-sounds', 'off'); } };\n\n  const handlePushToggle");

const soundsHtml = `{/* Sounds */}
      <section className="bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
          {soundsEnabled ? <Volume2 className="w-6 h-6 text-[var(--accent)]" /> : <VolumeX className="w-6 h-6 text-[var(--text-muted)]" />} Dźwięki aplikacji
        </h2>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-[var(--text-primary)] font-medium">Efekty dźwiękowe</p>
            <p className="text-[var(--text-muted)] text-sm">Odtwarzaj dźwięki przy akcjach (zaznaczanie, zmiana motywu)</p>
          </div>
          <button onClick={handleToggleSounds} className={\`px-6 py-2 rounded-xl font-bold transition-all \${soundsEnabled ? 'bg-[var(--accent)] text-white shadow-[var(--neon-shadow)]' : 'bg-[var(--bg-card)] border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}\`}>
            {soundsEnabled ? 'Włączone' : 'Wyłączone'}
          </button>
        </div>
      </section>

      {/* Push Notifications */}`;

c = c.replace(/\{\/\* Push Notifications \*\/\}/, soundsHtml);
c = c.replace(/<h1 className="text-3xl font-bold text-\[var\(--text-primary\)\] mb-8">Ustawienia<\/h1>/, '<h1 className="text-3xl font-bold text-[var(--text-primary)] mb-8 flex items-center gap-3"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 8, ease: "linear" }}><Settings className="w-8 h-8 text-[var(--accent)]" /></motion.div>Ustawienia</h1>');
c = c.replace(/onClick=\{handleDeleteAccount\}/, 'onClick={() => setIsDeletingAccount(true)}');

const modalHtml = `      <ConfirmDeleteModal isOpen={isDeletingAccount} onClose={() => setIsDeletingAccount(false)} onConfirm={handleDeleteAccount} title="Usuń konto" message="Czy na pewno chcesz usunąć swoje konto? Wszystkie zadania, notatki i wydarzenia zostaną trwale usunięte." />
    </div>
  );
}`;
c = c.replace(/<\/div>\s*\);\s*\}\s*$/, modalHtml);

fs.writeFileSync('src/pages/SettingsPage.jsx', c, 'utf8');
