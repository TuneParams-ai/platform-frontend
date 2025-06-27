import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/course-detail.css";

const CourseDetail = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();

    // Sample courses data - this would come from an API
    const allCoursesData = [
        {
            id: 1,
            title: "Machine Learning Fundamentals",
            description: "Learn the core concepts of machine learning, from basic algorithms to practical implementations. Perfect for beginners starting their ML journey.",
            level: "Beginner",
            duration: "8 weeks",
            lessons: 24,
            students: 1250,
            rating: 4.8,
            price: 99,
            originalPrice: 149,
            icon: "🤖",
            category: "Machine Learning",
            instructor: "Dr. Sarah Johnson",
            instructorBio: "AI researcher with 10+ years experience in machine learning and data science.",
            curriculum: [
                { week: 1, title: "Introduction to Machine Learning", lessons: 3 },
                { week: 2, title: "Data Preprocessing", lessons: 3 },
                { week: 3, title: "Supervised Learning", lessons: 3 },
                { week: 4, title: "Unsupervised Learning", lessons: 3 },
                { week: 5, title: "Model Evaluation", lessons: 3 },
                { week: 6, title: "Feature Engineering", lessons: 3 },
                { week: 7, title: "Advanced Algorithms", lessons: 3 },
                { week: 8, title: "Real-world Projects", lessons: 3 }
            ],
            prerequisites: ["Basic Python knowledge", "High school mathematics"],
            outcomes: [
                "Understand machine learning fundamentals",
                "Implement common ML algorithms",
                "Evaluate model performance",
                "Work with real datasets"
            ]
        },
        {
            id: 2,
            title: "Deep Learning with Neural Networks",
            description: "Master deep learning concepts and build neural networks from scratch. Covers CNNs, RNNs, and modern architectures like Transformers.",
            level: "Advanced",
            duration: "12 weeks",
            lessons: 36,
            students: 890,
            rating: 4.9,
            price: 149,
            originalPrice: 199,
            icon: "🧠",
            category: "Deep Learning"
            // Note: Missing instructor, curriculum, prerequisites, outcomes - will show N/A
        },
        {
            id: 3,
            title: "Python for Data Science",
            description: "Complete Python programming course focused on data science applications. Learn pandas, numpy, matplotlib, and more essential libraries.",
            level: "Beginner",
            duration: "6 weeks",
            lessons: 18,
            students: 2100,
            rating: 4.7,
            price: 79,
            originalPrice: 119,
            icon: "🐍",
            category: "Programming",
            instructor: "Prof. Mike Chen",
            prerequisites: ["Basic programming concepts"],
            outcomes: [
                "Master Python fundamentals",
                "Work with data using pandas and numpy",
                "Create visualizations with matplotlib"
            ]
            // Note: Missing instructorBio, curriculum - will show N/A
        },
        {
            id: 4,
            title: "Natural Language Processing",
            description: "Dive into NLP techniques, from text preprocessing to building chatbots and language models. Includes hands-on projects with real datasets.",
            level: "Intermediate",
            duration: "10 weeks",
            lessons: 30,
            students: 675,
            rating: 4.6,
            price: 129,
            originalPrice: 179,
            icon: "💬",
            category: "NLP"
            // Note: Missing most details - will show N/A
        },
        {
            id: 5,
            title: "Computer Vision Essentials",
            description: "Learn computer vision fundamentals, image processing, object detection, and facial recognition using OpenCV and modern deep learning frameworks.",
            level: "Intermediate",
            duration: "9 weeks",
            lessons: 27,
            students: 540,
            rating: 4.8,
            price: 119,
            originalPrice: 159,
            icon: "👁️",
            category: "Computer Vision"
            // Note: Missing most details - will show N/A
        },
        {
            id: 6,
            title: "Data Visualization Mastery",
            description: "Create stunning, interactive data visualizations using Python libraries like Matplotlib, Seaborn, Plotly, and D3.js. Make your data tell a story.",
            level: "Beginner",
            duration: "5 weeks",
            lessons: 15,
            students: 1320,
            rating: 4.5,
            price: 69,
            originalPrice: 99,
            icon: "📊",
            category: "Data Science"
            // Note: Missing most details - will show N/A
        },
        {
            id: 7,
            title: "MLOps and Model Deployment",
            description: "Learn to deploy machine learning models in production environments. Covers Docker, Kubernetes, model monitoring, and CI/CD for ML.",
            level: "Advanced",
            duration: "8 weeks",
            lessons: 24,
            students: 425,
            rating: 4.7,
            price: 139,
            originalPrice: 189,
            icon: "🚀",
            category: "MLOps"
            // Note: Missing most details - will show N/A
        },
        {
            id: 8,
            title: "Statistics for Machine Learning",
            description: "Build a strong statistical foundation for machine learning. Covers probability, hypothesis testing, and statistical modeling techniques.",
            level: "Beginner",
            duration: "7 weeks",
            lessons: 21,
            students: 980,
            rating: 4.6,
            price: 89,
            originalPrice: 129,
            icon: "📈",
            category: "Statistics"
            // Note: Missing most details - will show N/A
        }
    ];

    // Find the course data based on courseId
    const courseData = allCoursesData.find(course => course.id === parseInt(courseId));

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
        // TODO: Implement enrollment logic
        console.log(`Enrolling in course: ${courseData.title}`);
    };

    const handleGoBack = () => {
        navigate('/courses');
    };

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
                                    ⭐ {displayValue(courseData.rating)}/5 ({displayValue(courseData.students)} students)
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
                        <button className="enroll-btn-detail" onClick={handleEnroll}>
                            Enroll Now
                        </button>
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
                                <strong>Enrolled Students:</strong> {displayValue(courseData.students)}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
