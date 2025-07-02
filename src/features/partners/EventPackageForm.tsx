import { useForm, Controller } from "react-hook-form"
import { useState, useEffect } from "react"
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
    FormHelperText,
    type SxProps,
    type Theme,
    Checkbox,
    ListItemText,
    useMediaQuery,
    useTheme,
} from "@mui/material"
import { yupResolver } from "@hookform/resolvers/yup"
import { Save } from "lucide-react"
import ImageUploadForm from "@/features/partners/ImageUploadForm"
import DeleteButton from "@/components/DeleteButton"
import { useAuthContext } from "@/auth/AuthContext"
import { fetchLocationsByCompanyId } from "@/services/locationService"
import {
    createEmptyEventPackageModel,
    type EventPackageModel,
    EventPackageValidationSchema,
} from "@/models/EventPackageModel"
import { handleDeleteEventPackage, partnerPackagesBaseUrl } from "@/services/eventPackageService"
import PriceInput from "@/components/PriceInput"
import PriceTypeField from "./PriceTypeField"
import { AvailablePackageCategories, type PackageCategories } from "@/constants/PackageCategories"
import { formatPackageCategory } from "@/utils/formatPackageCategories"
import RichTextField from "@/components/RichTextField"
import { fetchRooms } from "@/services/roomService"
import PricingLabelField from "./PricingLabelField"
import EventCategoriesField2 from "./EventCategoriesField2"
import { RoomModel } from "@/models/RoomModel"
import { AvailablePricingLabelsBasic } from "@/utils/pricingManager"

const controlWidth = 7
const labelWidth = 4

interface FormProps {
    packageId: number
    locationId: number | null
    companyId: number
    submitButtonCaption?: string
    created?: (id: number) => void
    updated?: (id: number) => void
    deleted?: (id: number) => void
    packageCategory?: PackageCategories
    imagesChanged?: (images: string[]) => void
    sx?: SxProps<Theme>
}

const EventPackageForm = ({
    packageId,
    locationId,
    companyId,
    submitButtonCaption,
    created,
    updated,
    deleted,
    packageCategory,
    imagesChanged,
    sx,
}: FormProps) => {
    const theme = useTheme();
    const isSlimView = useMediaQuery(theme.breakpoints.down('sm'));

    const { authUser } = useAuthContext()

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [responseMessage, setResponseMessage] = useState("")

    const defaultValues = {
        ...createEmptyEventPackageModel(0, packageCategory ?? (AvailablePackageCategories[0] as PackageCategories)),
        ...(packageCategory !== undefined && { packageCategory: packageCategory }),
    }

    const {
        control,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues,
        resolver: yupResolver(EventPackageValidationSchema),
    })

    const watchedModel = watch() as EventPackageModel
    const [images, setImages] = useState<string[]>(watchedModel.images || [])

    const [locations, setLocations] = useState<{ id: number; title: string }[]>([])
    const [rooms, setRooms] = useState<{ id: number; name: string }[]>([])

    const handleImageUpload = async (image: string) => {
        if (!packageId) {
            console.error("Event Package ID is not defined")
            return
        }
        // Add the new image to the model
        try {
            // Call API to get presigned URL and upload the file
            const response = await fetch(`${partnerPackagesBaseUrl}/${packageId}/images`, {
                method: "POST",
                body: JSON.stringify({ image }),
                headers: {
                    Authorization: `Bearer ${authUser?.idToken}`,
                    "Content-Type": "application/json",
                },
            })
            if (response.ok) {
                // Update local state with the new image
                setImages((prevImages) => [...prevImages, image])
                setValue("images", [...images, image]) // Update form model
                updated?.(packageId)
            }
        } catch (error) {
            console.error("Image upload failed", error)
        }
    }

    const handleImageDelete = async (image: string) => {
        if (!packageId) {
            console.error("Event Package ID is not defined")
            return
        }

        try {
            // Call API to get presigned URL and upload the file
            const response = await fetch(`${partnerPackagesBaseUrl}/${packageId}/images`, {
                method: "DELETE",
                body: JSON.stringify({ image }),
                headers: {
                    Authorization: `Bearer ${authUser?.idToken}`,
                    "Content-Type": "application/json",
                },
            })
            if (response.ok) {
                // Update local state to remove the deleted image
                setImages((prevImages) => prevImages.filter((img) => img !== image))
                setValue(
                    "images",
                    images.filter((img) => img !== image),
                ) // Update form model
                updated?.(packageId)
            }
        } catch (error) {
            console.error("Image delete failed", error)
        }
    }

    useEffect(() => {
        // Fetch all locations
        const loadLocations = async () => {
            try {
                const locationsData = await fetchLocationsByCompanyId(companyId, setLoading, setError)
                setLocations(locationsData ?? [])
            } catch (error) {
                console.error("Error fetching locations", error)
            }
        }

        loadLocations()
    }, [])

    useEffect(() => {
        if (watchedModel.images) {
            setImages(watchedModel.images)
        }
    }, [watchedModel])

    useEffect(() => {
        setResponseMessage("")

        if (!authUser) {
            setError("Keine Berechtigung. Bitte melden Sie sich an.")
            return
        }

        if (packageId === null) {
            setError("Ungültige Paket-ID")
            return
        }

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                const response = await fetch(`${partnerPackagesBaseUrl}/${packageId}?include=rooms`, {
                    headers: {
                        Authorization: `Bearer ${authUser.idToken}`,
                    },
                })
                if (!response.ok) {
                    throw new Error(`Failed to fetch event package with id ${packageId}`)
                }
                const data = await response.json()
                reset(data)
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError("An unknown error occurred")
                }
            } finally {
                setLoading(false)
            }
        }

        if (packageId > 0) {
            fetchData()
        } else {
            if (locationId && locationId > 0) {
                // Set locationId in the form
                setValue("locationId", locationId)
            } else {
                //setError('Ungültige Location-ID');
            }

            setLoading(false)
        }
    }, [packageId])

    useEffect(() => {
        // Clear minPersons and maxPersons when packageId changes
        setValue("minPersons", null)
        setValue("maxPersons", null)
    }, [setValue])

    useEffect(() => {
        // Clear minPersons and maxPersons when packageId changes
        if (packageId === 0 || packageId === null) {
            setValue("minPersons", null)
            setValue("maxPersons", null)
        }
    }, [packageId, setValue])

    useEffect(() => {
        const loadLocationsAndRooms = async () => {
            try {
                setLoading(true)
                const locationsData = await fetchLocationsByCompanyId(companyId, setLoading, setError)
                setLocations(locationsData ?? [])

                // Fetch rooms if locationId is provided
                if (locationId) {
                    const roomsData = await fetchRooms(locationId, setLoading, setError)
                    setRooms(roomsData || [])
                }
            } catch (error) {
                console.error("Error fetching data", error)
            } finally {
                setLoading(false)
            }
        }

        loadLocationsAndRooms()
    }, [companyId, locationId])

    useEffect(() => {
        const loadRooms = async () => {
            if (watchedModel.locationId) {
                try {
                    setLoading(true);
                    const roomsData = await fetchRooms(watchedModel.locationId, setLoading, setError);
                    setRooms(roomsData || []);

                    // Pre-select all rooms for new package (packageId === 0)
                    if (packageId === 0 && roomsData?.length > 0) {
                        const allRoomIds = roomsData.map((room: RoomModel) => room.id);
                        setValue("roomIds", allRoomIds);
                    }
                } catch (error) {
                    console.error("Error fetching rooms", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadRooms();
    }, [watchedModel.locationId, packageId, setValue]);

    useEffect(() => {
        imagesChanged?.(images)
    }, [images])

    const onSubmit = async (data: any) => {
        setIsSubmitting(true)
        setError(null)
        setSuccess(false)
        setResponseMessage("")

        try {
            const isEdit = packageId && packageId > 0
            const url = isEdit ? `${partnerPackagesBaseUrl}/${packageId}` : `${partnerPackagesBaseUrl}`

            const method = isEdit ? "PUT" : "POST"

            // Ensure we're sending roomIds instead of rooms
            const submitData = { ...data }

            // Remove rooms property if it exists and ensure roomIds is present
            if (submitData.rooms) {
                delete submitData.rooms
            }

            // Make sure roomIds is an array
            if (!submitData.roomIds) {
                submitData.roomIds = []
            }

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${authUser?.idToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitData),
            })

            if (!response.ok) {
                setError("Fehler beim Speichern des Paketes.")
                return
            }

            if (isEdit) {
                setSuccess(true)
                setResponseMessage("Paket gespeichert!")
                updated?.(packageId)
                return
            }

            const responseData = await response.json()
            const newId = responseData?.model?.id
            if (newId) {
                setSuccess(true)
                setResponseMessage("Paket gespeichert!")
                created?.(newId)
                return
            }

            setSuccess(false)
            setError("Fehler beim Speichern des Paketes.")
        } catch (error) {
            setError("Fehler beim Speichern des Paketes.")
        } finally {
            setIsSubmitting(false)
        }
    }

    const priceTypeValue = watch("priceType")
    const isPriceInputDisabled = priceTypeValue === "none"

    return (
        <Box sx={{ ...sx }}>
            <Typography variant="h5" sx={{ mb: 2, color: "primary.main" }}>
                Allgemein
            </Typography>
            <Box
                sx={{
                    textAlign: "left",
                    maxWidth: "800px",
                }}
            >
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                        }}
                    >
                        {/* Title */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: 12, sm: labelWidth }}>
                                <Typography variant="label">Bezeichnung</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            variant="outlined"
                                            error={!!errors.title}
                                            helperText={errors.title?.message}
                                        />
                                    )}
                                />
                            </Grid2>
                        </Grid2>

                        {/* Description */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: labelWidth }}>
                                <Typography variant="label">Beschreibung</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                <Controller
                                    name="description"
                                    control={control}
                                    render={({ field }) => (
                                        <RichTextField name="description" control={control} error={errors.description?.message} />
                                    )}
                                />
                            </Grid2>
                        </Grid2>

                        {/* Package Category */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: 12, sm: labelWidth }}>
                                <Typography variant="label">Paket-Kategorie</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                <Controller
                                    name="packageCategory"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth variant="outlined" error={!!errors.packageCategory}>
                                            <Select {...field} label="Paket-Kategorie" onChange={(e) => field.onChange(e.target.value)}>
                                                {AvailablePackageCategories.map((value) => (
                                                    <MenuItem key={value} value={value}>
                                                        {formatPackageCategory(value as PackageCategories)}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>{errors.packageCategory?.message}</FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Grid2>
                        </Grid2>

                        {/* Price */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: labelWidth }}>
                                <Typography variant="label">Preis</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                {isPriceInputDisabled ? (
                                    <TextField value={"-"} disabled={true} sx={{ width: "100%" }} />
                                ) : (
                                    <PriceInput control={control} errors={errors} />
                                )}
                            </Grid2>
                        </Grid2>

                        {/* Price Type */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: 12, sm: labelWidth }}>
                                <Typography variant="label">Preisbezug</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                <PriceTypeField control={control} errors={errors} />
                            </Grid2>
                        </Grid2>

                        {/* Price Label */}
                        <Grid2 size={{ sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: labelWidth }}>
                                    <Typography variant="label">Preis-Label</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                    <PricingLabelField
                                        control={control}
                                        errors={errors}
                                        labels={AvailablePricingLabelsBasic}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Persons */}
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
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? null : Number(e.target.value)
                                                field.onChange(value)
                                            }}
                                            variant="outlined"
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">Von:</InputAdornment>,
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
                                            value={field.value ?? ""}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? null : Number(e.target.value)
                                                field.onChange(value)
                                            }}
                                            variant="outlined"
                                            slotProps={{
                                                input: {
                                                    startAdornment: <InputAdornment position="start">Bis:</InputAdornment>,
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

                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: 12, sm: labelWidth }}>
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
                                                value={field.value || ""}
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

                        {/* Categories */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: 12, sm: labelWidth }}>
                                <Typography variant="label">Kategorien</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                <EventCategoriesField2 control={control} errors={errors} />
                            </Grid2>
                        </Grid2>

                        {/* Rooms */}
                        <Grid2 container alignItems="top" rowSpacing={0} sx={{ width: "100%" }}>
                            <Grid2 size={{ xs: 12, sm: labelWidth }}>
                                <Typography variant="label">Räume</Typography>
                            </Grid2>
                            <Grid2 size={{ xs: 12, sm: 10, md: 6 }}>
                                <Controller
                                    name="roomIds"
                                    control={control}
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.roomIds}>
                                            <Select
                                                multiple
                                                displayEmpty
                                                value={field.value || []}
                                                onChange={(e) => field.onChange(e.target.value)}
                                                renderValue={(selected) => {
                                                    if (!selected || selected.length === 0) {
                                                        return <em>Alle Räume</em>
                                                    }

                                                    const charLimit = isSlimView ? 30 : 50;

                                                    const selectedNames = selected
                                                        .map((id) => rooms.find((room) => room.id === id)?.name)
                                                        .filter(Boolean)
                                                        .join(", ");

                                                    return (
                                                        <Box
                                                            sx={{
                                                                display: "block",
                                                                maxWidth: "100%",
                                                                overflow: "hidden",
                                                                textOverflow: "clip",
                                                                whiteSpace: "nowrap",
                                                            }}
                                                            title={selectedNames} // full string on hover
                                                        >
                                                            {selectedNames.length > charLimit
                                                                ? selectedNames.substring(0, charLimit - 3) + "..."
                                                                : selectedNames}
                                                        </Box>
                                                    );
                                                }}
                                            >
                                                {rooms.map((room) => (
                                                    <MenuItem key={room.id} value={room.id}>
                                                        <Checkbox color="secondary" checked={field.value?.includes(room.id) || false} />
                                                        <ListItemText primary={room.name} />
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>{errors.roomIds?.message}</FormHelperText>
                                        </FormControl>
                                    )}
                                />
                            </Grid2>
                        </Grid2>

                        {/* Submit */}
                        <Grid2 size={{ xs: controlWidth }} display={"flex"} gap={2} sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isSubmitting}
                                sx={{
                                    lineHeight: 0,
                                    outline: "3px solid transparent",
                                    mb: 1,
                                    "&:hover": {
                                        outline: "3px solid #00000033",
                                    },
                                    ".icon": {
                                        color: "#ffffff",
                                    },
                                    "&:hover .icon": {
                                        color: "#ffffff",
                                    },
                                }}
                            >
                                {submitButtonCaption || "Speichern"}
                                <Box component="span" sx={{ ml: 1 }}>
                                    <Save className="icon" width={16} height={16} />
                                </Box>
                            </Button>

                            {packageId > 0 && (
                                <DeleteButton
                                    isDisabled={isSubmitting}
                                    onDelete={() =>
                                        handleDeleteEventPackage(authUser?.idToken ?? "", packageId, () => deleted?.(packageId))
                                    }
                                />
                            )}
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
                {packageId > 0 && (
                    <>
                        <Typography variant="h5" sx={{ mt: 5, mb: 2, color: "primary.main" }}>
                            Bilder
                        </Typography>
                        <ImageUploadForm onImageUpload={handleImageUpload} onImageDelete={handleImageDelete} model={watchedModel} />
                    </>
                )}
            </Box>
        </Box>
    )
}

export default EventPackageForm
