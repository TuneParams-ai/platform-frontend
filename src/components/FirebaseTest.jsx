import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

const FirebaseTest = () => {
    const [testEmail, setTestEmail] = useState('test@example.com');
    const [testPassword, setTestPassword] = useState('password123');
    const [results, setResults] = useState([]);
    const { registerWithEmail } = useAuth();

    const addResult = (message, type = 'info') => {
        const timestamp = new Date().toLocaleTimeString();
        setResults(prev => [...prev, { timestamp, message, type }]);
    };

    const testEmailVerification = async () => {
        addResult('Starting Firebase email verification test...', 'info');

        try {
            // First, try to sign out any existing user
            if (auth.currentUser) {
                await signOut(auth);
                addResult('🔄 Signed out existing user', 'info');
            }

            const result = await registerWithEmail(testEmail, testPassword, 'Test', 'User');

            if (result.success) {
                addResult('✅ Registration successful!', 'success');
                if (result.requiresVerification) {
                    addResult('✅ Email verification sent!', 'success');
                    addResult(`📧 Check ${testEmail} for verification email`, 'info');
                    addResult('⚠️ User should NOT be logged in until verified', 'info');
                }
            } else {
                addResult(`❌ Registration failed: ${result.error}`, 'error');
            }
        } catch (error) {
            addResult(`❌ Test failed: ${error.message}`, 'error');
        }
    };

    const clearResults = () => {
        setResults([]);
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '600px',
            margin: '20px auto',
            border: '1px solid #ccc',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
        }}>
            <h3>🧪 Firebase Email Verification Test</h3>

            <div style={{ marginBottom: '15px' }}>
                <label>Test Email:</label>
                <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        margin: '5px 0',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Test Password:</label>
                <input
                    type="password"
                    value={testPassword}
                    onChange={(e) => setTestPassword(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '8px',
                        margin: '5px 0',
                        borderRadius: '4px',
                        border: '1px solid #ccc'
                    }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <button
                    onClick={testEmailVerification}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '10px'
                    }}
                >
                    🧪 Test Email Verification
                </button>

                <button
                    onClick={clearResults}
                    style={{
                        backgroundColor: '#6c757d',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Clear Results
                </button>
            </div>

            <div style={{
                backgroundColor: '#000',
                color: '#0f0',
                padding: '15px',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '300px',
                overflowY: 'auto'
            }}>
                <div>🔧 Firebase Test Console:</div>
                {results.length === 0 && (
                    <div style={{ color: '#888' }}>No tests run yet...</div>
                )}
                {results.map((result, index) => (
                    <div
                        key={index}
                        style={{
                            color: result.type === 'error' ? '#ff6b6b' :
                                result.type === 'success' ? '#51cf66' : '#0f0',
                            margin: '2px 0'
                        }}
                    >
                        [{result.timestamp}] {result.message}
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '15px', fontSize: '12px', color: '#666' }}>
                <strong>Instructions:</strong>
                <ol>
                    <li>Enter a test email address (use a real email you can access)</li>
                    <li>Click "Test Email Verification"</li>
                    <li>Check your email inbox for the verification email</li>
                    <li>If no email arrives, check the console logs and Firebase settings</li>
                </ol>
            </div>
        </div>
    );
};

export default FirebaseTest;
