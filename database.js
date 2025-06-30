import { createConnection } from 'mysql2';

const db = createConnection({
  host: 'localhost',
  user: 'root',
  password: '',        // XAMPP default
  database: 'database'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});

export default db;
