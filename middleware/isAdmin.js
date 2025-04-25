// middleware/isAdmin.js
module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
  
    console.warn(`Admin access denied: ${req.originalUrl} by user ${req.user?.username || 'Unknown'}`);
    req.flash('error', 'You must be an admin to access this page.');
    res.redirect('/login');
  };
  