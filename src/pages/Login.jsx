import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/login.css";

const Login = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        alert(`Login attempt: ${formData.email}`);
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
                    <button type="submit" className="btn">
                        Sign In
                    </button>
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
