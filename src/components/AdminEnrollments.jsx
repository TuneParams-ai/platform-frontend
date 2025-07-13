// src/components/AdminEnrollments.jsx
// Component for managing enrollment records
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminEnrollments = () => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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

    return (
        <div>
            <div className="admin-section-header">
                <h2>Course Enrollments ({enrollments.length})</h2>
                <button
                    onClick={loadEnrollments}
                    className="admin-refresh-button"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {error && <p className="admin-error">Error: {error}</p>}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Enrolled Date</th>
                            <th>Course</th>
                            <th>User ID</th>
                            <th>Progress</th>
                            <th>Status</th>
                            <th>Amount Paid</th>
                        </tr>
                    </thead>
                    <tbody>
                        {enrollments.map(enrollment => (
                            <tr key={enrollment.id}>
                                <td>
                                    {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                </td>
                                <td>
                                    {enrollment.courseTitle}
                                </td>
                                <td className="user-id">
                                    {enrollment.userId}
                                </td>
                                <td>
                                    {enrollment.progress || 0}%
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

            {enrollments.length === 0 && !loading && (
                <div className="admin-empty-state">
                    <p>No enrollment records found.</p>
                </div>
            )}
        </div>
    );
};

export default AdminEnrollments;
