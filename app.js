var mysql = require('mysql');
var con = mysql.createConnection({
  host: "node60691-env-7996996.th1.proen.cloud",
  user: "root",
  password: "VDAygb99771",
  database: "test"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("You are connected!");
  
    // เพิ่มโค้ดดึงข้อมูลออกมาจากฐานข้อมูลที่นี่
    con.query("SELECT * FROM users", function (err, result, fields) {
      if (err) throw err;
      console.log(result); // แสดงผลลัพธ์ที่ได้จากการ query
    });
  });
  
con.end();