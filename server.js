const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path'); // Import path module



const app = express();
const port = 3000;

app.use(bodyParser.json());

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join('C:/Users/user/projects/cdc_nip', 'public')));

const db = new sqlite3.Database('customs.db');



// Search for products based on description
app.get('/search-products', (req, res) => {
  const query = req.query.query;
  db.all(`SELECT * FROM hs_codes WHERE description LIKE ? LIMIT 10`, [`%${query}%`], (err, rows) => {
    if (err) {
      res.status(500).send('Database error: ' + err.message);
      return;
    }
    res.json(rows);
  });
});

// Endpoint to fetch HS code details
app.get('/fetchHsCodeDetails', (req, res) => {
    const hsCode = req.query.hsCode;
    db.get("SELECT * FROM hs_code WHERE code = ?", [hsCode], (err, row) => {
      if (err) {
        res.status(500).send('Database error: ' + err.message);
        return;
      }
      if (!row) {
        res.status(404).send('Invalid HS Code. Please check the HS Code.');
        return;
      }
      res.json(row);
    });
  });

  // Endpoint to retrieve HS code data
app.get('/hs-code', (req, res) => {
    const query = 'SELECT * FROM hs_code';
    db.all(query, [], (err, rows) => {
      if (err) {
        res.status(500).send('Database error: ' + err.message);
        return;
      }
      res.json(rows);
    });
  });
  
  // Endpoint to insert new HS code data
  app.post('/addHsCode', (req, res) => {
    const { code, description, su, id, vat, lvy, exc, dov} = req.body;
    const insert = db.prepare(`
      INSERT INTO hs_code (code, description, su, id, vat, lvy, exc, dov)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(code, description, su, id, vat, lvy, exc, dov, function(err) {
      if (err) {
        res.status(500).send('Database error: ' + err.message);
        return;
      }
      res.send(`A row has been inserted with rowid ${this.lastID}`);
    });
    insert.finalize();
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });