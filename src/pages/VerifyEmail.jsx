import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/verify-email.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { verifyEmail } = useAuth();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const handleEmailVerification = async () => {
            const mode = searchParams.get('mode');
            const oobCode = searchParams.get('oobCode');

            if (mode === 'verifyEmail' && oobCode) {
                try {
                    const result = await verifyEmail(oobCode);
                    if (result.success) {
                        setStatus('success');
                        setMessage('Email verified successfully! You can now sign in.');
                        setTimeout(() => {
                            navigate('/login?verified=true');
                        }, 3000);
                    } else {
                        setStatus('error');
                        setMessage(result.error || 'Email verification failed.');
                    }
                } catch (error) {
                    setStatus('error');
                    setMessage('Email verification failed. Please try again.');
                }
            } else {
                setStatus('error');
                setMessage('Invalid verification link.');
            }
        };

        handleEmailVerification();
    }, [searchParams, verifyEmail, navigate]);

    return (
        <div className="verify-email-container">
            <div className="verify-email-card">
                <div className="verify-email-header">
                    <h2>Email Verification</h2>
                </div>

                <div className="verify-email-content">
                    {status === 'verifying' && (
                        <div className="verification-status">
                            <div className="loading-spinner"></div>
                            <p>{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="verification-status success">
                            <div className="success-icon">✅</div>
                            <p>{message}</p>
                            <p className="redirect-message">Redirecting to login...</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="verification-status error">
                            <div className="error-icon">❌</div>
                            <p>{message}</p>
                            <button
                                className="btn btn-primary"
                                onClick={() => navigate('/login')}
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
