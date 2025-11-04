import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCourses } from '../services/courseManagementService';
import '../styles/admin-course-access.css';

const AdminCourseAccess = () => {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const allCourses = await getAllCourses();
                setCourses(allCourses);
                setFilteredCourses(allCourses);
            } catch (err) {
                console.error('Error fetching courses:', err);
                setError('Failed to load courses');
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    // Filter courses based on search term and category
    useEffect(() => {
        let filtered = courses;

        // Filter by category
        if (filterCategory !== 'ALL') {
            filtered = filtered.filter(course => course.category === filterCategory);
        }

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(course =>
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredCourses(filtered);
    }, [courses, searchTerm, filterCategory]);

    const handleCourseDashboardAccess = (courseId) => {
        navigate(`/course/${courseId}/dashboard`);
    };

    if (loading) {
        return (
            <div className="admin-course-access">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading courses...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-course-access">
                <div className="error-state">
                    <h3>Error</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-course-access">
            <div className="admin-course-header">
                <h2>🎓 Course Dashboard Access</h2>
                <p>Access any course dashboard as an administrator</p>
            </div>

            <div className="course-filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="course-search-input"
                    />
                </div>
                <div className="category-filter">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="category-select"
                    >
                        <option value="ALL">All Categories</option>
                        <option value="FAAI">FAAI</option>
                        <option value="RLAI">RLAI</option>
                    </select>
                </div>
            </div>

            <div className="courses-grid">
                {filteredCourses.length === 0 ? (
                    <div className="no-courses">
                        <p>{courses.length === 0 ? 'No courses available' : 'No courses match your filters'}</p>
                    </div>
                ) : (
                    filteredCourses.map(course => (
                        <div key={course.id} className="admin-course-card">
                            <div className="course-info">
                                <div className="course-icon">
                                    {course.category === 'FAAI' ? '🤖' : '🧠'}
                                </div>
                                <div className="course-details">
                                    <h3>{course.title}</h3>
                                    <p className="course-category">{course.category}</p>
                                    <p className="course-description">
                                        {course.description?.length > 100
                                            ? `${course.description.substring(0, 100)}...`
                                            : course.description
                                        }
                                    </p>
                                    <div className="course-meta">
                                        <span className="course-price">₹{course.price?.toLocaleString()}</span>
                                        <span className="course-duration">{course.duration}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="course-actions">
                                <button
                                    onClick={() => handleCourseDashboardAccess(course.id)}
                                    className="admin-dashboard-btn"
                                    title="Access course dashboard as admin"
                                >
                                    <span>🚀 Access Dashboard</span>
                                    <small>Admin Access</small>
                                </button>

                                <button
                                    onClick={() => navigate(`/course/${course.id}`)}
                                    className="course-detail-btn"
                                    title="View course details page"
                                >
                                    📄 Course Details
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminCourseAccess;