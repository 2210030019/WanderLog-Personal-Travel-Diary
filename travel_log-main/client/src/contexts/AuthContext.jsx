import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Decode JWT to get user info (you can use jwt-decode library)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.id,
                    name: payload.name,
                    email: payload.email,
                    picture: payload.picture
                });
            } catch (error) {
                console.error('Invalid token');
                logout();
            }
        }
        setLoading(false);
    }, [token]);

    const login = () => {
        // Redirect to server's Google OAuth
        window.location.href = 'http://localhost:1337/auth/google';
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        // Optionally call server logout
        fetch('http://localhost:1337/auth/logout');
    };

    const handleAuthSuccess = (tokenFromURL) => {
        localStorage.setItem('token', tokenFromURL);
        setToken(tokenFromURL);
    };

    const value = {
        user,
        token,
        login,
        logout,
        handleAuthSuccess,
        loading,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};