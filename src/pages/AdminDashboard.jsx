// src/pages/AdminDashboard.jsx
// Admin dashboard with optimized lazy loading
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isUserAdmin } from '../services/roleService';
import AdminRoleManager from '../components/AdminRoleManager';
import AdminOverview from '../components/AdminOverview';
import AdminPayments from '../components/AdminPayments';
import AdminManualPayments from '../components/AdminManualPayments';
import AdminEnrollments from '../components/AdminEnrollments';
import AdminEmailTracking from '../components/AdminEmailTracking';
import AdminCouponManager from '../components/AdminCouponManager';
import AdminProgressManager from '../components/AdminProgressManager';
import AdminSearch from '../components/AdminSearch';
import AdminAuditLogs from '../components/AdminAuditLogs';
import BatchMigrationTool from '../components/BatchMigrationTool';
import FirestoreBackupTool from '../components/FirestoreBackupTool';
import FirestoreRestoreTool from '../components/FirestoreRestoreTool';
import '../styles/admin-dashboard.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
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
                // Primary check: Database role
                const adminStatus = await isUserAdmin(user.uid);

                if (adminStatus) {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
            } catch (err) {
                setIsAdmin(false);
            } finally {
                setAdminLoading(false);
            }
        }; checkAdminStatus();
    }, [user]);

    // Fallback: Simple email-based admin check for development/emergency access
    const adminEmails = [
        'contact@tuneparams.com',
        'abhinaykotla@gmail.com',
        'admin@tuneparams.com',
        // Add more admin emails here as needed
    ];

    const isEmailAdmin = user && adminEmails.includes(user.email);

    // Database role takes priority, email is fallback only
    const hasAdminAccess = isAdmin || isEmailAdmin; if (!user) {
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
                <p>Please contact an administrator to assign you admin privileges.</p>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="admin-header-section">
                <h1>Admin Dashboard</h1>
                <div className="quick-actions">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="quick-action-btn course-management-btn"
                    >
                        📚 Course Management
                    </button>
                </div>
            </div>

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
                    onClick={() => setActiveTab('manualPayments')}
                    className={`admin-tab-button ${activeTab === 'manualPayments' ? 'active' : ''}`}
                >
                    🧾 Manual Payments
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
                    onClick={() => setActiveTab('progress')}
                    className={`admin-tab-button ${activeTab === 'progress' ? 'active' : ''}`}
                >
                    📈 Progress Tracking
                </button>
                <button
                    onClick={() => setActiveTab('search')}
                    className={`admin-tab-button ${activeTab === 'search' ? 'active' : ''}`}
                >
                    🔍 Search
                </button>
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`admin-tab-button ${activeTab === 'roles' ? 'active' : ''}`}
                >
                    👑 Role Management
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`admin-tab-button ${activeTab === 'audit' ? 'active' : ''}`}
                >
                    📋 Audit Logs
                </button>
                <button
                    onClick={() => setActiveTab('batchMigration')}
                    className={`admin-tab-button ${activeTab === 'batchMigration' ? 'active' : ''}`}
                    style={{ backgroundColor: '#ffc107', color: '#000' }}
                    title="Migrate batch numbers: 1→3, 2→4"
                >
                    🔄 Batch Migration
                </button>
                <button
                    onClick={() => setActiveTab('backup')}
                    className={`admin-tab-button ${activeTab === 'backup' ? 'active' : ''}`}
                    style={{ backgroundColor: '#28a745', color: '#fff' }}
                    title="Create Firestore database backups"
                >
                    🛡️ Database Backup
                </button>
                <button
                    onClick={() => setActiveTab('restore')}
                    className={`admin-tab-button ${activeTab === 'restore' ? 'active' : ''}`}
                    style={{ backgroundColor: '#dc3545', color: '#fff' }}
                    title="Restore from database backups"
                >
                    🔄 Database Restore
                </button>
            </div>

            <div className="admin-content">
                {activeTab === 'overview' && <AdminOverview />}
                {activeTab === 'payments' && <AdminPayments />}
                {activeTab === 'manualPayments' && <AdminManualPayments />}
                {activeTab === 'enrollments' && <AdminEnrollments />}
                {activeTab === 'emails' && <AdminEmailTracking />}
                {activeTab === 'coupons' && <AdminCouponManager />}
                {activeTab === 'progress' && <AdminProgressManager />}
                {activeTab === 'search' && <AdminSearch />}
                {activeTab === 'roles' && <AdminRoleManager />}
                {activeTab === 'audit' && <AdminAuditLogs />}
                {activeTab === 'batchMigration' && <BatchMigrationTool />}
                {activeTab === 'backup' && <FirestoreBackupTool />}
                {activeTab === 'restore' && <FirestoreRestoreTool />}
            </div>
        </div>
    );
};

export default AdminDashboard;
