const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

c = c.replace('<div className="flex items-center gap-2<div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">', '<div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">');

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
