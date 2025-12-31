require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'chivwati_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make user available in all views
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.appName = process.env.APP_NAME || 'CHIVWATI Tracker';
    next();
});

// Routes
const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const enrollmentRoutes = require('./src/routes/enrollment');
const reportRoutes = require('./src/routes/reports');
const userRoutes = require('./src/routes/users');

app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/enrollment', enrollmentRoutes);
app.use('/reports', reportRoutes);
app.use('/users', userRoutes);

// Home route - redirect to dashboard or login
app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/auth/login');
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('pages/404', {
        title: 'Page Not Found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).render('pages/error', {
        title: 'Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
app.listen(PORT, () => {
    console.log('========================================');
    console.log('CHIVWATI cha WANA Tracker');
    console.log('========================================');
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('========================================\n');
});

module.exports = app;
