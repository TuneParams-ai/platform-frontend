import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useCourseStats } from "../hooks/useCourseStats";
import { findCourseById, isComingSoon, getNextAvailableBatch } from "../data/coursesData";
import { useCourseAccess } from "../hooks/useCourseAccess";
import { isProgressTrackingEnabled } from '../utils/configUtils';
import PayPalCheckout from "../components/PayPalCheckout";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import StarRating from "../components/StarRating";
import AdminBatchInfo from "../components/AdminBatchInfo";
import "../styles/course-detail.css";
import "../styles/course-image.css";
import "../styles/paypal-checkout.css";
import ReviewsSection from "../components/ReviewsSection";

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
    const [enrollmentResult, setEnrollmentResult] = useState(null);
    const [isScrolling, setIsScrolling] = useState(false);

    // Check if progress tracking is enabled
    const progressTrackingEnabled = isProgressTrackingEnabled();
    const [showPayPal, setShowPayPal] = useState(false);

    // Use the course access hook
    const {
        hasAccess,
        enrollment,
        loading: accessLoading,
        error: accessError,
        processEnrollment,
        clearError
    } = useCourseAccess(courseId);

    // Get dynamic course statistics
    const { stats, loading: statsLoading } = useCourseStats(courseId, true); // Use real-time updates

    // Find the course data based on courseId (now supports alphanumeric IDs)
    const courseData = findCourseById(courseId);

    // Reviews
    // Note: Reviews handling moved to ReviewsSection component

    // All useCallback hooks must be at the top level, before any conditional returns
    const handlePaymentSuccess = useCallback(async (paymentDetails) => {
        try {
            // Process the enrollment using our payment service
            const result = await processEnrollment(paymentDetails);

            if (result.success) {
                setPaymentData(paymentDetails);
                setEnrollmentResult(result);
                setShowSuccessModal(true);
                setShowPayPal(false);
            }
        } catch (error) {
            alert(`Enrollment failed: ${error.message}. Please contact support with your payment details.`);
            setShowPayPal(false);
        }
    }, [processEnrollment]);

    const handlePaymentError = useCallback((error) => {
        alert('Payment failed. Please try again or contact support.');
        setShowPayPal(false);
    }, []);

    const handlePaymentCancel = useCallback((data) => {
        setShowPayPal(false);
        // Optionally show a message to the user
    }, []);

    const handleGoToDashboard = useCallback(() => {
        setShowSuccessModal(false);
        navigate(`/course/${courseId}/dashboard`);
    }, [navigate, courseId]);

    const handleGoBack = useCallback(() => {
        navigate('/courses');
    }, [navigate]);

    // Handle hash navigation on page load
    useEffect(() => {
        let hasScrolledToHash = false;

        const handleHashNavigation = () => {
            const hash = window.location.hash;
            if (hash === '#reviews-section' && !hasScrolledToHash) {
                hasScrolledToHash = true;
                // Small delay to ensure the component is fully rendered
                setTimeout(() => {
                    let target = document.getElementById('reviews-section');

                    if (!target) {
                        // Fallback searches if main ID not found
                        target = document.querySelector('.reviews-section') ||
                            document.querySelector('[id*="review"]') ||
                            document.querySelector('.home-reviews-section');
                    }

                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start',
                            inline: 'nearest'
                        });

                        // Add temporary highlight effect
                        target.style.transition = 'box-shadow 0.3s ease';
                        target.style.boxShadow = '0 0 15px rgba(255, 193, 7, 0.4)';
                        setTimeout(() => {
                            target.style.boxShadow = '';
                        }, 1500);
                    }
                }, 200);
            }
        };

        // Handle hash on initial load
        handleHashNavigation();

        // Handle hash changes (e.g., when navigating with back/forward)
        const handleHashChange = () => {
            hasScrolledToHash = false;
            handleHashNavigation();
        };

        window.addEventListener('hashchange', handleHashChange);

        return () => {
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);

    // Reviews handling moved to ReviewsSection component

    // Helper function to display value or N/A
    const displayValue = (value, defaultValue = "N/A") => {
        if (isComingSoon(courseData) && (value === "TBD" || value === "N/A" || value === null || value === 0)) {
            return "Coming Soon";
        }
        return value ? value : defaultValue;
    };

    // Get current enrollment count from dynamic stats
    // const currentEnrollments = statsLoading ? (courseData.students || 0) : stats.enrollmentCount;
    const comingSoon = isComingSoon(courseData);

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
        // Check if user is logged in first
        if (!user) {
            navigate('/login');
            return;
        }

        // Clear any previous errors
        clearError();

        if (isComingSoon(courseData)) {
            alert("This course is still in planning phase. Please check back for updates!");
            return;
        }

        // Check if there are any available batches for enrollment
        const nextBatch = getNextAvailableBatch(courseData);
        if (!nextBatch) {
            alert("No available batches for enrollment at this time. Please check back later or contact us for more information.");
            return;
        }

        // Check if user already has access
        if (hasAccess) {
            navigate('/dashboard');
            return;
        }

        // Show PayPal checkout
        setShowPayPal(true);
    };

    const nextBatch = getNextAvailableBatch(courseData);
    const noBatchesAvailable = !nextBatch;

    return (
        <>
            <div className="course-detail-container">
                <div
                    className="course-detail-header"
                    style={{
                        backgroundImage: courseData.image ? `url(${courseData.image})` : 'none'
                    }}
                >
                    <div className="course-detail-header-overlay"></div>
                    <div className="course-detail-header-content">
                        <button className="btn btn-secondary btn-small back-btn" onClick={handleGoBack}>
                            ← Back to Courses
                        </button>
                        <div className="course-hero">
                            <div className="course-hero-content">
                                <div className="course-icon-large">
                                    {displayValue(courseData.icon, "📚")}
                                </div>
                                <div className="course-info">
                                    <h1 className="course-detail-title">{displayValue(courseData.title)}</h1>
                                    <p className="course-detail-description">{displayValue(courseData.description)}</p>
                                    <div className="course-meta-detail">
                                        <span className="course-level-detail">{displayValue(courseData.level)}</span>
                                        <span className="course-duration-detail">⏱️ {displayValue(courseData.duration)}</span>
                                        {/* <span className="course-enrollment-detail">
                                            👥 {comingSoon ? "Coming Soon" : `${currentEnrollments}/${displayValue(courseData.maxCapacity)} seats`}
                                        </span> */}
                                        <div className="course-rating-detail">
                                            {comingSoon ? (
                                                <span>⭐ Coming Soon</span>
                                            ) : (
                                                <StarRating
                                                    rating={statsLoading ? courseData.rating : (stats.hasReviews ? stats.averageRating : courseData.rating)}
                                                    reviewCount={statsLoading ? 0 : stats.reviewCount}
                                                    showReviewCount={!statsLoading && stats.hasReviews}
                                                    size="small"
                                                    showNumeric={true}
                                                    clickable={true}
                                                    onClick={() => {
                                                        // Prevent multiple scroll operations
                                                        if (isScrolling) return;

                                                        setIsScrolling(true);

                                                        // Find and scroll to reviews section
                                                        const scrollToReviews = () => {
                                                            // Strategy 1: By ID
                                                            let target = document.getElementById('reviews-section');

                                                            // Strategy 2: By heading text
                                                            if (!target) {
                                                                const headings = document.querySelectorAll('h3');
                                                                const reviewHeading = Array.from(headings).find(h =>
                                                                    h.textContent.includes('Student Reviews') || h.textContent.includes('Reviews')
                                                                );
                                                                target = reviewHeading?.closest('section') || reviewHeading?.parentElement;
                                                            }

                                                            // Strategy 3: By class and text content
                                                            if (!target) {
                                                                const sections = document.querySelectorAll('.course-section');
                                                                target = Array.from(sections).find(section =>
                                                                    section.textContent.includes('Student Reviews')
                                                                );
                                                            }

                                                            if (target) {
                                                                target.scrollIntoView({
                                                                    behavior: 'smooth',
                                                                    block: 'start',
                                                                    inline: 'nearest'
                                                                });

                                                                // Add temporary highlight
                                                                target.style.transition = 'box-shadow 0.3s ease';
                                                                target.style.boxShadow = '0 0 0 3px rgba(255, 193, 7, 0.5)';
                                                                setTimeout(() => {
                                                                    target.style.boxShadow = '';
                                                                    setIsScrolling(false);
                                                                }, 1500);
                                                            } else {
                                                                setIsScrolling(false);
                                                                alert('Reviews section not found. Please scroll down manually to see reviews.');
                                                            }
                                                        };

                                                        // Execute scroll after a brief delay to avoid conflicts
                                                        setTimeout(scrollToReviews, 100);
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="course-enrollment">
                                {/* Only show pricing for non-enrolled users */}
                                {!hasAccess && !accessLoading && (
                                    <div className="course-price-detail">
                                        {courseData.originalPrice && !comingSoon && (
                                            <span className="original-price-detail">${courseData.originalPrice}</span>
                                        )}
                                        <span className="current-price-detail">
                                            {comingSoon ? "Price TBD" : (courseData.price ? `$${courseData.price}` : "Price N/A")}
                                        </span>
                                    </div>
                                )}

                                {/* Show loading state */}
                                {accessLoading && (
                                    <div className="enrollment-loading">
                                        <div className="loading-spinner"></div>
                                        <p>Checking enrollment status...</p>
                                    </div>
                                )}

                                {/* Show error if any */}
                                {accessError && (
                                    <div className="enrollment-error">
                                        <p className="course-detail-error-text">
                                            {accessError}
                                        </p>
                                        <button
                                            className="btn btn-secondary course-detail-access-button"
                                            onClick={clearError}
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}

                                {/* Show different content based on access status */}
                                {!accessLoading && !showPayPal && (
                                    <>
                                        {hasAccess ? (
                                            // User already has access
                                            <div className="enrollment-success">
                                                <div className="course-detail-enrollment-success">
                                                    <p className="course-detail-success-title">
                                                        ✅ Enrolled
                                                    </p>
                                                    {progressTrackingEnabled && enrollment && (
                                                        <p className="course-detail-progress-text">
                                                            Progress: {enrollment.progress || 0}%
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn enroll-btn-detail"
                                                    onClick={() => navigate(`/course/${courseId}/dashboard`)}
                                                >
                                                    Go to Dashboard →
                                                </button>
                                            </div>
                                        ) : (
                                            // User doesn't have access - show enrollment button
                                            <button
                                                className={`btn enroll-btn-detail ${noBatchesAvailable ? 'full' : ''} ${comingSoon ? 'coming-soon' : ''}`}
                                                onClick={handleEnroll}
                                                disabled={noBatchesAvailable || comingSoon}
                                            >
                                                {comingSoon ? "Coming Soon" : (noBatchesAvailable ? "No Available Batches" : user ? "Enroll Now" : "Login to Enroll")}
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* PayPal checkout section */}
                                {showPayPal && (
                                    <div className="enrollment-options">
                                        <button
                                            className="back-to-enroll-btn"
                                            onClick={() => setShowPayPal(false)}
                                        >
                                            ← Back to Course Details
                                        </button>
                                        <PayPalCheckout
                                            courseId={courseData.id}
                                            courseTitle={courseData.title}
                                            coursePrice={courseData.price}
                                            onSuccess={handlePaymentSuccess}
                                            onError={handlePaymentError}
                                            onCancel={handlePaymentCancel}
                                            disabled={noBatchesAvailable || comingSoon || !courseData.price}
                                        />
                                    </div>
                                )}

                                {/* {!noBatchesAvailable && !comingSoon && nextBatch && nextBatch.maxCapacity && (
                                    (() => {
                                        const batchAvailableSeats = nextBatch.maxCapacity - (nextBatch.enrollmentCount || 0);
                                        return batchAvailableSeats <= 5 && batchAvailableSeats > 0 && (
                                            <div className="seats-warning">
                                                ⚠️ Only {batchAvailableSeats} seats remaining in next batch!
                                            </div>
                                        );
                                    })()
                                )} */}
                                {/* Only show next batch info for non-enrolled users */}
                                {!hasAccess && !accessLoading && (() => {
                                    const nextBatch = getNextAvailableBatch(courseData);
                                    return nextBatch && !comingSoon && (
                                        <div className="next-batch-info">
                                            <span className="next-batch-label">Next Batch Starts:</span>
                                            <span className="next-batch-date">
                                                {new Date(nextBatch.startDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    );
                                })()}
                            </div>
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
                            <h2>Weekly Schedule</h2>
                            {courseData.weeklySchedule && courseData.weeklySchedule.length > 0 ? (
                                <div className="weekly-schedule-container">
                                    <div className="weekly-schedule-list">
                                        {courseData.weeklySchedule.map((session, index) => (
                                            <div key={index} className="schedule-item">
                                                <div className="schedule-info">
                                                    <span className="day-name">{session.day}</span>
                                                    <span className="session-type">{session.type}</span>
                                                    <span className="schedule-time">{session.time}</span>
                                                </div>
                                                {session.note && (
                                                    <div className="session-note">
                                                        <small>{session.note}</small>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="schedule-note">
                                        <strong>Note:</strong> All times are in Eastern Time (ET). Detailed schedules provided after enrollment.
                                    </p>
                                </div>
                            ) : (
                                <div className="na-message">
                                    <p>Weekly schedule information will be available closer to the course start date.</p>
                                </div>
                            )}
                        </section>

                        <section className="course-section">
                            <h2>Course Content</h2>
                            {courseData.curriculum && courseData.curriculum.length > 0 ? (
                                <CurriculumSection curriculum={courseData.curriculum} />
                            ) : (
                                <div className="na-message">
                                    <p>Detailed curriculum information is not available at this time.</p>
                                    <p>Course details coming soon</p>
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

                        {/* <section className="course-section">
                            <h3>Instructor</h3>
                            <div className="instructor-info">
                                <h4>{displayValue(courseData.instructor)}</h4>
                                <p>{displayValue(courseData.instructorBio, "Instructor bio not available.")}</p>
                            </div>
                        </section> */}

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
                                {/* <div className="info-item">
                                    <strong>Available Seats:</strong> {comingSoon ? "Coming Soon" : `${currentEnrollments}/${displayValue(courseData.maxCapacity)}`}
                                </div> */}
                                <div className="info-item">
                                    <strong>Next Batch:</strong> {(() => {
                                        const nextBatch = getNextAvailableBatch(courseData);
                                        return nextBatch ?
                                            new Date(nextBatch.startDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) : "N/A";
                                    })()}
                                </div>
                            </div>
                        </section>

                        <ReviewsSection
                            courseId={courseData.id}
                            courseTitle={courseData.title}
                        />

                    </div>
                </div>

                {/* Admin-only Batch Information */}
                <AdminBatchInfo course={courseData} />
            </div>

            <PaymentSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                paymentData={paymentData}
                enrollmentResult={enrollmentResult}
                onGoToDashboard={handleGoToDashboard}
            />
        </>
    );
};

// Collapsible Curriculum Component
const CurriculumSection = ({ curriculum }) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [expandedTopics, setExpandedTopics] = useState({});

    const toggleSection = (sectionIndex) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionIndex]: !prev[sectionIndex]
        }));
    };

    const toggleTopic = (sectionIndex, topicIndex) => {
        const key = `${sectionIndex}-${topicIndex}`;
        setExpandedTopics(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="curriculum-list">
            {curriculum.map((section, sectionIndex) => (
                <div key={sectionIndex} className="curriculum-item">
                    <div
                        className="section-header clickable"
                        onClick={() => toggleSection(sectionIndex)}
                    >
                        <div className="section-title-container">
                            <div className="section-title-with-count">
                                <h3>{section.section}</h3>
                                <span className="topic-count">
                                    {section.topics ? section.topics.length : 0} topics
                                </span>
                            </div>
                            <span className={`expand-icon ${expandedSections[sectionIndex] ? 'expanded' : ''}`}>
                                ▼
                            </span>
                        </div>
                        {section.description && (
                            <p className="section-description">{section.description}</p>
                        )}
                    </div>

                    {expandedSections[sectionIndex] && section.topics && section.topics.length > 0 && (
                        <ul className="topics-list expanded">
                            {section.topics.map((topic, topicIndex) => {
                                const topicKey = `${sectionIndex}-${topicIndex}`;
                                const isTopicExpanded = expandedTopics[topicKey];

                                // Handle both old format (strings) and new format (objects)
                                const topicTitle = typeof topic === 'string' ? topic : topic.title;
                                const hasDetails = typeof topic === 'object' && (topic.description || topic.duration || topic.keyPoints);

                                return (
                                    <li key={topicIndex} className="topic-item">
                                        <div
                                            className={`topic-header ${hasDetails ? 'clickable' : ''}`}
                                            onClick={() => hasDetails && toggleTopic(sectionIndex, topicIndex)}
                                        >
                                            <span className="topic-title">{topicTitle}</span>
                                            {hasDetails && (
                                                <span className={`topic-expand-icon ${isTopicExpanded ? 'expanded' : ''}`}>
                                                    ▼
                                                </span>
                                            )}
                                        </div>

                                        {hasDetails && isTopicExpanded && (
                                            <div className="topic-details">
                                                {topic.description && (
                                                    <p className="topic-description">{topic.description}</p>
                                                )}
                                                <div className="topic-meta">
                                                    {topic.duration && (
                                                        <span className="topic-duration">
                                                            ⏱️ {topic.duration}
                                                        </span>
                                                    )}
                                                    {topic.keyPoints && topic.keyPoints.length > 0 && (
                                                        <div className="key-points">
                                                            <strong>Key Points:</strong>
                                                            <ul className="key-points-list">
                                                                {topic.keyPoints.map((point, pointIndex) => (
                                                                    <li key={pointIndex}>{point}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CourseDetail;
