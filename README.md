# CHIVWATI cha WANA Initiative Tracker

A simple full-stack web application for tracking children with high viral load in the CHIVWATI cha WANA Initiative.

## 🎨 Features

- ✅ **User Management** - Role-based access (Admin, PSS Coordinator, Data Entry, Viewer)
- ✅ **Child Enrollment** - Complete tracking with caregiver and case manager details
- ✅ **Monthly Reporting** - Age/sex disaggregated metrics
- ✅ **Dashboard** - Real-time statistics and recent enrollments
- ✅ **PDF Reports** - Downloadable reports
- ✅ **Data Export** - CSV export functionality
- ✅ **Modern UI** - Red-themed, responsive design
- ✅ **Secure Authentication** - Password hashing with bcrypt
- ✅ **Session Management** - Secure user sessions

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **EJS** - Template engine
- **bcryptjs** - Password hashing
- **PDFKit** - PDF generation

### Frontend
- **HTML5/CSS3** - Structure and styling
- **Vanilla JavaScript** - Client-side functionality
- **Modern Red Theme** - Custom CSS with gradients

## 📋 Prerequisites

1. **Node.js** v14 or higher
   - Download: https://nodejs.org/

2. **MySQL** v5.7 or higher
   - Download: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP/MAMP

## 🚀 Installation

### 1. Clone the repo
```bash
git clone https://github.com/richardluke3000/chivwati_cha_wana_app.git
```

### 2. Install Dependencies
```bash
cd into the cloned repo

npm install
```

### 3. Configure Environment
Edit `.env` file with your database credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=chivwati_tracker
DB_PORT=3306
PORT=3000
```

### 4. Initialize Database
```bash
npm run init-db
```

This creates:
- Database schema
- All tables and relationships
- Default admin user
- Sample data

### 5. Start Application
```bash
npm start
```

Application available at: **http://localhost:3000**

## 🔐 Default Credentials

```
Username: admin
Password: admin123
```

**⚠️ IMPORTANT:** Change the default password after first login!

## 📁 Project Structure
## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, user management |
| **PSS Coordinator** | View all data, approve reports, generate reports |
| **Data Entry** | Add/edit child enrollments, view assigned data |
| **Viewer** | Read-only access to data |

## 📊 Database Schema

### Main Tables
- `users` - User accounts and authentication
- `child_enrollment` - Child enrollment data
- `caregiver_details` - Caregiver information
- `case_manager_details` - Case manager assignments
- `monthly_report` - Monthly report headers
- `monthly_report_metrics` - Disaggregated metrics
- `monthly_report_narrative` - Report narratives
- `reporting_instructions` - Standard procedures

### Views
- `vw_complete_child_record` - Complete child data
- `vw_enrollment_by_district` - District statistics

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ Secure session management
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS protection
- ✅ Role-based access control
- ✅ HTTPS ready (configure in production)


## 🔄 Backup & Maintenance

### Database Backup
```bash
# Backup
assuming the application is running on local host

mysqldump -u root -p chivwati_tracker > backup_$(date +%Y%m%d).sql

# Restore
mysql -u root -p chivwati_tracker < backup_20241228.sql
```

## 📝 License

Copyright © 2025 CHIVWATI cha WANA Initiative. All rights reserved.

## 🆘 Support

For technical support:
- Email: richard.luke@righttocare.org

## 🔄 Updates

### Version 1.0.0 (December 2024)
- Initial release
- User management
- Child enrollment
- Monthly reporting
- PDF generation
- Modern red-themed UI

## 🙏 Acknowledgments

Developed for the CHIVWATI cha WANA Initiative to support healthcare workers in tracking and supporting children with high viral load by Richard Luke.

---
