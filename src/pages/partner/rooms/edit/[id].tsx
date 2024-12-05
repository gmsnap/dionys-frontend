import { ReactElement, useEffect, useState } from 'react';
import PartnerLayout from '@/layouts/PartnerLayout';
import type { NextPageWithLayout } from '@/types/page';
import { Box, Button, Grid2, InputAdornment, TextField, Typography, MenuItem, Select, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import { useRouter } from 'next/router';
import { createEmptyRoomModel } from '@/models/RoomModel';
import { fetchVenuesByLocationId } from '@/services/venueService';
import useStore from '@/stores/partnerStore';

const PartnerPage: NextPageWithLayout = () => {
    const router = useRouter();
    const { id } = router.query;
    const { partnerLocation } = useStore();

    const [venues, setVenues] = useState<VenueModel[]>([]);
    const [room, setRoom] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [venueId, setVenueId] = useState<number | ''>('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRoom({
            ...room,
            [e.target.name]: e.target.value,
        });
    };

    const handleVenueChange = (e: SelectChangeEvent<number | ''>) => {
        const newValue = e.target.value;
        setVenueId(typeof newValue === 'number' ? newValue : '');
        setRoom({
            ...room,
            venueId: e.target.value, // Update room with selected venueId
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!room.name || !room.price || !room.maxPersons) {
            setError("Name, price, and max persons are required.");
            setSuccess(false);
            return;
        }

        try {
            const payload = {
                ...room,
            };

            const isEdit = room.id && room.id > 0;

            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/rooms/${room.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/rooms`;

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit room");
            }

            setResponseMessage(
                isEdit
                    ? "Raum geupdated!"
                    : "Raum gespeichert!"
            );
        } catch (error) {
            console.error(error);
            setResponseMessage("An error occurred while submitting the location.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch room data and venues
    useEffect(() => {
        if (id === undefined || !partnerLocation?.id) {
            return;
        }

        const roomId = Number(id);
        if (isNaN(roomId)) {
            setError('Invalid room ID');
            return;
        }

        const fetchVenues = async () => {
            try {
                const venuesData = await fetchVenuesByLocationId(partnerLocation.id, setLoading, setError);
                setVenues(venuesData);
            } catch (err) {
                setError('Error fetching venues');
            }
        };

        fetchVenues();

        const fetchRoomData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch room with id ${roomId}`);
                }
                const roomData = await response.json();
                setRoom(roomData);
                setVenueId(roomData.venueId); // Set the venueId of the room
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

        if (roomId > 0) {
            fetchRoomData();
        } else {
            setRoom(createEmptyRoomModel(1));
            setLoading(false);
        }
    }, [id, partnerLocation]);

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
                        {/* Venue */}
                        <Grid2 size={{ xs: 12 }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography>Venue</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Venue</InputLabel>
                                        <Select<number | ''>
                                            value={venueId}
                                            onChange={handleVenueChange}
                                            label="Venue"
                                        >
                                            {venues.map((venue) => (
                                                <MenuItem key={venue.id} value={venue.id}>
                                                    {venue.title}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid2>
                            </Grid2>
                        </Grid2>

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