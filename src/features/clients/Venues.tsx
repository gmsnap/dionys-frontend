import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, Typography, Button } from '@mui/material';
import { title } from 'process';
import useStore from '@/stores/eventStore';

interface VenueProps {
    sx?: SxProps<Theme>;
}

const Venues = ({ sx }: VenueProps) => {
    const [venues, setVenues] = useState<VenueModel[]>([]);
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

                if (response.status === 404) {
                    setIsLoading(false);
                    setVenues([]);
                    return;
                }

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

    if (!venues || venues.length === 0) {
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
            {venues?.map((venue) => (
                <Box
                    key={venue.id}
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
                    <Box sx={{
                        flexBasis: '500px',
                        mr: 5,
                    }}>
                        {/* Large Image (upper row) */}
                        <Box
                            component="img"
                            sx={{
                                width: '100%', // Match parent width
                                maxHeight: '250px', // Limit height
                                objectFit: 'fill',
                                borderRadius: '16px',
                            }}
                            src={venue.images[0]}
                            alt={title}
                        />
                        {/* Small Images (lower row) */}
                        <Box
                            display="flex"
                            flexDirection="row"
                            sx={{
                                marginTop: '8px', // Add some spacing between rows
                                justifyContent: 'space-between', // Evenly distribute small images
                                gap: '8px', // Add spacing between small images
                            }}
                        >
                            <Box
                                component="img"
                                sx={{
                                    flexGrow: 1, // Allow image to grow evenly
                                    flexBasis: 0, // Equal width for all children
                                    objectFit: 'fill',
                                    borderRadius: '8px',
                                    height: '100px', // Fixed height for small images
                                }}
                                src={venue.images[0]}
                                alt={title}
                            />
                            <Box
                                component="img"
                                sx={{
                                    flexGrow: 1,
                                    flexBasis: 0,
                                    objectFit: 'fill',
                                    borderRadius: '8px',
                                    height: '100px',
                                }}
                                src={venue.images[0]}
                                alt={title}
                            />
                        </Box>
                    </Box>

                </Box>
            ))}
        </Box>
    );
};

export default Venues;