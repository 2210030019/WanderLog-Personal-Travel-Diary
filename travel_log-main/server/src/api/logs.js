const { Router } = require('express');
const { verifyToken, optionalAuth } = require('../middleware/auth');

const LogEntry = require('../models/LogEntry');

const router = Router();

// GET all logs - optional auth (anyone can view)
router.get('/', optionalAuth, async (req , res , next ) => {
    try {
        let entries;
        if (req.user) {
            // If user is authenticated, show only their entries
            entries = await LogEntry.find({ userId: req.user.id });
        } else {
            // If no user, show entries that don't have userId (old entries) or public entries
            entries = await LogEntry.find({ 
                $or: [
                    { userId: { $exists: false } }, // Old entries without userId
                    { userId: null } // Explicitly null userId
                ]
            });
        }
        res.json(entries);
    } catch (error) {
        next(error);
    }
});

// POST new log - requires authentication
router.post('/', verifyToken, async (req , res, next)=> {
    try {
        // Add user info to the log entry
        const logEntryData = {
            ...req.body,
            userId: req.user.id,
            userEmail: req.user.email,
            userName: req.user.name
        };
        
        const logEntry = new LogEntry(logEntryData);
        const createdEntry = await logEntry.save();
        res.json(createdEntry);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(422);
        }
        next(error);
    }
});

// GET endpoint to clear old entries without user info (development only)
router.get('/clear-old-entries', async (req, res, next) => {
    try {
        const result = await LogEntry.deleteMany({ 
            $or: [
                { userId: { $exists: false } }, 
                { userId: null }
            ]
        });
        res.json({ 
            message: `Deleted ${result.deletedCount} old entries without user information` 
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router ;
