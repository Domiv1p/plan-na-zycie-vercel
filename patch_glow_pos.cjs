const fs = require('fs');
let c = fs.readFileSync('src/components/BottomDock.jsx', 'utf8');

c = c.replace(/absolute top-1/, 'absolute top-2');

fs.writeFileSync('src/components/BottomDock.jsx', c, 'utf8');
