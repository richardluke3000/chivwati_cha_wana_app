const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const [totalChildren] = await db.query('SELECT COUNT(*) as count FROM child_enrollment');
        const [byDistrict] = await db.query('SELECT district, COUNT(*) as count FROM child_enrollment GROUP BY district');
        const [recentEnrollments] = await db.query('SELECT * FROM child_enrollment ORDER BY created_at DESC LIMIT 5');
        
        res.render('pages/dashboard', {
            title: 'Dashboard',
            stats: {
                totalChildren: totalChildren[0].count,
                byDistrict: byDistrict,
                recentEnrollments: recentEnrollments
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading dashboard');
    }
});

module.exports = router;