const fs = require('fs');

const fixFile = (path, replacements) => {
  let content = fs.readFileSync(path, 'utf8');
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.replace(bad, good);
  }
  fs.writeFileSync(path, content, 'utf8');
};

fixFile('src/pages/TasksPage.jsx', {
  'Usu\uFFFD zadanie': 'Usuń zadanie',
  'usun\uFFFD\uFFFD to zadanie? Tej operacji nie mo\uFFFDna cofn\uFFFD\uFFFD.': 'usunąć to zadanie? Tej operacji nie można cofnąć.'
});

fixFile('src/pages/NotesPage.jsx', {
  'Usu\uFFFD notatk\uFFFD': 'Usuń notatkę',
  'usun\uFFFD\uFFFD t\uFFFD notatk\uFFFD?': 'usunąć tę notatkę?'
});

fixFile('src/pages/CalendarPage.jsx', {
  'Usu\uFFFD wydarzenie': 'Usuń wydarzenie',
  'usun\uFFFD\uFFFD to wydarzenie': 'usunąć to wydarzenie'
});

fixFile('src/pages/SettingsPage.jsx', {
  'Usu\uFFFD konto': 'Usuń konto',
  'usun\uFFFD\uFFFD swoje konto? Wszystkie zadania, notatki i wydarzenia zostan\uFFFD trwale usuni\uFFFDte.': 'usunąć swoje konto? Wszystkie zadania, notatki i wydarzenia zostaną trwale usunięte.'
});

fixFile('src/components/ConfirmDeleteModal.jsx', {
  '>Usu\uFFFD<': '>Usuń<'
});

fixFile('api/index.js', {
  'Brak nowych powiadomie\uFFFD': 'Brak nowych powiadomień',
  '1 dzie\uFFFD': '1 dzień',
  'B\uFFFD\uFFFDd crona': 'Błąd crona'
});

console.log('Fixed Polish characters');
