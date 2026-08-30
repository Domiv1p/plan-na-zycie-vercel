const fs = require('fs');
let c = fs.readFileSync('src/components/BottomDock.jsx', 'utf8');

c = c.replace(/className="absolute inset-0 rounded-full bg-\[var\(--accent\)\] opacity-20 blur-\[8px\]"/g, 'className="absolute inset-0 rounded-full bg-[var(--accent)] opacity-10"');

fs.writeFileSync('src/components/BottomDock.jsx', c, 'utf8');
