import React, { useEffect, useState } from 'react';
import Register from './Register';
import Login from './Login';
import PrivateChat from './components/PrivateChat.jsx';

function AuthWrapper() {
    const [isRegistering, setIsRegistering] = useState(true);
    const [user, setUser] = useState(null);

    const handleLogout = () => {
        try {
            localStorage.removeItem('token');
        } catch {}
        setUser(null);
        setIsRegistering(true);
    };

    const extractUsernameFromToken = (token) => {
        try {
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const payload = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');
            const json = atob(payload);
            const data = JSON.parse(json);
            return data.sub || null;
        } catch {
            return null;
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const name = extractUsernameFromToken(token);
        if (!name) {
            localStorage.removeItem('token');
            return;
        }
        // Optional: Token kurz gegen geschützten Endpoint prüfen
        (async () => {
            try {
                const res = await fetch('http://localhost:8080/api/conversations', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    setUser(name);
                    setIsRegistering(false);
                } else {
                    localStorage.removeItem('token');
                }
            } catch {
                localStorage.removeItem('token');
            }
        })();
    }, []);

    if (user) {
        return <PrivateChat username={user} onLogout={handleLogout} />;
    }

    return isRegistering ? (
        <Register onSwitch={() => setIsRegistering(false)} />
    ) : (
        <Login onSwitch={() => setIsRegistering(true)} onLoginSuccess={setUser} />
    );
}

export default AuthWrapper;
