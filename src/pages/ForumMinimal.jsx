import React from 'react';
import { useNavigate } from 'react-router-dom';

const ForumMinimal = () => {
    const navigate = useNavigate();

    return (
        <div style={{
            padding: '20px',
            background: '#1e1e1e',
            color: '#fff',
            minHeight: '100vh',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h1 style={{ color: '#007bff', marginBottom: '20px' }}>Community Forums</h1>
            <p style={{ marginBottom: '30px' }}>Join the conversation and connect with fellow learners</p>

            <div style={{
                background: '#2d2d2d',
                padding: '20px',
                borderRadius: '8px',
                textAlign: 'center'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '20px' }}>💬</div>
                <h3>No discussions yet</h3>
                <p style={{ color: '#999', marginBottom: '20px' }}>Be the first to start a discussion!</p>
                <button
                    style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer'
                    }}
                    onClick={() => navigate('/login')}
                >
                    Login to Post
                </button>
            </div>
        </div>
    );
};

export default ForumMinimal;
