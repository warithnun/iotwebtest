const { Pool } = require('pg');
const dbConnection = new Pool({
    user: 'webadmin',
    host: 'node60694-iotweb.th1.proen.cloud',
    database: 'test',
    password: 'KRCqev36719',
    port: 5432
});

module.exports = dbConnection;
