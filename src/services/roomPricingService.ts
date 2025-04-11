import { RoomPricingModel } from "@/models/RoomPricingModel";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const pricingsBaseUrl = `${baseUrl}/partner/roomPricings`;

export const fetchRoomPricingsByRoom = async (
    roomId: number | number[],
    setIsLoading?: (loading: boolean) => void,
    setError?: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading?.(true);

        const response = Array.isArray(roomId)
            ? await fetch(`${baseUrl}/rooms/pricings/multiple?roomIds=${roomId.join(',')}`)
            : await fetch(`${baseUrl}/rooms/${roomId}/pricings`);

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

export const createRoomPricing = async (
    idToken: string,
    model: RoomPricingModel,
    onSuccess?: (result: RoomPricingModel) => void,
    onError?: (message?: string) => void,
): Promise<void> => {
    try {
        const udpate = model.id > 0;
        // Create user via API if not exists
        const response = await fetch(
            udpate ? `${pricingsBaseUrl}/${model.id}` : pricingsBaseUrl,
            {
                method: udpate ? "PUT" : "POST",
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(model),
            });

        if (!response.ok) {
            const errResult = await response.json();
            onError?.(errResult?.message ?? "Unkekannter Fehler");
            return;
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

export const deleteRoomPricing = async (
    idToken: string,
    id: number,
    onSuccess: () => void,
    forceDelete = false
): Promise<void> => {
    try {
        if (!id || id <= 0) {
            console.error('Invalid Room Pricing ID');
            return;
        }

        const response = await fetch(`${pricingsBaseUrl}/${id}?force=${forceDelete}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok) {
            console.log('Room Pricing deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete Room Pricing:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting Room Pricing:', error);
    }
};