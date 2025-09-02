import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import CourseCard from "../components/CourseCard";
import { coursesData, getCategories } from "../data/coursesData";
import { useCourseAccess } from "../hooks/useCourseAccess";
import "../styles/courses.css";

const Courses = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");

  // Get enrollment data to show enrollment status (only if user is logged in)
  const { allEnrollments } = useCourseAccess();

  // Get filter categories dynamically
  const filterCategories = getCategories();

  const filteredCourses = activeFilter === "All"
    ? coursesData
    : coursesData.filter(course => course.category === activeFilter);

  // Helper function to check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    // If user is not logged in, they can't be enrolled
    if (!user || !allEnrollments) return false;
    return allEnrollments.some(enrollment => enrollment.courseId === courseId);
  };

  return (
    <div className="courses-page-container">
      <div className="courses-header">
        <h1 className="courses-title">Available Courses</h1>
        <p className="courses-subtitle">
          Discover our comprehensive collection of AI courses designed to take you from beginner to expert.
          {!user && " Login to enroll and track your progress!"}
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