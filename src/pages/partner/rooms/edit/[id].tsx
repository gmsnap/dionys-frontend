import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Button, Grid2, InputAdornment, TextField, Typography } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import RoomGrid from '@/features/partners/RoomGrid';
import { useRouter } from 'next/router';

const PartnerPage: NextPageWithLayout = () => {
    const router = useRouter();
    const { id } = router.query; // Access the `id` from the URL

    const [room, setRoom] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoom({
            ...room,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {

    };

    // Fetch room data
    useEffect(() => {
        if (id) {
            const fetchRoomData = async () => {
                try {
                    setLoading(true);
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch room with id ${id}`);
                    }
                    const roomData = await response.json();
                    setRoom(roomData);
                } catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError('An unknown error occurred');
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchRoomData();
        }
    }, [id]);

    // Loading state or error handling
    if (loading) {
        return <Box>Loading...</Box>;
    }

    if (error) {
        return <Box>Error: {error}</Box>;
    }

    const roomTitle = room ? `Räume: ${room.name}` : 'Räume';

    return (
        <PartnerContentLayout title={roomTitle}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Allgemein
            </Typography>
            <Box sx={{
                textAlign: "left",
                maxWidth: "600px",
            }}>
                <form onSubmit={handleSubmit}>
                    <Grid2 container spacing={2}>
                        {/* Title */}
                        <Grid2 size={{ xs: 12 }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography>Bezeichnung</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <TextField
                                        name="name"
                                        value={room?.name}
                                        onChange={handleChange}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Size */}
                        <Grid2 size={{ xs: 12 }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography>Quadratmeter</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <TextField
                                        name="size"
                                        value={room?.size}
                                        onChange={handleChange}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Price */}
                        <Grid2 size={{ xs: 12 }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography>Preis / Tag</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <TextField
                                        name="price"
                                        value={room?.price}
                                        onChange={handleChange}
                                        fullWidth
                                        variant="outlined"
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        <Grid2 container size={{ xs: 12 }} spacing={0}>
                            {/* Label */}
                            <Grid2 size={{ xs: 4 }}>
                                <Typography>Personenanzahl</Typography>
                            </Grid2>

                            {/* Min Persons */}
                            <Grid2 size={{ xs: 4 }}>
                                <TextField
                                    name="minPersons"
                                    value={room?.minPersons}
                                    onChange={handleChange}
                                    variant="outlined"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">Von:</InputAdornment>
                                            ),
                                        },
                                    }}
                                    fullWidth
                                    sx={{ ml: 0, pl: 0 }}
                                />
                            </Grid2>

                            {/* Max Persons */}
                            <Grid2 size={{ xs: 4 }} sx={{ ml: 0 }}>
                                <TextField
                                    name="maxPersons"
                                    value={room?.maxPersons}
                                    onChange={handleChange}
                                    variant="outlined"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">Bis:</InputAdornment>
                                            ),
                                        },
                                    }}
                                    fullWidth
                                />
                            </Grid2>
                        </Grid2>

                        {/* Submit */}
                        <Grid2 size={{ xs: 12 }} sx={{ mt: 2 }}>
                            <Button variant="contained" color="primary" type="submit">
                                Speichern
                            </Button>
                        </Grid2>

                        {/* Messages */}
                        {error && (
                            <Grid2 size={{ xs: 12 }}>
                                <Typography color="error">{error}</Typography>
                            </Grid2>
                        )}
                        {success && (
                            <Grid2 size={{ xs: 12 }}>
                                <Typography color="success">Profil gespeichert!</Typography>
                            </Grid2>
                        )}
                    </Grid2>
                </form>
            </Box>
        </PartnerContentLayout>
    );
};

// Use ClientLayout as the layout for this page
PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return (
        <PartnerLayout>{page}</PartnerLayout>
    );
};

export default PartnerPage;