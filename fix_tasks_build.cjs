const fs = require('fs');
let c = fs.readFileSync('src/pages/TasksPage.jsx', 'utf8');

c = c.replace(/const updateTaskStatus = async \(id, currentStatus, direction\) => \{\n    const statuses = \['todo', 'in_progress', 'done'\];\n    const newStatus = statuses\[statuses.indexOf\(currentStatus\) \+ direction\];\n    if \(newStatus === 'done'\) playDing\(\);\n    const statuses = \['todo', 'in_progress', 'done'\];\n    const currentIndex = statuses\.indexOf\(currentStatus\);\n    let newIndex = currentIndex \+ direction;\n    if \(newIndex < 0 \|\| newIndex > 2\) return;\n    \n    const newStatus = statuses\[newIndex\];/g, "const updateTaskStatus = async (id, currentStatus, direction) => {\n    const statuses = ['todo', 'in_progress', 'done'];\n    const currentIndex = statuses.indexOf(currentStatus);\n    let newIndex = currentIndex + direction;\n    if (newIndex < 0 || newIndex > 2) return;\n    const newStatus = statuses[newIndex];\n    if (newStatus === 'done') playDing();");

fs.writeFileSync('src/pages/TasksPage.jsx', c, 'utf8');
