// src/components/AdminRoleManager.jsx
// Component for managing user roles (admin only)
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../config/firebase';
import { assignUserRole, USER_ROLES, logRoleAction, getUserRole } from '../services/roleService';
import { useAuth } from '../hooks/useAuth';

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
        <div style={{
            padding: '20px',
            backgroundColor: 'rgba(29, 126, 153, 0.1)',
            borderRadius: '8px',
            margin: '20px 0'
        }}>
            <h3>👑 Role Management</h3>

            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: '#f56565' }}>❌ {error}</p>}
            {message && <p style={{ color: '#48bb78' }}>✅ {message}</p>}

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
                <select
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        minWidth: '200px'
                    }}
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
                    style={{
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                >
                    <option value={USER_ROLES.STUDENT}>Student</option>
                    <option value={USER_ROLES.INSTRUCTOR}>Instructor</option>
                    <option value={USER_ROLES.ADMIN}>Admin</option>
                </select>

                <button
                    onClick={handleAssignRole}
                    disabled={!selectedUser || !selectedRole || loading}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: (!selectedUser || !selectedRole || loading) ? '#ccc' : '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (!selectedUser || !selectedRole || loading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Assigning...' : 'Assign Role'}
                </button>
            </div>

            {/* Current User Roles Display */}
            {users.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                    <h4>Current User Roles:</h4>
                    <div style={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '12px',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}>
                        {users.map(user => (
                            <div key={user.userId} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #f7fafc'
                            }}>
                                <div>
                                    <strong>{user.displayName}</strong>
                                    {user.email && <span style={{ color: '#666', fontSize: '12px' }}> ({user.email})</span>}
                                    <div style={{ fontSize: '11px', color: '#888' }}>
                                        ID: {user.userId.substring(0, 12)}...
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 8px',
                                    backgroundColor: userRoles.get(user.userId) === USER_ROLES.ADMIN ? '#e53e3e' :
                                        userRoles.get(user.userId) === USER_ROLES.INSTRUCTOR ? '#3b82f6' : '#48bb78',
                                    color: 'white',
                                    borderRadius: '12px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    {userRoles.get(user.userId) || 'Loading...'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                backgroundColor: '#fff3cd',
                border: '1px solid #ffc107',
                borderRadius: '4px',
                padding: '12px',
                fontSize: '14px'
            }}>
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
