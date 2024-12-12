export const fetchLocationByPartnerId = async (
    partnerId: number,
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null
): Promise<any> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response =
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/partner/${partnerId}?single=1`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result; // Return the result instead of setting it to a parameter
    } catch (err) {
        if (setError != null) {
            setError(err instanceof Error ?
                err.message :
                'An unknown error occurred');
        }
        return null; // In case of error, return null
    } finally {
        if (setIsLoading != null) {
            setIsLoading(false);
        }
    }
};