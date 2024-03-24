const express = require('express');
const path = require('path');
const mysql = require('mysql');
const app = express();
const port = 3030;

app.set('view engine', 'ejs');


var con = mysql.createConnection({
    host: "node60691-env-7996996.th1.proen.cloud",
    user: "root",
    password: "VDAygb99771",
    database: "test"
  });

app.get('/', function(req, res) {
    const sql = "SELECT * FROM users";
    con.query(sql, function(err, result) {
      if (err) throw err;
      console.log(result)
      res.render('/index',{ data: result });
    });
});


  app.listen(port, () => console.log(`Server is running on port ${port}`));