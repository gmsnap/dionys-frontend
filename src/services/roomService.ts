export const fetchRoomsByVenueId = async (
    venueId: number,
    setRooms: (rooms: any[]) => void,
    setIsLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
): Promise<void> => {
    try {
        setIsLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${venueId}/rooms`);
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        setRooms(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
        setIsLoading(false);
    }
};

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

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}?force=${forceDelete}`, {
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