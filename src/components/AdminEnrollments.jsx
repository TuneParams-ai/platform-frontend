// src/components/AdminEnrollments.jsx
// Component for managing enrollment records
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedBatch, setSelectedBatch] = useState('all');
    const [selectedCourse, setSelectedCourse] = useState('all');

    const loadEnrollments = async () => {
        setLoading(true);
        setError(null);

        try {
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                orderBy('enrolledAt', 'desc')
            );
            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
            const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setEnrollments(enrollmentsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEnrollments();
    }, []);

    // Filter enrollments based on selected filters
    const filteredEnrollments = enrollments.filter(enrollment => {
        const batchMatch = selectedBatch === 'all' || enrollment.batchNumber?.toString() === selectedBatch;
        const courseMatch = selectedCourse === 'all' || enrollment.courseId === selectedCourse;
        return batchMatch && courseMatch;
    });

    // Get unique values for filters
    const uniqueCourses = [...new Set(enrollments.map(e => e.courseId))].filter(Boolean);
    const uniqueBatches = [...new Set(enrollments.map(e => e.batchNumber))].filter(Boolean).sort((a, b) => a - b);

    // Group enrollments by batch for summary
    const batchSummary = {};
    filteredEnrollments.forEach(enrollment => {
        const key = `${enrollment.courseId}_batch${enrollment.batchNumber || 'legacy'}`;
        if (!batchSummary[key]) {
            batchSummary[key] = {
                courseId: enrollment.courseId,
                courseTitle: enrollment.courseTitle,
                batchNumber: enrollment.batchNumber || 'Legacy',
                count: 0,
                totalRevenue: 0
            };
        }
        batchSummary[key].count++;
        batchSummary[key].totalRevenue += enrollment.amountPaid || 0;
    });

    return (
        <div>
            <div className="admin-section-header">
                <h2>Course Enrollments ({filteredEnrollments.length})</h2>
                <button
                    onClick={loadEnrollments}
                    className="admin-refresh-button"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {error && <p className="admin-error">Error: {error}</p>}

            {/* Filters */}
            <div className="admin-filters" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                    <div>
                        <label htmlFor="course-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Filter by Course:
                        </label>
                        <select
                            id="course-filter"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="all">All Courses</option>
                            {uniqueCourses.map(courseId => (
                                <option key={courseId} value={courseId}>{courseId}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="batch-filter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Filter by Batch:
                        </label>
                        <select
                            id="batch-filter"
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="all">All Batches</option>
                            {uniqueBatches.map(batchNumber => (
                                <option key={batchNumber} value={batchNumber.toString()}>
                                    Batch {batchNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Batch Summary */}
            {Object.keys(batchSummary).length > 0 && (
                <div className="batch-summary" style={{ marginBottom: '30px' }}>
                    <h3>Batch Summary</h3>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Course</th>
                                    <th>Batch</th>
                                    <th>Enrollments</th>
                                    <th>Total Revenue</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.values(batchSummary).map((summary, index) => (
                                    <tr key={index}>
                                        <td>{summary.courseTitle || summary.courseId}</td>
                                        <td>
                                            <span className={`batch-badge batch-${summary.batchNumber}`}>
                                                {summary.batchNumber}
                                            </span>
                                        </td>
                                        <td>{summary.count}</td>
                                        <td>${summary.totalRevenue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detailed Enrollments Table */}
            <h3>Detailed Enrollments</h3>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Enrolled Date</th>
                            <th>Course</th>
                            <th>Batch</th>
                            <th>User ID</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredEnrollments.map(enrollment => (
                            <tr key={enrollment.id}>
                                <td>
                                    {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                </td>
                                <td>
                                    <div>
                                        <strong>{enrollment.courseTitle}</strong>
                                        <br />
                                        <small style={{ color: '#666' }}>({enrollment.courseId})</small>
                                    </div>
                                </td>
                                <td>
                                    <span className={`batch-badge batch-${enrollment.batchNumber || 'legacy'}`}>
                                        {enrollment.batchNumber ? `Batch ${enrollment.batchNumber}` : 'Legacy'}
                                    </span>
                                </td>
                                <td className="user-id">
                                    {enrollment.userId}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div
                                            style={{
                                                width: '60px',
                                                height: '8px',
                                                backgroundColor: '#e0e0e0',
                                                borderRadius: '4px',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${enrollment.progress || 0}%`,
                                                    height: '100%',
                                                    backgroundColor: enrollment.progress >= 100 ? '#4caf50' :
                                                        enrollment.progress >= 50 ? '#ff9800' : '#2196f3',
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </div>
                                        <span>{enrollment.progress || 0}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-${enrollment.status}`}>
                                        {enrollment.status}
                                    </span>
                                </td>
                                <td>
                                    ${enrollment.amountPaid}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredEnrollments.length === 0 && !loading && (
                <div className="admin-empty-state">
                    <p>No enrollment records found for the selected filters.</p>
                </div>
            )}

            {/* Additional CSS for batch badges */}
            <style jsx>{`
                .batch-badge {
                    display: inline-block;
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: bold;
                    text-align: center;
                    min-width: 60px;
                }
                
                .batch-1 {
                    background-color: #e3f2fd;
                    color: #1976d2;
                }
                
                .batch-2 {
                    background-color: #f3e5f5;
                    color: #7b1fa2;
                }
                
                .batch-3 {
                    background-color: #e8f5e8;
                    color: #388e3c;
                }
                
                .batch-legacy {
                    background-color: #fafafa;
                    color: #616161;
                    border: 1px solid #e0e0e0;
                }
                
                .admin-filters {
                    border: 1px solid #e0e0e0;
                }
                
                .batch-summary {
                    border-top: 2px solid #e0e0e0;
                    padding-top: 20px;
                }
                
                .batch-summary h3 {
                    margin-bottom: 15px;
                    color: #333;
                }
            `}</style>
        </div>
    );
};

export default AdminEnrollments;
