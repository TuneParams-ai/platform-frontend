// src/pages/AdminDashboard.jsx
// Admin dashboard to view payments and manage users
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { isUserAdmin } from '../services/roleService';
import AdminRoleManager from '../components/AdminRoleManager';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('payments');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminLoading, setAdminLoading] = useState(true);

    // Check if user is admin using database roles
    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!user) {
                setIsAdmin(false);
                setAdminLoading(false);
                return;
            }

            try {
                const adminStatus = await isUserAdmin(user.uid);
                setIsAdmin(adminStatus);
            } catch (err) {
                console.error('Error checking admin status:', err);
                setIsAdmin(false);
            } finally {
                setAdminLoading(false);
            }
        };

        checkAdminStatus();
    }, [user]);

    // Fallback: Simple email-based admin check for development
    const adminEmails = [
        'admin@tuneparams.ai',
        'abhinaykotla@gmail.com',
        // Add more admin emails here as needed
    ];

    const isEmailAdmin = user && adminEmails.includes(user.email);
    const hasAdminAccess = isAdmin || isEmailAdmin;

    useEffect(() => {
        if (hasAdminAccess) {
            loadData();
        }
    }, [hasAdminAccess]);

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
            <div className="admin-access-denied">
                <h2>Please log in to access admin panel</h2>
            </div>
        );
    }

    if (adminLoading) {
        return (
            <div className="admin-loading">
                <h2>Checking admin permissions...</h2>
            </div>
        );
    }

    if (!hasAdminAccess) {
        return (
            <div className="admin-access-denied">
                <h2>Access Denied</h2>
                <p>You don't have permission to access this page.</p>
                {isEmailAdmin && (
                    <div className="admin-note">
                        <p><strong>Note:</strong> You have email-based admin access but no database role.</p>
                        <p>Use the Role Manager below to set up proper database roles.</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>

            {/* Role Manager for admins */}
            {isEmailAdmin && <AdminRoleManager />}

            <div className="admin-tabs">
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`admin-tab-button ${activeTab === 'payments' ? 'active' : ''}`}
                >
                    Payments ({payments.length})
                </button>
                <button
                    onClick={() => setActiveTab('enrollments')}
                    className={`admin-tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
                >
                    Enrollments ({enrollments.length})
                </button>
                <button
                    onClick={loadData}
                    className="admin-refresh-button"
                >
                    Refresh
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="admin-error">Error: {error}</p>}

            {activeTab === 'payments' && (
                <div>
                    <h2>Payment Records</h2>
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Course</th>
                                    <th>User Email</th>
                                    <th>Amount</th>
                                    <th>Payment ID</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(payment => (
                                    <tr key={payment.id}>
                                        <td>
                                            {payment.paymentDate?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                        </td>
                                        <td>
                                            {payment.courseTitle}
                                        </td>
                                        <td>
                                            {payment.userEmail || payment.payerEmail}
                                        </td>
                                        <td>
                                            ${payment.amount}
                                        </td>
                                        <td className="payment-id">
                                            {payment.paymentId}
                                        </td>
                                        <td>
                                            <span className={`status-${payment.status}`}>
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
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
