// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./users.db');

// Middleware
app.use(express.static(__dirname)); // Sert login + CSS
app.use('/site', express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));

// Créer table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )`);
});

// Routes
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// Inscription
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, password], (err) => {
    if (err) res.send('<h3 style="color:red;">Utilisateur existe !</h3><a href="/register">Retour</a>');
    else res.redirect('/site/index.html');
  });
});

// Connexion
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, password], (err, row) => {
    if (row) res.redirect('/site/index.html');
    else res.send('<h3 style="color:red;">Mauvais identifiants !</h3><a href="/">Retour</a>');
  });
});

// Protection
app.use('/site', (req, res, next) => {
  const ext = path.extname(req.path);
  if (['.css', '.js', '.png', '.jpg', '.mp4'].includes(ext)) return next();
  res.redirect('/');
});

// Port
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Serveur sur port ${port}`));