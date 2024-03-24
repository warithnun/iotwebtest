const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: "node60691-env-7996996.th1.proen.cloud",
    user: "root",
    password: "VDAygb99771",
    database: "iotweb"
});

module.exports = dbConnection;
