const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        // Get token from Authorization header
        const authHeader = req.header(tokenHeaderKey);
        
        if (!authHeader) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        // Extract token (remove 'Bearer ' prefix if present)
        const token = authHeader.startsWith('Bearer ') 
            ? authHeader.slice(7) 
            : authHeader;

        // Verify token
        const verified = jwt.verify(token, jwtSecretKey);
        
        // Add user data to request object
        req.user = verified;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        } else {
            return res.status(401).json({ error: 'Token verification failed' });
        }
    }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = (req, res, next) => {
    const tokenHeaderKey = process.env.TOKEN_HEADER_KEY;
    const jwtSecretKey = process.env.JWT_SECRET_KEY;

    try {
        const authHeader = req.header(tokenHeaderKey);
        
        if (authHeader) {
            const token = authHeader.startsWith('Bearer ') 
                ? authHeader.slice(7) 
                : authHeader;
            
            const verified = jwt.verify(token, jwtSecretKey);
            req.user = verified;
        }
        
        next();
    } catch (error) {
        // Don't fail, just continue without user
        next();
    }
};

module.exports = {
    verifyToken,
    optionalAuth
};