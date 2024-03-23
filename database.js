const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: 'node60688-iotweb.th1.proen.cloud',
    user: 'root', // MySQL username
    password: 'HDKkbe38334', // MySQL password
    database: 'web01' // MySQL database name
});

module.exports = dbConnection;
