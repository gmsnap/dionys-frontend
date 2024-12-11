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
    InputAdornment
} from '@mui/material';
import PartnerContentLayout from '@/layouts/PartnerContentLayout';
import { NextPageWithLayout } from '@/types/page';
import { createEmptyRoomModel, RoomModel } from '@/models/RoomModel';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import PartnerLayout from '@/layouts/PartnerLayout';
import { Save, X } from 'lucide-react';
import { fetchLocationWithRooms, handleDeleteRoom } from '@/services/roomService';
import ImageUploadForm from '@/features/partners/ImageUploadForm';
import DeleteButton from '@/components/DeleteButton';

// Validation schema
const roomValidationSchema = yup.object().shape({
    locationId: yup
        .number()
        .required('Location ist erforderlich')
        .positive('Wählen Sie eine gültige Location aus'),
    name: yup
        .string()
        .required('Bezeichnung ist erforderlich')
        .min(1, 'Bezeichnung muss mindestens 1 Zeichen lang sein'),
    description: yup
        .string(),
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
    images: yup.array().of(yup.string()),
});

const PartnerPage: NextPageWithLayout = () => {
    const router = useRouter();
    const { id } = router.query;
    const { partnerLocation } = useStore();

    const [roomId, setRoomId] = useState(0);
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

    const watchedModel = watch() as RoomModel;
    const [images, setImages] = useState<string[]>(watchedModel.images || []);

    const handleImageUpload = async (image: string) => {
        if (!roomId) {
            console.error("Room ID is not defined");
            return;
        }
        // Add the new image to the room model
        try {
            // Call API to get presigned URL and upload the file
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/images`,
                {
                    method: "POST",
                    body: JSON.stringify({ image }),
                    headers: { "Content-Type": "application/json" },
                });
            if (response.ok) {
                // Update local state with the new image
                setImages((prevImages) => [...prevImages, image]);
                setValue('images', [...images, image]); // Update form model
            }
            const { room } = await response.json();
        } catch (error) {
            console.error("Image upload failed", error);
        }
    };

    const handleImageDelete = async (image: string) => {
        if (!roomId) {
            console.error("Room ID is not defined");
            return;
        }

        try {
            // Call API to get presigned URL and upload the file
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}/images`,
                {
                    method: "DELETE",
                    body: JSON.stringify({ image }),
                    headers: { "Content-Type": "application/json" },
                });
            if (response.ok) {
                // Update local state to remove the deleted image
                setImages((prevImages) => prevImages.filter((img) => img !== image));
                setValue('images', images.filter((img) => img !== image)); // Update form model
            }
        } catch (error) {
            console.error("Image delete failed", error);
        }
    };

    useEffect(() => {
        if (watchedModel.images) {
            setImages(watchedModel.images);
        }
    }, [watchedModel]);

    useEffect(() => {
        if (id === undefined || !partnerLocation?.id) {
            return;
        }

        const roomId = Number(id);
        if (isNaN(roomId)) {
            setError('Invalid room ID');
            return;
        }

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
            // Set locationId in the form
            setValue("locationId", partnerLocation.id);
            console.log("locationId " + partnerLocation.id);
            setLoading(false);
        }

        setRoomId(roomId);
    }, [id, partnerLocation, setValue]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        try {
            const isEdit = roomId && roomId > 0;
            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/rooms/${roomId}`
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

            if (!isEdit && responseData?.room?.id) {
                setRoomId(responseData.room.id);
                //router.push(`/partner/rooms/${responseData.id}`, undefined, { shallow: true });
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
        <Box sx={{ height: "100vh", }}>
            <Typography variant="h5"
                sx={{ mb: 2, color: 'primary.main' }}>
                Allgemein
            </Typography>
            <Box sx={{
                textAlign: "left",
                maxWidth: "800px",
                height: "100%",
            }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container spacing={2}>

                        {/* Title */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="top">
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

                        {/* Title */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: 4 }}>
                                    <Typography variant="label">Beschreibung</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 8 }}>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.description}
                                                helperText={errors.description?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Size */}
                        <Grid2 size={{ xs: labelWidth }}>
                            <Grid2 container alignItems="top">
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
                            <Grid2 container alignItems="top">
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
                            container
                            size={{ xs: labelWidth }}
                            spacing={0}
                            alignItems="top">
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
                            size={{ xs: labelWidth }}
                            display={'flex'}
                            gap={2}
                            sx={{ mt: 2 }}
                        >
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
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
                                <DeleteButton
                                    isDisabled={isSubmitting}
                                    onDelete={() => handleDeleteRoom(roomId,
                                        () => router.push('/partner/rooms'))}
                                />
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
                                <Typography variant="body2" color="success">
                                    {responseMessage}
                                </Typography>
                            </Grid2>
                        )}
                    </Grid2>
                </form>
                {roomId > 0 &&
                    <>
                        <Typography variant="h5"
                            sx={{ mt: 5, mb: 2, color: 'primary.main' }}>
                            Bilder
                        </Typography>
                        <ImageUploadForm
                            onImageUpload={handleImageUpload}
                            onImageDelete={handleImageDelete}
                            model={watchedModel} />
                    </>}
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
