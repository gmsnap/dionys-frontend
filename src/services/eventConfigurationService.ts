import { PriceTypes } from "@/constants/PriceTypes";
import { EventConfigurationModel } from "@/models/EventConfigurationModel";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const evntConfUrl = `${baseUrl}/eventConfigurations`;

export const fetchEventConfigurationsByCompany = async (
    companyId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);

        const response =
            await fetch(`${evntConfUrl}/company/${companyId}`);

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

export const deleteEventConfiguration = async (
    idToken: string,
    id: number,
    onSuccess?: () => void,
    forceDelete = false
): Promise<void> => {
    try {
        if (!id || id <= 0) {
            console.error('Invalid ID');
            return;
        }

        const response = await fetch(`${evntConfUrl}/${id}?force=${forceDelete}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok) {
            console.log('Deleted successfully');
            onSuccess?.();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting:', error);
    }
};