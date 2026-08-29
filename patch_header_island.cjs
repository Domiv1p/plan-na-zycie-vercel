const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

if (!c.includes('DynamicIsland')) {
  c = c.replace(/import \{ useClickOutside \} from '\.\.\/hooks\/useClickOutside';/, "import { useClickOutside } from '../hooks/useClickOutside';\nimport DynamicIsland from './DynamicIsland';");
  
  // Insert <DynamicIsland /> inside the header
  c = c.replace(/<div className="h-full flex items-center justify-between px-6">/, '<div className="h-full flex items-center justify-between px-6">\n        <DynamicIsland />');
  
  fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
}
