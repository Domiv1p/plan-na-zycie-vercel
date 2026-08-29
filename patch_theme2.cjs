const fs = require('fs');
let c = fs.readFileSync('src/components/ThemeSwitcher.jsx', 'utf8');

c = c.replace(/onClick=\{\(\) => setTheme\(themeKey\)\}/, "onClick={() => { playPlum(); setTheme(themeKey); }}");

fs.writeFileSync('src/components/ThemeSwitcher.jsx', c, 'utf8');
