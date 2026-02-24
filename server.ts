import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure backup directory exists or use local
const BACKUP_DIR = '/backup';
const DB_PATH = fs.existsSync(BACKUP_DIR) 
  ? path.join(BACKUP_DIR, 'contracts.db') 
  : path.join(__dirname, 'contracts.db');

// Initialize Database
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS contracts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clientName TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    data TEXT
  )
`);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/contracts', (req, res) => {
    try {
      const stmt = db.prepare('SELECT id, clientName, createdAt FROM contracts ORDER BY createdAt DESC');
      const contracts = stmt.all();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contracts' });
    }
  });

  app.get('/api/contracts/:id', (req, res) => {
    try {
      const stmt = db.prepare('SELECT * FROM contracts WHERE id = ?');
      const contract = stmt.get(req.params.id);
      if (contract) {
        res.json({ ...contract, data: JSON.parse(contract.data as string) });
      } else {
        res.status(404).json({ error: 'Contract not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch contract' });
    }
  });

  app.post('/api/contracts', (req, res) => {
    try {
      const { clientName, data } = req.body;
      const stmt = db.prepare('INSERT INTO contracts (clientName, data) VALUES (?, ?)');
      const info = stmt.run(clientName, JSON.stringify(data));
      res.json({ id: info.lastInsertRowid, success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save contract' });
    }
  });

  app.delete('/api/contracts/:id', (req, res) => {
    try {
      const stmt = db.prepare('DELETE FROM contracts WHERE id = ?');
      stmt.run(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete contract' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(__dirname, 'dist');
    console.log(`Serving static files from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Database path: ${DB_PATH}`);
  });
}

startServer();
