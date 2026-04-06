/**
 * Authentication Middleware
 * Protects routes that require a logged-in user
 */

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login?error=Please+log+in+to+access+this+page');
};

const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.status(403).render('error', {
    title: 'Access Denied',
    message: 'You do not have permission to access this page.'
  });
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { isAuthenticated, isAdmin, isGuest };
