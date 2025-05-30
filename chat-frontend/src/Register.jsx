import React, { useState } from 'react';

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
        <div style={styles.container}>
            <h2>Registrierung</h2>
            {error && <div style={styles.error}>{error}</div>}
            {success && <div style={styles.success}>{success}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    name="name"
                    placeholder="Benutzername"
                    value={form.name}
                    onChange={handleChange}
                    required
                />
                <input
                    name="email"
                    type="email"
                    placeholder="E-Mail"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Passwort"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Passwort bestätigen"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                />
                <button type="submit">Registrieren</button>
            </form>
            <p>
                Bereits registriert?{' '}
                <span style={styles.link} onClick={onSwitch}>
                    Jetzt einloggen
                </span>
            </p>
        </div>
    );
}

const styles = {
    container: {
        maxWidth: 400,
        margin: '50px auto',
        padding: 20,
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10
    },
    error: {
        color: 'red',
        marginBottom: 10
    },
    success: {
        color: 'green',
        marginBottom: 10
    },
    link: {
        color: '#007bff',
        cursor: 'pointer'
    }
};

export default Register;
