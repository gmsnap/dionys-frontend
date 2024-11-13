import React, { useEffect, useState } from 'react';
import { Box, SxProps, Theme, useTheme, CircularProgress, Typography, Button } from '@mui/material';
import { title } from 'process';

interface VenueProps {
    locationId: number;
    sx?: SxProps<Theme>;
}

const Venues = ({ locationId, sx }: VenueProps) => {
    const theme = useTheme();
    const [venues, setVenues] = useState<VenueModel[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/venues/location/${locationId}`);
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
            {venues?.map((venue) => (
                <Box
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
                        <Button variant="contained" color="primary" sx={{ flex: 1 }}>
                            Venue auswählen
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