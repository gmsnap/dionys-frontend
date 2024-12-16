import { Amplify } from "aws-amplify";
import * as Auth from '@aws-amplify/auth';

const clientPoolConfig = {
    userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_POOL_CLIENT_ID || '',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
};

const partnerPoolConfig = {
    userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_PARTNER_POOL_ID || '',
    userPoolClientId: process.env.NEXT_PUBLIC_AWS_COGNITO_PARTNER_POOL_CLIENT_ID || '',
    authenticationFlowType: 'USER_PASSWORD_AUTH',
};

export const configureAmplify = (userPoolType: 'client' | 'partner') => {
    if (typeof window === 'undefined') return;

    const config = userPoolType === 'client' ? clientPoolConfig : partnerPoolConfig;

    Amplify.configure({
        Auth: {
            Cognito: {
                ...config,
            },
        }
    });

    console.log(`Amplify configured for ${userPoolType} pool`);
};

export const switchUserPool = async (userPoolType: 'client' | 'partner') => {
    await Auth.signOut(); // Sign out the current user
    configureAmplify(userPoolType);
};