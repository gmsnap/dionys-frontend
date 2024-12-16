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

export interface LoginResult {
    status: 'success' | 'confirm' | 'reset' | 'error';
    user: AuthUser | null;
}

const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+(?:\.[^\s@]+)*$/.test(email);
}

export const useAuth = () => {
    const [authUser, setAuthUser] = useState<AuthUser | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const getCurrentUser2 = useCallback(async () => {
        try {
            const session = await fetchAuthSession();
            const attr = await fetchUserAttributes();
            if (session.tokens?.idToken &&
                attr.email
            ) {
                const formattedUser: AuthUser = {
                    sub: session.userSub,
                    username: attr.email,
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
            setAuthLoading(false);
        }

        setAuthUser(null);
    }, []);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        if (!isValidEmail(email)) {
            throw new Error("Invalid email format");
        }
        if (!password || password.trim() === '') {
            throw new Error('Password is required.');
        }

        try {
            const signInResult = await signIn({ username: email, password });
            const nextStep = signInResult.nextStep?.signInStep;
            switch (nextStep) {
                case 'RESET_PASSWORD':
                // TODO: prompt user to reset their password
                case 'CONFIRM_SIGN_UP':
                    //User needs to enter email verification code 
                    return {
                        status: 'confirm',
                        user: null
                    };
                case 'DONE':
                    // Ensure up-to-date attributes are fetched
                    await getCurrentUser2();
                    return {
                        status: 'success',
                        user: authUser as AuthUser
                    };
                default:
                    throw Error('unhandled signInStep: $signInStep');
            }
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
        authLoading,
        login,
        logout,
        signUp2,
        confirmSignUp2,
        getCurrentUser2,
    };
};