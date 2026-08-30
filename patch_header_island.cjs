const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

// We need to replace the entire <div className="relative" ref={dropdownRef}> block.

const oldBlockRegex = /<div className="relative" ref=\{dropdownRef\}>[\s\S]*?(?=<div className="flex items-center gap-2)/;

const newBlock = `<div className="relative" ref={dropdownRef}>
            <div className="w-10 h-10 relative">
              <AnimatePresence>
                {!isDropdownOpen && (
                  <motion.button
                    key="bell-island"
                    layoutId="notification-island"
                    onClick={() => setIsDropdownOpen(true)}
                    className="absolute inset-0 flex items-center justify-center hover:bg-[var(--bg-card)] text-[var(--text-primary)] z-10 origin-top-right overflow-hidden border border-transparent"
                    style={{ borderRadius: 9999, backgroundColor: 'transparent' }}
                    transition={{ type: "spring", damping: 24, stiffness: 300 }}
                  >
                    <motion.div layoutId="island-icon" className="relative flex items-center justify-center w-full h-full">
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
                            className="absolute top-1 right-1 bg-red-500 text-white min-w-[16px] h-[16px] rounded-full text-[9px] flex items-center justify-center font-bold px-1 border-2 border-[var(--glass-bg)]"
                          >
                            {unreadCount}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    key="menu-island"
                    layoutId="notification-island"
                    className="fixed top-14 right-4 w-[calc(100vw-32px)] sm:absolute sm:top-full sm:mt-2 sm:right-0 sm:w-80 max-h-[80vh] bg-[var(--bg-primary)] border border-[var(--border-bright)] shadow-2xl z-50 flex flex-col origin-top-right overflow-hidden"
                    style={{ borderRadius: 32 }}
                    transition={{ type: "spring", damping: 24, stiffness: 300, mass: 0.8 }}
                  >
                    <div className="p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--bg-card)] backdrop-blur-md">
                      <motion.div layoutId="island-icon" className="flex items-center justify-center shrink-0 mr-3">
                        <Bell size={20} className="text-[var(--accent)]" />
                      </motion.div>
                      <motion.h3 
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}
                        className="font-bold text-lg text-[var(--text-primary)] flex-1"
                      >
                        Powiadomienia
                      </motion.h3>
                      {unreadCount > 0 && (
                        <motion.button
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                          onClick={markAllAsRead}
                          className="text-xs font-semibold px-3 py-1 bg-[var(--accent)] text-white rounded-full hover:brightness-110 transition-all shadow-[var(--neon-shadow)]"
                        >
                          Przeczytane
                        </motion.button>
                      )}
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2, delay: 0.05 }}
                      className="flex-1 overflow-y-auto p-2"
                    >
                      {notifications?.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {notifications.map((notif) => (
                            <motion.div
                              key={notif.id}
                              layout
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              onClick={() => !notif.is_read && markAsRead(notif.id)}
                              className={\`p-4 rounded-2xl transition-all cursor-pointer \${
                                !notif.is_read ? 'bg-[var(--glass-bg)] border border-[var(--accent)] shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'bg-transparent border border-transparent hover:bg-[var(--glass-bg)]'
                              }\`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <h4 className={\`text-sm \${!notif.is_read ? 'font-bold text-[var(--text-primary)]' : 'font-medium text-[var(--text-secondary)]'}\`}>{notif.title}</h4>
                                <span className="text-[10px] font-medium text-[var(--text-muted)] whitespace-nowrap ml-2 bg-[var(--bg-primary)] px-2 py-0.5 rounded-full">
                                  {timeAgo(notif.created_at)}
                                </span>
                              </div>
                              <p className="text-xs text-[var(--text-secondary)] mt-2">{notif.body}</p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
                          <BellOff size={40} className="opacity-30" />
                          <p className="text-sm font-medium">Brak powiadomień</p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2`;

c = c.replace(oldBlockRegex, newBlock);

// We need to import BellOff if it's used inside the map
// Let's make sure BellOff is imported
if (!c.includes('BellOff')) {
  c = c.replace(/import \{ Bell, /, 'import { Bell, BellOff, ');
}

// Since I wrote Powiadomień with Polish chars inside Node, it will be correct!

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
