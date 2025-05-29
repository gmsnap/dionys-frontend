import { EventCategoryModel } from "@/models/EventCategoryModel";
import { makeAuthHeader } from '@/utils/apiHelper';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const categoriesBaseUrl = `${baseUrl}/eventCategories`;
export const partnerCategoriesBaseUrl = `${baseUrl}/partner/eventCategories`;

export const fetchEventCategoriesByCompany = async (
    companyId: number,
    setIsLoading?: (loading: boolean) => void,
    setError?: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading?.(true);

        const response =
            await fetch(`${categoriesBaseUrl}/company/${companyId}`);

        if (response.status === 404) {
            setIsLoading?.(false);
            return [];
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setError?.(null);
        return result || [];
    } catch (err) {
        setError?.(err instanceof Error ? err.message : 'An unknown error occurred');
        return null;
    } finally {
        setIsLoading?.(false);
    }
};

export const fetchEventCategoriesByLocation = async (
    locationId: number,
    setIsLoading?: (loading: boolean) => void,
    setError?: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading?.(true);

        const response =
            await fetch(`${categoriesBaseUrl}/location/${locationId}`);

        if (response.status === 404) {
            setIsLoading?.(false);
            return [];
        }

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        setError?.(null);
        return result || [];
    } catch (err) {
        setError?.(err instanceof Error ? err.message : 'An unknown error occurred');
        return null;
    } finally {
        setIsLoading?.(false);
    }
};

export const createEventCategory = async (
    model: EventCategoryModel,
    onSuccess: () => void,
    onError?: () => void,
    idToken?: string
): Promise<void> => {
    try {
        const response = model.id
            ? await fetch(`${partnerCategoriesBaseUrl}/${model.id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(model),
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        "Content-Type": "application/json"
                    },
                })
            : await fetch(partnerCategoriesBaseUrl,
                {
                    method: "POST",
                    body: JSON.stringify(model),
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                        "Content-Type": "application/json"
                    },
                });

        if (response.ok) {
            console.log('Event Package deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to create Event Package:', errorMessage);
            onError?.();
        }
    } catch (error) {
        console.error('Error creating Event Package:', error);
        onError?.();
    }
};

export const deleteEventCategory = async (
    id: number,
    onSuccess: () => void,
    onError?: () => void,
    idToken?: string
): Promise<void> => {
    try {
        const response = await fetch(`${partnerCategoriesBaseUrl}/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
            });

        if (response.ok) {
            console.log('Event Package deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete Event Package:', errorMessage);
            onError?.();
        }
    } catch (error) {
        console.error('Error deleting Event Package:', error);
        onError?.();
    }
};

export const setEventCategoryImage = async (
    locationId: number,
    categoryKey: string,
    image: string,
    onSuccess: () => void,
    onError?: () => void,
    idToken?: string
): Promise<void> => {
    try {
        const response = await fetch(`${partnerCategoriesBaseUrl}/location/${locationId}/category/${categoryKey}/image`,
            {
                method: "PUT",
                body: JSON.stringify({ imageUrl: image }),
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
            });

        if (response.ok) {
            console.log('Category image successfully updated');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to update Category image:', errorMessage);
            onError?.();
        }
    } catch (error) {
        console.error('Error updating Category image:', error);
        onError?.();
    }
};

export const deleteEventCategoryByLocation = async (
    locationId: number,
    categoryKey: string,
    onSuccess: () => void,
    onError?: () => void,
    idToken?: string
): Promise<void> => {
    try {
        const response = await fetch(`${partnerCategoriesBaseUrl}/location/${locationId}/category/${categoryKey}/image`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
            });

        if (response.ok) {
            console.log('Category image successfully deleted');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete Category image:', errorMessage);
            onError?.();
        }
    } catch (error) {
        console.error('Error deleting Category image:', error);
        onError?.();
    }
};