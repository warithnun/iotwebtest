const mysql = require('mysql');

// กำหนดค่าการเชื่อมต่อกับฐานข้อมูล
const dbPool = mysql.createPool({
    connectionLimit: 10,
    host: "node60691-env-7996996.th1.proen.cloud",
    user: "root",
    password: "VDAygb99771",
    database: "iotweb"
});

// สร้างโมดูลที่สามารถใช้ในแอปพลิเคชัน Express ได้
module.exports = dbPool;
