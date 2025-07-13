import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { findCourseById, isCourseFull, getAvailableSeats, isComingSoon } from "../data/coursesData";
import { useCourseAccess } from "../hooks/useCourseAccess";
import PayPalCheckout from "../components/PayPalCheckout";
import PaymentSuccessModal from "../components/PaymentSuccessModal";
import "../styles/course-detail.css";
import "../styles/course-image.css";
import "../styles/paypal-checkout.css";

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [paymentData, setPaymentData] = useState(null);
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

    // Find the course data based on courseId (now supports alphanumeric IDs)
    const courseData = findCourseById(courseId);

    // All useCallback hooks must be at the top level, before any conditional returns
    const handlePaymentSuccess = useCallback(async (paymentDetails) => {
        console.log('Payment successful:', paymentDetails);

        try {
            // Process the enrollment using our payment service
            const result = await processEnrollment(paymentDetails);

            if (result.success) {
                setPaymentData(paymentDetails);
                setShowSuccessModal(true);
                setShowPayPal(false);

                console.log('Enrollment processed successfully:', {
                    paymentRecordId: result.paymentRecordId,
                    enrollmentId: result.enrollmentId
                });
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
        console.log('Payment cancelled:', data);
        setShowPayPal(false);
        // Optionally show a message to the user
    }, []);

    const handleGoToDashboard = useCallback(() => {
        setShowSuccessModal(false);
        navigate('/dashboard'); // You might need to create this route
    }, [navigate]);

    const handleDownloadReceipt = useCallback(() => {
        // Generate and download receipt
        const receiptData = {
            ...paymentData,
            companyName: 'TuneParams.ai',
            companyAddress: 'Your Company Address',
            receiptNumber: `RCP-${Date.now()}`
        };

        console.log('Download receipt:', receiptData);
        // Here you would generate and download a PDF receipt
        alert('Receipt download functionality will be implemented soon!');
    }, [paymentData]);

    const handleGoBack = useCallback(() => {
        navigate('/courses');
    }, [navigate]);

    // Helper function to display value or N/A
    const displayValue = (value, defaultValue = "N/A") => {
        if (isComingSoon(courseData) && (value === "TBD" || value === "N/A" || value === null || value === 0)) {
            return "Coming Soon";
        }
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
        // Clear any previous errors
        clearError();

        if (isComingSoon(courseData)) {
            alert("This course is still in planning phase. Please check back for updates!");
            return;
        }
        if (isCourseFull(courseData)) {
            alert("This course is currently full. Please check back for the next batch or contact us to join the waitlist.");
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

    const courseFull = isCourseFull(courseData);
    const availableSeats = getAvailableSeats(courseData);
    const comingSoon = isComingSoon(courseData);

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
                        <button className="btn btn-secondary back-btn" onClick={handleGoBack}>
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
                                    {courseData.originalPrice && !comingSoon && (
                                        <span className="original-price-detail">${courseData.originalPrice}</span>
                                    )}
                                    <span className="current-price-detail">
                                        {comingSoon ? "Price TBD" : (courseData.price ? `$${courseData.price}` : "Price N/A")}
                                    </span>
                                </div>

                                {/* Show loading state */}
                                {accessLoading && (
                                    <div className="enrollment-loading">
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
                                                        ✅ You're enrolled!
                                                    </p>
                                                    {enrollment && (
                                                        <p className="course-detail-success-text">
                                                            Progress: {enrollment.progress || 0}%
                                                        </p>
                                                    )}
                                                </div>
                                                <button
                                                    className="btn enroll-btn-detail"
                                                    onClick={() => navigate('/dashboard')}
                                                >
                                                    Go to Dashboard
                                                </button>
                                            </div>
                                        ) : (
                                            // User doesn't have access - show enrollment button
                                            <button
                                                className={`btn enroll-btn-detail ${courseFull ? 'full' : ''} ${comingSoon ? 'coming-soon' : ''}`}
                                                onClick={handleEnroll}
                                                disabled={courseFull || comingSoon}
                                            >
                                                {comingSoon ? "Coming Soon" : (courseFull ? "Course Full - Join Waitlist" : "Enroll Now")}
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
                                            disabled={courseFull || comingSoon || !courseData.price}
                                        />
                                    </div>
                                )}

                                {!courseFull && !comingSoon && availableSeats !== "N/A" && availableSeats <= 5 && (
                                    <div className="seats-warning">
                                        ⚠️ Only {availableSeats} seats remaining!
                                    </div>
                                )}
                                {courseData.nextBatchDate && !comingSoon && (
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

                        <section className="course-section">
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
                        </section>
                    </div>
                </div>
            </div>

            <PaymentSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                paymentData={paymentData}
                onGoToDashboard={handleGoToDashboard}
                onDownloadReceipt={handleDownloadReceipt}
            />
        </>
    );
};

export default CourseDetail;
