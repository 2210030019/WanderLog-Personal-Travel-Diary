import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const AuthCallback = () => {
    const { handleAuthSuccess } = useAuth();

    useEffect(() => {
        // Extract token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        if (token) {
            handleAuthSuccess(token);
            // Redirect to main app
            window.location.href = '/';
        } else {
            // Handle error - redirect to login
            window.location.href = '/';
        }
    }, [handleAuthSuccess]);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            <div>Processing authentication...</div>
        </div>
    );
};

export default AuthCallback;