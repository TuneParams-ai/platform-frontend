import React from "react";
import "./../styles/landing.css";

const Landing = () => {
  return (
    <div className="landing-page-container">
      <img src="/logo192.png" alt="Logo" className="landing-logo" />
      <h1 className="landing-heading">ML From Scratch</h1>
      <p className="landing-subheading">
        A complete machine learning course covering everything you need to build intelligent systems.
      </p>
      <button className="cta-button">Enroll Now</button>
      <div className="features-container">
        <div className="feature-item">🚀 Beginner to Pro</div>
        <div className="feature-item">📚 Multiple Lessons</div>
        <div className="feature-item">✅ Practical Challenges</div>
        <div className="feature-item">🏆 Certificates </div>
      </div>
    </div>
  );
};

export default Landing;