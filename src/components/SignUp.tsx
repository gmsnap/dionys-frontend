import { useAuthContext } from '@/auth/AuthContext';
import React, { useState } from 'react';

export const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [givenName, setGivenName] = useState('');
    const [familyName, setFamilyName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const { authUser, signUp2 } = useAuthContext();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await signUp2(email, password, givenName, familyName);
            setSuccess(true);
            setError(null);
        } catch (error: any) {
            console.error('Signup error:', error);
            setError(error.message || 'Failed to sign up');
            setSuccess(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-8">
            <form onSubmit={handleSignUp} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="givenName" className="block text-sm font-medium text-gray-700">Given Name</label>
                    <input
                        type="text"
                        id="givenName"
                        value={givenName}
                        onChange={(e) => setGivenName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="familyName" className="block text-sm font-medium text-gray-700">Family Name</label>
                    <input
                        type="text"
                        id="familyName"
                        value={familyName}
                        onChange={(e) => setFamilyName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Sign Up
                </button>
            </form>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            {success && <p className="mt-2 text-sm text-green-600">Sign up successful! Please check your email for verification.</p>}
        </div>
    );
};
