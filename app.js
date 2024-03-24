const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const port = 3030;
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

const pool = new Pool({
    user: 'webadmin',
    host: 'node60694-iotweb.th1.proen.cloud',
    database: 'postgres',
    password: 'KRCqev36719',
    port: 5432
});

app.get('/', function(req, res) {
    res.render('index');

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
