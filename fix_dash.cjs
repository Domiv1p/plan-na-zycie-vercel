const fs = require('fs');
let c = fs.readFileSync('src/pages/DashboardPage.jsx', 'utf8');

c = c.replace(/import \{ format \} from 'date-fns';\nimport \{ pl \} from 'date-fns\/locale';\nimport \{ format \} from 'date-fns';\nimport \{ pl \} from 'date-fns\/locale';/, "import { format } from 'date-fns';\nimport { pl } from 'date-fns/locale';");

c = c.replace(/\}\n\}\n$/, "}\n");

fs.writeFileSync('src/pages/DashboardPage.jsx', c, 'utf8');
