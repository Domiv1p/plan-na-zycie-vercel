import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import webpush from 'web-push';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDB, getDB } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

let db;


  await initDB();
  db = getDB();
app.use(cors());
app.use(express.json());

// Web Push setup
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Auth Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Brak autoryzacji' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Nieprawidłowy token' });
  }
};

// Push Notification Helper
async function sendPushToUser(userId, title, body, type = 'info') {
  try {
    await db.prepare('INSERT INTO notifications (user_id, title, body, type) VALUES (?, ?, ?, ?)').run(userId, title, body, type);
    
    const subscriptions = await db.prepare('SELECT * FROM push_subscriptions WHERE user_id = ?').all(userId);
    const payload = JSON.stringify({ title, body, type, timestamp: Date.now() });

    for (const sub of subscriptions) {
      try {
        const subData = JSON.parse(sub.subscription_json);
        await webpush.sendNotification(subData, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await db.prepare('DELETE FROM push_subscriptions WHERE id = ?').run(sub.id);
        } else {
          console.error('Błąd wysyłania powiadomienia push:', err);
        }
      }
    }
  } catch (err) {
    console.error('Błąd podczas sendPushToUser:', err);
  }
}

async function notifyOtherUser(currentUserId, title, body, type) {
  try {
    const otherUsers = await db.prepare('SELECT id FROM users WHERE id != ?').all(currentUserId);
    for (const user of otherUsers) {
      await sendPushToUser(user.id, title, body, type);
    }
  } catch (err) {
    console.error('Błąd notifyOtherUser:', err);
  }
}

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, pin } = req.body;
    
    const countRow = await db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (countRow.count >= 2) {
      return res.status(400).json({ error: 'Osiągnięto limit 2 użytkowników.' });
    }

    if (!name || !email || !password || !pin) {
      return res.status(400).json({ error: 'Wszystkie pola są wymagane.' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const pin_hash = await bcrypt.hash(pin.toString(), 10);

    const result = await db.prepare(`
      INSERT INTO users (name, email, password_hash, pin_hash) VALUES (?, ?, ?, ?)
    `).run(name, email, password_hash, pin_hash);

    const user = { id: result.lastInsertRowid, name, email };
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ token, user: { ...user, avatar: 'default', created_at: new Date().toISOString() } });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Email jest już zajęty.' });
    } else {
      res.status(500).json({ error: 'Błąd serwera podczas rejestracji.' });
    }
  }
});

app.post('/api/auth/login-pin', async (req, res) => {
  try {
    const { userId, pin } = req.body;
    
    if (!userId || !pin) {
      return res.status(400).json({ error: 'userId i pin są wymagane.' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika.' });
    }

    const pinMatch = await bcrypt.compare(pin.toString(), user.pin_hash);
    if (!pinMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy PIN.' });
    }

    const userPayload = { id: user.id, name: user.name, email: user.email };
    const token = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar, created_at: user.created_at }
    });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas logowania PINem.' });
  }
});

app.get('/api/auth/profiles', async (req, res) => {
  try {
    const users = await db.prepare('SELECT id, name, avatar, created_at FROM users').all();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania profili.' });
  }
});

app.delete('/api/auth/account', authMiddleware, async (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'PIN jest wymagany.' });
    }

    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const pinMatch = await bcrypt.compare(pin.toString(), user.pin_hash);
    
    if (!pinMatch) {
      return res.status(401).json({ error: 'Nieprawidłowy PIN.' });
    }

      await db.prepare('DELETE FROM tasks WHERE created_by = ? OR assigned_to = ?').run(req.user.id, req.user.id);
      await db.prepare('DELETE FROM notes WHERE created_by = ?').run(req.user.id);
      await db.prepare('DELETE FROM calendar_events WHERE created_by = ?').run(req.user.id);
      // Remove this exact subscription from any other user first to prevent cross-account notifications on the same device
    await db.prepare('DELETE FROM push_subscriptions WHERE subscription_json = ?').run(JSON.stringify(subscription));
    
    // Remove old subscriptions for this user to keep it clean (optional, but good if they have many dead ones)
    await db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').run(req.user.id);
      await db.prepare('DELETE FROM notifications WHERE user_id = ?').run(req.user.id);
      await db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania konta.' });
  }
});

// Tasks
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await db.prepare(`
      SELECT tasks.*, users.name as creator_name 
      FROM tasks 
      JOIN users ON tasks.created_by = users.id
    `).all();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania zadań.' });
  }
});

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Tytuł jest wymagany.' });
    }

    const result = await db.prepare(`
      INSERT INTO tasks (title, description, status, priority, assigned_to, created_by, due_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      title, 
      description || null, 
      status || 'todo', 
      priority || 'medium', 
      assigned_to || null, 
      req.user.id, 
      due_date || null
    );

    const task = await db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
    
    notifyOtherUser(req.user.id, `Nowe zadanie: ${title}`, req.user.name + ' dodał nowe zadanie.', 'task');
    
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas tworzenia zadania.' });
  }
});

app.patch('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const { id } = req.params;
    
    const allowedFields = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date'];
    const setClauses = [];
    const values = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Brak danych do aktualizacji.' });
    }

    values.push(id);
    await db.prepare(`UPDATE tasks SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    
    const task = await db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas aktualizacji zadania.' });
  }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    await db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania zadania.' });
  }
});

// Notes
app.get('/api/notes', authMiddleware, async (req, res) => {
  try {
    const notes = await db.prepare(`
      SELECT notes.*, users.name as creator_name 
      FROM notes 
      JOIN users ON notes.created_by = users.id
    `).all();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania notatek.' });
  }
});

app.post('/api/notes', authMiddleware, async (req, res) => {
  try {
    const { title, content, dedication, color } = req.body;
    if (!title) {
      return res.status(400).json({ error: 'Tytuł jest wymagany.' });
    }

    const result = await db.prepare(`
      INSERT INTO notes (title, content, dedication, created_by, color)
      VALUES (?, ?, ?, ?, ?)
    `).run(title, content || null, dedication || 'both', req.user.id, color || '#a78bfa');

    const note = await db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    
    notifyOtherUser(req.user.id, `Nowa notatka: ${title}`, req.user.name + ' dodał notatkę.', 'note');

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas tworzenia notatki.' });
  }
});

app.patch('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const { id } = req.params;
    
    const allowedFields = ['title', 'content', 'dedication', 'color'];
    const setClauses = [];
    const values = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'Brak danych do aktualizacji.' });

    values.push(id);
    await db.prepare(`UPDATE notes SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    
    const note = await db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas aktualizacji notatki.' });
  }
});

app.delete('/api/notes/:id', authMiddleware, async (req, res) => {
  try {
    await db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania notatki.' });
  }
});

// Calendar Events
app.get('/api/calendar', authMiddleware, async (req, res) => {
  try {
    const events = await db.prepare(`
      SELECT calendar_events.*, users.name as creator_name 
      FROM calendar_events 
      JOIN users ON calendar_events.created_by = users.id
    `).all();
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania wydarzeń kalendarza.' });
  }
});

app.post('/api/calendar', authMiddleware, async (req, res) => {
  try {
    const { title, description, date, time, reminder } = req.body;
    if (!title || !date) {
      return res.status(400).json({ error: 'Tytuł i data są wymagane.' });
    }

    const result = await db.prepare(`
      INSERT INTO calendar_events (title, description, date, time, reminder, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(title, description || null, date, time || null, reminder || '15 minut przed', req.user.id);

    const event = await db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(result.lastInsertRowid);
    
    notifyOtherUser(req.user.id, `Nowe wydarzenie: ${title}`, req.user.name + ' dodał wydarzenie.', 'event');

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas tworzenia wydarzenia.' });
  }
});

app.patch('/api/calendar/:id', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    const { id } = req.params;
    
    const allowedFields = ['title', 'description', 'date', 'time', 'reminder'];
    const setClauses = [];
    const values = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        setClauses.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'Brak danych do aktualizacji.' });

    values.push(id);
    await db.prepare(`UPDATE calendar_events SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    
    const event = await db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(id);
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas aktualizacji wydarzenia.' });
  }
});

app.delete('/api/calendar/:id', authMiddleware, async (req, res) => {
  try {
    await db.prepare('DELETE FROM calendar_events WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd podczas usuwania wydarzenia.' });
  }
});

// Push subscriptions
app.post('/api/push/subscribe', authMiddleware, async (req, res) => {
  try {
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: 'Brak subskrypcji.' });
    }
    
    await db.prepare('DELETE FROM push_subscriptions WHERE user_id = ?').run(req.user.id);
    
    await db.prepare(`
      INSERT INTO push_subscriptions (user_id, subscription_json) VALUES (?, ?)
    `).run(req.user.id, JSON.stringify(subscription));

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd zapisywania subskrypcji.' });
  }
});

app.post('/api/push/test', authMiddleware, async (req, res) => {
  try {
    await sendPushToUser(req.user.id, 'Testowe powiadomienie', 'Push działa prawidłowo!', 'info');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd wysyłania testowego powiadomienia.' });
  }
});

// Cron job endpoint for sending reminders
app.get('/api/cron/reminders', async (req, res) => {
  try {
    const events = await db.prepare('SELECT * FROM calendar_events WHERE reminder_sent = 0 AND time IS NOT NULL AND reminder != \'Brak\'').all();
    if (events.length === 0) return res.json({ success: true, message: 'Brak nowych powiadomień' });

    const now = new Date();
    const pl = new Intl.DateTimeFormat('pl-PL', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(now);
    const [datePart, timePart] = pl.split(', ');
    const [dPart, mPart, yPart] = datePart.split('.');
    const currentWarsawTime = new Date(yPart + '-' + mPart + '-' + dPart + 'T' + timePart + ':00').getTime();

    let sentCount = 0;
    for (const event of events) {
      const eventTime = new Date(event.date + 'T' + event.time + ':00').getTime();
      let offsetMs = 0;
      if (event.reminder.includes('15 minut')) offsetMs = 15 * 60 * 1000;
      else if (event.reminder.includes('1 godzina')) offsetMs = 60 * 60 * 1000;
      else if (event.reminder.includes('1 dzień')) offsetMs = 24 * 60 * 60 * 1000;
      
      const targetTime = eventTime - offsetMs;
      
      // If current time is past or exactly at the target reminder time
      if (currentWarsawTime >= targetTime) {
        // Find users to notify (both users)
        const users = await db.prepare('SELECT id FROM users').all();
        for (const u of users) {
          await sendPushToUser(u.id, 'Przypomnienie o wydarzeniu', event.title + ' (' + event.date + ' ' + event.time + ')', 'event');
        }
        await db.prepare('UPDATE calendar_events SET reminder_sent = 1 WHERE id = ?').run(event.id);
        sentCount++;
      }
    }

    res.json({ success: true, sent: sentCount });
  } catch (err) {
    console.error('Cron error:', err);
    res.status(500).json({ error: 'Błąd crona' });
  }
});

// Notifications
app.get('/api/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all(req.user.id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania powiadomień.' });
  }
});

app.patch('/api/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd oznaczania wszystkich jako przeczytane.' });
  }
});

app.patch('/api/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Błąd oznaczania jako przeczytane.' });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../client/dist')));

// Fallback for SPA
app.get('*', async (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

export default app;




