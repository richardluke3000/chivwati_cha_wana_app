require('dotenv').config();
const mysql = require('mysql2/promise');

async function initializeDatabase() {
    let connection;
    
    try {
        // Connect without database first
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✓ Connected to MySQL server');

        // Create database if not exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'chivwati_tracker'}`);
        console.log(`✓ Database '${process.env.DB_NAME}' created or already exists`);

        // Use the database
        await connection.query(`USE ${process.env.DB_NAME || 'chivwati_tracker'}`);

        // Create Users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                user_id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('admin', 'data_entry', 'viewer', 'pss_coordinator') DEFAULT 'data_entry',
                district VARCHAR(100),
                facility VARCHAR(150),
                is_active BOOLEAN DEFAULT TRUE,
                last_login DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_username (username),
                INDEX idx_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: users');

        // Create Child Enrollment table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS child_enrollment (
                enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
                serial_number VARCHAR(50) UNIQUE NOT NULL,
                district VARCHAR(100) NOT NULL,
                facility VARCHAR(150) NOT NULL,
                ccw_enrollment_date DATE NOT NULL,
                child_name VARCHAR(100) NOT NULL,
                age_years INT,
                sex ENUM('M', 'F') NOT NULL,
                art_number VARCHAR(50),
                art_regimen VARCHAR(100),
                duration_on_art VARCHAR(50),
                disclosure_status ENUM('Not Disclosed', 'Partially Disclosed', 'Fully Disclosed'),
                iac_status ENUM('Not Started', 'In Progress', 'Completed'),
                first_iac_date DATE,
                completed_iac ENUM('Yes', 'No', 'In Progress'),
                followup_vl_sample_collected ENUM('Yes', 'No'),
                type_of_vl_sample ENUM('DBS', 'Plasma'),
                date_followup_vl_sample_collected DATE,
                testing_platform VARCHAR(50),
                followup_vl_result_received ENUM('Yes', 'No'),
                followup_vl_result VARCHAR(50),
                results_narrative TEXT,
                created_by INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_serial (serial_number),
                INDEX idx_district (district),
                INDEX idx_facility (facility),
                INDEX idx_enrollment_date (ccw_enrollment_date),
                FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE SET NULL
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: child_enrollment');

        // Create Caregiver Details table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS caregiver_details (
                caregiver_id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id INT NOT NULL,
                caregiver_name VARCHAR(100) NOT NULL,
                contact_number VARCHAR(20),
                physical_address TEXT,
                age_years INT,
                sex ENUM('M', 'F'),
                child_caregiver_relationship VARCHAR(50),
                hiv_status ENUM('Positive', 'Negative', 'Unknown'),
                art_status_if_positive VARCHAR(50),
                recent_vl_results_if_positive VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (enrollment_id) REFERENCES child_enrollment(enrollment_id) ON DELETE CASCADE,
                INDEX idx_enrollment (enrollment_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: caregiver_details');

        // Create Case Manager Details table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS case_manager_details (
                case_manager_id INT AUTO_INCREMENT PRIMARY KEY,
                enrollment_id INT NOT NULL,
                manager_name VARCHAR(100) NOT NULL,
                contact_number VARCHAR(20),
                cadre VARCHAR(50),
                home_assessment_done ENUM('Yes', 'No'),
                date_of_home_assessment DATE,
                issues_identified TEXT,
                action_plan_in_place TEXT,
                key_steps_taken TEXT,
                type_of_dots VARCHAR(50),
                number_of_home_visits INT DEFAULT 0,
                comments_additional_info TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (enrollment_id) REFERENCES child_enrollment(enrollment_id) ON DELETE CASCADE,
                INDEX idx_enrollment (enrollment_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: case_manager_details');

        // Create Monthly Report table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS monthly_report (
                report_id INT AUTO_INCREMENT PRIMARY KEY,
                district VARCHAR(100) NOT NULL,
                facility VARCHAR(150) NOT NULL,
                reporting_month VARCHAR(20) NOT NULL,
                reporting_year INT NOT NULL,
                reported_by INT,
                report_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_report (district, facility, reporting_month, reporting_year),
                FOREIGN KEY (reported_by) REFERENCES users(user_id) ON DELETE SET NULL,
                INDEX idx_report_date (reporting_year, reporting_month)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: monthly_report');

        // Create Monthly Report Metrics table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS monthly_report_metrics (
                metric_id INT AUTO_INCREMENT PRIMARY KEY,
                report_id INT NOT NULL,
                metric_category VARCHAR(100) NOT NULL,
                metric_name VARCHAR(200) NOT NULL,
                age_category ENUM('0-4', '5-9', '10-14'),
                sex ENUM('M', 'F', 'P', 'B'),
                value INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (report_id) REFERENCES monthly_report(report_id) ON DELETE CASCADE,
                INDEX idx_report (report_id),
                INDEX idx_category (metric_category)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: monthly_report_metrics');

        // Create Monthly Report Narrative table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS monthly_report_narrative (
                narrative_id INT AUTO_INCREMENT PRIMARY KEY,
                report_id INT NOT NULL,
                successes TEXT,
                challenges TEXT,
                lessons_learnt TEXT,
                best_practices TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (report_id) REFERENCES monthly_report(report_id) ON DELETE CASCADE,
                INDEX idx_report (report_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: monthly_report_narrative');

        // Create Reporting Instructions table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS reporting_instructions (
                instruction_id INT AUTO_INCREMENT PRIMARY KEY,
                instruction_number INT,
                instruction_text TEXT NOT NULL,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        console.log('✓ Table: reporting_instructions');

        // Insert default reporting instructions
        await connection.query(`
            INSERT IGNORE INTO reporting_instructions (instruction_id, instruction_number, instruction_text) VALUES
            (1, 1, 'Report this data at facility level for all sites implementing CCW'),
            (2, 2, 'Report this data on monthly basis'),
            (3, 3, 'PSS coordinator should lead in compiling and entering the report in DHIS2'),
            (4, 4, 'Generate this report "as of" or "by" (cumulative cohort report)'),
            (5, 5, 'If the reporting month is November 2024, the reporting period is "as of" or "by" October 2024'),
            (6, 6, 'Use CCW Tracker as primary data source for this report'),
            (7, 7, 'The Treatment Supporter should enter the report in DHIS2 by 5th of every new month')
        `);
        console.log('✓ Default reporting instructions inserted');

        // Create default admin user (password: admin123)
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.query(`
            INSERT IGNORE INTO users (user_id, username, email, password, full_name, role, district, facility) 
            VALUES (1, 'admin', 'admin@chivwati.org', ?, 'System Administrator', 'admin', 'Central', 'Main Office')
        `, [hashedPassword]);
        console.log('✓ Default admin user created (username: admin, password: admin123)');

        // Create views
        await connection.query(`
            CREATE OR REPLACE VIEW vw_complete_child_record AS
            SELECT 
                e.enrollment_id,
                e.serial_number,
                e.district,
                e.facility,
                e.ccw_enrollment_date,
                e.child_name,
                e.age_years AS child_age,
                e.sex AS child_sex,
                e.art_number,
                e.art_regimen,
                e.duration_on_art,
                e.disclosure_status,
                e.iac_status,
                e.first_iac_date,
                e.completed_iac,
                e.followup_vl_sample_collected,
                e.type_of_vl_sample,
                e.date_followup_vl_sample_collected,
                e.testing_platform,
                e.followup_vl_result_received,
                e.followup_vl_result,
                c.caregiver_name,
                c.contact_number AS caregiver_contact,
                c.physical_address,
                c.age_years AS caregiver_age,
                c.sex AS caregiver_sex,
                c.child_caregiver_relationship,
                c.hiv_status AS caregiver_hiv_status,
                c.art_status_if_positive AS caregiver_art_status,
                cm.manager_name AS case_manager_name,
                cm.contact_number AS case_manager_contact,
                cm.cadre,
                cm.home_assessment_done,
                cm.date_of_home_assessment,
                cm.issues_identified,
                cm.action_plan_in_place,
                cm.type_of_dots,
                cm.number_of_home_visits,
                e.results_narrative
            FROM child_enrollment e
            LEFT JOIN caregiver_details c ON e.enrollment_id = c.enrollment_id
            LEFT JOIN case_manager_details cm ON e.enrollment_id = cm.enrollment_id
        `);
        console.log('✓ View: vw_complete_child_record');

        await connection.query(`
            CREATE OR REPLACE VIEW vw_enrollment_by_district AS
            SELECT 
                district,
                COUNT(*) AS total_enrollments,
                SUM(CASE WHEN sex = 'M' THEN 1 ELSE 0 END) AS males,
                SUM(CASE WHEN sex = 'F' THEN 1 ELSE 0 END) AS females,
                ROUND(AVG(age_years), 1) AS average_age
            FROM child_enrollment
            GROUP BY district
        `);
        console.log('✓ View: vw_enrollment_by_district');

        console.log('\n========================================');
        console.log('✓ Database initialization completed!');
        console.log('========================================');
        console.log('\nDefault Login Credentials:');
        console.log('  Username: admin');
        console.log('  Password: admin123');
        console.log('\nPlease change the default password after first login!');
        console.log('========================================\n');

    } catch (error) {
        console.error('✗ Error initializing database:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run if called directly
if (require.main === module) {
    initializeDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = initializeDatabase;
