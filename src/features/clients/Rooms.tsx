import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Typography, Button } from '@mui/material';
import { title } from 'process';
import useStore from '@/stores/eventStore';
import { RoomModel } from '@/models/RoomModel';
import ImageSlideShow from './ImageSlideShow';

interface VenueProps {
    sx?: SxProps<Theme>;
}

const Rooms = ({ sx }: VenueProps) => {
    const [rooms, setRooms] = useState<RoomModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { eventConfiguration, setEventConfiguration } = useStore();

    const fetchRooms = async (newVenueId: number): Promise<RoomModel[]> => {
        try {
            if (eventConfiguration) {

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${newVenueId}/rooms`);

                if (response.status === 404) {
                    return [];
                }

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const rooms: RoomModel[] = await response.json();

                return rooms;
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        }
        return [];
    };

    // Function to handle updating the venueId
    const handleRoomChange = async (newRoomId: number) => {
        if (eventConfiguration) {
            const room = rooms?.find((room) => room.id === newRoomId);
            setEventConfiguration({
                ...eventConfiguration,
                roomId: newRoomId,
                room: room || null,
                rooms: rooms || null,
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                const response =
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/${eventConfiguration?.locationId}?include=rooms`);

                if (response.status === 404) {
                    setIsLoading(false);
                    setRooms([]);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();

                setRooms(result.rooms || []);

                setIsLoading(false);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred');
                }
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    if (!rooms || rooms.length === 0) {
        return <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 8 }}>VENUE</Typography>
            <Typography variant="h5" sx={{ mt: 4 }}>Keine Venues für diese Location gefunden!</Typography>
        </Box>;
    }

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 8 }}>VENUE</Typography>
            {isLoading && <Typography>Loading...</Typography>}
            {error && <Typography>Error fetching data...</Typography>}
            {rooms?.map((room) => (
                <Box
                    key={room.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        mb: 10,
                    }}
                >
                    {/* Left Column */}
                    <Box flexBasis="50%" sx={{
                        flexGrow: 1,
                        maxWidth: '450px',
                        mr: 5,
                    }}>
                        <Typography
                            variant="h5"
                            sx={{
                                textTransform: 'uppercase',
                                mb: 4
                            }}>
                            {room.name}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mb: 4 }}>
                            {room.description}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ flex: 1 }}
                            onClick={() => handleRoomChange(room.id)}>
                            {eventConfiguration?.roomId === room.id ? 'Ausgewählt' : 'Venue Auswählen'}
                        </Button>
                    </Box>

                    {/* Right Column */}
                    <ImageSlideShow
                        images={room.images}
                        title={title}
                        sx={{ maxWidth: '550px' }}
                    />
                </Box>
            ))}
        </Box>
    );
};

export default Rooms;