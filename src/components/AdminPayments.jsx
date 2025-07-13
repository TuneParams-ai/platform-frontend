// src/components/AdminPayments.jsx
// Component for managing payment records
import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

const AdminPayments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadPayments = async () => {
        setLoading(true);
        setError(null);

        try {
            const paymentsQuery = query(
                collection(db, 'payments'),
                orderBy('createdAt', 'desc')
            );
            const paymentsSnapshot = await getDocs(paymentsQuery);
            const paymentsData = paymentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setPayments(paymentsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, []);

    return (
        <div>
            <div className="admin-section-header">
                <h2>Payment Records ({payments.length})</h2>
                <button
                    onClick={loadPayments}
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

            {payments.length === 0 && !loading && (
                <div className="admin-empty-state">
                    <p>No payment records found.</p>
                </div>
            )}
        </div>
    );
};

export default AdminPayments;
