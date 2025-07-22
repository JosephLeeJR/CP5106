// Admin middleware to protect admin routes
module.exports = function(req, res, next) {
  // User must be authenticated first
  if (!req.user) {
    return res.status(401).json({ msg: 'No authentication token, authorization denied' });
  }

  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ msg: 'Access denied: Admin privileges required' });
  }

  next();
}; 