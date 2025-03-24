
import { LocationModel } from '@/models/LocationModel';
import useStore from '@/stores/partnerStore';
import { makeAuthHeader } from '@/utils/apiHelper';
import { useEffect } from 'react';

export const locationsBaseUrl = `${process.env.NEXT_PUBLIC_API_URL}/locations`;
export const allLocationsUrl = `${locationsBaseUrl}?include=eventCategories`;

export const fetchLocationById = async (
    id: number,
    withBillingAddress: boolean,
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null,
    idToken?: string
): Promise<any> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }

        let url = `${locationsBaseUrl}/${id}?include=eventCategories`;

        if (withBillingAddress) {
            url += `,billingAddress`;
        }

        const response = await fetch(
            url,
            makeAuthHeader(idToken)
        );

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

export const fetchLocationsByCompanyId = async (
    companyId: number,
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null,
    includeCategories: boolean = false
): Promise<any> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response =
            includeCategories ?
                await fetch(`${locationsBaseUrl}/company/${companyId}?include=eventCategories,rooms`) :
                await fetch(`${locationsBaseUrl}/company/${companyId}`);
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

export const fetchLocationByCode = async (
    code: string,
    setIsLoading: ((loading: boolean) => void) | null,
    setError: ((error: string | null) => void) | null
): Promise<any> => {
    try {
        if (setIsLoading != null) {
            setIsLoading(true);
        }
        const response =
            await fetch(`${locationsBaseUrl}/code/${code}?single=1&include=eventCategories,rooms,eventPackages`);
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
    const { partnerUser, setPartnerLocations } = useStore();

    useEffect(() => {
        const setLocation = async () => {
            if (partnerUser?.companyId) {
                const locations = await fetchLocationsByCompanyId(partnerUser.companyId, null, null, true);
                if (locations) {
                    setPartnerLocations(locations);
                    return;
                }
            }
            setPartnerLocations(null);
        };

        setLocation();
    }, [partnerUser, setPartnerLocations]);
};

export const storePartnerLocations = (onComplete?: () => void) => {
    const companyId = useStore.getState().partnerUser?.companyId;

    if (!companyId) {
        useStore.getState().setPartnerLocations(null);
        onComplete?.();
        return;
    }

    const runFetch = async (companyId: number) => {
        const locations = await fetchLocationsByCompanyId(companyId, null, null, true);
        if (locations) {
            useStore.getState().setPartnerLocations(locations);
        }
        onComplete?.();
    }

    runFetch(companyId);
};

export const handleDeleteLocation = async (
    locationId: number,
    onSuccess: () => void,
    forceDelete = false
): Promise<void> => {
    try {
        if (!locationId || locationId <= 0) {
            console.error('Invalid location ID');
            return;
        }

        const response = await fetch(`${locationsBaseUrl}/${locationId}?force=${forceDelete}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('Location deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete location:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting location:', error);
    }
};

export const getAggregatedRoomPrices = (location: LocationModel) => {
    if (!location.rooms || location.rooms.length === 0) {
        return 0;
    }

    return location.rooms.reduce((minPrice, room) => {
        return room.price < minPrice ? room.price : minPrice;
    }, Number.MAX_VALUE);
};