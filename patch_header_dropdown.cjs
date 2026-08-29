const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

const dynamicIslandAnimation = `initial={{ opacity: 0, scale: 0.2, y: -40, x: 120, borderRadius: 100 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0, borderRadius: 24 }}
                  exit={{ opacity: 0, scale: 0.2, y: -40, x: 120, borderRadius: 100 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.8 }}
                  style={{ transformOrigin: 'top right' }}`;

c = c.replace(/initial=\{\{ opacity: 0, scale: 0\.5, y: -20, filter: 'blur\(10px\)' \}\}[\s\S]*?style=\{\{ transformOrigin: 'top right' \}\}/, dynamicIslandAnimation);

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
