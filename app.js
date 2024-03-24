const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3030;
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
const dbConnection = require('./database');

const pool = new Pool({
    user: 'webadmin',   // ตั้งค่า PostgreSQL username ที่ถูกต้อง
    host: 'node60694-iotweb.th1.proen.cloud',
    database: 'postgres',
    password: 'KRCqev36719',
    port: 5432
});

app.get('/', function(req, res) {
    const sql = "SELECT * FROM users";
    pool.query(sql, function(err, result) {
      if (err) throw err;
      console.log(result.rows);
      res.render('index',{ data: result.rows });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



  app.listen(port, () => console.log(`Server is running on port ${port}`));