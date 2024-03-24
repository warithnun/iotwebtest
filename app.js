const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 11991;
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

const pool = new Pool({
    user: 'webadmin',
    host: 'node60694-iotweb.th1.proen.cloud',
    database: 'postgres',
    password: 'KRCqev36719',
    port: 5432
});

app.get('/', function(req, res) {
    const sql = "SELECT * FROM users";
    pool.query(sql, function(err, result) {
      if (err) {
        console.error('An error occurred.', err);
        res.status(500).send('An error occurred.');
        return;
      }
      console.log(result.rows);
      res.render('index',{ data: result.rows });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
