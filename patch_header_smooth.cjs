const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

const smoothAnimation = `initial={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'top right' }}`;

c = c.replace(/initial=\{\{ opacity: 0, scale: 0\.2, y: -40, x: 120, borderRadius: 100 \}\}[\s\S]*?style=\{\{ transformOrigin: 'top right' \}\}/, smoothAnimation);
// Also fallback if the user is on the OLD version (since they said it didn't change at all, maybe I replaced it wrong earlier or they were looking at the old version)
c = c.replace(/initial=\{\{ opacity: 0, scale: 0\.5, y: -20, filter: 'blur\(10px\)' \}\}[\s\S]*?style=\{\{ transformOrigin: 'top right' \}\}/, smoothAnimation);

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
