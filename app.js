
const express = require('express');
const mysql = require('mysql');
const ejs = require('ejs')
const app = express();
const port = 11512;

app.set('view engine', 'ejs');

var con = mysql.createConnection({
    host: "node60691-env-7996996.th1.proen.cloud",
    user: "root",
    password: "VDAygb99771",
    database: "test"
});

app.get('/', function(req, res) {
     con.query("SELECT * FROM users", function(err, result) {
        if (err) throw err;
         res.render('index', { users: result });
    });
});
/* app.post('/add', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    
    con.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function(err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('/'); 
    });
}); */


app.listen(port, () => console.log(`Server is running on port ${port}`));