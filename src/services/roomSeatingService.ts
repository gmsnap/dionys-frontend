import { RoomSeatingModel } from "@/models/RoomSeatingModel";

const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const seatingsBaseUrl = `${baseUrl}/partner/roomSeatings`;

export const fetchRoomSeatingsByRoom = async (
    roomId: number | number[],
    setIsLoading?: (loading: boolean) => void,
    setError?: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading?.(true);

        const response = Array.isArray(roomId)
            ? await fetch(`${baseUrl}/rooms/seatings/multiple?roomIds=${roomId.join(',')}`)
            : await fetch(`${baseUrl}/rooms/${roomId}/seatings`);

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

export const createRoomSeating = async (
    idToken: string,
    model: RoomSeatingModel,
    onSuccess?: (result: RoomSeatingModel) => void,
    onError?: (message?: string) => void,
): Promise<void> => {
    try {
        const udpate = model.id > 0;
        // Create user via API if not exists
        const response = await fetch(
            udpate ? `${seatingsBaseUrl}/${model.id}` : seatingsBaseUrl,
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
            onError?.(errResult?.message ?? "Unbekannter Fehler");
            return;
        }

        const result = await response.json();
        onSuccess?.(result?.model);
        return;
    } catch (err) {
        if (err instanceof Error) {
            onError?.(err.message);
        } else {
            onError?.("An unknown error occurred");
        }
    }
};

export const deleteRoomSeating = async (
    idToken: string,
    id: number,
    onSuccess: () => void,
    forceDelete = false
): Promise<void> => {
    try {
        if (!id || id <= 0) {
            console.error('Invalid Room Seating ID');
            return;
        }

        const response = await fetch(`${seatingsBaseUrl}/${id}?force=${forceDelete}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json"
            },
        });

        if (response.ok) {
            console.log('Room Seating deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete Room Seating:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting Room Seating:', error);
    }
};