const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const { body, validationResult } = require('express-validator');
const dbPool = require('./database'); // Importing database pool
const app = express();

app.use(express.urlencoded({ extended: false }));


// SET OUR VIEWS AND VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// APPLY COOKIE SESSION MIDDLEWARE
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 3600 * 1000 // 1hr
}));

// DECLARING CUSTOM MIDDLEWARE
const ifNotLoggedin = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.render('login');
    }
    next();
};

const ifLoggedin = (req, res, next) => {
    if (req.session.isLoggedIn) {
        return res.redirect('/user');
    }
    next();
};
// END OF CUSTOM MIDDLEWARE

// ROOT PAGE
app.get('/', ifNotLoggedin, (req, res, next) => {
    dbPool.query("SELECT name FROM users WHERE id=?", [req.session.userID], (err, result) => {
        if (err) {
            return next(err);
        }
        res.render('user', {
            name: result[0].name,
        });
    });
});

// REGISTER PAGE
app.get('/register', ifLoggedin, (req, res) => {
    res.render('register', {
        register_error: [],
        old_data: {},
    });
});

// LOGIN PAGE
app.get('/login', ifLoggedin, (req, res) => {
    const registerSuccess = req.query.register === 'success';
    res.render('login', {
        login_errors: [],
        register_success: registerSuccess,
    });
});

app.post('/login', ifLoggedin, [
    body('user_email').custom((value) => {
        return new Promise((resolve, reject) => {
            dbPool.query('SELECT email FROM users WHERE email=?', [value], (error, results) => {
                if (error) {
                    reject(error);
                }
                if (results.length === 1) {
                    resolve(true);
                } else {
                    reject('Invalid Email Address!');
                }
            });
        });
    }),
    body('user_pass', 'Password is empty!').trim().not().isEmpty(),
], (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
        dbPool.query("SELECT * FROM users WHERE email=$1", [user_email])
            .then((result) => {
                bcrypt.compare(user_pass, result.rows[0].password).then((compare_result) => {
                    if (compare_result === true) {
                        req.session.isLoggedIn = true;
                        req.session.userID = result.rows[0].id;
                        res.redirect('/user');
                    } else {
                        res.render('login', {
                            login_errors: ['Invalid Password!'],
                        });
                    }
                })
                    .catch((err) => {
                        if (err) throw err;
                    });
            })
            .catch((err) => {
                if (err) throw err;
            });
    } else {
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        res.render('login', {
            login_errors: allErrors,
        });
    }
});

// REGISTER PAGE
app.get('/register', ifLoggedin, (req, res) => {
    res.render('register', {
        register_error: [],
        old_data: {},
    });
});

app.post('/register', ifLoggedin, [
    body('user_email', 'Invalid email address!').isEmail().custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            dbPool.query('SELECT email FROM users WHERE email = ?', [value], (error, [rows]) => {
                if (error) {
                    reject(error);
                }
                if (rows.length > 0) {
                    reject('This E-mail already in use!');
                } else {
                    resolve(true);
                }
            });
        });
    }),
    body('user_name', 'Username is Empty!').trim().not().isEmpty(),
    body('user_pass', 'The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
], (req, res, next) => {
    const validation_result = validationResult(req);
    const { user_name, user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
        bcrypt.hash(user_pass, 12).then((hash_pass) => {
            dbPool.query("INSERT INTO users(name, email, password) VALUES(?, ?, ?)", [user_name, user_email, hash_pass], (error) => {
                if (error) {
                    console.error('Error inserting user:', error);
                    return res.status(500).send('Internal Server Error');
                }
                res.redirect('/login?register=success');
            });
        })
        .catch((err) => {
            console.error('Error hashing password:', err);
            return res.status(500).send('Internal Server Error');
        });
    } else {
        let allErrors = validation_result.errors.map((error) => {
            return error.msg;
        });
        res.render('register', {
            register_error: allErrors,
            old_data: req.body,
        });
    }
});


app.post('/addboard', async (req, res) => {
    try {
        const { boardname, message, tokenboard, user_email } = req.body;
        // เพิ่มข้อมูลลงในฐานข้อมูล
        const client = await dbConnection.connect();
        const result = await client.query(
            'INSERT INTO board (email, token, boardname, message, temperature, humidity, soilmoisture, phvalue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [user_email, tokenboard, boardname, message, null, null, null, null]
        );
        client.release();
        // แจ้งเตือนผู้ใช้ว่าเพิ่มบอร์ดสำเร็จ
        res.send("<script>alert('เพิ่มบอร์ดแล้ว'); window.location.href = '/user';</script>");
    } catch (err) {
        console.error(err);
        // กรณีเกิดข้อผิดพลาด
        res.send('เกิดข้อผิดพลาดในการเพิ่มบอร์ด');
    }
});

// USER PAGE
app.get('/user', ifNotLoggedin, (req, res) => {
    dbPool.query("SELECT * FROM users WHERE id = ?", [req.session.userID], (err, [result]) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Internal Server Error');
        }

        // ดำเนินการเฉพาะเมื่อมีผลลัพธ์ที่สำเร็จ
        if (result.length > 0) {
            const username = result[0].email || 'Guest';
            res.render('user', { username });
        } else {
            res.status(404).send('User not found');
        }
    });
});


app.get('/getboards/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Query ข้อมูลจากฐานข้อมูลโดยใช้ username เป็นเงื่อนไข
        const result = await dbPool.query('SELECT * FROM board WHERE email = ?', [username]);

        // ส่งข้อมูลที่ได้กลับเป็น JSON ให้กับไคลเอ็นต์
        res.json(result);
    } catch (err) {
        console.error('Error fetching boards data:', err);
        // กรณีเกิดข้อผิดพลาด
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/board', ifNotLoggedin, (req, res) => {
    const nemeValue = req.query.neme; // ตรวจสอบชื่อที่เข้าถึงผ่าน query parameters
    res.render('board', { nemeValue: nemeValue }); // render หน้ามุมมอง 'board' พร้อมส่งค่า nemeValue ไปแสดงผล
});


app.get('/DatasensorStream', async (req, res) => {
    const neme = req.query.neme;
    try {
        const query = `SELECT * FROM board WHERE token = ? ORDER BY id DESC LIMIT 1`;
        const { rows } = await dbPool.query(query, [neme]); // ใช้ Connection Pool และ parameterized query เพื่อป้องกันการทำ SQL Injection

        if (rows.length > 0) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            });

            const sendSensorData = (data) => {
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };

            const watcher = () => {
                dbPool.query(query, [neme])
                    .then(({ rows: result }) => {
                        if (result.length > 0) {
                            const sensorData = {
                                temperature: result[0].temperature,
                                humidity: result[0].humidity,
                                pHValue: result[0].phvalue,
                                soilMoisture: result[0].soilmoisture,
                                boardname: result[0].boardname
                            };
                            sendSensorData(sensorData);
                        }
                    })
                    .catch(error => console.error('Error watching sensor data:', error));
            };

            setInterval(watcher, 1000);
        } else {
            res.status(404).end();
        }
    } catch (error) {
        console.error('Error fetching sensor data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.post('/update-data', (req, res) => {
    const { temperature, humidity, soilMoisture, pHValue, token } = req.body;

    const query = 'UPDATE board SET temperature = ?, humidity = ?, soilmoisture = ?, phvalue = ? WHERE token = ?';
    dbPool.query(query, [temperature, humidity, soilMoisture, pHValue, token])
        .then(() => {
            res.status(200).send('Data updated successfully');
        })
        .catch(error => {
            console.error('Error updating sensor data:', error);
            res.status(500).send('Internal Server Error');
        });
});



// LOGOUT
app.get('/logout', (req, res) => {
    req.session = null;
    res.redirect('/login');
});

// 404 Page Not Found
app.use((req, res) => {
    res.redirect('/login');
});
  app.listen(3030, () => console.log(`Server is running on port ${3030}`));