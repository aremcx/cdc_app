const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const db = new sqlite3.Database('customs.db');

app.get('/hs-code/:code', (req, res) => {
  const code = req.params.code;
  db.get('SELECT * FROM hs_codes WHERE code = ?', [code], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'HS code not found' });
    } else {
      res.json(row);
    }
  });
});

// Close the database connection on server shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
