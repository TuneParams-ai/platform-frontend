import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCourseStats, getDisplayRating, formatEnrollmentCount } from "../hooks/useCourseStats";
import { isCourseNearlyFull, isCourseFull, isComingSoon } from "../data/coursesData";
import StarRating from "./StarRating";
import "../styles/course-image.css";

const CourseCard = ({ course, isEnrolled = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get dynamic course statistics
  const { stats, loading: statsLoading } = useCourseStats(course.id, false);

  const handleEnroll = (e) => {
    e.stopPropagation(); // Prevent card click when clicking enroll

    // If user is not logged in, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }

    // If user is logged in, proceed to course detail for enrollment
    navigate(`/courses/${course.id}`);
  };

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const comingSoon = isComingSoon(course);

  // Use dynamic stats for course capacity calculations
  const currentEnrollments = statsLoading ? course.students || 0 : stats.enrollmentCount;
  const maxCapacity = course.maxCapacity || 0;

  // Calculate course status based on dynamic enrollment data
  const courseWithDynamicStats = {
    ...course,
    students: currentEnrollments,
    rating: statsLoading ? course.rating : (stats.hasReviews ? stats.averageRating : course.rating)
  };

  const nearlyFull = !comingSoon && maxCapacity > 0 && (currentEnrollments / maxCapacity) >= 0.8;
  const full = !comingSoon && maxCapacity > 0 && currentEnrollments >= maxCapacity;

  // Helper function to display values with "Coming Soon" fallback
  const displayValue = (value, fallback = "TBD") => {
    if (comingSoon && (value === "TBD" || value === "N/A" || value === null || value === 0)) {
      return "Coming Soon";
    }
    return value || fallback;
  };

  return (
    <div className="course-card" onClick={handleCardClick}>
      {/* Show enrollment status - prioritize enrolled status */}
      {isEnrolled ? (
        <div className="enrollment-status enrolled">
          ✅ Enrolled
        </div>
      ) : comingSoon ? (
        <div className="enrollment-status coming-soon">
          Coming Soon
        </div>
      ) : nearlyFull && (
        <div className={`enrollment-status ${full ? 'full' : 'nearly-full'}`}>
          {full ? "Course Full" : "Few Seats Left"}
        </div>
      )}
      <div className="course-image">
        {!course.image || imageError ? (
          <div className="course-image-fallback">{course.icon}</div>
        ) : (
          <div className="course-image-container">
            {!imageLoaded && (
              <div className="course-image-loading">{course.icon}</div>
            )}
            <img
              src={course.image}
              alt={course.title}
              className={`course-image-img ${imageLoaded ? 'loaded' : 'loading'}`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              style={{ display: imageLoaded ? 'block' : 'none' }}
            />
          </div>
        )}
      </div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-meta">
        <span className="course-level">{displayValue(course.level)}</span>
        <span className="course-duration">⏱️ {displayValue(course.duration)}</span>
      </div>
      <div className="course-stats">
        <span className="course-stat">📚 {displayValue(course.lessons)} lessons</span>
        <span className="course-stat">
          👥 {comingSoon ? "Coming Soon" :
            statsLoading ? `${course.students || 0}/${course.maxCapacity || 0} seats` :
              `${currentEnrollments}/${maxCapacity} seats`}
        </span>
        <div className="course-stat course-rating-stat">
          {comingSoon ? "Coming Soon" : (
            <StarRating
              rating={statsLoading ? course.rating : (stats.hasReviews ? stats.averageRating : course.rating)}
              reviewCount={statsLoading ? 0 : stats.reviewCount}
              showReviewCount={!statsLoading && stats.hasReviews}
              size="small"
              showNumeric={false}
            />
          )}
        </div>
      </div>
      <div className="course-price">
        {course.originalPrice && !comingSoon && (
          <span className="original-price">${course.originalPrice}</span>
        )}
        {comingSoon ? "Price TBD" : `$${course.price}`}
      </div>
      <div className="course-action">
        <button
          className={`btn enroll-btn ${comingSoon ? 'coming-soon' : ''} ${isEnrolled ? 'enrolled' : ''}`}
          onClick={handleEnroll}
          disabled={comingSoon}
        >
          {isEnrolled ? "Continue Learning" : (comingSoon ? "Coming Soon" : user ? "Enroll Now" : "Login to Enroll")}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;