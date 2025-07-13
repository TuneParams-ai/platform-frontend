import React, { useState } from "react";
import CourseCard from "../components/CourseCard";
import { coursesData, getCategories } from "../data/coursesData";
import { useCourseAccess } from "../hooks/useCourseAccess";
import "../styles/courses.css";

const Courses = () => {
  const [activeFilter, setActiveFilter] = useState("All");

  // Get enrollment data to show enrollment status
  const { allEnrollments } = useCourseAccess();

  // Get filter categories dynamically
  const filterCategories = getCategories();

  const filteredCourses = activeFilter === "All"
    ? coursesData
    : coursesData.filter(course => course.category === activeFilter);

  // Helper function to check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return allEnrollments.some(enrollment => enrollment.courseId === courseId);
  };

  return (
    <div className="courses-page-container">
      <div className="courses-header">
        <h1 className="courses-title">Available Courses</h1>
        <p className="courses-subtitle">
          Discover our comprehensive collection of machine learning and data science courses designed to take you from beginner to expert.
        </p>
      </div>

      <div className="courses-filters">
        {filterCategories.map(category => (
          <button
            key={category}
            className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="courses-grid">
        {filteredCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={isEnrolled(course.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Courses;