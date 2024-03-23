var express = require('express');
var mysql = require('mysql');
var ejs = require('ejs');
var bodyParser = require('body-parser');

var app = express();

var con = mysql.createConnection({
    host: "node60691-env-7996996.th1.proen.cloud",
    user: "root",
    password: "VDAygb99771",
    database: "test"
});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
    con.query("SELECT * FROM users", function(err, result, fields) {
        if (err) throw err;
        res.render('index', { users: result });
    });
});

app.post('/', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    
    con.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function(err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        res.redirect('/'); 
    });
});

var server = app.listen(3000, function() {
    console.log('Server is running on port 3000');
});
