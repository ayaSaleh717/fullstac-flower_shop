import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import './Login.css';
import { loginUser } from '../../api/api';
import { loginSuccess } from '../../redux/feature/authSlice';
import { toast } from 'react-toastify';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser({ email: email.trim(), password: password.trim() });
            // console.log('Login response:', response);
            
            // The response is already the data we need from the API utility
            if (response && response.token) {
                dispatch(loginSuccess({
                    user: response.data, // The user data from the server
                    token: response.token // The JWT token
                }));
                toast.success('Login successful!');
                navigate('/');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login failed:', error);
            toast.error(error.message || 'Login failed');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Welcome Back!</h2>
                <p>Sign in to continue</p>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                </form>
                <div className="login-footer">
                    <p>Don't have an account? <NavLink to="/register">Sign up</NavLink></p>
                </div>
            </div>
        </div>
    );
};

export default Login;