const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));

const connection = mysql.createConnection({
    host: 'node60691-env-7996996.th1.proen.cloud',
    user: 'root', // แทนที่ด้วยชื่อผู้ใช้ MySQL
    password: 'password', // แทนที่ด้วยรหัสผ่าน MySQL
    database: 'test' // แทนที่ด้วยชื่อฐานข้อมูลที่ต้องการเชื่อมต่อ
  });

connection.connect((err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับฐานข้อมูล:', err);
    return;
  }
  console.log('เชื่อมต่อกับฐานข้อมูล MySQL สำเร็จ');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.post('/addData', (req, res) => {
  const { name, email, id } = req.body;
  const INSERT_DATA_QUERY = `INSERT INTO users (name, email, id) VALUES (?, ?, ?)`;

  connection.query(INSERT_DATA_QUERY, [name, email, id], (error, results) => {
    if (error) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', error);
      return res.status(500).send('เกิดข้อผิดพลาดในการเพิ่มข้อมูล',error);
    }
    console.log('ข้อมูลถูกเพิ่มเข้าฐานข้อมูลเรียบร้อยแล้ว');
    res.redirect('/');
  });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
