const dbConnection = new Pool({
    user: 'webadmin',
    host: 'node60694-iotweb.th1.proen.cloud',
    database: 'postgres',
    password: 'KRCqev36719',
    port: 5432
});

module.exports = dbConnection;
