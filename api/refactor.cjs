const fs = require('fs');
let code = fs.readFileSync('server.js', 'utf8');
code = code.replace(/app\.(get|post|patch|delete)\('([^']+)',\s*(authMiddleware,\s*)?(async\s*)?\(req, res\)/g, "app.$1('$2', $3async (req, res)");
code = code.replace(/async\s+async\s+\(req/g, 'async (req');
code = code.replace(/db\.prepare/g, 'await db.prepare');
// fix any double await
code = code.replace(/await\s+await\s+db\.prepare/g, 'await db.prepare');
// For getDB in startServer, no await needed since getDB is just returning the wrapper.
code = code.replace(/await\s+db\s*=\s*await\s+getDB\(\)/, 'db = getDB()');
code = code.replace(/db\s*=\s*await\s+getDB\(\)/, 'db = getDB()'); // getDB isn't async
// Wait, notifyOtherUser has const otherUsers = await db.prepare...
fs.writeFileSync('server.js', code);
