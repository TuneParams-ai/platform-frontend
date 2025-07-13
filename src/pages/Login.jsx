import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [showResendButton, setShowResendButton] = useState(false);

    const { signInWithEmail, signInWithGoogle, resendVerificationEmail } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Check for URL parameters on component mount
    useEffect(() => {
        const urlMessage = searchParams.get('message');
        const verified = searchParams.get('verified');
        const emailVerified = searchParams.get('emailVerified');
        const from = location.state?.from;

        if (from && from.pathname !== '/login') {
            setMessage("Please log in to access this page.");
        } else if (urlMessage === 'verify-email') {
            setMessage("Registration successful! Please check your email and click the verification link before signing in.");
        } else if (verified === 'true' || emailVerified === 'true') {
            setMessage("Email verified successfully! You can now sign in.");
        }
    }, [searchParams, location]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error and hide resend button when user starts typing
        if (error) setError("");
        if (showResendButton) setShowResendButton(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        const result = await signInWithEmail(formData.email, formData.password);

        if (result.success) {
            // Navigate to the page they were trying to access, or dashboard as default
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from);
        } else {
            setError(result.error);
            // If email verification is required, show resend option
            if (result.requiresVerification) {
                setShowResendButton(true);
                setMessage("Need to resend verification email? Use the 'Resend Verification' button below.");
            } else {
                setShowResendButton(false);
            }
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        setMessage("");

        const result = await signInWithGoogle();

        if (result.success) {
            // Navigate to the page they were trying to access, or dashboard as default
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleResendVerification = async () => {
        if (!formData.email || !formData.password) {
            setError("Please enter both email and password to resend verification.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("Sending verification email...");

        const result = await resendVerificationEmail(formData.email, formData.password);

        if (result.success) {
            setMessage(result.message);
            setShowResendButton(false);
        } else {
            setError(result.error);
            setMessage("");
        }

        setLoading(false);
    };

    return (
        <div className="login-page-container">
            <div className="login-card">
                {/* Header */}
                <div className="login-header">
                    <h1 className="login-title">
                        Welcome Back
                    </h1>
                    <p className="login-subtitle">
                        Sign in to your account
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="login-error-message">
                        {error}
                    </div>
                )}

                {/* Success/Info Message */}
                {message && (
                    <div className="login-success-message">
                        {message}
                    </div>
                )}

                {/* Google Sign-In Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="google-sign-in-button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {loading ? 'Signing in...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div className="divider-container">
                    <hr className="divider-line" />
                    <span className="divider-text">or</span>
                    <hr className="divider-line" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Email Field */}
                    <div className="form-field">
                        <label className="form-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="form-input"
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-field">
                        <label className="form-label">
                            Password
                        </label>
                        <div className="password-field-container">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                className="form-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle-button"
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="forgot-password-container">
                        <Link to="/forgot-password" className="forgot-password-link">
                            Forgot your password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>

                    {/* Resend Verification Button */}
                    {showResendButton && (
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={loading}
                            className="btn btn-secondary"
                            style={{
                                marginTop: '15px',
                                backgroundColor: '#6c757d',
                                border: 'none'
                            }}
                        >
                            {loading ? 'Sending...' : 'Resend Verification Email'}
                        </button>
                    )}
                </form>

                {/* Footer */}
                <div className="login-footer">
                    <p className="footer-text">
                        Don't have an account?{" "}
                        <Link to="/register" className="footer-link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
