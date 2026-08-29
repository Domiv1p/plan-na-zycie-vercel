const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

const classMatch = /className="absolute right-0 top-full mt-2 w-\[90vw\] max-w-sm sm:w-80 max-h-\[80vh\] overflow-hidden bg-\[var\(--bg-primary\)\] border border-\[var\(--border-bright\)\] rounded-\[2rem\] shadow-2xl z-50 flex flex-col"/;

const newClass = 'className="fixed top-20 right-4 w-[calc(100vw-32px)] sm:absolute sm:top-full sm:mt-2 sm:right-0 sm:w-80 max-h-[80vh] overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-bright)] rounded-[2rem] shadow-2xl z-50 flex flex-col"';

c = c.replace(classMatch, newClass);
fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
