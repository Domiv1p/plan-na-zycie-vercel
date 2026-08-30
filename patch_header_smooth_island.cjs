const fs = require('fs');
let c = fs.readFileSync('src/components/Header.jsx', 'utf8');

// Replace the entire block starting from <div className="relative" ref={dropdownRef}>
// Up to the end of the AnimatePresence that wraps it.

const regex = /<div className="relative" ref=\{dropdownRef\}>[\s\S]*?(?=<div className="flex items-center gap-2)/;

const newBlock = `<div className="relative" ref={dropdownRef}>
            {/* Placeholder to keep header layout stable */}
            <div className="w-10 h-10" />

            <motion.div
              layout
              initial={false}
              transition={{ type: "spring", damping: 25, stiffness: 250, mass: 0.8 }}
              style={{
                borderRadius: isDropdownOpen ? 32 : 9999,
              }}
              className={\`absolute right-0 top-0 overflow-hidden border z-50 flex flex-col origin-top-right \${
                isDropdownOpen 
                  ? 'w-[calc(100vw-32px)] sm:w-80 max-h-[80vh] bg-[var(--bg-primary)] shadow-2xl border-[var(--border-bright)]' 
                  : 'w-10 h-10 bg-transparent hover:bg-[var(--bg-card)] border-transparent cursor-pointer'
              }\`}
            >
              {!isDropdownOpen ? (
                <button 
                  onClick={() => setIsDropdownOpen(true)}
                  className="w-full h-full flex items-center justify-center text-[var(--text-primary)]"
                >
                  <motion.div
                    animate={unreadCount > 0 ? { rotate: [-15, 15, -10, 10, 0] } : { rotate: 0 }}
                    transition={{ repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2, duration: 0.5 }}
                  >
                    <Bell size={24} />
                  </motion.div>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white min-w-[16px] h-[16px] rounded-full text-[9px] flex items-center justify-center font-bold border border-[var(--glass-bg)]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.05 }}
                  className="flex flex-col w-full h-full"
                >
                  <div className="p-4 sm:p-5 border-b border-[var(--glass-border)] flex justify-between items-center bg-[var(--bg-card)] backdrop-blur-md">
                    <Bell size={20} className="text-[var(--accent)] mr-3 shrink-0" />
                    <h3 className="font-bold text-lg text-[var(--text-primary)] flex-1">Powiadomienia</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs font-semibold px-3 py-1 bg-[var(--accent)] text-white rounded-full hover:brightness-110 transition-all shadow-[var(--neon-shadow)]"
                      >
                        Przeczytane
                      </button>
                    )}
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2">
                    {notifications?.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
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
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 flex flex-col items-center justify-center text-[var(--text-muted)] gap-3">
                        <BellOff size={40} className="opacity-30" />
                        <p className="text-sm font-medium">Brak powiadomień</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
`;

// Wait, the regex replace could be tricky with the end div. Let's make sure it matches properly.
c = c.replace(/<div className="relative" ref=\{dropdownRef\}>[\s\S]*?<div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">/, newBlock);

fs.writeFileSync('src/components/Header.jsx', c, 'utf8');
