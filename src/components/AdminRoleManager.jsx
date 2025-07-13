// src/components/AdminRoleManager.jsx
// Component for managing user roles (admin only)
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { assignUserRole, USER_ROLES, logRoleAction, getUserRole } from '../services/roleService';
import { useAuth } from '../hooks/useAuth';
import '../styles/admin-role-manager.css';

const AdminRoleManager = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [userRoles, setUserRoles] = useState(new Map());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedRole, setSelectedRole] = useState(USER_ROLES.STUDENT);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get all unique users from enrollments and payments
            const [enrollmentsSnapshot, paymentsSnapshot] = await Promise.all([
                getDocs(query(collection(db, 'enrollments'))),
                getDocs(query(collection(db, 'payments')))
            ]);

            const uniqueUsers = new Map();

            // Collect users from enrollments
            enrollmentsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.userId) {
                    uniqueUsers.set(data.userId, {
                        userId: data.userId,
                        displayName: data.userId.substring(0, 8) + '...',
                        source: 'enrollment'
                    });
                }
            });

            // Collect users from payments (might have email info)
            paymentsSnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.userId) {
                    const existing = uniqueUsers.get(data.userId);
                    uniqueUsers.set(data.userId, {
                        userId: data.userId,
                        displayName: data.payerEmail || existing?.displayName || data.userId.substring(0, 8) + '...',
                        email: data.payerEmail,
                        source: existing ? 'both' : 'payment'
                    });
                }
            });

            const usersArray = Array.from(uniqueUsers.values());
            setUsers(usersArray);

            // Load current roles for all users
            const rolePromises = usersArray.map(async (user) => {
                const role = await getUserRole(user.userId);
                return [user.userId, role];
            });

            const roles = await Promise.all(rolePromises);
            const rolesMap = new Map(roles);
            setUserRoles(rolesMap);

        } catch (err) {
            setError(err.message);
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignRole = async () => {
        if (!selectedUser || !selectedRole) {
            setError('Please select both a user and a role');
            return;
        }

        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const result = await assignUserRole(selectedUser, selectedRole, user.uid);

            if (result.success) {
                // Update local state with new role
                const newRole = await getUserRole(selectedUser);
                setUserRoles(prev => new Map(prev).set(selectedUser, newRole));

                // Log the action
                await logRoleAction('assign_role', selectedUser, user.uid, {
                    newRole: selectedRole,
                    timestamp: new Date().toISOString()
                });

                setMessage(`Successfully assigned ${selectedRole} role to user`);
                setSelectedUser('');
                setSelectedRole(USER_ROLES.STUDENT);
            } else {
                setError(`Error: ${result.error}`);
            }
        } catch (err) {
            setError(`Error assigning role: ${err.message}`);
            console.error('Error assigning role:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-role-manager">
            <h3>👑 Role Management</h3>

            {loading && <p>Loading users...</p>}
            {error && <p className="admin-role-error">❌ {error}</p>}
            {message && <p className="admin-role-success">✅ {message}</p>}

            <div className="admin-role-form">
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="admin-role-select"
                >
                    <option value="">Select User</option>
                    {users.map(user => (
                        <option key={user.userId} value={user.userId}>
                            {user.displayName} {user.email ? `(${user.email})` : ''}
                            {userRoles.get(user.userId) ? ` - Current: ${userRoles.get(user.userId)}` : ''}
                        </option>
                    ))}
                </select>

                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="admin-role-select"
                >
                    <option value={USER_ROLES.STUDENT}>Student</option>
                    <option value={USER_ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={USER_ROLES.ADMIN}>Admin</option>
                </select>

                <button
                    onClick={handleAssignRole}
                    disabled={!selectedUser || !selectedRole || loading}
                    className={`admin-role-button ${(!selectedUser || !selectedRole || loading) ? 'loading' : ''}`}
                >
                    {loading ? 'Assigning...' : 'Assign Role'}
                </button>
            </div>            {/* Current User Roles Display */}
            {users.length > 0 && (
                <div className="admin-current-roles">
                    <h4>Current User Roles:</h4>
                    <div className="admin-roles-list">
                        {users.map(user => (
                            <div key={user.userId} className="admin-role-user-item">
                                <div className="admin-role-user-info">
                                    <div className="admin-role-user-name">{user.displayName}</div>
                                    {user.email && <div className="admin-role-user-email">({user.email})</div>}
                                    <div className="admin-role-user-id">
                                        ID: {user.userId.substring(0, 12)}...
                                    </div>
                                </div>
                                <div className={`admin-role-badge ${userRoles.get(user.userId)?.toLowerCase() || 'student'}`}>
                                    {userRoles.get(user.userId) || 'Loading...'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="admin-setup-note">
                <strong>⚠️ Quick Setup:</strong><br />
                To make yourself an admin immediately, use the Firestore Test page:<br />
                1. Go to <code>/firestore-test</code><br />
                2. Sign in with your account<br />
                3. Click "Test Payment Service" (this will create your user record)<br />
                4. Then manually add your role in Firestore console or use the script below
            </div>
        </div>
    );
};

export default AdminRoleManager;
