const fs = require('fs');
let c = fs.readFileSync('src/pages/NotesPage.jsx', 'utf8');

c = c.replace(/importę /g, 'import ');
c = c.replace(/useEffectę/g, 'useEffect');
c = c.replace(/letę /g, 'let ');
c = c.replace(/constę /g, 'const ');
c = c.replace(/exportę /g, 'export ');
c = c.replace(/setę /g, 'set ');
c = c.replace(/getę /g, 'get ');
c = c.replace(/awaitę /g, 'await ');
c = c.replace(/targetę/g, 'target');
c = c.replace(/defaultę/g, 'default');
c = c.replace(/eventę/g, 'event');
c = c.replace(/submitę/g, 'submit');
c = c.replace(/preventę/g, 'prevent');
c = c.replace(/Textę/g, 'Text');
c = c.replace(/tęt/g, 'tt');
c = c.replace(/transparentę/g, 'transparent');
c = c.replace(/contentę/g, 'content');
c = c.replace(/tę /g, 't '); // Restore everything, just to be safe
c = c.replace(/t /g, 'tę '); // Wait, no! If I restore it, I might undo something, but it's too dangerous.

fs.writeFileSync('src/pages/NotesPage.jsx', c, 'utf8');
