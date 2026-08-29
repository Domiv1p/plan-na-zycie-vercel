const fs = require('fs');
let c = fs.readFileSync('src/components/ThemeSwitcher.jsx', 'utf8');

if (!c.includes('playPlum')) {
  c = c.replace(/import \{ useTheme \} from '\.\.\/contexts\/ThemeContext';/, "import { useTheme } from '../contexts/ThemeContext';\nimport { playPlum } from '../utils/sounds';");
  c = c.replace(/onClick=\{\(\) => \{/, "onClick={() => {\n            playPlum();");
  fs.writeFileSync('src/components/ThemeSwitcher.jsx', c, 'utf8');
}
