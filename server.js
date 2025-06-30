import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import db from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files from the root directory (where index.html lives)
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, 'pages', 'templates')));
app.use(express.static(path.join(__dirname, 'pages')));

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//app.get('/test', (req, res) => {
//  res.send('Server is working!');
//});

app.get('/card/:name', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'templates', 'card.html'));
});

// Serve the sign-in page
app.get('/signin', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'templates', 'signin.html'));
});


// Handle login POST request
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  console.log('Signin attempt:', { username, password });

  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  db.query(
    'SELECT * FROM users WHERE Username = ? AND Password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).send('Database error.');
      }

      console.log('DB results:', results);

      if (results.length > 0) {
        res.send('Login successful!');
      } else {
        res.status(401).send('Invalid username or password');
      }
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
