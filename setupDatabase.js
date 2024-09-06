const sqlite3 = require("sqlite3").verbose();

// Connect to the SQLite database
const db = new sqlite3.Database("customs.db");

// Create the hs_codes table if it doesn't exist and insert data
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS hs_codes (
    code INTEGER PRIMARY KEY,
    description TEXT,
    su TEXT,
    id INTEGER,
    vat REAL,
    lvy REAL,
    exc REAL,
    dov date
  )`);

  // Prepare the INSERT statement
  const insert = db.prepare(`
    INSERT INTO hs_codes (code, description, su, id, vat, lvy, exc, dov)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Insert data into the hs_codes table
  const data = {
    "0101210000": { description: "Live Purebred breeding horses", su: "U", id: 5, vat: 7.5, lvy: 0, exc: 0, dov:"12/02/2020"},
    // Add more HS codes as needed
  };

  for (const code in data) {
    const { description, su, id, vat, lvy, exc, dov } = data[code];
    insert.run(code, description, su, id, vat, lvy, exc, dov);
  }

  insert.finalize();
});

// Close the database connection
db.close();
