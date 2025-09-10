import React, { useState, useCallback } from "react";
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
            console.error('Enrollment processing failed:', error);
            alert(`Enrollment failed: ${error.message}. Please contact support with your payment details.`);
            setShowPayPal(false);
        }
    }, [processEnrollment]);

    const handlePaymentError = useCallback((error) => {
        console.error('Payment error:', error);
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
                            <h2>Course Content</h2>
                            {courseData.curriculum && courseData.curriculum.length > 0 ? (
                                <div className="curriculum-list">
                                    {courseData.curriculum.map((section, index) => (
                                        <div key={index} className="curriculum-item">
                                            <div className="section-header">
                                                <h3>{section.section}</h3>
                                            </div>
                                            {section.topics && section.topics.length > 0 && (
                                                <ul className="topics-list">
                                                    {section.topics.map((topic, topicIndex) => (
                                                        <li key={topicIndex} className="topic-item">{topic}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="na-message">
                                    <p>Detailed curriculum information is not available at this time.</p>
                                    <p>Course details coming soon</p>
                                </div>
                            )}
                        </section>

                        {/* Student Reviews moved to sidebar */}
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

                        {/* <section className="course-section">
                            <h3>Course Materials</h3>
                            <div className="course-materials">
                                {courseData.downloadUrl ? (
                                    <a
                                        href={courseData.downloadUrl}
                                        download={`${courseData.title || 'Course'}_Info.pdf`}
                                        className="download-btn"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        📄 Download Course Info PDF
                                    </a>
                                ) : (
                                    <div className="download-btn disabled">
                                        📄 Course Info PDF (Coming Soon)
                                    </div>
                                )}
                                <p className="download-description">
                                    Detailed course information, curriculum, and requirements
                                </p>
                            </div>
                        </section> */}
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

export default CourseDetail;
