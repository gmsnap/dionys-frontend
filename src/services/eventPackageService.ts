const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const packagesBaseUrl = `${baseUrl}/eventPackages`;
export const partnerPackagesBaseUrl = `${baseUrl}/partner/eventPackages`;

export const fetchEventPackages = async (
    locationId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);

        const response =
            await fetch(`${baseUrl}/locations/${locationId}/packages`);

        if (response.status === 404) {
            setIsLoading(false);
            return [];
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setError(null);
        return result || [];
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        return null;
    } finally {
        setIsLoading(false);
    }
}

export const fetchEventPackagesByCompany = async (
    companyId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);

        const response =
            await fetch(`${packagesBaseUrl}/company/${companyId}`);

        if (response.status === 404) {
            setIsLoading(false);
            return [];
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setError(null);
        return result || [];
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        return null;
    } finally {
        setIsLoading(false);
    }
}

export const handleDeleteEventPackage = async (
    id: number,
    onSuccess: () => void,
    forceDelete = false
): Promise<void> => {
    try {
        if (!id || id <= 0) {
            console.error('Invalid Event Package ID');
            return;
        }

        const response = await fetch(`${partnerPackagesBaseUrl}/${id}?force=${forceDelete}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('Event Package deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete Event Package:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting Event Package:', error);
    }
};