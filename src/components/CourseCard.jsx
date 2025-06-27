import React from "react";
import { useNavigate } from "react-router-dom";
import { isCourseNearlyFull, isCourseFull } from "../data/coursesData";

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

  return (
    <div className="course-card" onClick={handleCardClick}>
      {nearlyFull && (
        <div className={`enrollment-status ${full ? 'full' : 'nearly-full'}`}>
          {full ? "Course Full" : "Few Seats Left"}
        </div>
      )}
      <div className="course-image">{course.icon}</div>
      <h3 className="course-title">{course.title}</h3>
      <p className="course-description">{course.description}</p>
      <div className="course-meta">
        <span className="course-level">{course.level}</span>
        <span className="course-duration">⏱️ {course.duration}</span>
      </div>
      <div className="course-stats">
        <span className="course-stat">📚 {course.lessons} lessons</span>
        <span className="course-stat">👥 {course.students}/{course.maxCapacity} seats</span>
        <span className="course-stat">⭐ {course.rating}/5</span>
      </div>
      <div className="course-price">
        {course.originalPrice && (
          <span className="original-price">${course.originalPrice}</span>
        )}
        ${course.price}
      </div>
      <div className="course-action">
        <button className="enroll-btn" onClick={handleEnroll}>
          Enroll Now
        </button>
        <button className="preview-btn" onClick={handlePreview}>
          Preview
        </button>
      </div>
    </div>
  );
};

export default CourseCard;