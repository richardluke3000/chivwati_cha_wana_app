// Authentication middleware
const authMiddleware = {
    // Check if user is authenticated
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        res.redirect('/auth/login');
    },

    // Check if user is admin
    isAdmin: (req, res, next) => {
        if (req.session && req.session.user && req.session.user.role === 'admin') {
            return next();
        }
        res.status(403).render('pages/error', {
            title: 'Access Denied',
            error: { message: 'You do not have permission to access this page' }
        });
    },

    // Check if user is PSS Coordinator or Admin
    isPSSCoordinator: (req, res, next) => {
        if (req.session && req.session.user && 
            (req.session.user.role === 'pss_coordinator' || req.session.user.role === 'admin')) {
            return next();
        }
        res.status(403).render('pages/error', {
            title: 'Access Denied',
            error: { message: 'Only PSS Coordinators can access this page' }
        });
    },

    // Check if user can view data
    canView: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        res.redirect('/auth/login');
    },

    // Check if user can edit data
    canEdit: (req, res, next) => {
        if (req.session && req.session.user && 
            ['admin', 'data_entry', 'pss_coordinator'].includes(req.session.user.role)) {
            return next();
        }
        res.status(403).render('pages/error', {
            title: 'Access Denied',
            error: { message: 'You do not have permission to edit data' }
        });
    },

    // Redirect if already logged in
    redirectIfAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            return res.redirect('/dashboard');
        }
        next();
    }
};

module.exports = authMiddleware;
