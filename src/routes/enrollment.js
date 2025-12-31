const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { isAuthenticated, canEdit } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const [children] = await db.query('SELECT * FROM vw_complete_child_record ORDER BY ccw_enrollment_date DESC');
        res.render('pages/enrollment/list', { title: 'Children Enrollment', children });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading enrollments');
    }
});

router.get('/new', canEdit, (req, res) => {
    res.render('pages/enrollment/form', { title: 'New Enrollment', child: null, error: null });
});

router.post('/new', canEdit, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        const [result] = await connection.query(
            `INSERT INTO child_enrollment (serial_number, district, facility, ccw_enrollment_date, 
             child_name, age_years, sex, art_number, art_regimen, duration_on_art, 
             disclosure_status, iac_status, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.body.serial_number, req.body.district, req.body.facility, req.body.ccw_enrollment_date,
             req.body.child_name, req.body.age_years, req.body.sex, req.body.art_number, 
             req.body.art_regimen, req.body.duration_on_art, req.body.disclosure_status,
             req.body.iac_status, req.session.user.user_id]
        );
        
        const enrollmentId = result.insertId;
        
        if (req.body.caregiver_name) {
            await connection.query(
                `INSERT INTO caregiver_details (enrollment_id, caregiver_name, contact_number, 
                 physical_address, age_years, sex, child_caregiver_relationship, hiv_status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [enrollmentId, req.body.caregiver_name, req.body.contact_number, 
                 req.body.physical_address, req.body.caregiver_age, req.body.caregiver_sex,
                 req.body.relationship, req.body.hiv_status]
            );
        }
        
        await connection.commit();
        res.redirect('/enrollment');
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.render('pages/enrollment/form', { 
            title: 'New Enrollment', 
            child: req.body, 
            error: 'Error saving enrollment: ' + error.message 
        });
    } finally {
        connection.release();
    }
});

module.exports = router;