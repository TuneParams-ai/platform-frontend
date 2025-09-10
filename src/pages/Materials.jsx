import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCourseAccess } from '../hooks/useCourseAccess';
import { useUserRole } from '../hooks/useUserRole';
import { findCourseById, getBatchByNumber } from '../data/coursesData';
import '../styles/materials-clean.css';

const Materials = () => {
    const { courseId, batchNumber } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const { checkAccess } = useCourseAccess();
    const { isInstructor, isAdmin } = useUserRole();
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [course, setCourse] = useState(null);
    const [batch, setBatch] = useState(null);
    const [activeTab, setActiveTab] = useState('notes');

    useEffect(() => {
        const checkAccess = async () => {
            if (authLoading) return;

            if (!user) {
                navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
                return;
            }

            const foundCourse = findCourseById(courseId);
            if (!foundCourse) {
                navigate('/courses');
                return;
            }

            const foundBatch = getBatchByNumber(foundCourse, parseInt(batchNumber));
            if (!foundBatch) {
                navigate('/courses');
                return;
            }

            setCourse(foundCourse);
            setBatch(foundBatch);

            // Check if user has access to this course and batch
            const hasUserAccess = await checkAccess(courseId, parseInt(batchNumber));
            setHasAccess(hasUserAccess);
            setLoading(false);

            if (!hasUserAccess) {
                navigate('/dashboard');
                return;
            }
        };

        checkAccess();
    }, [courseId, batchNumber, user, authLoading, navigate, checkAccess]);

    // Sample materials structure - folder-based organization
    const getMaterialsForCourse = (course, batch) => {
        if (!course || !batch) return { notes: [], assignments: [] };

        // For FAAI course batch 1, return test materials
        if (course.id === 'FAAI' && batch.batchNumber === 1) {
            return {
                notes: [
                    {
                        name: '1 Introduction to AI.pdf',
                        url: '/data/FAAI/batch1/notes/1 Introduction to AI.pdf',
                        type: 'pdf',
                        size: '2.1 MB'
                    },
                    {
                        name: '2 Machine Learning Basics.pptx',
                        url: '/data/FAAI/batch1/notes/2 Machine Learning Basics.pptx',
                        type: 'pptx',
                        size: '3.5 MB'
                    },
                    {
                        name: '3 Neural Networks Overview.pdf',
                        url: '/data/FAAI/batch1/notes/3 Neural Networks Overview.pdf',
                        type: 'pdf',
                        size: '1.8 MB'
                    }
                ],
                assignments: [
                    {
                        name: '1 Python Fundamentals Assignment.pdf',
                        url: '/data/FAAI/batch1/assignments/1 Python Fundamentals Assignment.pdf',
                        type: 'pdf',
                        size: '0.8 MB'
                    },
                    {
                        name: '2 Data Analysis Project.pdf',
                        url: '/data/FAAI/batch1/assignments/2 Data Analysis Project.pdf',
                        type: 'pdf',
                        size: '1.2 MB'
                    }
                ]
            };
        }

        // For other batches or courses, return empty arrays
        return { notes: [], assignments: [] };
    };

    const materials = getMaterialsForCourse(course, batch);

    if (loading || authLoading) {
        return (
            <div className="materials-container">
                <div className="loading-spinner">Loading materials...</div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="materials-container">
                <div className="access-denied">
                    <h2>Access Denied</h2>
                    <p>You don't have access to these course materials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="materials-container">
            <div className="materials-header">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <div className="course-info">
                    <h1>{course?.title} - Materials</h1>
                    <p className="batch-info">Batch {batch?.batchNumber}: {batch?.batchName}</p>
                </div>
                {(isInstructor || isAdmin) && (
                    <Link
                        to={`/materials/${courseId}/${batchNumber}/upload`}
                        className="upload-link"
                    >
                        📤 Manage Materials
                    </Link>
                )}
            </div>

            <div className="materials-content">
                <div className="materials-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('notes')}
                    >
                        📚 Notes ({materials.notes.length})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('assignments')}
                    >
                        📝 Assignments ({materials.assignments.length})
                    </button>
                </div>

                <div className="materials-main">
                    {activeTab === 'notes' && (
                        <div className="materials-section">
                            <div className="section-header">
                                <h2>📚 Course Notes</h2>
                                <p className="materials-count">
                                    {materials.notes.length} {materials.notes.length === 1 ? 'file' : 'files'} available
                                </p>
                            </div>

                            {materials.notes.length === 0 ? (
                                <div className="no-materials">
                                    <div className="no-materials-icon">📚</div>
                                    <h3>No Notes Available Yet</h3>
                                    <p>Course notes for this batch are still being prepared. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="materials-grid">
                                    {materials.notes.map((material, index) => (
                                        <div key={index} className="material-card">
                                            <div className="material-header">
                                                <div className="material-icon">
                                                    {material.type === 'pdf' ? '📄' : material.type === 'pptx' ? '📊' : '📄'}
                                                </div>
                                                <div className="material-info">
                                                    <h4>{material.name}</h4>
                                                    <span className="material-type">
                                                        {material.type === 'pdf' ? 'PDF Document' :
                                                            material.type === 'pptx' ? 'PowerPoint Presentation' : 'Document'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="material-details">
                                                <div className="material-meta">
                                                    <span className="meta-item">💾 {material.size}</span>
                                                </div>
                                            </div>

                                            <div className="material-actions">
                                                <a
                                                    href={material.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="access-btn"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'assignments' && (
                        <div className="materials-section">
                            <div className="section-header">
                                <h2>📝 Assignments</h2>
                                <p className="materials-count">
                                    {materials.assignments.length} {materials.assignments.length === 1 ? 'assignment' : 'assignments'} available
                                </p>
                            </div>

                            {materials.assignments.length === 0 ? (
                                <div className="no-materials">
                                    <div className="no-materials-icon">📝</div>
                                    <h3>No Assignments Available Yet</h3>
                                    <p>Assignments for this batch are still being prepared. Check back soon!</p>
                                </div>
                            ) : (
                                <div className="materials-grid">
                                    {materials.assignments.map((material, index) => (
                                        <div key={index} className="material-card">
                                            <div className="material-header">
                                                <div className="material-icon">📝</div>
                                                <div className="material-info">
                                                    <h4>{material.name}</h4>
                                                    <span className="material-type">Assignment</span>
                                                </div>
                                            </div>

                                            <div className="material-details">
                                                <div className="material-meta">
                                                    <span className="meta-item">💾 {material.size}</span>
                                                </div>
                                            </div>

                                            <div className="material-actions">
                                                <a
                                                    href={material.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="access-btn"
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Materials;
