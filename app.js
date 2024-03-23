// app.js

const express = require('express');
const mysql = require('mysql');
const app = express();

const connection = mysql.createConnection({
  host: 'node60691-env-7996996.th1.proen.cloud',
  user: 'root',
  password: 'VDAygb99771',
  database: 'test'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ' + err.stack);
    return;
  }
  console.log('Connected to database as id ' + connection.threadId);
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  // Query เพื่อดึงข้อมูลจากฐานข้อมูล
  connection.query('SELECT * FROM your_table_name', (error, results) => {
    if (error) {
      console.error('Error querying database: ' + error.stack);
      return;
    }
    // ส่งข้อมูลที่ดึงมาไปแสดงในหน้า index ด้วย EJS
    res.render('index', { data: results });
  });
});

app.listen(3001, () => {
  console.log('Server is running on port 3000');
});
