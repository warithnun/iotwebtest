const { Pool } = require('pg');

const dbConnection = new Pool({
    user: 'webadmin', 
    host: 'node60669-iotpj.th1.proen.cloud',
    database: 'postgres',
    password: 'TZOkpx87811',
    port: 5432
});

module.exports = dbConnection;
