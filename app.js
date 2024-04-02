const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const dbConnection = require('./database');
const app = express();
const port = 5180;
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
app.get('/', (req, res) => {
    if (!req.session.userID) { 
        res.render('index', { username: null }); 
    } else {
        dbConnection.query("SELECT name FROM users WHERE id=$1", [req.session.userID], (err, result) => {
            if (err) {
                return next(err);
            }
            res.render('index', {
                username: result.rows[0].name, 
            });
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


// LOGIN PAGE
app.get('/login', ifLoggedin, (req, res) => {
   
    if(req.query.register === 'success'){
        const registerSuccess = req.query.register === 'success';
        res.render('login', {
            login_errors: [],
            register_success: registerSuccess,
    
    
        });
    }else{
        res.render('login', {
            login_errors: [],
    
        });
    }
        
       
});

app.post('/login', ifLoggedin, [
    body('user_email').custom((value) => {
        return dbConnection.query('SELECT email FROM users WHERE email=$1', [value])
            .then((result) => {
                if (result.rows.length === 1) {
                    return true;
                }
                return Promise.reject('Invalid Email Address!');
            });
    }),
    body('user_pass', 'Password is empty!').trim().not().isEmpty(),
], (req, res) => {
    const validation_result = validationResult(req);
    const { user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
        dbConnection.query("SELECT * FROM users WHERE email=$1", [user_email])
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
    body('user_email', 'Invalid email address!').isEmail().custom((value) => {
        return dbConnection.query('SELECT email FROM users WHERE email=$1', [value])
            .then((result) => {
                if (result.rows.length > 0) {
                    return Promise.reject('This E-mail already in use!');
                }
                return true;
            });
    }),
    body('user_name', 'Username is Empty!').trim().not().isEmpty(),
    body('user_pass', 'Passwords do not match').custom((value, { req }) => {
        if (value !== req.body.confirm_pass) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    body('user_pass', 'The password must be of minimum length 6 characters').trim().isLength({ min: 6 }),
], (req, res, next) => {
    const validation_result = validationResult(req);
    const { user_name, user_pass, user_email } = req.body;
    if (validation_result.isEmpty()) {
        bcrypt.hash(user_pass, 12).then((hash_pass) => {
            dbConnection.query("INSERT INTO users(name, email, password) VALUES($1, $2, $3)", [user_name, user_email, hash_pass])
                .then(() => {
                    
                    res.redirect('/login?register=success');
                    
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
        res.render('register', {
            register_error: allErrors,
            old_data: req.body,
        });
    }
});

app.post('/addboard', ifNotLoggedin, async (req, res) => {
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
    dbConnection.query("SELECT * FROM users WHERE id=$1", [req.session.userID], (err, result) => {
        if (err) {
            return res.status(500).send('Internal Server Error');
        }

        // นำข้อมูลชื่อผู้ใช้จากฐานข้อมูล
        const username = result.rows[0].email || 'Guest';
        // ส่งข้อมูลไปที่มุมมอง (view) เพื่อแสดงบนหน้าเว็บ
        res.render('user', { username });
    });
});


app.get('/getboards/:username', async (req, res) => {
    try {
        const username = req.params.username;

        // Query ข้อมูลจากฐานข้อมูลโดยใช้ username เป็นเงื่อนไข
        const result = await dbConnection.query('SELECT * FROM board WHERE email = $1', [username]);

        // ส่งข้อมูลที่ได้กลับเป็น JSON ให้กับไคลเอ็นต์
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        // กรณีเกิดข้อผิดพลาด
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/board', ifNotLoggedin, function(req, res, next) {
    dbConnection.query("SELECT name FROM users WHERE id=$1", [req.session.userID], (err, result) => {
        if (err) {
            return next(err);
        }
        const username = result.rows[0].name;
        const nemeValue = req.query.neme;
        res.render('board', { username: username, nemeValue: nemeValue });
    });
});

app.get('/DatasensorStream', ifNotLoggedin, async (req, res) => {
    const neme = req.query.neme;
    try {
        const query = `SELECT * FROM board WHERE token = '${neme}' ORDER BY id DESC LIMIT 1`;
        const { rows } = await dbConnection.query(query);

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
                const query = `SELECT * FROM board WHERE token = '${neme}' ORDER BY id DESC LIMIT 1`;
                dbConnection.query(query)
                    .then(result => {
                        if (result.rows.length > 0) {
                            const sensorData = {
                                temperature: result.rows[0].temperature,
                                humidity: result.rows[0].humidity,
                                pHValue: result.rows[0].phvalue,
                                soilMoisture: result.rows[0].soilmoisture,
                                boardname: result.rows[0].boardname
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
    const { username, password, temperature, humidity, soilMoisture, pHValue, token } = req.body;

    // ตรวจสอบข้อมูลที่ส่งมาและไม่ว่างเปล่า
    if (!username || !password || !temperature || !humidity || !soilMoisture || !pHValue || !token) {
        return res.status(400).send("Missing required fields.");
    }
    // ตรวจสอบ username และ password
    dbConnection.query("SELECT * FROM users WHERE email=$1", [username])
        .then((result) => {
            if (result.rows.length > 0) {
                bcrypt.compare(password, result.rows[0].password)
                    .then((compare_result) => {
                        if (compare_result === true) {
                            // ตรวจสอบ user และ token
                            dbConnection.query("SELECT * FROM board WHERE email=$1", [username])
                                .then((boardResult) => {
                                    let checktoken = false; // เพิ่มตัวแปรเพื่อตรวจสอบโทเค็น
                                    for (let i = 0; i < boardResult.rows.length; i++) {
                                        if (boardResult.rows[i].token === token) {
                                            checktoken = true;
                                            break;
                                        }
                                    }
                                    if (checktoken === true) {
                                        // อัพเดทข้อมูล
                                        dbConnection.query('UPDATE board SET temperature = $1, humidity = $2, soilmoisture = $3, phvalue = $4 WHERE token = $5',
                                            [temperature, humidity, soilMoisture, pHValue, token], (err, result) => {
                                                if (err) {
                                                    res.status(500).send("Internal Server Error");
                                                } else {
                                                    res.status(200).send("Data updated successfully");
                                                    
                                                }
                                            });
                                    } else {
                                        res.status(403).send("Invalid token.");
                                    }
                                })
                                .catch((err) => {
                                    res.status(500).send("Internal Server Error");
                                });
                        } else {
                            res.status(401).send("Incorrect password.");
                        }
                    })
                    .catch((err) => {
                        res.status(500).send("Internal Server Error");
                    });
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch((err) => {
            res.status(500).send("Internal Server Error");
        });
});

app.post('/deleteData', ifNotLoggedin, (req, res) => {
    const { token } = req.body;

    // ตรวจสอบว่า token ถูกต้องหรือไม่
    dbConnection.query("SELECT * FROM board WHERE token=$1", [token])
        .then((result) => {
            if (result.rows.length > 0) {
                // ถ้าพบ token ให้ลบข้อมูล
                dbConnection.query("DELETE FROM board WHERE token=$1", [token])
                    .then(() => {
                        res.send("<script>alert('ลบข้อมูลแล้ว'); window.location.href = '/user';</script>");
                    })
                    .catch((err) => {
                        console.error(err);
                        res.status(500).send("เกิดข้อผิดพลาดในการลบข้อมูล");
                    });
            } else {
                // ถ้าไม่พบ token ให้แสดงข้อความว่าไม่พบข้อมูล
                res.status(404).send("ไม่พบข้อมูล");
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send("เกิดข้อผิดพลาดในการค้นหาข้อมูล");
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
   /*  res.status(404).send('<h1>404 Page Not Found!</h1>'); */
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
