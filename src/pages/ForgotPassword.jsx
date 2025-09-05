import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "../styles/forgot-password.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [emailSent, setEmailSent] = useState(false);

    const { sendPasswordReset } = useAuth();
    const [searchParams] = useSearchParams();

    // Check for URL parameters on component mount
    useEffect(() => {
        const passwordReset = searchParams.get('passwordReset');
        if (passwordReset === 'true') {
            setMessage("Password reset successful! You can now sign in with your new password.");
        }
    }, [searchParams]);

    const handleChange = (e) => {
        setEmail(e.target.value);
        // Clear error when user starts typing
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        const result = await sendPasswordReset(email);

        if (result.success) {
            setMessage(result.message);
            setEmailSent(true);
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="forgot-password-page-container">
            <div className="forgot-password-card">
                {/* Header */}
                <div className="forgot-password-header">
                    <h1 className="forgot-password-title">
                        Reset Your Password
                    </h1>
                    <p className="forgot-password-subtitle">
                        {emailSent
                            ? "Check your email for reset instructions. If you don't see the email, please check your **SPAM**/junk folder."
                            : "Enter your email address and we'll send you instructions to reset your password"
                        }
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="forgot-password-error-message">
                        {error}
                    </div>
                )}

                {/* Success/Info Message */}
                {message && (
                    <div className="forgot-password-success-message">
                        {message}
                    </div>
                )}

                {!emailSent ? (
                    <>
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="forgot-password-form">
                            {/* Email Field */}
                            <div className="form-field">
                                <label className="form-label">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={handleChange}
                                    placeholder="Enter your email address"
                                    required
                                    className="form-input"
                                />
                            </div>

                            {/* Submit Button */}
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Sending...' : 'Send Reset Email'}
                            </button>
                        </form>

                        {/* Important Note */}
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '8px',
                            padding: '15px',
                            marginTop: '20px',
                            fontSize: '0.9rem',
                            color: 'var(--text-color)'
                        }}>
                            <strong>📝 Note:</strong> Password reset works even if your email is not verified.
                            After resetting your password, you'll also be able to verify your email if needed.
                        </div>
                    </>
                ) : (
                    <div className="email-sent-container">
                        <div className="forgot-password-success-container">
                            <div className="forgot-password-success-icon">📧</div>
                            <h3 className="forgot-password-success-title">
                                Email Sent!
                            </h3>
                            <p className="forgot-password-success-text">
                                We've sent password reset instructions to <strong>{email}</strong>
                            </p>
                            <p className="forgot-password-success-note">
                                Don't see the email? Check your spam folder or try again.
                            </p>
                        </div>

                        {/* Resend Button */}
                        <button
                            onClick={() => {
                                setEmailSent(false);
                                setMessage("");
                                setError("");
                            }}
                            className="btn btn-secondary forgot-password-back-button"
                        >
                            Send Another Email
                        </button>
                    </div>
                )}

                {/* Footer */}
                <div className="forgot-password-footer">
                    <p className="footer-text">
                        Remember your password?{" "}
                        <Link to="/login" className="footer-link">
                            Back to Sign In
                        </Link>
                    </p>
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

export default ForgotPassword;
