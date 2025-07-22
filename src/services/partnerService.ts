import { AuthUser } from "@/auth/useAuth";
import { BillingDetails } from "@/models/BillingDetails";
import { PartnerCompanyModel } from "@/models/PartnerCompanyModel";
import { PartnerUserModel } from "@/models/PartnerUserModel";

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

export const createPartnerUser = async (
    authUser: AuthUser,
    onSuccess?: (result: PartnerUserModel) => void,
    onError?: (message?: string) => void,
): Promise<void> => {
    try {
        // Fetch additional user data from API
        let response = await fetch(`${usersBaseUrl}/sub/${authUser.sub}`);

        // Create user via API if not exists
        if (response.status === 404) {
            const createResponse = await fetch(
                usersBaseUrl,
                {
                    method: "POST",
                    body: JSON.stringify({
                        cognitoSub: authUser.sub,
                        username: authUser.username,
                        email: authUser.email,
                        givenName: authUser.givenName,
                        familyName: authUser.familyName,
                    }),
                    headers: { "Content-Type": "application/json" },
                });
            response = await fetch(`${usersBaseUrl}/sub/${authUser.sub}`);
        }

        if (!response.ok) {
            onError?.("Failed to fetch user data");
        }

        const result = await response.json();
        onSuccess?.(result);
        return;
    } catch (err) {
        if (err instanceof Error) {
            onError?.(err.message);
        } else {
            onError?.("An unknown error occurred");
        }
    }
};

export const updatePartnerCompany = async (
    idToken: string,
    companyId: number,
    companyData: any,
    onSuccess?: (result: PartnerCompanyModel) => void,
    onError?: (message?: string) => void,
): Promise<void> => {
    try {
        const response = await fetch(
            `${companyBaseUrl}/${companyId}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(companyData),
            }
        );

        if (response.ok) {
            onSuccess?.(await response?.json());
        } else {
            const errorMessage = await response.text();
            console.error(errorMessage);
            onError?.(`Error ${response.status}: ${response.statusText}`);
        }
    }
    catch (error) {
        console.error('Error updating user:', error);
        onError?.();
    }
};

export const updateBillingDetails = async (
    idToken: string,
    companyId: number,
    billingDetails: BillingDetails,
    onSuccess?: (result: PartnerCompanyModel) => void,
    onError?: (message?: string) => void,
): Promise<void> => {
    await updatePartnerCompany(
        idToken,
        companyId,
        { billingDetails },
        onSuccess,
        onError
    );
};