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

// เพิ่มการเรียกใช้งาน cookie-session middleware
app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2']
}));

// สร้างเส้นทางสำหรับการรับค่า POST จากฟอร์มลงทะเบียน
app.post('/register', (req, res) => {
    // รับข้อมูลจากฟอร์ม
    const { user_name, user_email, user_pass } = req.body;

    // ตรวจสอบความถูกต้องของข้อมูล
    if (!user_name || !user_email || !user_pass) {
        // กรณีข้อมูลไม่ครบถ้วน
        return res.status(400).send("กรุณากรอกข้อมูลให้ครบทุกช่อง");
    }

    // นำข้อมูลที่ได้รับมาเขียนลงในฐานข้อมูล
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    dbConnection.query(sql, [user_name, user_email, user_pass], (err, result) => {
        if (err) {
            console.error("เกิดข้อผิดพลาดในการเพิ่มข้อมูล:", err);
            return res.status(500).send("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
        }
        console.log("บันทึกข้อมูลเรียบร้อย:", result);
        res.send("การลงทะเบียนเสร็จสมบูรณ์");
    });

});

// เพิ่มเส้นทางสำหรับการแสดงฟอร์มลงทะเบียน
app.get('/register', (req, res) => {
    res.render('register');
});

// เพิ่มเส้นทางสำหรับการเรียกใช้งานหน้าลงทะเบียนหากไม่พบเส้นทางที่ตรงกับที่ร้องขอ
app.use((req, res) => {
    res.redirect('/register');
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(3000, () => console.log('Server is Running...'));
