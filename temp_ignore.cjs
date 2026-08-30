const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

// Replace the button and dropdown with layoutId morphing

const searchBlock = `<div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative p-2 rounded-full hover:bg-[var(--bg-card)] transition-colors text-[var(--text-primary)]"
            >
              <motion.div
                animate={
                  unreadCount > 0
                    ? { rotate: [-15, 15, -10, 10, 0] }
                    : { rotate: 0 }
                }
                transition={{ repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2, duration: 0.5 }}
              >
                <Bell size={24} />
              </motion.div>
              <AnimatePresence>
                {unreadCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white min-w-[18px] h-[18px] rounded-full text-[10px] flex items-center justify-center font-bold px-1 border-2 border-[var(--glass-bg)]"
                  >
                    {unreadCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.8, y: -10, filter: 'blur(10px)' }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'top right' }}
                  className="fixed top-20 right-4 w-[calc(100vw-32px)] sm:absolute sm:top-full sm:mt-2 sm:right-0 sm:w-80 max-h-[80vh] overflow-hidden bg-[var(--bg-primary)] border border-[var(--border-bright)] rounded-[2rem] shadow-2xl z-50 flex flex-col"
                >
                  <div className="p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--bg-card)] backdrop-blur-md">
                    <h3 className="font-bold text-lg text-[var(--text-primary)]">Powiadomienia</h3>
                    <div className="flex gap-2">
                      <button onClick={markAllAsRead} className="text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-bright)] transition-colors px-3 py-1.5 rounded-full bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20">
                        Oznacz wszystkie
                      </button>
                    </div>
                  </div>`;

// Wait, the above might not match perfectly due to whitespace or minor edits. Let's use a smarter approach: regex or parsing.
