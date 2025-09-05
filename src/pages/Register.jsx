import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/register.css";

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { registerWithEmail, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long!");
            return;
        }

        setLoading(true);
        setError("");

        const result = await registerWithEmail(
            formData.email,
            formData.password,
            formData.firstName,
            formData.lastName
        );

        if (result.success) {
            if (result.requiresVerification) {
                // Show success message for email verification
                setError(""); // Clear any previous errors
                alert(result.message || "Registration successful! Please check your email and verify your account before signing in. If you don't see the email, please check your **SPAM**/junk folder.");
                // Redirect to login page with a message
                navigate('/login?message=verify-email');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");

        const result = await signInWithGoogle();

        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="register-page-container">
            <div className="register-card">
                {/* Header */}
                <div className="register-header">
                    <h1 className="register-title">
                        Create Account
                    </h1>
                    <p className="register-subtitle">
                        Join our learning platform
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="register-error-message">
                        {error}
                    </div>
                )}

                {/* Google Sign-In Button */}
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="register-google-button"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    {loading ? 'Signing up...' : 'Continue with Google'}
                </button>

                {/* Divider */}
                <div className="register-divider-container">
                    <hr className="register-divider-line" />
                    <span className="register-divider-text">or</span>
                    <hr className="register-divider-line" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="register-form">
                    {/* Name Fields Row */}
                    <div className="name-fields-row">
                        {/* First Name */}
                        <div className="form-field-half">
                            <label className="form-label">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First name"
                                required
                                className="form-input"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="form-field-half">
                            <label className="form-label">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last name"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>

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
                                placeholder="Create a password"
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

                    {/* Confirm Password Field */}
                    <div className="form-field">
                        <label className="form-label">
                            Confirm Password
                        </label>
                        <div className="password-field-container">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                                className="form-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle-button"
                            >
                                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                {/* Footer */}
                <div className="register-footer">
                    <p className="footer-text">
                        Already have an account?{" "}
                        <Link to="/login" className="footer-link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
