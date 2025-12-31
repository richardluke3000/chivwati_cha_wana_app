const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, async (req, res) => {
    try {
        const [users] = await db.query('SELECT user_id, username, email, full_name, role, district, facility, is_active, last_login FROM users ORDER BY created_at DESC');
        res.render('pages/users/list', { title: 'User Management', users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading users');
    }
});

router.get('/new', isAdmin, (req, res) => {
    res.render('pages/users/form', { title: 'New User', user: null, error: null });
});

router.post('/new', isAdmin, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        await db.query(
            'INSERT INTO users (username, email, password, full_name, role, district, facility) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [req.body.username, req.body.email, hashedPassword, req.body.full_name, req.body.role, req.body.district, req.body.facility]
        );
        res.redirect('/users');
    } catch (error) {
        console.error(error);
        res.render('pages/users/form', { title: 'New User', user: req.body, error: 'Error creating user' });
    }
});

module.exports = router;