import { useAuthContext } from '@/auth/AuthContext';
import React, { useState } from 'react';

const ConfirmSignup = () => {
    const { confirmSignUp2 } = useAuthContext();
    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleConfirmSignup = async (e: any) => {
        e.preventDefault();

        if (!email || !verificationCode) {
            setMessage('Email and verification code are required.');
            return;
        }

        setIsLoading(true);
        setMessage(''); // Clear any previous messages

        try {
            await confirmSignUp2(email, verificationCode);
            setMessage('Sign-up successfully confirmed! You can now log in.');
        } catch (error: any) {
            console.error('Error confirming sign-up:', error);
            setMessage(error.message || 'Failed to confirm sign-up. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: 'auto', padding: '2rem', textAlign: 'center' }}>
            <h1>Confirm Sign-up</h1>
            <form onSubmit={handleConfirmSignup}>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ padding: '0.5rem', width: '100%' }}
                        required
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="code" style={{ display: 'block', marginBottom: '0.5rem' }}>
                        Verification Code
                    </label>
                    <input
                        id="code"
                        type="text"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        style={{ padding: '0.5rem', width: '100%' }}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                >
                    {isLoading ? 'Confirming...' : 'Confirm Sign-up'}
                </button>
            </form>

            {message && (
                <div style={{ marginTop: '1rem', color: message.includes('successfully') ? 'green' : 'red' }}>
                    {message}
                </div>
            )}
        </div>
    );
};

export default ConfirmSignup;