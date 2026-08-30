const fs = require('fs');
let c = fs.readFileSync('src/components/BottomDock.jsx', 'utf8');

// We need to inject activeIndex and the single glow element, and remove the layoutId glow.

// 1. Remove the old layoutId glow
const oldGlowRegex = /\{\s*isActive\s*&&\s*\(\s*<motion\.div\s*layoutId="dock-glow"[\s\S]*?\/>\s*\)\s*\}/;
c = c.replace(oldGlowRegex, '');

// 2. Add activeIndex calculation
const locationRegex = /const location = useLocation\(\);/;
const activeIndexCode = `const location = useLocation();
  const activeIndex = navItems.findIndex(item => location.pathname.startsWith(item.path));
  const safeActiveIndex = activeIndex >= 0 ? activeIndex : 0;`;
c = c.replace(locationRegex, activeIndexCode);

// 3. Add the single glow element
const navStartRegex = /<nav className="flex justify-around items-center h-16 px-2">/;
const newNavStart = `<nav className="flex justify-around items-center h-16 px-2 relative">
        <div className="absolute inset-y-0 left-2 right-2 pointer-events-none flex z-0">
          <motion.div
            className="h-full flex items-center justify-center"
            initial={false}
            animate={{ x: \`\${safeActiveIndex * 100}%\` }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ width: \`\${100 / navItems.length}%\` }}
          >
            {/* The beautiful glow with blur is back, but as a single element to prevent overlap flashes! */}
            <div className="w-10 h-10 rounded-full bg-[var(--accent)] opacity-30 blur-[8px] absolute top-1" />
          </motion.div>
        </div>`;
c = c.replace(navStartRegex, newNavStart);

fs.writeFileSync('src/components/BottomDock.jsx', c, 'utf8');
