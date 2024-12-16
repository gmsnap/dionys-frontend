import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { AuthUser, useAuth } from './useAuth';

interface AuthContextType {
    authUser: AuthUser | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<AuthUser>;
    logout: () => Promise<void>;
    signUp2: (email: string, password: string, givenName: string, familyName: string) => Promise<any>;
    confirmSignUp2: (email: string, verificationCode: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { authUser, loading, login, logout, signUp2, confirmSignUp2, getCurrentUser2 } = useAuth();

    // Call `getCurrentUser2` on provider mount
    useEffect(() => {
        const initializeAuth = async () => {
            await getCurrentUser2();
        };
        initializeAuth();
    }, [getCurrentUser2]);

    return (
        <AuthContext.Provider
            value={{
                authUser,
                loading,
                login,
                logout,
                signUp2,
                confirmSignUp2,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};