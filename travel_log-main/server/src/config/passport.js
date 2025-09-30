const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
    // This callback is called when Google returns user data
    const user = {
        id: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        picture: profile.photos[0].value
    };
    
    // In a real app, you'd save this user to your database
    // For now, we'll just pass the user data along
    return done(null, user);
}));

// Serialize user for session storage
passport.serializeUser((user, done) => {
    done(null, user);
});

// Deserialize user from session storage
passport.deserializeUser((user, done) => {
    done(null, user);
});

module.exports = passport;