import React, { useState } from "react";
import { Link } from "react-router-dom";
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        console.log("Registration form submitted:", formData);
        alert(`Registration attempt: ${formData.email}`);
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
                                className="password-input"
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
                                className="password-input"
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
                    <button type="submit" className="submit-button">
                        Create Account
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
