// src/components/AdminCouponManager.jsx
// Admin component for managing coupons and discount codes
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    createCoupon,
    getAllCoupons,
    updateCouponStatus,
    deleteCoupon,
    getCouponUsageStats
} from '../services/couponService';
import { getAllUsers } from '../services/userService';
import { sendCouponEmail } from '../services/emailService';
import { coursesData } from '../data/coursesData';
import '../styles/admin-coupon-manager.css';

const AdminCouponManager = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('create');
    const [coupons, setCoupons] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [usageStats, setUsageStats] = useState(null);

    // Create coupon form state
    const [couponForm, setCouponForm] = useState({
        name: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        maxDiscountAmount: '',
        minOrderAmount: '',
        targetType: 'general',
        targetUserId: '',
        targetUserEmail: '',
        courseId: '',
        usageLimit: '',
        usageLimitPerUser: '1',
        validFrom: '',
        validUntil: '',
        prefix: '',
        // Email options
        sendEmail: false,
        emailMessage: ''
    });

    // Load initial data
    useEffect(() => {
        loadCoupons();
        loadUsers();
        loadUsageStats();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const result = await getAllCoupons();
            if (result.success) {
                setCoupons(result.coupons);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to load coupons');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const result = await getAllUsers();
            if (result.success) {
                setUsers(result.users);
            }
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    };

    const loadUsageStats = async () => {
        try {
            const result = await getCouponUsageStats();
            if (result.success) {
                setUsageStats(result.stats);
            }
        } catch (err) {
            console.error('Failed to load usage stats:', err);
        }
    };

    const handleFormChange = (field, value) => {
        setCouponForm(prev => ({
            ...prev,
            [field]: value
        }));

        // Auto-populate target user email when user is selected
        if (field === 'targetUserId' && value) {
            const selectedUser = users.find(u => u.id === value);
            if (selectedUser) {
                setCouponForm(prev => ({
                    ...prev,
                    targetUserEmail: selectedUser.email
                }));
            }
        }

        // Auto-populate course title when course is selected
        if (field === 'courseId' && value) {
            const selectedCourse = coursesData.find(c => c.id === value);
            if (selectedCourse) {
                setCouponForm(prev => ({
                    ...prev,
                    courseTitle: selectedCourse.title
                }));
            }
        }
    };

    const handleCreateCoupon = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Validate form
            if (!couponForm.discountValue || parseFloat(couponForm.discountValue) <= 0) {
                throw new Error('Please enter a valid discount value');
            }

            if (couponForm.targetType === 'user_specific' && !couponForm.targetUserId) {
                throw new Error('Please select a target user for user-specific coupons');
            }

            if (couponForm.targetType === 'course_specific' && !couponForm.courseId) {
                throw new Error('Please select a target course for course-specific coupons');
            }

            // Add course title to form data
            let formData = { ...couponForm };
            if (formData.courseId) {
                const selectedCourse = coursesData.find(c => c.id === formData.courseId);
                if (selectedCourse) {
                    formData.courseTitle = selectedCourse.title;
                }
            }

            const result = await createCoupon(formData, user.uid);

            if (result.success) {
                // Create detailed success message
                let successMessage = `🎉 Coupon Generated Successfully!\n\n`;
                successMessage += `📋 Coupon Details:\n`;
                successMessage += `• Code: ${result.couponCode}\n`;
                successMessage += `• Name: ${formData.name}\n`;
                successMessage += `• Discount: ${formData.discountType === 'percentage' ? formData.discountValue + '%' : '$' + formData.discountValue} off\n`;
                successMessage += `• Type: ${formData.targetType === 'general' ? 'General (Available to all)' : formData.targetType === 'user_specific' ? 'User-specific' : 'Course-specific'}\n`;

                if (formData.targetType === 'user_specific' && formData.targetUserEmail) {
                    successMessage += `• Target User: ${formData.targetUserEmail}\n`;
                }

                if (formData.courseId) {
                    const selectedCourse = coursesData.find(c => c.id === formData.courseId);
                    successMessage += `• Course: ${selectedCourse?.title || 'Unknown Course'}\n`;
                }

                if (formData.validUntil) {
                    successMessage += `• Valid Until: ${new Date(formData.validUntil).toLocaleDateString()}\n`;
                }

                if (formData.usageLimit) {
                    successMessage += `• Usage Limit: ${formData.usageLimit} uses\n`;
                }

                if (formData.minOrderAmount) {
                    successMessage += `• Minimum Order: $${formData.minOrderAmount}\n`;
                }

                successMessage += `\n✅ The coupon is now active and ready to use!`;

                setSuccess(successMessage);

                // Send email if requested and it's a user-specific coupon
                if (formData.sendEmail && formData.targetType === 'user_specific' && formData.targetUserEmail) {
                    try {
                        const selectedUser = users.find(u => u.id === formData.targetUserId);
                        const selectedCourse = coursesData.find(c => c.id === formData.courseId);

                        const emailData = {
                            recipientName: selectedUser?.displayName || selectedUser?.email?.split('@')[0] || 'Student',
                            recipientEmail: formData.targetUserEmail,
                            couponCode: result.couponCode,
                            couponName: formData.name,
                            discountType: formData.discountType,
                            discountValue: formData.discountValue,
                            courseTitle: selectedCourse?.title || null,
                            courseId: formData.courseId || null,
                            validUntil: formData.validUntil || null,
                            minOrderAmount: formData.minOrderAmount || null,
                            adminMessage: formData.emailMessage || null,
                            senderName: user?.displayName || 'Admin'
                        };

                        const emailResult = await sendCouponEmail(emailData, formData.targetUserId);
                        if (emailResult.success) {
                            setSuccess(prev => prev + ' Email sent successfully!');
                        } else if (emailResult.skipped) {
                            setSuccess(prev => prev + ' (Email service not configured)');
                        } else {
                            setError('Coupon created but failed to send email: ' + emailResult.error);
                        }
                    } catch (emailError) {
                        console.error('Email sending error:', emailError);
                        setError('Coupon created but failed to send email');
                    }
                }

                // Reset form
                setCouponForm({
                    name: '',
                    description: '',
                    discountType: 'percentage',
                    discountValue: '',
                    maxDiscountAmount: '',
                    minOrderAmount: '',
                    targetType: 'general',
                    targetUserId: '',
                    targetUserEmail: '',
                    courseId: '',
                    usageLimit: '',
                    usageLimitPerUser: '1',
                    validFrom: '',
                    validUntil: '',
                    prefix: '',
                    sendEmail: false,
                    emailMessage: ''
                });
                loadCoupons();
                loadUsageStats();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (couponId, newStatus) => {
        try {
            const result = await updateCouponStatus(couponId, newStatus, user.uid);
            if (result.success) {
                setSuccess(`Coupon status updated to ${newStatus}`);
                loadCoupons();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to update coupon status');
        }
    };

    const handleSendCouponEmail = async (coupon) => {
        if (coupon.targetType !== 'user_specific' || !coupon.targetUserEmail) {
            setError('Can only send emails for user-specific coupons');
            return;
        }

        try {
            setLoading(true);
            const selectedUser = users.find(u => u.id === coupon.targetUserId);
            const selectedCourse = coursesData.find(c => c.id === coupon.courseId);

            const emailData = {
                recipientName: selectedUser?.displayName || selectedUser?.email?.split('@')[0] || 'Student',
                recipientEmail: coupon.targetUserEmail,
                couponCode: coupon.code,
                couponName: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                courseTitle: selectedCourse?.title || null,
                courseId: coupon.courseId || null,
                validUntil: coupon.validUntil || null,
                minOrderAmount: coupon.minOrderAmount || null,
                adminMessage: `Your exclusive coupon code is ready to use! This coupon ${coupon.usageCount > 0 ? 'has been used ' + coupon.usageCount + ' time(s)' : 'has not been used yet'}.`,
                senderName: user?.displayName || 'Admin'
            };

            const emailResult = await sendCouponEmail(emailData, coupon.targetUserId);
            if (emailResult.success) {
                setSuccess('Coupon email sent successfully!');
            } else if (emailResult.skipped) {
                setError('Email service not configured');
            } else {
                setError('Failed to send coupon email: ' + emailResult.error);
            }
        } catch (err) {
            setError('Failed to send coupon email');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCoupon = async (couponId) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) {
            return;
        }

        try {
            const result = await deleteCoupon(couponId, user.uid);
            if (result.success) {
                setSuccess(result.message);
                loadCoupons();
                loadUsageStats();
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to delete coupon');
        }
    };

    const formatDiscount = (coupon) => {
        if (coupon.discountType === 'percentage') {
            return `${coupon.discountValue}% off`;
        } else {
            return `$${coupon.discountValue} off`;
        }
    };

    const formatDate = (date) => {
        if (!date) return 'No expiry';
        return date.toDate ? date.toDate().toLocaleDateString() : new Date(date).toLocaleDateString();
    };

    const getTargetInfo = (coupon) => {
        switch (coupon.targetType) {
            case 'user_specific':
                return `User: ${coupon.targetUserEmail || 'Unknown user'}`;
            case 'course_specific':
                return `Course: ${coupon.courseTitle || coupon.courseId}`;
            case 'general':
                return 'All users';
            default:
                return coupon.targetType;
        }
    };

    const renderCreateCouponForm = () => (
        <div className="coupon-form-container">
            <h3>Create New Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="coupon-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Coupon Name *</label>
                        <input
                            type="text"
                            value={couponForm.name}
                            onChange={(e) => handleFormChange('name', e.target.value)}
                            placeholder="e.g., Summer Sale 2025"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Code Prefix (Optional)</label>
                        <input
                            type="text"
                            value={couponForm.prefix}
                            onChange={(e) => handleFormChange('prefix', e.target.value.toUpperCase())}
                            placeholder="e.g., SUMMER"
                            maxLength={10}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <textarea
                        value={couponForm.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        placeholder="Brief description of the coupon"
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Discount Type *</label>
                        <select
                            value={couponForm.discountType}
                            onChange={(e) => handleFormChange('discountType', e.target.value)}
                            required
                        >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Amount ($)</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>
                            Discount Value *
                            {couponForm.discountType === 'percentage' ? ' (1-100)' : ' ($)'}
                        </label>
                        <input
                            type="number"
                            value={couponForm.discountValue}
                            onChange={(e) => handleFormChange('discountValue', e.target.value)}
                            placeholder={couponForm.discountType === 'percentage' ? '50' : '300'}
                            min="1"
                            max={couponForm.discountType === 'percentage' ? '100' : undefined}
                            step={couponForm.discountType === 'percentage' ? '1' : '0.01'}
                            required
                        />
                    </div>
                </div>

                {couponForm.discountType === 'percentage' && (
                    <div className="form-group">
                        <label>Maximum Discount Amount ($) (Optional)</label>
                        <input
                            type="number"
                            value={couponForm.maxDiscountAmount}
                            onChange={(e) => handleFormChange('maxDiscountAmount', e.target.value)}
                            placeholder="e.g., 500"
                            min="0"
                            step="0.01"
                        />
                        <small>Maximum dollar amount that can be discounted</small>
                    </div>
                )}

                <div className="form-group">
                    <label>Minimum Order Amount ($) (Optional)</label>
                    <input
                        type="number"
                        value={couponForm.minOrderAmount}
                        onChange={(e) => handleFormChange('minOrderAmount', e.target.value)}
                        placeholder="e.g., 100"
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className="form-group">
                    <label>Target Type *</label>
                    <select
                        value={couponForm.targetType}
                        onChange={(e) => handleFormChange('targetType', e.target.value)}
                        required
                    >
                        <option value="general">General (All Users)</option>
                        <option value="user_specific">User Specific</option>
                        <option value="course_specific">Course Specific</option>
                    </select>
                </div>

                {couponForm.targetType === 'user_specific' && (
                    <div className="form-group">
                        <label>Target User *</label>
                        <select
                            value={couponForm.targetUserId}
                            onChange={(e) => handleFormChange('targetUserId', e.target.value)}
                            required
                        >
                            <option value="">Select a user...</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.displayName || user.email} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {couponForm.targetType === 'course_specific' && (
                    <div className="form-group">
                        <label>Target Course *</label>
                        <select
                            value={couponForm.courseId}
                            onChange={(e) => handleFormChange('courseId', e.target.value)}
                            required
                        >
                            <option value="">Select a course...</option>
                            {coursesData.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="form-row">
                    <div className="form-group">
                        <label>Total Usage Limit (Optional)</label>
                        <input
                            type="number"
                            value={couponForm.usageLimit}
                            onChange={(e) => handleFormChange('usageLimit', e.target.value)}
                            placeholder="e.g., 100"
                            min="1"
                        />
                        <small>Maximum number of times this coupon can be used</small>
                    </div>
                    <div className="form-group">
                        <label>Usage Limit Per User</label>
                        <input
                            type="number"
                            value={couponForm.usageLimitPerUser}
                            onChange={(e) => handleFormChange('usageLimitPerUser', e.target.value)}
                            min="1"
                            required
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Valid From (Optional)</label>
                        <input
                            type="datetime-local"
                            value={couponForm.validFrom}
                            onChange={(e) => handleFormChange('validFrom', e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Valid Until (Optional)</label>
                        <input
                            type="datetime-local"
                            value={couponForm.validUntil}
                            onChange={(e) => handleFormChange('validUntil', e.target.value)}
                        />
                    </div>
                </div>

                {/* Email Options */}
                {couponForm.targetType === 'user_specific' && couponForm.targetUserEmail && (
                    <div className="email-options-section">
                        <h4>📧 Email Options</h4>
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={couponForm.sendEmail}
                                    onChange={(e) => handleFormChange('sendEmail', e.target.checked)}
                                />
                                <span className="checkmark"></span>
                                Send coupon code to user via email
                            </label>
                        </div>

                        {couponForm.sendEmail && (
                            <div className="form-group">
                                <label>Personal Message (Optional)</label>
                                <textarea
                                    value={couponForm.emailMessage}
                                    onChange={(e) => handleFormChange('emailMessage', e.target.value)}
                                    placeholder="Add a personal message to include with the coupon email..."
                                    rows={3}
                                />
                                <small>This message will be included in the email along with the coupon details.</small>
                            </div>
                        )}
                    </div>
                )}

                <button type="submit" disabled={loading} className="create-coupon-btn">
                    {loading ? 'Creating...' : 'Create Coupon'}
                </button>
            </form>
        </div>
    );

    const renderCouponsList = () => (
        <div className="coupons-list-container">
            <h3>Manage Coupons</h3>
            {coupons.length === 0 ? (
                <p>No coupons found.</p>
            ) : (
                <div className="coupons-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name</th>
                                <th>Discount</th>
                                <th>Target</th>
                                <th>Usage</th>
                                <th>Valid Until</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.map(coupon => (
                                <tr key={coupon.id}>
                                    <td className="coupon-code">{coupon.code}</td>
                                    <td>{coupon.name}</td>
                                    <td>{formatDiscount(coupon)}</td>
                                    <td>{getTargetInfo(coupon)}</td>
                                    <td>
                                        {coupon.usageCount || 0}
                                        {coupon.usageLimit && ` / ${coupon.usageLimit}`}
                                    </td>
                                    <td>{formatDate(coupon.validUntil)}</td>
                                    <td>
                                        <span className={`status-badge status-${coupon.status}`}>
                                            {coupon.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            {coupon.status === 'active' ? (
                                                <button
                                                    onClick={() => handleStatusUpdate(coupon.id, 'inactive')}
                                                    className="btn-deactivate"
                                                    title="Deactivate"
                                                >
                                                    🔴
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleStatusUpdate(coupon.id, 'active')}
                                                    className="btn-activate"
                                                    title="Activate"
                                                >
                                                    🟢
                                                </button>
                                            )}
                                            {coupon.targetType === 'user_specific' && coupon.targetUserEmail && (
                                                <button
                                                    onClick={() => handleSendCouponEmail(coupon)}
                                                    className="btn-email"
                                                    title="Send Email"
                                                    disabled={loading}
                                                >
                                                    📧
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteCoupon(coupon.id)}
                                                className="btn-delete"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    const renderUsageStats = () => (
        <div className="usage-stats-container">
            <h3>Coupon Usage Statistics</h3>
            {usageStats ? (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h4>Total Usage</h4>
                        <p className="stat-value">{usageStats.totalUsage}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Total Discount Given</h4>
                        <p className="stat-value">${usageStats.totalDiscount.toFixed(2)}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Total Order Value</h4>
                        <p className="stat-value">${usageStats.totalOrders.toFixed(2)}</p>
                    </div>
                    <div className="stat-card">
                        <h4>Average Discount</h4>
                        <p className="stat-value">${usageStats.averageDiscount.toFixed(2)}</p>
                    </div>
                </div>
            ) : (
                <p>Loading statistics...</p>
            )}

            {usageStats && usageStats.usageRecords.length > 0 && (
                <div className="recent-usage">
                    <h4>Recent Usage</h4>
                    <div className="usage-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Coupon Code</th>
                                    <th>User</th>
                                    <th>Course</th>
                                    <th>Discount</th>
                                    <th>Order Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usageStats.usageRecords.slice(0, 10).map(usage => (
                                    <tr key={usage.id}>
                                        <td>{formatDate(usage.usedAt)}</td>
                                        <td className="coupon-code">{usage.couponCode}</td>
                                        <td>{usage.userId}</td>
                                        <td>{usage.courseId}</td>
                                        <td>${usage.discountAmount?.toFixed(2)}</td>
                                        <td>${usage.orderAmount?.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="admin-coupon-manager">
            <h2>Coupon Management</h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="coupon-tabs">
                <button
                    onClick={() => setActiveTab('create')}
                    className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
                >
                    🎫 Create Coupon
                </button>
                <button
                    onClick={() => setActiveTab('manage')}
                    className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
                >
                    📋 Manage Coupons
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
                >
                    📊 Usage Statistics
                </button>
            </div>

            <div className="coupon-content">
                {activeTab === 'create' && renderCreateCouponForm()}
                {activeTab === 'manage' && renderCouponsList()}
                {activeTab === 'stats' && renderUsageStats()}
            </div>
        </div>
    );
};

export default AdminCouponManager;
