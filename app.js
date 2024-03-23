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
});
con.end();