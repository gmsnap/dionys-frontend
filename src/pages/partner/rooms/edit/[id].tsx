import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect, ReactElement } from 'react';
import useStore from '@/stores/partnerStore';
import {
    Grid2,
    Box,
    Typography,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputAdornment
} from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import { NextPageWithLayout } from '@/types/page';
import { createEmptyRoomModel, RoomModel } from '@/models/RoomModel';
import { fetchVenuesByLocationId } from '@/services/venueService';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import PartnerLayout from '@/layouts/PartnerLayout';
import { VenueModel } from '@/models/VenueModel';
import { Save, X } from 'lucide-react';
import { handleDeleteRoom } from '@/services/roomService';

// Define the validation schema
const roomValidationSchema = yup.object().shape({
    venueId: yup
        .number()
        .required('Venue ist erforderlich')
        .positive('Wählen Sie einen gültigen Veranstaltungsort aus'),
    name: yup
        .string()
        .required('Bezeichnung ist erforderlich')
        .min(1, 'Bezeichnung muss mindestens 1 Zeichen lang sein'),
    size: yup
        .number()
        .typeError('Quadratmeter muss eine Zahl sein')
        .positive('Quadratmeter müssen positiv sein')
        .required('Quadratmeter sind erforderlich'),
    price: yup
        .number()
        .typeError('Preis / Tag muss eine Zahl sein')
        .positive('Preis / Tag muss positiv sein')
        .required('Preis / Tag ist erforderlich'),
    minPersons: yup
        .number()
        .typeError('Mindestpersonenanzahl muss eine Zahl sein')
        .positive('Mindestpersonenanzahl muss positiv sein')
        .max(yup.ref('maxPersons'), 'Mindestpersonenanzahl muss kleiner als Maximalpersonenanzahl sein')
        .required('Mindestpersonenanzahl ist erforderlich'),
    maxPersons: yup
        .number()
        .typeError('Maximalpersonenanzahl muss eine Zahl sein')
        .positive('Maximalpersonenanzahl muss positiv sein')
        .min(yup.ref('minPersons'), 'Maximalpersonenanzahl muss größer als Mindestpersonenanzahl sein')
        .required('Maximalpersonenanzahl ist erforderlich'),
});

const PartnerPage: NextPageWithLayout = () => {
    const router = useRouter();
    const { id } = router.query;
    const { partnerLocation } = useStore();

    const [roomId, setRoomId] = useState(0);
    const [venues, setVenues] = useState<VenueModel[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: createEmptyRoomModel(1),
        resolver: yupResolver(roomValidationSchema),
    });

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
                reset(roomData);
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
            setLoading(false);
        }

        setRoomId(roomId);
    }, [id, partnerLocation, setValue]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const isEdit = id && Number(id) > 0;
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/rooms/${id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/rooms`;

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Failed to submit room");
            }

            setSuccess(true);
            setResponseMessage(isEdit ? "Raum geupdated!" : "Raum gespeichert!");
        } catch (error) {
            setError("Fehler beim Speichern des Raums.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const roomTitle = watch('name') ?
        `Räume: ${watch('name')}` :
        'Räume: Raum hinzufügen';

    const labelWidth = 10;

    return (
        <Box>
            <Typography variant="h5" sx={{ mb: 2, color: 'primary.main' }}>
                Allgemein
            </Typography>
            <Box sx={{
                textAlign: "left",
                maxWidth: "600px",
            }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container spacing={2}>

                        {/* Venue */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography variant="label">Venue</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <Controller
                                        name="venueId"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth variant="outlined">
                                                <Select
                                                    {...field}
                                                    displayEmpty
                                                >
                                                    <MenuItem value="" disabled>
                                                        Select a Venue
                                                    </MenuItem>
                                                    {venues.map((venue) => (
                                                        <MenuItem key={venue.id} value={venue.id}>
                                                            {venue.title}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Title */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography variant="label">Bezeichnung</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <Controller
                                        name="name"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.name}
                                                helperText={errors.name?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Size */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography variant="label">Quadratmeter</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <Controller
                                        name="size"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.size}
                                                helperText={errors.size?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Price */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="center">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography variant="label">Preis / Tag</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <Controller
                                        name="price"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.price}
                                                helperText={errors.price?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        <Grid2
                            container size={{ xs: labelWidth }}
                            spacing={0}
                            alignItems="center">
                            {/* Label */}
                            <Grid2 size={{ xs: 4 }}>
                                <Typography variant="label">Personenanzahl</Typography>
                            </Grid2>

                            {/* Min Persons */}
                            <Grid2 size={{ xs: 4 }}>
                                <Controller
                                    name="minPersons"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            variant="outlined"
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">Von:</InputAdornment>
                                                    ),
                                                },
                                            }}
                                            error={!!errors.minPersons}
                                            helperText={errors.minPersons?.message}
                                            sx={{ mr: 1 }}
                                        />
                                    )}
                                />
                            </Grid2>

                            {/* Max Persons */}
                            <Grid2 size={{ xs: 4 }} sx={{ ml: 0 }}>
                                <Controller
                                    name="maxPersons"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            variant="outlined"
                                            slotProps={{
                                                input: {
                                                    startAdornment: (
                                                        <InputAdornment position="start">Bis:</InputAdornment>
                                                    ),
                                                },
                                            }}
                                            error={!!errors.maxPersons}
                                            helperText={errors.maxPersons?.message}
                                            sx={{ ml: 1 }}
                                        />
                                    )}
                                />
                            </Grid2>
                        </Grid2>

                        {/* Submit */}
                        <Grid2
                            display={'flex'}
                            gap={2}
                            sx={{ mt: 2 }}
                        >
                            <Button variant="contained" color="primary" type="submit" disabled={isSubmitting}
                                sx={{
                                    lineHeight: 0,
                                    outline: '3px solid transparent',
                                    mb: 1,
                                    '&:hover': {
                                        outline: '3px solid #00000033',
                                    },
                                    '.icon': {
                                        color: '#ffffff',
                                    },
                                    '&:hover .icon': {
                                        color: '#ffffff',
                                    },
                                }}
                            >
                                {isSubmitting ? 'Speichern...' : 'Speichern'}
                                <Box component="span" sx={{ ml: 1 }}>
                                    <Save className="icon" width={16} height={16} />
                                </Box>
                            </Button>

                            {roomId > 0 &&
                                <Button variant="contained" disabled={isSubmitting}
                                    sx={{
                                        flex: 1,
                                        lineHeight: 0,
                                        outline: '3px solid transparent',
                                        backgroundColor: '#ff0000',
                                        mb: 1,
                                        '&:hover': {
                                            outline: '3px solid #FF000033',
                                        },
                                        '.icon': {
                                            color: '#ffffff',
                                        },
                                        '&:hover .icon': {
                                            color: '#ffffff',
                                        },
                                    }}
                                    onClick={() => handleDeleteRoom(roomId,
                                        () => router.push('/partner/rooms'))
                                    }
                                >
                                    Delete
                                    <Box component="span" sx={{ ml: 1 }}>
                                        <X className="icon" width={16} height={16} />
                                    </Box>
                                </Button>
                            }
                        </Grid2>

                        {/* Messages */}
                        {error && (
                            <Grid2 size={{ xs: labelWidth }}>
                                <Typography color="error">{error}</Typography>
                            </Grid2>
                        )}
                        {success && (
                            <Grid2 size={{ xs: labelWidth }}>
                                <Typography color="success">{responseMessage}</Typography>
                            </Grid2>
                        )}
                    </Grid2>
                </form>
            </Box>
        </Box >
    );
};

PartnerPage.getLayout = function getLayout(page: ReactElement) {
    return <PartnerLayout>
        <PartnerContentLayout title='Räume'>
            {page}
        </PartnerContentLayout>
    </PartnerLayout>;
};

export default PartnerPage;
