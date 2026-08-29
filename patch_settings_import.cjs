const fs = require('fs');
let c = fs.readFileSync('src/pages/SettingsPage.jsx', 'utf8');

c = c.replace(/import React, \{ useState \} from 'react';/, "import React, { useState, useEffect } from 'react';");

fs.writeFileSync('src/pages/SettingsPage.jsx', c, 'utf8');
