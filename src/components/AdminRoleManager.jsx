// src/components/AdminRoleManager.jsx
// Component for managing user roles (admin only)
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { assignUserRole, USER_ROLES, logRoleAction, getUserRole } from '../services/roleService';
import { getAllUsers } from '../services/userService';
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            // Get all users from the users collection
            const result = await getAllUsers();

            if (result.success) {
                setUsers(result.users);

                // Load current roles for all users
                const rolePromises = result.users.map(async (user) => {
                    const roleData = await getUserRole(user.id);
                    return [user.id, roleData.role]; // Extract just the role string
                });

                const roles = await Promise.all(rolePromises);
                const rolesMap = new Map(roles);
                setUserRoles(rolesMap);
            } else {
                setError(result.error);
                // Fallback to old method if users collection is empty
                await loadUsersFromTransactions();
            }

        } catch (err) {
            setError(err.message);
            console.error('Error loading users:', err);
            // Fallback to old method
            await loadUsersFromTransactions();
        } finally {
            setLoading(false);
        }
    };

    // Fallback method to load users from transactions if users collection is empty
    const loadUsersFromTransactions = async () => {
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
                        id: data.userId,
                        uid: data.userId,
                        displayName: data.userId,
                        email: null,
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
                        id: data.userId,
                        uid: data.userId,
                        displayName: data.payerEmail || existing?.displayName || data.userId,
                        email: data.payerEmail,
                        source: existing ? 'both' : 'payment'
                    });
                }
            });

            const usersArray = Array.from(uniqueUsers.values());
            setUsers(usersArray);

            // Load current roles for all users
            const rolePromises = usersArray.map(async (user) => {
                const roleData = await getUserRole(user.id);
                return [user.id, roleData.role]; // Extract just the role string
            });

            const roles = await Promise.all(rolePromises);
            const rolesMap = new Map(roles);
            setUserRoles(rolesMap);

        } catch (err) {
            setError(err.message);
            console.error('Error loading users from transactions:', err);
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
                const newRoleData = await getUserRole(selectedUser);
                setUserRoles(prev => new Map(prev).set(selectedUser, newRoleData.role)); // Extract just the role string

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

    const syncAllUserRoles = async () => {
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            // Get all user roles from user_roles collection
            const userRolesSnapshot = await getDocs(collection(db, 'user_roles'));

            let syncCount = 0;
            const syncPromises = userRolesSnapshot.docs.map(async (roleDoc) => {
                const roleData = roleDoc.data();
                const userId = roleDoc.id;

                // Update the users collection with the role from user_roles
                const userRef = doc(db, 'users', userId);
                await setDoc(userRef, {
                    role: roleData.role,
                    updatedAt: serverTimestamp()
                }, { merge: true });

                syncCount++;
                return { userId, role: roleData.role };
            });

            await Promise.all(syncPromises);

            setMessage(`Successfully synced ${syncCount} user roles between collections`);

            // Reload users to show updated data
            await loadUsers();

        } catch (err) {
            setError(`Error syncing user roles: ${err.message}`);
            console.error('Error syncing user roles:', err);
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
                        <option key={user.id || user.uid} value={user.id || user.uid}>
                            {user.displayName || user.email} {user.email ? `(${user.email})` : ''}
                            {userRoles.get(user.id || user.uid) ? ` - Current: ${userRoles.get(user.id || user.uid)}` : ''}
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

                <button
                    onClick={syncAllUserRoles}
                    disabled={loading}
                    className={`admin-role-button sync-button ${loading ? 'loading' : ''}`}
                    title="Sync roles from user_roles collection to users collection"
                >
                    {loading ? 'Syncing...' : '🔄 Sync All Roles'}
                </button>
            </div>            {/* Current User Roles Display */}
            {users.length > 0 && (
                <div className="admin-current-roles">
                    <h4>Current User Roles:</h4>
                    <div className="admin-roles-list">
                        {users.map(user => (
                            <div key={user.id || user.uid} className="admin-role-user-item">
                                <div className="admin-role-user-info">
                                    <div className="admin-role-user-name">{user.displayName || user.email}</div>
                                    {user.email && <div className="admin-role-user-email">({user.email})</div>}
                                    <div className="admin-role-user-id">
                                        ID: {user.id || user.uid}
                                    </div>
                                </div>
                                <div className={`admin-role-badge ${(userRoles.get(user.id || user.uid) || 'student').toLowerCase()}`}>
                                    {userRoles.get(user.id || user.uid) || 'student'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="admin-setup-note">
                <strong>⚠️ Quick Setup:</strong><br />
                To make yourself an admin immediately:<br />
                1. Ensure you have an account and have logged in at least once<br />
                2. Use the Firestore console to manually add your role<br />
                3. Or run the setup script below to create your admin role
            </div>
        </div>
    );
};

export default AdminRoleManager;
