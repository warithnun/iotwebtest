const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: 'node60688-iotweb.th1.proen.cloud',
    user: 'root', // MySQL username
    password: 'HDKkbe38334', // MySQL password
    database: 'web01' // MySQL database name
});

dbConnection.connect(function(err) {
    if (err) throw err;
    console.log("You are connected!");
    // เรียกใช้งานฐานข้อมูลที่เชื่อมต่อได้ที่นี่
    // ยกตัวอย่างเช่นการ query ข้อมูลหรือทำงานอื่น ๆ
});

// ไม่จำเป็นต้องเรียกใช้ con.end(); ที่นี่ เพราะเราอาจต้องการเชื่อมต่อกับฐานข้อมูลตลอดเวลาในแอปพลิเคชัน

module.exports = dbConnection;
