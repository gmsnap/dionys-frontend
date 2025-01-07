const baseUrl = process.env.NEXT_PUBLIC_API_URL;
export const roomsBaseUrl = `${baseUrl}/partner/rooms`;

export const fetchRooms = async (
    locationId: number,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<any> => {
    try {
        setIsLoading(true);

        const response =
            await fetch(`${baseUrl}/locations/${locationId}/rooms?include=roomConfigurations`);

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

export const handleDeleteRoom = async (
    roomId: number,
    onSuccess: () => void,
    forceDelete = false
): Promise<void> => {
    try {
        if (!roomId || roomId <= 0) {
            console.error('Invalid room ID');
            return;
        }

        const response = await fetch(`${roomsBaseUrl}/${roomId}?force=${forceDelete}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log('Room deleted successfully');
            onSuccess();
        } else {
            const errorMessage = await response.text();
            console.error('Failed to delete room:', errorMessage);
        }
    } catch (error) {
        console.error('Error deleting room:', error);
    }
};