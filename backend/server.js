const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { init: initDb } = require('./db/init');

const dbPath = process.env.DB_PATH
  ? path.resolve(__dirname, process.env.DB_PATH)
  : path.resolve(__dirname, 'data', 'training.db');

if (!fs.existsSync(dbPath)) {
  console.log('[startup] DB file not found — initializing schema.');
}
initDb();

if (!process.env.JWT_SECRET) {
  console.warn('[startup] WARNING: JWT_SECRET is not set. Auth tokens cannot be issued or verified.');
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.warn('[startup] WARNING: ANTHROPIC_API_KEY is not set. AI endpoints will fail at call time.');
}

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/exam', require('./routes/exam'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/admin', require('./routes/admin'));

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, _next) => {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

const port = Number(process.env.PORT) || 3100;
const server = app.listen(port, () => {
  console.log(`[startup] Backend listening on http://localhost:${port}`);
});

function shutdown(signal) {
  console.log(`[shutdown] ${signal} received, closing server.`);
  server.close(() => process.exit(0));
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = app;
