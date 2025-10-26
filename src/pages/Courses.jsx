import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import CourseCard from "../components/CourseCard";
import { useCourses } from "../hooks/useCourses";
import { useCourseAccess } from "../hooks/useCourseAccess";
import "../styles/courses.css";

const Courses = () => {
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");
  const [filterCategories, setFilterCategories] = useState(["All"]);

  // Get courses from Firestore
  const { courses, loading, error } = useCourses();

  // Get enrollment data to show enrollment status (only if user is logged in)
  const { allEnrollments } = useCourseAccess();

  // Extract categories from courses
  useEffect(() => {
    if (courses && courses.length > 0) {
      const categories = ["All", ...new Set(courses.map(course => course.category).filter(Boolean))];
      setFilterCategories(categories);
    }
  }, [courses]);

  const filteredCourses = activeFilter === "All"
    ? courses
    : courses.filter(course => course.category === activeFilter);

  // Helper function to check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    // If user is not logged in, they can't be enrolled
    if (!user || !allEnrollments) return false;
    return allEnrollments.some(enrollment => enrollment.courseId === courseId);
  };

  if (loading) {
    return (
      <div className="courses-page-container">
        <div className="courses-loading">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="courses-page-container">
        <div className="courses-error">
          <h2>Error Loading Courses</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

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