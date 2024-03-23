// เรียกใช้งาน MySQL module
const mysql = require('mysql');

// กำหนดค่าการเชื่อมต่อกับฐานข้อมูล MySQL
const connection = mysql.createConnection({
    host: 'node60688-iotweb.th1.proen.cloud',
    user: 'root',
    password: 'HDKkbe38334',
    database: 'test'
});

// เชื่อมต่อกับฐานข้อมูล
connection.connect((err) => {
  if (err) {
    console.error('เกิดข้อผิดพลาดในการเชื่อมต่อกับ MySQL:', err);
    throw err;
  }
  console.log('เชื่อมต่อกับ MySQL สำเร็จ');
});

// ฟังก์ชันสำหรับเพิ่มข้อมูลลงในฐานข้อมูล
function insertData(data) {
  const sql = 'INSERT INTO table_name (column1, column2, column3) VALUES (?, ?, ?)';
  const values = [data.value1, data.value2, data.value3];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล:', err);
      throw err;
    }
    console.log('ข้อมูลถูกเพิ่มเข้าสู่ฐานข้อมูลแล้ว');
  });
}

// เรียกใช้งานฟังก์ชันเพื่อเพิ่มข้อมูล
insertData({ value1: 'ค่า1', value2: 'ค่า2', value3: 'ค่า3' });

// ปิดการเชื่อมต่อกับฐานข้อมูล MySQL เมื่อไม่ได้ใช้งาน
// connection.end();
