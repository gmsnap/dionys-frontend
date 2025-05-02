import { useForm, Controller } from 'react-hook-form';
import { useState, useEffect } from 'react';
import {
    Grid2,
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    SxProps,
    Theme
} from '@mui/material';
import { createEmptyRoomModel, RoomModel } from '@/models/RoomModel';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Save } from 'lucide-react';
import { roomsBaseUrl, handleDeleteRoom } from '@/services/roomService';
import ImageUploadForm from '@/features/partners/ImageUploadForm';
import DeleteButton from '@/components/DeleteButton';
import EventCategoriesField from '@/features/partners/EventCategoriesField';
import { useAuthContext } from '@/auth/AuthContext';
import { fetchLocationsByCompanyId } from '@/services/locationService';
import PriceInput from '@/components/PriceInput';
import PriceTypeField from './PriceTypeField';
import RichTextField from '@/components/RichTextField';

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
        .typeError('Preis muss eine Zahl sein')
        .min(0, 'Preis darf nicht negativ sein')
        .nullable()
        .transform(value => (value === null || value === '') ? undefined : value)
        .required('Preis ist erforderlich'),
    priceType: yup
        .string()
        .required('Preis-Typ ist erforderlich')
        .min(1, 'Preis-Typ muss ein gültiger Wert sein'),
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
    eventCategories: yup
        .array()
        .nullable()
        .of(yup.string())
        .test(
            'eventCategories-not-empty',
            'Mindestens eine Kategorie notwendig',
            (value) => value != null && value.length > 0
        ),
    services: yup
        .string()
        .nullable(),
});

const controlWidth = 7;
const labelWidth = 4;
interface RoomFormProps {
    roomId: number;
    locationId: number | null;
    companyId: number;
    submitButtonCaption?: string;
    roomCreated?: (id: number) => void;
    roomUpdated?: (id: number) => void;
    roomDeleted?: (id: number) => void;
    imagesChanged?: (images: string[]) => void;
    sx?: SxProps<Theme>;
}

const RoomForm = ({
    roomId,
    locationId,
    companyId,
    submitButtonCaption,
    roomCreated,
    roomUpdated,
    roomDeleted,
    imagesChanged,
    sx
}: RoomFormProps) => {
    const { authUser } = useAuthContext();

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
        defaultValues: createEmptyRoomModel(0),
        resolver: yupResolver(roomValidationSchema),
    });

    const watchedModel = watch() as RoomModel;
    const [images, setImages] = useState<string[]>(watchedModel.images || []);

    const [locations, setLocations] = useState<{ id: number; title: string }[]>([]);

    const handleImageUpload = async (image: string) => {
        if (!roomId) {
            console.error("Room ID is not defined");
            return;
        }
        // Add the new image to the room model
        try {
            // Call API to get presigned URL and upload the file
            const response = await fetch(
                `${roomsBaseUrl}/${roomId}/images`,
                {
                    method: "POST",
                    body: JSON.stringify({ image }),
                    headers: {
                        Authorization: `Bearer ${authUser?.idToken}`,
                        "Content-Type": "application/json"
                    },
                });
            if (response.ok) {
                // Update local state with the new image
                setImages((prevImages) => [...prevImages, image]);
                setValue('images', [...images, image]); // Update form model
                roomUpdated?.(roomId);
            }
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
                `${roomsBaseUrl}/${roomId}/images`,
                {
                    method: "DELETE",
                    body: JSON.stringify({ image }),
                    headers: {
                        Authorization: `Bearer ${authUser?.idToken}`,
                        "Content-Type": "application/json"
                    },
                });
            if (response.ok) {
                // Update local state to remove the deleted image
                setImages((prevImages) => prevImages.filter((img) => img !== image));
                setValue('images', images.filter((img) => img !== image)); // Update form model
                roomUpdated?.(roomId);
            }
        } catch (error) {
            console.error("Image delete failed", error);
        }
    };

    useEffect(() => {
        // Fetch all locations
        const loadLocations = async () => {
            try {
                const locationsData = await fetchLocationsByCompanyId(
                    companyId,
                    setLoading,
                    setError);
                setLocations(locationsData);
            } catch (error) {
                console.error('Error fetching locations', error);
            }
        };

        loadLocations();
    }, []);

    useEffect(() => {
        if (watchedModel.images) {
            setImages(watchedModel.images);
        }
    }, [watchedModel]);

    useEffect(() => {
        setResponseMessage("");

        if (!authUser) {
            setError('Keine Berechtigung. Bitte melden Sie sich an.');
            return;
        }

        if (roomId === null) {
            setError('Ungültige Raum-ID');
            return;
        }

        const fetchRoomData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${roomsBaseUrl}/${roomId}`, {
                    headers: {
                        Authorization: `Bearer ${authUser.idToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`Failed to fetch room with id ${roomId}`);
                }
                const roomData = await response.json();
                console.log(roomData)
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
            if (locationId && locationId > 0) {
                // Set locationId in the form
                setValue("locationId", locationId);
            } else {
                //setError('Ungültige Location-ID');
            }

            setLoading(false);
        }
    }, [roomId]);

    useEffect(() => {
        imagesChanged?.(images);
    }, [images]);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);
        setResponseMessage("");

        try {
            const isEdit = roomId && roomId > 0;
            const url = isEdit
                ? `${roomsBaseUrl}/${roomId}`
                : `${roomsBaseUrl}`;

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${authUser?.idToken}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                setError("Fehler beim Speichern des Raums.");
                return;
            }

            if (isEdit) {
                setSuccess(true);
                setResponseMessage("Raum gespeichert!");
                roomUpdated?.(roomId);
                return;
            }

            const responseData = await response.json();
            const newId = responseData?.room?.id;
            if (newId) {
                setSuccess(true);
                setResponseMessage("Raum gespeichert!");
                roomCreated?.(newId);
                return;
            }

            setSuccess(false);
            setError("Fehler beim Speichern des Raums.");
        } catch (error) {
            setError("Fehler beim Speichern des Raums.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box sx={{ height: "100vh", ...sx }}>
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
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}>

                        {/* Title */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Bezeichnung</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
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

                        {/* Description */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Beschreibung</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <Controller
                                        name="description"
                                        control={control}
                                        render={({ field }) => (
                                            <RichTextField
                                                name="description"
                                                control={control}
                                                error={errors.description?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Services */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography
                                        variant="label"
                                        sx={{
                                            display: 'inline',
                                            lineHeight: 1.2,
                                            mb: 0,
                                            mt: 0,
                                        }}
                                    >
                                        Inklusivleistungen (optional)
                                    </Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <Controller
                                        name="services"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                multiline={true}
                                                minRows={3}
                                                sx={{
                                                    pt: 0,
                                                    mt: 0,
                                                    '& .MuiOutlinedInput-root': {
                                                        alignItems: 'flex-start',
                                                        paddingTop: 0,
                                                        paddingBottom: 0,
                                                    },
                                                    '& .MuiOutlinedInput-inputMultiline': {
                                                        paddingTop: '4px',
                                                        paddingBottom: '4px',
                                                        lineHeight: 1.4,
                                                    },
                                                }}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Size */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Quadratmeter</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
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
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Preis</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <PriceInput
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Price Type */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Preisbezug</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <PriceTypeField
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        <Grid2 container size={{ xs: 12, sm: 10 }} spacing={0} alignItems="top">
                            {/* Label */}
                            <Grid2 size={{ xs: 12, md: labelWidth }}>
                                <Typography variant="label">Personenanzahl</Typography>
                            </Grid2>

                            {/* Min Persons */}
                            <Grid2 size={{ xs: 6, sm: 5, md: 3 }} sx={{ ml: 0 }}>
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
                            <Grid2 size={{ xs: 6, sm: 5, md: 3 }} sx={{ ml: 0 }}>
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

                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Location</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <Controller
                                        name="locationId"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.locationId}>
                                                <Select
                                                    {...field}
                                                    labelId="location-select-label"
                                                    id="location-select"
                                                    label="Wählen Sie eine Location"
                                                    value={field.value || ''}
                                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                                >
                                                    {locations.map((loc) => (
                                                        <MenuItem key={loc.id} value={loc.id}>
                                                            {loc.title}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                <Typography variant="caption" color="error">
                                                    {errors.locationId?.message}
                                                </Typography>
                                            </FormControl>
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Categories */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Kategorien</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <EventCategoriesField
                                        control={control}
                                        errors={errors}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Submit */}
                        <Grid2
                            size={{ xs: controlWidth }}
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
                                {submitButtonCaption || "Speichern"}
                                <Box component="span" sx={{ ml: 1 }}>
                                    <Save className="icon" width={16} height={16} />
                                </Box>
                            </Button>

                            {roomId > 0 &&
                                <DeleteButton
                                    isDisabled={isSubmitting}
                                    onDelete={() => authUser?.idToken
                                        ? handleDeleteRoom(
                                            authUser.idToken,
                                            roomId,
                                            () => roomDeleted?.(roomId)
                                        )
                                        : {}
                                    }
                                />
                            }
                        </Grid2>

                        {/* Messages */}
                        {error && (
                            <Grid2 size={{ xs: controlWidth }}>
                                <Typography color="error">{error}</Typography>
                            </Grid2>
                        )}
                        {success && (
                            <Grid2 size={{ xs: controlWidth }}>
                                <Typography variant="body2" color="success">
                                    {responseMessage}
                                </Typography>
                            </Grid2>
                        )}
                    </Box>
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

export default RoomForm;
