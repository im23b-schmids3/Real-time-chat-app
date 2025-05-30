import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import App from './App';

function AuthWrapper() {
    const [isRegistering, setIsRegistering] = useState(true);
    const [user, setUser] = useState(null);

    if (user) {
        return <App username={user} />;
    }

    return isRegistering ? (
        <Register onSwitch={() => setIsRegistering(false)} />
    ) : (
        <Login onSwitch={() => setIsRegistering(true)} onLoginSuccess={setUser} />
    );
}

export default AuthWrapper;
