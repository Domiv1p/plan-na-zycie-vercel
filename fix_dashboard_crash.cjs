const fs = require('fs');
let c = fs.readFileSync('src/pages/DashboardPage.jsx', 'utf8');

c = c.replace(/const \{ user \} = useAuth\(\);/, "const { user, profiles } = useAuth();");

fs.writeFileSync('src/pages/DashboardPage.jsx', c, 'utf8');
