var mysql = require('mysql');
var con = mysql.createConnection({
  host: "{host}",
  user: "{user}",
  password: "{password}",
  database: "{database}"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("You are connected!");
});
con.end();