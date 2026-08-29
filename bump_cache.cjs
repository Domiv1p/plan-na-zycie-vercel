const fs = require('fs');
let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'pnz-cache-v[0-9]+';/, "const CACHE_NAME = 'pnz-cache-v3';");
fs.writeFileSync('public/sw.js', sw, 'utf8');

// Let's also fix App.jsx's Ładowanie
let app = fs.readFileSync('src/App.jsx', 'utf8');
app = app.replace('Ĺ\x81adowanie...', 'Ładowanie...');
// Remove BOM from App.jsx if present
if (app.charCodeAt(0) === 0xFEFF) {
  app = app.slice(1);
}
fs.writeFileSync('src/App.jsx', app, 'utf8');

