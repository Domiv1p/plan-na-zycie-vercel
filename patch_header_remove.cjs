const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

c = c.replace("import DynamicIsland from './DynamicIsland';\n", "");
c = c.replace("<DynamicIsland />", "");

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
