require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Demo backend running' });
});

// সব users list
app.get('/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'DB error' });
  }
});

// নতুন user add
app.post('/users', async (req, res) => {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const data = JSON.parse(body || '{}');
      const { name, email } = data;

      if (!name || !email) {
        return res.status(400).json({ error: 'name & email required' });
      }

      const [result] = await pool.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      );

      res.status(201).json({ id: result.insertId, name, email });
    } catch (err) {
      console.error('Error inserting user:', err.message);
      res.status(500).json({ error: 'DB error' });
    }
  });
});

const port = process.env.APP_PORT || 3000;

app.listen(port, '0.0.0.0', () => {
  console.log(`Demo backend listening on port ${port}`);
});
