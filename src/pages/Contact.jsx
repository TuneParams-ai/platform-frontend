// src/pages/Contact.jsx

import React from "react";
import "../styles/contact.css";

function Contact() {
    return (
        <div className="contact-container">
            <h1>Contact Us</h1>
            <p>Have questions or suggestions? We'd love to hear from you!</p>
            <form className="contact-form">
                <label>Name:</label>
                <input type="text" placeholder="Your Name" />

                <label>Email:</label>
                <input type="email" placeholder="Your Email" />

                <label>Message:</label>
                <textarea rows="4" placeholder="Your Message" />

                <button type="submit">Send</button>
            </form>
        </div>
    );
}

export default Contact;
