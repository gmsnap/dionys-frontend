export const makeAuthHeader = (token?: string) => {
    return token
        ? {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
        : {};
};