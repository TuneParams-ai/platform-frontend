import React from "react";
import "../styles/about.css";

const About = () => {
    return (
        <div className="about-page-container">
            <div className="about-card metallic-border metallic-glow">
                <header className="about-header">
                    <h1 className="about-title">👋 About Us</h1>
                    <p className="about-subtitle">Hello! from <span className="metallic-text">TuneParams</span></p>
                </header>

                <section className="about-section">
                    <p>
                        We’re a small, passionate team with diverse backgrounds, united by a shared mission: to make a positive
                        societal impact through Artificial Intelligence starting with accessible, practical, and impactful AI
                        courses for learners from all walks of life.
                    </p>
                    <p>
                        Our instructors hold PhD in Machine Learning from top-tier universities, with over 8 years of experience in AI/ML and 2 years building state-of-the-art models in industry. They have worked on the cutting
                        edge applications and now, they are here to guide you from foundational concepts to advanced mastery.
                    </p>

                    <p className="about-highlight metallic-border">
                        At <strong>TuneParams.ai</strong>, we don’t just teach you. We prepare you to become an AI expert - confident,
                        capable, and ready to thrive in the era of AI.
                    </p>
                </section>

                {/* <div className="about-cta">
                    <a className="btn" href="#/courses">Explore Courses</a>
                    <a className="btn btn-secondary" href="#/contact">Contact Us</a>
                </div> */}
            </div>
        </div>
    );
};

export default About;
