import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./../styles/landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
            <h1 className="hero-title">Master Machine Learning</h1>
            <p className="hero-subtitle">
              No prior experience? No problem. Learn the foundations of machine learning and build real-world applications with our beginner-friendly course.
            </p>
            <p className="hero-description">
              Start your journey in AI with a hands-on, practical course designed for high-school students, experienced professionals, and curious minds.
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

      {/* About Section */}
      <section className="about-section">
        <div className="about-content">
          <h2>Why TuneParams.ai?</h2>
          <p>
            At TuneParams.ai, we believe that anyone can learn machine learning with the right guidance.
            Our Courses simplifies complex topics and helps you build an intuitive and practical understanding
            of core ML concepts, with no math background required.
          </p>
        </div>
      </section>

      {/* What You'll Learn Section */}
      <section className="curriculum-section">
        <h2>What You'll Learn</h2>
        <p className="curriculum-intro">
          This course covers both math foundations and practical skills. Topics include:
        </p>
        <div className="curriculum-grid">
          <div className="curriculum-item">
            <div className="curriculum-icon">🤖</div>
            <h3>Introduction to Machine Learning</h3>
            <p>Understand what ML is, types of learning, and why it's transforming the world.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-icon">🔢</div>
            <h3>Vectors and Matrices Basics</h3>
            <p>Learn essential linear algebra concepts used throughout ML. No prior knowledge required.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-icon">🐍</div>
            <h3>Python for Machine Learning</h3>
            <p>A crash course on Python, tailored for ML tasks.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-icon">📈</div>
            <h3>Linear & Logistic Regression</h3>
            <p>Your first ML algorithms—easy to understand, powerful in practice.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-icon">🧠</div>
            <h3>Neural Networks</h3>
            <p>Understand how modern deep learning models are structured and trained.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-icon">👁️</div>
            <h3>Computer Vision & CNNs</h3>
            <p>Learn how CNNs power breakthroughs in image recognition and autonomous driving.</p>
          </div>
        </div>
      </section>

      {/* Who Should Take This Course */}
      <section className="audience-section">
        <h2>Who Should Take This Course?</h2>
        <div className="audience-grid">
          <div className="audience-item">
            <div className="audience-icon">🎓</div>
            <h3>Beginners</h3>
            <p>Looking to enter the field of machine learning</p>
          </div>
          <div className="audience-item">
            <div className="audience-icon">📚</div>
            <h3>Students</h3>
            <p>High school students seeking an applied introduction to ML</p>
          </div>
          <div className="audience-item">
            <div className="audience-icon">💼</div>
            <h3>Professionals</h3>
            <p>Experienced IT professionals wanting to upskill</p>
          </div>
          <div className="audience-item">
            <div className="audience-icon">🔍</div>
            <h3>Curious Minds</h3>
            <p>Anyone curious about how AI and ML work behind the scenes</p>
          </div>
          <div className="audience-item">
            <div className="audience-icon">👨‍💻</div>
            <h3>Developers</h3>
            <p>Software developers looking to integrate AI into their applications</p>
          </div>
          <div className="audience-item">
            <div className="audience-icon">📊</div>
            <h3>Data Analysts</h3>
            <p>Data professionals wanting to advance to machine learning roles</p>
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