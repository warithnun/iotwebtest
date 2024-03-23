const { Pool } = require('pg');

const dbConnection = new Pool({
    user: 'webadmin', 
    host: '10.104.10.202',
    database: 'postgres',
    password: 'TZOkpx87811',
    port: 5432
});

module.exports = dbConnection;
