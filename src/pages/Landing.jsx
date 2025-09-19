import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./../styles/landing.css";
import HomeReviews from "../components/HomeReviews";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // HomeReviews handles its own data

  const handleEnrollClick = () => {
    navigate('/courses');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="landing-page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Master the World of AI</h1>
            <p className="hero-subtitle">
              No prior experience? No problem. Learn from the foundations of AI and build real-world applications in this beginner-friendly course.
            </p>
            <p className="hero-description">
              Start your journey in AI with a hands-on course designed for beginners - from high-school students to experienced professionals and curious learners of all backgrounds.
            </p>
            <div className="hero-buttons">
              <button className="cta-primary" onClick={handleEnrollClick}>
                Browse Courses
              </button>
              {user ? (
                <button className="cta-secondary" onClick={handleDashboardClick}>
                  Go to Dashboard
                </button>
              ) : (
                <button className="cta-secondary" onClick={handleRegisterClick}>
                  Register Now
                </button>
              )}
            </div>
          </div>
          <div className="hero-image">
            <img src="/logo1024.png" alt="TuneParams.ai Logo" />
          </div>
        </div>
      </section>

      {/* Merged Audience & About Section */}
      <section className="merged-info-section">
        <div className="merged-info-container">
          <div className="about-content-merged">
            <h2>Why TuneParams.ai?</h2>
            <p>
              At TuneParams.ai, we believe that anyone can become master of Artificial Intelligence with the right guidance.
              Our Courses simplifies complex topics and helps you build an intuitive and practical understanding
              of core AI concepts, with no math background required.
            </p>
          </div>
          <div className="audience-content-merged">
            <h2>Who Should Take This Course?</h2>
            <div className="audience-grid-compact">
              <div className="audience-item-compact">
                <div className="audience-icon">🎓</div>
                <h4>Beginners</h4>
                <p>Looking to enter the field of AI</p>
              </div>
              <div className="audience-item-compact">
                <div className="audience-icon">📚</div>
                <h4>Students</h4>
                <p>High school students seeking an applied introduction to AI</p>
              </div>
              <div className="audience-item-compact">
                <div className="audience-icon">💼</div>
                <h4>Professionals</h4>
                <p>Experienced IT professionals wanting to upskill</p>
              </div>
              <div className="audience-item-compact">
                <div className="audience-icon">👨‍💻</div>
                <h4>Developers</h4>
                <p>Software developers looking to integrate AI into their applications</p>
              </div>
              <div className="audience-item-compact">
                <div className="audience-icon">📊</div>
                <h4>Data Analysts</h4>
                <p>Data professionals wanting to advance to machine learning roles</p>
              </div>
              <div className="audience-item-compact">
                <div className="audience-icon">🔍</div>
                <h4>Curious Minds</h4>
                <p>Anyone curious about how AI works behind the scenes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Reviews Carousel */}
      <HomeReviews />

      {/* What You'll Learn Section */}
      <section className="curriculum-section">
        <h2>What You'll Learn</h2>
        {/* <p className="curriculum-intro">
          This course covers both math foundations and practical skills. Topics include:
        </p> */}
        <div className="curriculum-grid">
          <div className="curriculum-item">
            <h3>Introduction to AI</h3>
            <p>Understand what AI is, types of AI, and why it's transforming the world.</p>
          </div>
          <div className="curriculum-item">
            <h3>Math Foundations for AI</h3>
            <p>Learn essential linear algebra concepts. No prior knowledge required.</p>
          </div>
          <div className="curriculum-item">
            <h3>Python for AI</h3>
            <p>A crash course on Python to build practical AI applications.</p>
          </div>
          <div className="curriculum-item">
            <h3>Neural Networks</h3>
            <p>Understand foundations of today's AI applications using Neural Networks.</p>
          </div>
          <div className="curriculum-item">
            <h3>Computer Vision & CNNs</h3>
            <p>Learn CNNs that power breakthroughs in image recognition and autonomous driving.</p>
          </div>
          <div className="curriculum-item">
            <h3>NLP and LLMs</h3>
            <p>Explore the world of Natural Language Processing and Large Language Models.</p>
          </div>
        </div>
      </section>

      {/* Course Format */}
      <section className="format-section">
        <div className="format-content">
          <h2>Course Format</h2>
          <div className="format-grid">
            <div className="format-item">
              <span className="format-icon">🎥</span>
              <span>Live Classes - 4 hours per week</span>
            </div>
            <div className="format-item">
              <span className="format-icon">💻</span>
              <span>Coding labs for assignments</span>
            </div>
            <div className="format-item">
              <span className="format-icon">📋</span>
              <span>Downloadable slides</span>
            </div>
            <div className="format-item">
              <span className="format-icon">�</span>
              <span>Two projects: mid-term and final</span>
            </div>
          </div>
        </div>
        <div className="format-image">
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=400&fit=crop&auto=format" alt="Online Learning" />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <h2>{user ? "Continue Your Learning Journey" : "Ready to Level Up Your Skills?"}</h2>
        {user ? (
          <button className="cta-final" onClick={handleDashboardClick}>
            Go to Dashboard
          </button>
        ) : (
          <button className="cta-final" onClick={handleRegisterClick}>
            Register Here
          </button>
        )}
      </section>

    </div>
  );
};

export default Landing;