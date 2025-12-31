const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const db = require('../config/database');
const { isAuthenticated } = require('../middleware/auth');

router.get('/', isAuthenticated, async (req, res) => {
    try {
        const [reports] = await db.query('SELECT * FROM monthly_report ORDER BY reporting_year DESC, reporting_month DESC');
        res.render('pages/reports/list', { title: 'Reports', reports });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error loading reports');
    }
});

router.get('/pdf/:id', isAuthenticated, async (req, res) => {
    try {
        const [reports] = await db.query('SELECT * FROM monthly_report WHERE report_id = ?', [req.params.id]);
        if (reports.length === 0) return res.status(404).send('Report not found');
        
        const report = reports[0];
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=report-${report.report_id}.pdf`);
        doc.pipe(res);
        
        doc.fontSize(20).text('CHIVWATI cha WANA Monthly Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`District: ${report.district}`);
        doc.text(`Facility: ${report.facility}`);
        doc.text(`Period: ${report.reporting_month} ${report.reporting_year}`);
        doc.end();
    } catch (error) {
        console.error(error);
        res.status(500).send('Error generating PDF');
    }
});

module.exports = router;