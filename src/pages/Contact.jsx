// src/pages/Contact.jsx

import React, { useState } from "react";
import "../styles/contact.css";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const validateField = (name, value) => {
        const newErrors = { ...errors };

        switch (name) {
            case 'name':
                if (!value.trim()) {
                    newErrors.name = 'Name is required';
                } else if (value.trim().length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                } else {
                    delete newErrors.name;
                }
                break;
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!value.trim()) {
                    newErrors.email = 'Email is required';
                } else if (!emailRegex.test(value)) {
                    newErrors.email = 'Please enter a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
            case 'phone':
                if (value && value.length > 0) {
                    const phoneRegex = /^[+]?[\d\s\-()]+$/;
                    if (!phoneRegex.test(value)) {
                        newErrors.phone = 'Please enter a valid phone number';
                    } else {
                        delete newErrors.phone;
                    }
                } else {
                    delete newErrors.phone;
                }
                break;
            case 'message':
                if (!value.trim()) {
                    newErrors.message = 'Message is required';
                } else if (value.trim().length < 10) {
                    newErrors.message = 'Message must be at least 10 characters';
                } else {
                    delete newErrors.message;
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Validate field if it's been touched
        if (touched[name]) {
            validateField(name, value);
        }

        // Clear submit status when user starts typing again
        if (submitStatus) {
            setSubmitStatus(null);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const isFormValid = () => {
        const requiredFields = ['name', 'email', 'message'];
        const allFieldsValid = requiredFields.every(field => {
            validateField(field, formData[field]);
            return !errors[field];
        });

        // Also validate phone if provided
        if (formData.phone) {
            validateField('phone', formData.phone);
        }

        return allFieldsValid && Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        setTouched({
            name: true,
            email: true,
            phone: true,
            message: true
        });

        // Validate form
        if (!isFormValid()) {
            setSubmitStatus('validation');
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            // Replace 'YOUR_FORM_ID' with your actual Formspree form ID
            const response = await fetch('https://formspree.io/f/xkgbylng', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.message,
                    _subject: `New contact form submission from ${formData.name}`,
                }),
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    message: ""
                });
                setErrors({});
                setTouched({});
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="contact-page-container">
            <div className="contact-card">
                {/* Header */}
                <div className="contact-header">
                    <h1 className="contact-title">
                        Contact Us
                    </h1>
                    <p className="contact-subtitle">
                        Have questions or suggestions? We'd love to hear from you!
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="contact-form">
                    {/* Validation Error Message */}
                    {submitStatus === 'validation' && (
                        <div className="form-message error">
                            <p>❌ Please fix the errors below and try again.</p>
                        </div>
                    )}

                    {/* Success Message */}
                    {submitStatus === 'success' && (
                        <div className="form-message success">
                            <p>✅ Thank you for your message! We'll get back to you within 24 hours.</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {submitStatus === 'error' && (
                        <div className="form-message error">
                            <p>❌ Sorry, there was an error sending your message. Please try again or contact us directly.</p>
                        </div>
                    )}

                    {/* Name Field */}
                    <div className="form-field">
                        <label className="form-label">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Your full name"
                            required
                            className={`form-input ${errors.name ? 'error' : ''}`}
                        />
                        {errors.name && <span className="field-error">{errors.name}</span>}
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
                            onBlur={handleBlur}
                            placeholder="Your email address"
                            required
                            className={`form-input ${errors.email ? 'error' : ''}`}
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    {/* Phone Field */}
                    <div className="form-field">
                        <label className="form-label">
                            Phone Number <span className="optional-text">(optional)</span>
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Your phone number"
                            className={`form-input ${errors.phone ? 'error' : ''}`}
                        />
                        {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>

                    {/* Message Field */}
                    <div className="form-field">
                        <label className="form-label">
                            Message
                        </label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Tell us about your question or feedback..."
                            rows="5"
                            required
                            className={`form-textarea ${errors.message ? 'error' : ''}`}
                        />
                        {errors.message && <span className="field-error">{errors.message}</span>}
                        <div className="character-count">
                            {formData.message.length}/500 characters
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                </form>

                {/* Additional Info */}
                <div className="contact-info">
                    <p className="response-notice">
                        We typically respond within 24 hours
                    </p>

                    <div className="contact-methods">
                        <div className="contact-method">
                            <div className="contact-icon">📧</div>
                            <div className="contact-details-text">
                                <strong>Email</strong>
                                <span>admin@tuneparams.ai</span>
                            </div>
                        </div>

                        <div className="contact-method">
                            <div className="contact-icon">🕒</div>
                            <div className="contact-details-text">
                                <strong>Response Time</strong>
                                <span>Within 24 hours</span>
                            </div>
                        </div>

                        <div className="contact-method">
                            <div className="contact-icon">🌍</div>
                            <div className="contact-details-text">
                                <strong>Timezone</strong>
                                <span>UTC-8 (PST)</span>
                            </div>
                        </div>
                    </div>

                    <div className="social-links">
                        <p className="social-title">Follow us on social media</p>
                        <div className="social-buttons">
                            <a href="https://linkedin.com/company/tuneparams" target="_blank" rel="noopener noreferrer" className="social-btn linkedin">
                                LinkedIn
                            </a>
                            <a href="https://twitter.com/tuneparams" target="_blank" rel="noopener noreferrer" className="social-btn twitter">
                                Twitter
                            </a>
                            <a href="https://github.com/tuneparams" target="_blank" rel="noopener noreferrer" className="social-btn github">
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
