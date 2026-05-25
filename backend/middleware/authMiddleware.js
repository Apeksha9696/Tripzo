const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Validates JWT in Authorization header and decodes token payload
 */
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    console.log('[AUTH MIDDLEWARE] Access Denied: No token provided');
    return res.status(401).json({
      error: 'No token provided'
    });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('[AUTH MIDDLEWARE] CRITICAL ERROR: JWT_SECRET environment variable is missing!');
    return res.status(500).json({
      error: 'Server configuration error'
    });
  }

  try {
    const rawToken = token.replace('Bearer ', '');
    const decoded = jwt.verify(rawToken, jwtSecret);
    
    // Assign parsed payload to request context
    req.user = decoded;
    next();
  } catch (err) {
    console.error(`[AUTH MIDDLEWARE] JWT validation failed: ${err.message}`);
    return res.status(401).json({
      error: 'Invalid Token: ' + err.message
    });
  }
};

/**
 * Role Authorization Middleware
 * Restricts route accessibility based on user role
 * @param {Array<String>|String} roles Allowed roles
 */
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }
  
  return (req, res, next) => {
    // If not authenticated first
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User is not authenticated' });
    }
    
    const hasRole = roles.length === 0 || roles.includes(req.user.role);
    if (!hasRole) {
      console.warn(`[AUTH AUTHORIZE] Forbidden access attempt by user ID ${req.user.id} with role "${req.user.role}". Allowed roles: ${JSON.stringify(roles)}`);
      return res.status(403).json({ error: 'Access Denied: Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  auth: authMiddleware,
  authMiddleware, // Alias for maximum import compatibility
  authorize
};
