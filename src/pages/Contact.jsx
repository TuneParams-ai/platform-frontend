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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Contact form submitted:", formData);
        alert(`Thank you ${formData.name}! We'll get back to you at ${formData.email}`);
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
                            placeholder="Your full name"
                            required
                            className="form-input"
                        />
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
                            placeholder="Your email address"
                            required
                            className="form-input"
                        />
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
                            placeholder="Your phone number"
                            className="form-input"
                        />
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
                            placeholder="Tell us about your question or feedback..."
                            rows="5"
                            required
                            className="form-textarea"
                        />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="submit-button">
                        Send Message
                    </button>
                </form>

                {/* Additional Info */}
                <div className="contact-info">
                    <p className="response-notice">
                        We typically respond within 24 hours
                    </p>
                    <div className="contact-details">
                        <span>📧 support@tuneparams.ai</span>
                        <span>📞 +1 (555) 123-4567</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Contact;
