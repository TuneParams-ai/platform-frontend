// src/pages/AdminDashboard.jsx
// Admin dashboard with optimized lazy loading
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { isUserAdmin } from '../services/roleService';
import AdminRoleManager from '../components/AdminRoleManager';
import AdminOverview from '../components/AdminOverview';
import AdminPayments from '../components/AdminPayments';
import AdminEnrollments from '../components/AdminEnrollments';
import AdminEmailTracking from '../components/AdminEmailTracking';
import AdminCouponManager from '../components/AdminCouponManager';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
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
        'admin@tuneparams.com',
        // Add more admin emails here as needed
    ];

    const isEmailAdmin = user && adminEmails.includes(user.email);
    const hasAdminAccess = isAdmin || isEmailAdmin;

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

            <div className="admin-tabs">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`admin-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                >
                    📊 Overview
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`admin-tab-button ${activeTab === 'payments' ? 'active' : ''}`}
                >
                    💳 Payments
                </button>
                <button
                    onClick={() => setActiveTab('enrollments')}
                    className={`admin-tab-button ${activeTab === 'enrollments' ? 'active' : ''}`}
                >
                    📚 Enrollments
                </button>
                <button
                    onClick={() => setActiveTab('emails')}
                    className={`admin-tab-button ${activeTab === 'emails' ? 'active' : ''}`}
                >
                    📧 Email Tracking
                </button>
                <button
                    onClick={() => setActiveTab('coupons')}
                    className={`admin-tab-button ${activeTab === 'coupons' ? 'active' : ''}`}
                >
                    🎫 Coupons
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`admin-tab-button ${activeTab === 'roles' ? 'active' : ''}`}
                >
                    👑 Role Management
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'overview' && <AdminOverview />}
                {activeTab === 'payments' && <AdminPayments />}
                {activeTab === 'enrollments' && <AdminEnrollments />}
                {activeTab === 'emails' && <AdminEmailTracking />}
                {activeTab === 'coupons' && <AdminCouponManager />}
                {activeTab === 'roles' && <AdminRoleManager />}
            </div>
        </div>
    );
};

export default AdminDashboard;
