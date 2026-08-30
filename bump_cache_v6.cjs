const fs = require('fs');
let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/const CACHE_NAME = 'pnz-cache-v[0-9]+';/, "const CACHE_NAME = 'pnz-cache-v6';");
fs.writeFileSync('public/sw.js', sw, 'utf8');
