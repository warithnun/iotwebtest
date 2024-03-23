const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: 'node60688-iotweb.th1.proen.cloud',
    user: 'root',
    password: 'HDKkbe38334',
    database: 'web01' 
});

dbConnection.connect(function(err) {
    if (err) throw err;
    console.log("You are connected!");
    
});

// ไม่จำเป็นต้องเรียกใช้ con.end(); ที่นี่ เพราะเราอาจต้องการเชื่อมต่อกับฐานข้อมูลตลอดเวลาในแอปพลิเคชัน

module.exports = dbConnection;
