// src/components/EmailSetupGuide.jsx
// Component to guide users through EmailJS setup
import React, { useState } from 'react';

const EmailSetupGuide = () => {
    const [showGuide, setShowGuide] = useState(false);

    const styles = {
        container: {
            margin: '30px 0',
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        },
        button: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '14px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease',
            ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
            }
        },
        guideContainer: {
            background: '#ffffff',
            border: '1px solid #e1e5e9',
            borderRadius: '12px',
            padding: '32px',
            marginTop: '16px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            lineHeight: '1.6'
        },
        title: {
            color: '#2d3748',
            fontSize: '24px',
            fontWeight: '600',
            marginBottom: '24px',
            textAlign: 'center',
            borderBottom: '2px solid #667eea',
            paddingBottom: '16px'
        },
        stepContainer: {
            marginBottom: '32px',
            padding: '24px',
            background: '#f7fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
        },
        stepTitle: {
            color: '#667eea',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        stepList: {
            paddingLeft: '20px',
            color: '#4a5568'
        },
        stepListItem: {
            marginBottom: '8px',
            fontSize: '15px'
        },
        codeBlock: {
            background: '#1a202c',
            color: '#e2e8f0',
            padding: '20px',
            borderRadius: '8px',
            margin: '16px 0',
            fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'auto',
            border: '1px solid #2d3748'
        },
        codeBlockLight: {
            background: '#f7fafc',
            color: '#2d3748',
            padding: '20px',
            borderRadius: '8px',
            margin: '16px 0',
            fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
            fontSize: '14px',
            lineHeight: '1.5',
            overflow: 'auto',
            border: '1px solid #e2e8f0'
        },
        inlineCode: {
            background: '#edf2f7',
            color: '#667eea',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '14px',
            fontFamily: 'monospace'
        },
        alertSuccess: {
            background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
            border: '1px solid #b8dabc',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '24px',
            color: '#155724'
        },
        alertWarning: {
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            border: '1px solid #ffeaa7',
            borderRadius: '8px',
            padding: '20px',
            marginTop: '16px',
            color: '#856404'
        },
        link: {
            color: '#667eea',
            textDecoration: 'none',
            fontWeight: '500',
            ':hover': {
                textDecoration: 'underline'
            }
        },
        strong: {
            color: '#2d3748',
            fontWeight: '600'
        }
    };

    return (
        <div style={styles.container}>
            <button
                onClick={() => setShowGuide(!showGuide)}
                style={styles.button}
                onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
            >
                📧 Email Service Setup Guide {showGuide ? '▲' : '▼'}
            </button>

            {showGuide && (
                <div style={styles.guideContainer}>
                    <h3 style={styles.title}>
                        🚀 Setting up Email Service for Enrollment Confirmations
                    </h3>

                    <div style={styles.stepContainer}>
                        <h4 style={styles.stepTitle}>
                            📝 Step 1: Create EmailJS Account
                        </h4>
                        <ol style={styles.stepList}>
                            <li style={styles.stepListItem}>
                                Go to <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" style={styles.link}>EmailJS.com</a>
                            </li>
                            <li style={styles.stepListItem}>Sign up for a free account</li>
                            <li style={styles.stepListItem}>Verify your email address</li>
                        </ol>
                    </div>

                    <div style={styles.stepContainer}>
                        <h4 style={styles.stepTitle}>
                            🔧 Step 2: Configure Email Service
                        </h4>
                        <ol style={styles.stepList}>
                            <li style={styles.stepListItem}>In EmailJS dashboard, go to <strong style={styles.strong}>"Email Services"</strong></li>
                            <li style={styles.stepListItem}>Click <strong style={styles.strong}>"Add New Service"</strong></li>
                            <li style={styles.stepListItem}>Choose your email provider (Gmail recommended)</li>
                            <li style={styles.stepListItem}>Follow the setup instructions</li>
                            <li style={styles.stepListItem}>Note down your <strong style={styles.strong}>Service ID</strong></li>
                        </ol>
                    </div>

                    <div style={styles.stepContainer}>
                        <h4 style={styles.stepTitle}>
                            📧 Step 3: Create Email Template
                        </h4>
                        <ol style={styles.stepList}>
                            <li style={styles.stepListItem}>Go to <strong style={styles.strong}>"Email Templates"</strong> in EmailJS dashboard</li>
                            <li style={styles.stepListItem}>Click <strong style={styles.strong}>"Create New Template"</strong></li>
                            <li style={styles.stepListItem}>Use this template configuration:</li>
                        </ol>

                        <div style={styles.codeBlockLight}>
                            <strong>Template Settings:</strong><br />
                            • <strong>Subject:</strong> {`{{subject}}`}<br />
                            • <strong>To Email:</strong> {`{{to_email}}`}<br />
                            • <strong>From Name:</strong> {`{{from_name}}`}<br />
                            • <strong>HTML Content:</strong> {`{{html_content}}`}<br />
                            • <strong>Text Content:</strong> {`{{text_content}}`}
                        </div>

                        <p style={{ color: '#4a5568', marginTop: '16px' }}>
                            📌 Note down your <strong style={styles.strong}>Template ID</strong> after saving
                        </p>
                    </div>

                    <div style={styles.stepContainer}>
                        <h4 style={styles.stepTitle}>
                            🔑 Step 4: Get Public Key
                        </h4>
                        <ol style={styles.stepList}>
                            <li style={styles.stepListItem}>Go to <strong style={styles.strong}>"Account"</strong> → <strong style={styles.strong}>"General"</strong></li>
                            <li style={styles.stepListItem}>Find your <strong style={styles.strong}>Public Key</strong></li>
                            <li style={styles.stepListItem}>Copy it for the environment configuration</li>
                        </ol>
                    </div>

                    <div style={styles.stepContainer}>
                        <h4 style={styles.stepTitle}>
                            ⚙️ Step 5: Update Environment Variables
                        </h4>
                        <p style={{ color: '#4a5568', marginBottom: '16px' }}>
                            Add these variables to your <span style={styles.inlineCode}>.env</span> file:
                        </p>

                        <div style={styles.codeBlock}>
                            <span style={{ color: '#68d391' }}>REACT_APP_EMAILJS_SERVICE_ID</span>=your_service_id_here<br />
                            <span style={{ color: '#68d391' }}>REACT_APP_EMAILJS_TEMPLATE_ID</span>=your_template_id_here<br />
                            <span style={{ color: '#68d391' }}>REACT_APP_EMAILJS_PUBLIC_KEY</span>=your_public_key_here<br />
                            <span style={{ color: '#68d391' }}>REACT_APP_FROM_EMAIL</span>=noreply@tuneparams.ai<br />
                            <span style={{ color: '#68d391' }}>REACT_APP_SUPPORT_EMAIL</span>=support@tuneparams.ai<br />
                            <span style={{ color: '#68d391' }}>REACT_APP_WEBSITE_URL</span>=https://www.tuneparams.ai
                        </div>
                    </div>

                    <div style={styles.alertSuccess}>
                        <strong>✅ Testing Instructions:</strong>
                        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                            <li>Once configured, restart your development server</li>
                            <li>Test the email functionality by making a test payment</li>
                            <li>Check the browser console for email sending status</li>
                            <li>Verify emails appear in the Admin Dashboard → Email Tracking</li>
                        </ul>
                    </div>

                    <div style={styles.alertWarning}>
                        <strong>⚠️ Important Notes:</strong>
                        <ul style={{ marginTop: '12px', paddingLeft: '20px' }}>
                            <li><strong>Free Plan Limit:</strong> EmailJS free plan allows 200 emails per month</li>
                            <li><strong>Production Use:</strong> Consider upgrading to a paid plan for higher volume</li>
                            <li><strong>Security:</strong> Public keys are safe to expose in frontend code</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailSetupGuide;
