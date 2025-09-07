// src/components/AdminOverview.jsx
// Dashboard overview with summary statistics
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalEnrollments: 0,
        totalUsers: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadStats = async () => {
        setLoading(true);
        setError(null);

        try {
            // Load only the counts, not the full data
            const [paymentsSnapshot, enrollmentsSnapshot, usersSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'payments'))),
                getDocs(query(collection(db, 'enrollments'))),
                getDocs(query(collection(db, 'users')))
            ]);

            // Calculate total revenue from payments
            let totalRevenue = 0;
            paymentsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.amount && typeof data.amount === 'number') {
                    totalRevenue += data.amount;
                }
            });

            setStats({
                totalPayments: paymentsSnapshot.size,
                totalEnrollments: enrollmentsSnapshot.size,
                totalUsers: usersSnapshot.size,
                totalRevenue
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStats();
    }, []);

    return (
        <div>
            <div className="admin-section-header">
                <h2>📊 Dashboard Overview</h2>
                <button
                    onClick={loadStats}
                    className="admin-refresh-button"
                    disabled={loading}
                >
                    {loading ? 'Loading...' : '🔄 Refresh'}
                </button>
            </div>

            {error && <p className="admin-error">Error: {error}</p>}

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="admin-stat-icon">💳</div>
                    <div className="admin-stat-content">
                        <h3>Total Payments</h3>
                        <p className="admin-stat-number">{stats.totalPayments}</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">📚</div>
                    <div className="admin-stat-content">
                        <h3>Total Enrollments</h3>
                        <p className="admin-stat-number">{stats.totalEnrollments}</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">👥</div>
                    <div className="admin-stat-content">
                        <h3>Total Users</h3>
                        <p className="admin-stat-number">{stats.totalUsers}</p>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="admin-stat-icon">💰</div>
                    <div className="admin-stat-content">
                        <h3>Total Revenue</h3>
                        <p className="admin-stat-number">${stats.totalRevenue}</p>
                    </div>
                </div>
            </div>

            <div className="admin-overview-actions">
                <div className="admin-action-card">
                    <h3>🎯 Quick Actions</h3>
                    <ul>
                        <li>View detailed payment records in the Payments tab</li>
                        <li>Manage user enrollments in the Enrollments tab</li>
                        <li>Track and update student progress in the Progress Tracking tab</li>
                        <li>Configure coupon discounts in the Coupons tab</li>
                        <li>Assign user roles in the Role Management section</li>
                        <li>Test system functionality using admin tools</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
