import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findCourseById, isCourseFull, getAvailableSeats } from "../data/coursesData";
import "../styles/course-detail.css";

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Find the course data based on courseId (now supports alphanumeric IDs)
    const courseData = findCourseById(courseId);

    // Helper function to display value or N/A
    const displayValue = (value, defaultValue = "N/A") => {
        return value ? value : defaultValue;
    };

    // If course not found, show course not found message
    if (!courseData) {
        return (
            <div className="course-detail-container">
                <div className="course-detail-header">
                    <div className="course-hero">
                        <div className="course-hero-content">
                            <div className="course-icon-large">❓</div>
                            <div className="course-info">
                                <h1 className="course-detail-title">Course Not Found</h1>
                                <p className="course-detail-description">
                                    The course you're looking for doesn't exist or has been removed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleEnroll = () => {
        if (isCourseFull(courseData)) {
            alert("This course is currently full. Please check back for the next batch or contact us to join the waitlist.");
            return;
        }
        // TODO: Implement enrollment logic
        console.log(`Enrolling in course: ${courseData.title}`);
    };

    const handleGoBack = () => {
        navigate('/courses');
    };

    const courseFull = isCourseFull(courseData);
    const availableSeats = getAvailableSeats(courseData);

    return (
        <div className="course-detail-container">
            <div className="course-detail-header">
                <button className="back-btn" onClick={handleGoBack}>
                    ← Back to Courses
                </button>
                <div className="course-hero">
                    <div className="course-hero-content">
                        <div className="course-icon-large">{displayValue(courseData.icon, "📚")}</div>
                        <div className="course-info">
                            <h1 className="course-detail-title">{displayValue(courseData.title)}</h1>
                            <p className="course-detail-description">{displayValue(courseData.description)}</p>
                            <div className="course-meta-detail">
                                <span className="course-level-detail">{displayValue(courseData.level)}</span>
                                <span className="course-duration-detail">⏱️ {displayValue(courseData.duration)}</span>
                                <span className="course-rating-detail">
                                    ⭐ {displayValue(courseData.rating)}/5
                                </span>
                                <span className="course-enrollment-detail">
                                    👥 {displayValue(courseData.students)}/{displayValue(courseData.maxCapacity)} seats
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="course-enrollment">
                        <div className="course-price-detail">
                            {courseData.originalPrice && (
                                <span className="original-price-detail">${courseData.originalPrice}</span>
                            )}
                            <span className="current-price-detail">
                                {courseData.price ? `$${courseData.price}` : "Price N/A"}
                            </span>
                        </div>
                        <button
                            className={`enroll-btn-detail ${courseFull ? 'full' : ''}`}
                            onClick={handleEnroll}
                            disabled={courseFull}
                        >
                            {courseFull ? "Course Full - Join Waitlist" : "Enroll Now"}
                        </button>
                        {!courseFull && availableSeats !== "N/A" && availableSeats <= 5 && (
                            <div className="seats-warning">
                                ⚠️ Only {availableSeats} seats remaining!
                            </div>
                        )}
                        {courseData.nextBatchDate && (
                            <div className="next-batch-info">
                                <span className="next-batch-label">Next Batch Starts:</span>
                                <span className="next-batch-date">
                                    {new Date(courseData.nextBatchDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="course-content">
                <div className="course-main">
                    <section className="course-section">
                        <h2>What You'll Learn</h2>
                        {courseData.outcomes && courseData.outcomes.length > 0 ? (
                            <ul className="outcomes-list">
                                {courseData.outcomes.map((outcome, index) => (
                                    <li key={index}>{outcome}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="na-message">
                                <p>Learning outcomes information is not available at this time.</p>
                            </div>
                        )}
                    </section>

                    <section className="course-section">
                        <h2>Course Curriculum</h2>
                        {courseData.curriculum && courseData.curriculum.length > 0 ? (
                            <div className="curriculum-list">
                                {courseData.curriculum.map((week, index) => (
                                    <div key={index} className="curriculum-item">
                                        <div className="week-header">
                                            <h3>Week {week.week}: {week.title}</h3>
                                            <span className="lesson-count">{week.lessons} lessons</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="na-message">
                                <p>Detailed curriculum information is not available at this time.</p>
                                <p>Course includes {displayValue(courseData.lessons)} lessons over {displayValue(courseData.duration)}.</p>
                            </div>
                        )}
                    </section>
                </div>

                <div className="course-sidebar">
                    <section className="course-section">
                        <h3>Prerequisites</h3>
                        {courseData.prerequisites && courseData.prerequisites.length > 0 ? (
                            <ul className="prerequisites-list">
                                {courseData.prerequisites.map((prereq, index) => (
                                    <li key={index}>{prereq}</li>
                                ))}
                            </ul>
                        ) : (
                            <div className="na-message">
                                <p>No specific prerequisites listed.</p>
                            </div>
                        )}
                    </section>

                    <section className="course-section">
                        <h3>Instructor</h3>
                        <div className="instructor-info">
                            <h4>{displayValue(courseData.instructor)}</h4>
                            <p>{displayValue(courseData.instructorBio, "Instructor bio not available.")}</p>
                        </div>
                    </section>

                    <section className="course-section">
                        <h3>Course Information</h3>
                        <div className="course-additional-info">
                            <div className="info-item">
                                <strong>Category:</strong> {displayValue(courseData.category)}
                            </div>
                            <div className="info-item">
                                <strong>Level:</strong> {displayValue(courseData.level)}
                            </div>
                            <div className="info-item">
                                <strong>Duration:</strong> {displayValue(courseData.duration)}
                            </div>
                            <div className="info-item">
                                <strong>Total Lessons:</strong> {displayValue(courseData.lessons)}
                            </div>
                            <div className="info-item">
                                <strong>Available Seats:</strong> {displayValue(courseData.students)}/{displayValue(courseData.maxCapacity)}
                            </div>
                            <div className="info-item">
                                <strong>Next Batch:</strong> {courseData.nextBatchDate ?
                                    new Date(courseData.nextBatchDate).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    }) : "N/A"}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
