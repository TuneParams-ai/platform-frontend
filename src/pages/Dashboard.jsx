import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseAccess } from '../hooks/useCourseAccess';
import { findCourseById } from '../data/coursesData';
import { isProgressTrackingEnabled } from '../utils/configUtils';
import '../styles/dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Use the course access hook to get real enrollment data
  const {
    allEnrollments,
    loading,
    error
    // hasAnyCourseAccess, - currently unused
    // updateProgress - currently unused
  } = useCourseAccess();

  // Check if progress tracking is enabled
  const progressTrackingEnabled = isProgressTrackingEnabled();

  // Convert enrollments to the format expected by the UI
  const enrolledCourses = allEnrollments.map(enrollment => {
    const courseData = findCourseById(enrollment.courseId);
    return {
      id: enrollment.courseId,
      title: enrollment.courseTitle || courseData?.title || 'Unknown Course',
      progress: enrollment.progress || 0,
      status: enrollment.status || 'enrolled',
      enrolledDate: enrollment.enrolledAt?.toDate?.() || new Date(enrollment.enrolledAt) || new Date(),
      ...courseData // Include additional course data
    };
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>My Dashboard</h1>
        <p>Welcome! Here are your enrolled courses.</p>
      </div>

      <div className="dashboard-content">
        <section className="enrolled-courses">
          <h2>My Courses</h2>

          {/* Loading state */}
          {loading && (
            <div className="dashboard-loading-state">
              <p>Loading your courses...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="dashboard-error-state">
              <p className="dashboard-error-text">
                Error loading courses: {error}
              </p>
            </div>
          )}

          {/* Courses list */}
          {!loading && !error && enrolledCourses.length > 0 ? (
            <div className="courses-grid">
              {enrolledCourses.map(course => (
                <div key={course.id} className="course-dashboard-card">
                  <div className="course-header">
                    <h3>{course.title}</h3>
                    <span className="course-status">{course.status}</span>
                  </div>
                  {progressTrackingEnabled && (
                    <div className="course-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">{course.progress}% Complete</span>
                    </div>
                  )}
                  <div className="course-actions">
                    <button
                      className="btn"
                      onClick={() => navigate(`/course/${course.id}/dashboard`)}
                    >
                      Course Dashboard
                    </button>
                  </div>
                  <div className="enrollment-info">
                    <small>
                      Enrolled: {course.enrolledDate.toLocaleDateString('en-US', {
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
            !loading && !error && (
              <div className="no-courses">
                <div className="no-courses-icon">📚</div>
                <h3>No courses enrolled yet</h3>
                <p>Start your learning journey by enrolling in one of our courses!</p>
                <button
                  className="btn"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </button>
              </div>
            )
          )}
        </section>

        <section className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <div className="action-card">
              <div className="action-content">
                <div className="action-icon">📖</div>
                <h4>Browse Courses</h4>
                <p>Discover new courses to expand your skills</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/courses')}
              >
                View All Courses
              </button>
            </div>
            <div className="action-card">
              <div className="action-content">
                <div className="action-icon">💬</div>
                <h4>Get Support</h4>
                <p>Need help? Contact our support team</p>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/contact')}
              >
                Contact Support
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;