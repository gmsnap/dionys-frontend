import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Typography, Button } from '@mui/material';
import { title } from 'process';
import useStore from '@/stores/eventStore';
import { RoomModel } from '@/models/RoomModel';
import ImageGallery from './ImageGallery';
import { fetchRooms } from '@/services/roomService';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

interface VenueProps {
    sx?: SxProps<Theme>;
}

const Rooms = ({ sx }: VenueProps) => {
    const [rooms, setRooms] = useState<RoomModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { eventConfiguration, setEventConfiguration } = useStore();

    // Function to handle updating the venueId
    const handleRoomChange = async (newRoomId: number) => {
        if (eventConfiguration) {
            const room = rooms?.find((room) => room.id === newRoomId);
            setEventConfiguration({
                ...eventConfiguration,
                roomIds: [newRoomId],
                rooms: rooms || null,
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (eventConfiguration?.locationId) {
                    const roomsResult = await fetchRooms(
                        eventConfiguration.locationId,
                        setIsLoading,
                        setError
                    );

                    // Set rooms to state
                    if (roomsResult) {
                        setRooms(roomsResult);
                        return;
                    }
                }
                setRooms([]);
                setIsLoading(false);
                setError("No Location found");
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
                        minWidth: '200px',
                        maxWidth: '500px',
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
                            {eventConfiguration?.roomIds?.length && eventConfiguration.roomIds[0] === room.id
                                ? 'Ausgewählt'
                                : 'Venue Auswählen'}
                        </Button>
                    </Box>

                    {/* Right Column */}
                    <ImageGallery
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