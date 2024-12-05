export const fetchVenuesByLocationId = async (
    locationId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);
        const response =
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/location/${locationId}?include=rooms`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        return result; // Return the result instead of setting it to a parameter
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        return null; // In case of error, return null
    } finally {
        setIsLoading(false);
    }
};