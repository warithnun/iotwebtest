// เรียกใช้ Express.js
const express = require('express');
const app = express();

// กำหนดพอร์ตที่แอพพลิเคชันจะรัน
const port = 3000;

// กำหนด route หลัก
app.get('/', (req, res) => {
  res.send('สวัสดีจากแอปพลิเคชัน Node.js!');
});

// เริ่มเซิร์ฟเวอร์และรอการเชื่อมต่อจาก clients
app.listen(port, () => {
  console.log(`แอปพลิเคชันกำลังรันที่ http://localhost:${port}`);
});
