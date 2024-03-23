const express = require('express');
const path = require('path');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const dbConnection = require('./database');
const app = express();
app.use(express.urlencoded({ extended: false }));

// SET OUR VIEWS AND VIEW ENGINE
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// APPLY COOKIE SESSION MIDDLEWARE
app.post('/register', [
    body('user_name').notEmpty().trim().escape(),
    body('user_email').isEmail().normalizeEmail(),
    body('user_pass').notEmpty()
], async (req, res) => {
    // ตรวจสอบ errors จาก express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { user_name, user_email, user_pass } = req.body;

    try {
        // สร้าง hash ของรหัสผ่าน
        const hashedPassword = await bcrypt.hash(user_pass, 10);

        // เพิ่มข้อมูลลงในฐานข้อมูล
        dbConnection.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [user_name, user_email, hashedPassword], (error, results, fields) => {
            if (error) {
                console.error('Error inserting data to database: ' + error.stack);
                return res.status(500).send('Internal Server Error');
            }
            console.log('Inserted ' + results.affectedRows + ' row(s)');
            res.redirect('/login'); // เมื่อเสร็จสามารถเปลี่ยนเส้นทางไปยังหน้า login หรือหน้าอื่น ๆ ตามที่ต้องการ
        });
    } catch (error) {
        console.error('Error inserting data to database: ' + error.stack);
        res.status(500).send('Internal Server Error');
    }
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

app.listen(3000, () => console.log('Server is Running...'));
