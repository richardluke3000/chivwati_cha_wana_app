const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { redirectIfAuthenticated } = require('../middleware/auth');

// Login page
router.get('/login', redirectIfAuthenticated, (req, res) => {
    res.render('pages/login', {
        title: 'Login',
        error: null
    });
});

// Login POST
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.render('pages/login', {
                title: 'Login',
                error: 'Please provide username and password'
            });
        }

        // Find user
        const [users] = await db.query(
            'SELECT * FROM users WHERE username = ? AND is_active = TRUE',
            [username]
        );

        if (users.length === 0) {
            return res.render('pages/login', {
                title: 'Login',
                error: 'Invalid username or password'
            });
        }

        const user = users[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.render('pages/login', {
                title: 'Login',
                error: 'Invalid username or password'
            });
        }

        // Update last login
        await db.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );

        // Set session
        req.session.user = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            district: user.district,
            facility: user.facility
        };

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        res.render('pages/login', {
            title: 'Login',
            error: 'An error occurred. Please try again.'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/auth/login');
    });
});

// Change password page
router.get('/change-password', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('pages/change-password', {
        title: 'Change Password',
        error: null,
        success: null
    });
});

// Change password POST
router.post('/change-password', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    try {
        const { current_password, new_password, confirm_password } = req.body;

        // Validate input
        if (!current_password || !new_password || !confirm_password) {
            return res.render('pages/change-password', {
                title: 'Change Password',
                error: 'All fields are required',
                success: null
            });
        }

        if (new_password !== confirm_password) {
            return res.render('pages/change-password', {
                title: 'Change Password',
                error: 'New passwords do not match',
                success: null
            });
        }

        if (new_password.length < 6) {
            return res.render('pages/change-password', {
                title: 'Change Password',
                error: 'Password must be at least 6 characters',
                success: null
            });
        }

        // Get current user
        const [users] = await db.query(
            'SELECT password FROM users WHERE user_id = ?',
            [req.session.user.user_id]
        );

        if (users.length === 0) {
            return res.redirect('/auth/logout');
        }

        // Verify current password
        const isValid = await bcrypt.compare(current_password, users[0].password);
        if (!isValid) {
            return res.render('pages/change-password', {
                title: 'Change Password',
                error: 'Current password is incorrect',
                success: null
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await db.query(
            'UPDATE users SET password = ? WHERE user_id = ?',
            [hashedPassword, req.session.user.user_id]
        );

        res.render('pages/change-password', {
            title: 'Change Password',
            error: null,
            success: 'Password changed successfully!'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.render('pages/change-password', {
            title: 'Change Password',
            error: 'An error occurred. Please try again.',
            success: null
        });
    }
});

module.exports = router;
