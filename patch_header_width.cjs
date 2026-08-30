const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

// Replace w-[calc(100vw-32px)] with w-[300px]
c = c.replace(/w-\[calc\(100vw-32px\)\]/g, 'w-[300px]');

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
