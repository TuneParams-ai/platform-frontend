import React, { useState } from "react";
import { Link } from "react-router-dom";

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
        <div style={{
            minHeight: 'calc(100vh - 140px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'linear-gradient(135deg, rgba(29, 126, 153, 0.05) 0%, rgba(0, 0, 0, 0.8) 100%)'
        }}>
            <div style={{
                background: 'rgba(11, 11, 26, 0.95)',
                border: '1px solid rgba(29, 126, 153, 0.2)',
                borderRadius: '16px',
                padding: '40px',
                width: '100%',
                maxWidth: '480px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(29, 126, 153, 0.1)'
            }}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: 'var(--text-color)',
                        margin: '0 0 8px 0',
                        background: 'var(--metallic-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text'
                    }}>
                        Welcome Back
                    </h1>
                    <p style={{
                        color: 'var(--secondary-text-color)',
                        fontSize: '1rem',
                        margin: '0'
                    }}>
                        Sign in to your account
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px'
                }}>
                    {/* Email Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{
                            color: 'var(--text-color)',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                        }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            style={{
                                padding: '12px 16px',
                                border: '2px solid rgba(29, 126, 153, 0.2)',
                                borderRadius: '8px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'var(--text-color)',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    </div>

                    {/* Password Field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{
                            color: 'var(--text-color)',
                            fontWeight: '500',
                            fontSize: '0.9rem'
                        }}>
                            Password
                        </label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                required
                                style={{
                                    padding: '12px 16px',
                                    border: '2px solid rgba(29, 126, 153, 0.2)',
                                    borderRadius: '8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    color: 'var(--text-color)',
                                    fontSize: '1rem',
                                    outline: 'none',
                                    width: '100%',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--secondary-text-color)',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    fontSize: '1.2rem'
                                }}
                            >
                                {showPassword ? "👁️" : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password Link */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-8px' }}>
                        <Link
                            to="/forgot-password"
                            style={{
                                color: 'var(--primary-color)',
                                textDecoration: 'none',
                                fontSize: '0.9rem'
                            }}
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        style={{
                            background: 'var(--metallic-gradient)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '14px 24px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginTop: '8px',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Sign In
                    </button>
                </form>

                {/* Footer */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid rgba(29, 126, 153, 0.1)'
                }}>
                    <p style={{ color: 'var(--secondary-text-color)', margin: '0' }}>
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            style={{
                                color: 'var(--primary-color)',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                        >
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
