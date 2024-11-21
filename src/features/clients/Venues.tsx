import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, useTheme, Typography, Button } from '@mui/material';
import { title } from 'process';
import useStore from '@/stores/eventStore';

interface VenueProps {
    sx?: SxProps<Theme>;
}

const Venues = ({ sx }: VenueProps) => {
    const theme = useTheme();
    const [venues, setVenues] = useState<VenueModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { eventConfiguration, setEventConfiguration } = useStore();

    const fetchRooms = async (newVenueId: number): Promise<RoomModel[]> => {
        try {
            if (eventConfiguration) {
                setIsLoading(true);

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/${newVenueId}/rooms`);

                if (response.status === 404) {
                    setIsLoading(false);
                    return [];
                }

                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }

                const rooms: RoomModel[] = await response.json();

                setIsLoading(false);

                return rooms;
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
            setIsLoading(false);
        }
        return [];
    };

    // Function to handle updating the venueId
    const handleVenueChange = async (newVenueId: number) => {
        if (eventConfiguration) {
            const venue = venues?.find((venue) => venue.id === newVenueId);
            const rooms = newVenueId && await fetchRooms(newVenueId);
            setEventConfiguration({
                ...eventConfiguration,
                venueId: newVenueId,
                venue: venue || null,
                rooms: rooms || null,
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response =
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/location/${eventConfiguration?.locationId}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const result = await response.json();
                setVenues(result);
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

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h3" sx={{ mb: 4 }}>VENUE</Typography>
            {isLoading && <Typography>Loading...</Typography>}
            {error && <Typography>Error fetching data...</Typography>}
            {venues?.map((venue) => (
                <Box
                    key={venue.id}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: 5,
                        mb: 10,
                    }}
                >
                    {/* Left Column */}
                    <Box flexBasis="50%" sx={{
                        flexGrow: 1,
                        [theme.breakpoints.up('md')]: { flexGrow: 2 }
                    }}>
                        <Typography
                            variant="h5"
                            sx={{ mb: 4 }}>
                            {venue.title}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ mb: 4 }}>
                            {venue.description}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ flex: 1 }}
                            onClick={() => handleVenueChange(venue.id)}>
                            {eventConfiguration?.venueId === venue.id ? 'Ausgewählt' : 'Venue Auswählen'}
                        </Button>
                    </Box>
                    {/* Right Column */}
                    <Box flexBasis="50%" sx={{ [theme.breakpoints.up('md')]: { flexBasis: '450px' } }}>
                        <Box
                            component="img"
                            sx={{
                                width: '100%',
                                maxHeight: '250px',
                                objectFit: 'cover',
                                borderRadius: '16px',
                                margin: 0,
                                padding: 0,
                            }}
                            src={venue.images[0]}
                            alt={title}
                        />
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default Venues;