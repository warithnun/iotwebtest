const { Pool } = require('pg');

const dbConnection = new Pool({
    user: 'postgres',   // Correct PostgreSQL username
    host: 'localhost',
    database: 'web1',
    password: '0000',
    port: 5432
});

module.exports = dbConnection;
