const fs = require('fs');
let c = fs.readFileSync('api/index.js', 'utf8');

const subscribeRegex = /await db\.prepare\('DELETE FROM push_subscriptions WHERE user_id = \?'\)\.run\(req\.user\.id\);/;
const subscribeReplacement = `// Remove this exact subscription from any other user first to prevent cross-account notifications on the same device\n    await db.prepare('DELETE FROM push_subscriptions WHERE subscription_json = ?').run(JSON.stringify(subscription));\n    \n    // Remove old subscriptions for this user to keep it clean (optional, but good if they have many dead ones)\n    await db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').run(req.user.id);`;

c = c.replace(subscribeRegex, subscribeReplacement);
fs.writeFileSync('api/index.js', c, 'utf8');
