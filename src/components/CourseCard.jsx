import React from "react";
import { useNavigate } from "react-router-dom";
import { isCourseNearlyFull, isCourseFull, isComingSoon } from "../data/coursesData";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleEnroll = (e) => {
    e.stopPropagation(); // Prevent card click when clicking enroll
    // TODO: Implement enrollment logic
    console.log(`Enrolling in course: ${course.title}`);
  };

  const handlePreview = (e) => {
    e.stopPropagation(); // Prevent card click when clicking preview
    // TODO: Implement course preview logic
    console.log(`Previewing course: ${course.title}`);
  };

  const handleCardClick = () => {
    navigate(`/courses/${course.id}`);
  };

  const nearlyFull = isCourseNearlyFull(course);
  const full = isCourseFull(course);
  const comingSoon = isComingSoon(course);

  // Helper function to display values with "Coming Soon" fallback
  const displayValue = (value, fallback = "TBD") => {
    if (comingSoon && (value === "TBD" || value === "N/A" || value === null || value === 0)) {
      return "Coming Soon";
    }
    return value || fallback;
  };

  return (
    <div className="course-card" onClick={handleCardClick}>
      {comingSoon ? (
        <div className="enrollment-status coming-soon">
          Coming Soon
        </div>
      ) : nearlyFull && (
        <div className={`enrollment-status ${full ? 'full' : 'nearly-full'}`}>
          {full ? "Course Full" : "Few Seats Left"}
        </div>
      )}
      <div className="course-image">{course.icon}</div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-meta">
        <span className="course-level">{displayValue(course.level)}</span>
        <span className="course-duration">⏱️ {displayValue(course.duration)}</span>
      </div>
      <div className="course-stats">
        <span className="course-stat">📚 {displayValue(course.lessons)} lessons</span>
        <span className="course-stat">
          👥 {comingSoon ? "Coming Soon" : `${course.students}/${course.maxCapacity} seats`}
        </span>
        <span className="course-stat">⭐ {displayValue(course.rating)}/5</span>
      </div>
      <div className="course-price">
        {course.originalPrice && !comingSoon && (
          <span className="original-price">${course.originalPrice}</span>
        )}
        {comingSoon ? "Price TBD" : `$${course.price}`}
      </div>
      <div className="course-action">
        <button
          className={`enroll-btn ${comingSoon ? 'coming-soon' : ''}`}
          onClick={handleEnroll}
          disabled={comingSoon}
        >
          {comingSoon ? "Coming Soon" : "Enroll Now"}
        </button>
        <button
          className={`preview-btn ${comingSoon ? 'coming-soon' : ''}`}
          onClick={handlePreview}
          disabled={comingSoon}
        >
          {comingSoon ? "Details TBD" : "Preview"}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;