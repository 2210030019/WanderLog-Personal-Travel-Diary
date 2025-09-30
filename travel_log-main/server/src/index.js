const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const session = require('express-session');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const middlewares = require('./middlewares');
const mongoose = require ('mongoose');

const logs = require('./api/logs');

// Import passport configuration
const passport = require('./config/passport');

const app = express();


mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser : true ,
    useUnifiedTopology : true,
    
}).then( ()=> console.log("Database Connected ! ")
).catch(    
    err => console.log(err)
)

app.use(morgan('common'));
app.use(helmet());
app.use(cors({
    origin : process.env.CORS_ORIGIN,
}));

app.use(express.json());

// Session configuration for Passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/',(req,res)=> {
    res.json({
        message: 'Hello World!'
    })
});

// Authentication Routes
// Redirect to Google for authentication
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google callback after successful authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Generate JWT token after successful authentication
        const jwtSecretKey = process.env.JWT_SECRET_KEY;
        const userData = {
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            picture: req.user.picture,
            time: Date()
        };

        const token = jwt.sign(userData, jwtSecretKey, { expiresIn: '7d' });

        // Redirect to frontend with token
        res.redirect(`${process.env.CORS_ORIGIN}/auth/success?token=${token}`);
    }
);

// Logout route
app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logged out successfully' });
    });
});

// Get current user (if authenticated)
app.get('/auth/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user);
    } else {
        res.status(401).json({ error: 'Not authenticated' });
    }
});

app.use('/api/logs' , logs);

app.use(middlewares.notFound);

app.use(middlewares.errorHandler);



const port = process.env.PORT || 1337;

app.listen(port, ()=>{
    console.log(`Listening at https://localhost:${port}`);
});