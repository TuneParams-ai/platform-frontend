import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // This would typically fetch the user's enrolled courses from an API
  const enrolledCourses = [
    {
      id: "FAAI",
      title: "Foundations to Frontiers of Artificial Intelligence",
      progress: 0,
      status: "enrolled",
      enrolledDate: new Date().toISOString()
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome back! Here are your enrolled courses.</p>
      </div>

      <div className="dashboard-content">
        <section className="enrolled-courses">
          <h2>My Courses</h2>
          {enrolledCourses.length > 0 ? (
            <div className="courses-grid">
              {enrolledCourses.map(course => (
                <div key={course.id} className="course-dashboard-card">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <span className="course-status">{course.status}</span>
                  </div>
                  <div className="course-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">{course.progress}% Complete</span>
                  </div>
                  <div className="course-actions">
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/course/${course.id}`)}
                    >
                      {course.progress === 0 ? 'Start Learning' : 'Continue Learning'}
                    </button>
                  </div>
                  <div className="enrollment-info">
                    <small>
                      Enrolled: {new Date(course.enrolledDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-courses">
              <div className="no-courses-icon">📚</div>
              <h3>No courses enrolled yet</h3>
              <p>Start your learning journey by enrolling in one of our courses!</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/courses')}
              >
                Browse Courses
              </button>
            </div>
          )}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <div className="action-icon">📖</div>
              <h4>Browse Courses</h4>
              <p>Discover new courses to expand your skills</p>
              <button
                className="btn-secondary"
                onClick={() => navigate('/courses')}
              >
                View All Courses
              </button>
            </div>
            <div className="action-card">
              <div className="action-icon">💬</div>
              <h4>Get Support</h4>
              <p>Need help? Contact our support team</p>
              <button
                className="btn-secondary"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </button>
            </div>
            <div className="action-card">
              <div className="action-icon">📄</div>
              <h4>Certificates</h4>
              <p>View and download your course certificates</p>
              <button className="btn-secondary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;