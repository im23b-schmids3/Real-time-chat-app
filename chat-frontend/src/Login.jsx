import React, { useState } from 'react';
import './styles/common.css';

function Login({ onSwitch, onLoginSuccess }) {
    const [form, setForm] = useState({ name: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const token = await response.text();
            if (!response.ok) throw new Error(token);

            localStorage.setItem('token', token);
            onLoginSuccess(form.name);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--secondary-color)' }}>Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    className="auth-input"
                    name="name"
                    placeholder="Benutzername"
                    onChange={handleChange}
                    required
                />
                <input
                    className="auth-input"
                    name="password"
                    type="password"
                    placeholder="Passwort"
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="auth-button">Login</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Noch kein Konto?{' '}
                <span className="auth-link" onClick={onSwitch}>
                    Jetzt registrieren
                </span>
            </p>
        </div>
    );
}

export default Login;
