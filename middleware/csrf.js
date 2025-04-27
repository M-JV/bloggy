const csrf = require('csurf');

// Setup CSRF protection
const csrfProtection = csrf();

// Middleware to add csrfToken to res.locals
const addCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

module.exports = {
  csrfProtection,
  addCsrfToken
};
