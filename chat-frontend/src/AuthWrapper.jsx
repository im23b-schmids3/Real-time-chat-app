import React, { useState } from 'react';
import Register from './Register';
import Login from './Login';
import PrivateChat from './components/PrivateChat.jsx';

function AuthWrapper() {
    const [isRegistering, setIsRegistering] = useState(true);
    const [user, setUser] = useState(null);

    if (user) {
        return <PrivateChat username={user} />;
    }

    return isRegistering ? (
        <Register onSwitch={() => setIsRegistering(false)} />
    ) : (
        <Login onSwitch={() => setIsRegistering(true)} onLoginSuccess={setUser} />
    );
}

export default AuthWrapper;
