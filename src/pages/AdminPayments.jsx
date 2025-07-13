// src/pages/AdminPayments.jsx
// Simple admin panel to view payments (for testing/debugging)
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';

const AdminPayments = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('payments');

    // Simple access control - only allow specific admin emails
    const adminEmails = [
        'admin@tuneparams.ai',
        // Add your admin email here
    ];

    const isAdmin = user && adminEmails.includes(user.email);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load payments
            const paymentsQuery = query(
                collection(db, 'payments'),
                orderBy('createdAt', 'desc')
            );
            const paymentsSnapshot = await getDocs(paymentsQuery);
            const paymentsData = paymentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Load enrollments
            const enrollmentsQuery = query(
                collection(db, 'enrollments'),
                orderBy('enrolledAt', 'desc')
            );
            const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
            const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setPayments(paymentsData);
            setEnrollments(enrollmentsData);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Please log in to access admin panel</h2>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div style={{ padding: '40px', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
            </div>
        );
    }

    return (
        <div style={{
            padding: '20px',
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
            minHeight: '100vh'
        }}>
            <h1>Admin Dashboard</h1>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setActiveTab('payments')}
                    style={{
                        padding: '10px 20px',
                        marginRight: '10px',
                        backgroundColor: activeTab === 'payments' ? 'var(--primary-color)' : 'transparent',
                        color: activeTab === 'payments' ? 'white' : 'var(--text-color)',
                        border: '1px solid var(--primary-color)',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Payments ({payments.length})
                </button>
                <button
                    onClick={() => setActiveTab('enrollments')}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === 'enrollments' ? 'var(--primary-color)' : 'transparent',
                        color: activeTab === 'enrollments' ? 'white' : 'var(--text-color)',
                        border: '1px solid var(--primary-color)',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Enrollments ({enrollments.length})
                </button>
                <button
                    onClick={loadData}
                    style={{
                        padding: '10px 20px',
                        marginLeft: '10px',
                        backgroundColor: 'var(--secondary-color)',
                        color: 'black',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Refresh
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: '#f56565' }}>Error: {error}</p>}

            {activeTab === 'payments' && (
                <div>
                    <h2>Payment Records</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: 'rgba(29, 126, 153, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(29, 126, 153, 0.2)' }}>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Date</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Course</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>User Email</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Amount</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Payment ID</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            {payment.paymentDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            {payment.courseTitle}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            {payment.payerEmail}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            ${payment.amount}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)', fontSize: '0.8rem' }}>
                                            {payment.paymentId}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            <span style={{
                                                color: payment.status === 'completed' ? '#10b981' : '#f56565',
                                                fontWeight: 'bold'
                                            }}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'enrollments' && (
                <div>
                    <h2>Course Enrollments</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            backgroundColor: 'rgba(29, 126, 153, 0.1)',
                            borderRadius: '8px'
                        }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(29, 126, 153, 0.2)' }}>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Enrolled Date</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Course</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>User ID</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Progress</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Status</th>
                                    <th style={{ padding: '12px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>Amount Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {enrollments.map(enrollment => (
                                    <tr key={enrollment.id}>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            {enrollment.enrolledAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            {enrollment.courseTitle}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)', fontSize: '0.8rem' }}>
                                            {enrollment.userId}
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            {enrollment.progress || 0}%
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            <span style={{
                                                color: enrollment.status === 'completed' ? '#10b981' :
                                                    enrollment.status === 'enrolled' ? '#3b82f6' : '#f56565',
                                                fontWeight: 'bold'
                                            }}>
                                                {enrollment.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '8px', border: '1px solid rgba(29, 126, 153, 0.3)' }}>
                                            ${enrollment.amountPaid}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
