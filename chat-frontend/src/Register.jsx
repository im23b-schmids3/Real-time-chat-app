import React, { useState } from 'react';
import './styles/common.css';

function Register({ onSwitch }) {
    const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            setError('Passwörter stimmen nicht überein');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    password: form.password
                })
            });

            const data = await response.text();
            if (!response.ok) throw new Error(data);

            setSuccess('Registrierung erfolgreich. Sie können sich jetzt einloggen.');
            setError('');
            setTimeout(() => onSwitch(), 2000);
        } catch (err) {
            setError(err.message);
            setSuccess('');
        }
    };

    return (
        <div className="auth-container">
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--secondary-color)' }}>Registrierung</h2>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    className="auth-input"
                    name="name"
                    placeholder="Benutzername"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <input
                    className="auth-input"
                    name="email"
                    type="email"
                    placeholder="E-Mail"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    className="auth-input"
                    name="password"
                    type="password"
                    placeholder="Passwort"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <input
                    className="auth-input"
                    name="confirmPassword"
                    type="password"
                    placeholder="Passwort bestätigen"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button type="submit" className="auth-button">Registrieren</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
                Bereits registriert?{' '}
                <span className="auth-link" onClick={onSwitch}>
                    Jetzt einloggen
                </span>
            </p>
        </div>
    );
}

export default Register;
