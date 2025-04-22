module.exports.isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash('error', 'You must be logged in to access this page');
    res.redirect('/login');
  };

module.exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated() && req.user.isAdmin) {
      return next();
    }
    req.flash('error', 'You must be an admin to access this page');
    res.redirect('/login');
  };