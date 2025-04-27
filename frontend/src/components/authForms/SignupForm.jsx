import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import './authForm.css';

const SignupForm = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    
    const passwordsMatch = () =>  password === confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
        const response = await fetch('/user/register', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
            throw new Error('Failed to connect to the server');
        }
        const { token } = response.data;
        localStorage.setItem("token", token); // Just for testing. TODO: use cookies or sessions in useAuth Hook
        navigate({ to: '/login' });  
        } catch (error) {
        setError(error.message);
        }
    };
    return (
        <div className="form-wrapper">
            <h1>Sign Up</h1>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <label htmlFor="email">
                    Email:
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </label>
                <label htmlFor="username">
                    Username:
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </label>
                <label htmlFor="password">
                    Password:
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </label>
                <label htmlFor="confirm-password">
                    Confirm Password:
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>
                <button type="submit"  disabled={!passwordsMatch()}>Sign Up</button>
            </form>
        </div>
    );
}

export default SignupForm;