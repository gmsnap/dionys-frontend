
import useStore from '@/stores/partnerStore';
import { useEffect } from 'react';

export const locationsBaseUrl = `${process.env.NEXT_PUBLIC_API_URL}/locations`;
export const allLocationsUrl = `${locationsBaseUrl}?include=eventCategories`;

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
            await fetch(`${locationsBaseUrl}/partner/${partnerId}?single=1`);
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

export const fetchLocationWithRooms = async (
    locationId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);
        const response =
            await fetch(`${locationsBaseUrl}/${locationId}?include=rooms`);
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

export const useSetLocationByCurrentPartner = () => {
    const { partnerUser, setPartnerLocation } = useStore();

    useEffect(() => {
        const setLocation = async () => {
            if (partnerUser?.id) {
                const location = await fetchLocationByPartnerId(partnerUser.id, null, null);
                if (location) {
                    setPartnerLocation(location);
                    return;
                }
            }
            setPartnerLocation(null);
        };

        setLocation();
    }, [partnerUser, setPartnerLocation]);
};