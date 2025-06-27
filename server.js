const express = require('express');
const path = require('path');
const app = express();

// Serve static files (your CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname)));

// Route for dynamic card pages
app.get('/card/:name', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'card.html'));
});

// Optionally: fallback to index.html for other SPA routes
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'index.html'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
    