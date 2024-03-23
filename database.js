const mysql = require('mysql');

const dbConnection = mysql.createConnection({
    host: 'node60688-iotweb.th1.proen.cloud',
    user: 'root', // MySQL username
    password: 'HDKkbe38334', // MySQL password
    database: 'web01' // MySQL database name
});
dbConnection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + dbConnection.threadId);
});


module.exports = dbConnection;
