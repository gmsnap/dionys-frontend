export const usersBaseUrl = `${process.env.NEXT_PUBLIC_API_URL}/partner-users`;
export const companyBaseUrl = `${process.env.NEXT_PUBLIC_API_URL}/partner-companies`;

export const fetchPartners = async (
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null
): Promise<{ response: Response; result: any } | null> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response = await fetch(`${usersBaseUrl}`);
        const result = await response.json();
        return { response, result };
    } catch (err) {
        if (setError != null) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred"
            );
        }
        return null;
    } finally {
        if (setIsLoading != null) {
            setIsLoading(false);
        }
    }
};

export const fetchPartnersByCompany = async (
    companyId: number,
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null
): Promise<{ response: Response; result: any } | null> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response = await fetch(`${usersBaseUrl}/company/${companyId}`);
        const result = await response.json();
        return { response, result };
    } catch (err) {
        if (setError != null) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred"
            );
        }
        return null;
    } finally {
        if (setIsLoading != null) {
            setIsLoading(false);
        }
    }
};

export const fetchCompanyById = async (
    id: number,
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null
): Promise<{ response: Response; result: any } | null> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response = await fetch(`${companyBaseUrl}/${id}`);
        const result = await response.json();
        return { response, result };
    } catch (err) {
        if (setError != null) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred"
            );
        }
        return null;
    } finally {
        if (setIsLoading != null) {
            setIsLoading(false);
        }
    }
};

export const fetchCompanies = async (
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null
): Promise<{ response: Response; result: any } | null> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response = await fetch(`${companyBaseUrl}`);
        const result = await response.json();
        return { response, result };
    } catch (err) {
        if (setError != null) {
            setError(
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred"
            );
        }
        return null;
    } finally {
        if (setIsLoading != null) {
            setIsLoading(false);
        }
    }
};