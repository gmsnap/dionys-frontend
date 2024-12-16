import {
    signOut,
    fetchUserAttributes,
    signUp,
    fetchAuthSession,
    signIn,
    confirmSignUp
} from '@aws-amplify/auth';
import { useState, useCallback } from 'react';

export interface AuthUser {
    sub: string | undefined;
    username: string;
    email: string;
    givenName?: string;
    familyName?: string;
    idToken: string;
}

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const useAuth = () => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const getCurrentUser2 = useCallback(async () => {
        try {
            const session = await fetchAuthSession();
            const attr = await fetchUserAttributes();
            console.log('session.identityId ', session);
            if (session.identityId &&
                session.tokens?.idToken &&
                attr.email
            ) {
                const formattedUser: AuthUser = {
                    sub: session.userSub,
                    username: session.identityId,
                    idToken: session.tokens.idToken.toString(),
                    email: attr.email,
                    givenName: attr.given_name,
                    familyName: attr.family_name,
                };
                setAuthUser(formattedUser);
                return;
            }
        } catch {
            //
        } finally {
            setLoading(false);
        }

        setAuthUser(null);
    }, []);

    const login = async (email: string, password: string): Promise<AuthUser> => {
        if (!isValidEmail(email)) {
            throw new Error("Invalid email format");
        }
        if (!password || password.trim() === '') {
            throw new Error('Password is required.');
        }

        try {
            await signIn({ username: email, password });
            // Ensure up-to-date attributes are fetched
            await getCurrentUser2();
            return authUser as AuthUser;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            await signOut();
            setAuthUser(null);
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const signUp2 = async (
        email: string,
        password: string,
        givenName: string,
        familyName: string
    ) => {
        try {
            const result = await signUp({
                username: email,
                password,
                options: {
                    userAttributes: {
                        email,
                        given_name: givenName,
                        family_name: familyName,
                    },
                },
            });
            console.log('Signup successful:', result);
            return result;
        } catch (error: any) {
            console.error('Signup error:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    };

    const confirmSignUp2 = async (email: string, verificationCode: string) => {
        try {
            const { isSignUpComplete, nextStep } = await confirmSignUp({
                username: email,
                confirmationCode: verificationCode
            });
            console.log('Signup successful:', isSignUpComplete);
            return;
        } catch (error: any) {
            console.error('Signup error:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    }

    return {
        authUser,
        setAuthUser,
        loading,
        login,
        logout,
        signUp2,
        confirmSignUp2,
        getCurrentUser2,
    };
};