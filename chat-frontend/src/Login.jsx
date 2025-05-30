import React, { useState } from 'react';

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
        <div style={styles.container}>
            <h2>Login</h2>
            {error && <div style={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit} style={styles.form}>
                <input name="name" placeholder="Benutzername" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Passwort" onChange={handleChange} required />
                <button type="submit">Login</button>
            </form>
            <p>
                Noch kein Konto?{' '}
                <span style={styles.link} onClick={onSwitch}>
                    Jetzt registrieren
                </span>
            </p>
        </div>
    );
}

const styles = {
    container: { maxWidth: 400, margin: '50px auto', padding: 20, textAlign: 'center' },
    form: { display: 'flex', flexDirection: 'column', gap: 10 },
    error: { color: 'red' },
    link: { color: '#007bff', cursor: 'pointer' },
};

export default Login;
