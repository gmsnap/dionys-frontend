"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
    Grid2,
    FormControl,
    Select,
    FormHelperText,
    Tooltip,
    IconButton,
} from "@mui/material";
import { ClipboardCheck, Save } from "lucide-react";
import { CreateLocationResponse } from "@/types/geolocation";
import { EventCategories } from "@/constants/EventCategories";
import useStore from '@/stores/partnerStore';
import { createEmptyLocationModel } from "@/models/LocationModel";
import City, { AvailableCities } from "@/models/City";
import ImageUploadField from "./ImageUploadField";
import { locationsBaseUrl } from "@/services/locationService";
import { formatEventCategoriesSync } from "@/utils/formatEventCategories";
import ImmutableItemList from "./ImmutableItemList";
import { Clipboard } from 'lucide-react';

// Validation schema
const locationValidationSchema = yup.object().shape({
    title: yup
        .string()
        .required('Bezeichnung ist erforderlich')
        .min(1, 'Bezeichnung muss mindestens 1 Zeichen lang sein'),
    city: yup
        .string()
        .required('Stadt ist erforderlich')
        .min(1, 'Stadt muss mindestens 1 Zeichen lang sein'),
    area: yup
        .string()
        .optional(),
    streetAddress: yup
        .string()
        .required('Anschrift ist erforderlich')
        .min(1, 'Anschrift muss mindestens 1 Zeichen lang sein'),
    postalCode: yup
        .string()
        .required('Postleitzahl ist erforderlich')
        .min(1, 'Postleitzahl muss mindestens 1 Zeichen lang sein'),
    image: yup
        .mixed()
        .nullable()
        .test(
            'is-valid-image',
            'Ein Bild ist erforderlich',
            value => {
                // If the value is a File, it's valid (it should not be null or undefined)
                if (value instanceof File) {
                    return true;
                }

                // If the value is a string, it must not be null or an empty string
                if (typeof value === 'string') {
                    return value.trim() !== '';
                }

                // If the value is null, it's invalid
                return false;
            }
        ),
    price: yup
        .number()
        .typeError('Preis / Tag muss eine Zahl sein')
        .positive('Preis / Tag muss positiv sein')
        .required('Preis / Tag ist erforderlich'),
});

const LocationForm: React.FC<{ locationId?: string }> = ({ }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [eventCategories, setEventCategories] = useState<string[]>([]);
    const [idCode, setIdCode] = useState<string | null>(null);
    const [domain, setDomain] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const { partnerLocations, partnerUser } = useStore();

    const methods = useForm({
        defaultValues: createEmptyLocationModel(0),
        resolver: yupResolver(locationValidationSchema),
    });

    const { control, handleSubmit, reset, formState: { errors } } = methods;

    // Fetch location data
    useEffect(() => {
        const fetchLocationData = async (companyId: number) => {
            try {
                setIsLoading(true);

                // Fetch Locations
                const response =
                    await fetch(`${locationsBaseUrl}/company/${companyId}?single=1&include=eventCategories`);

                if (response.status === 404 || response.status === 204) {
                    // Switch to "Create Mode"
                    setIsEdit(false);
                    reset(createEmptyLocationModel(companyId));
                    setIsLoading(false);
                    return;
                }

                if (!response.ok) {
                    throw new Error(`Failed to fetch location`);
                }
                const locationData = await response.json();
                reset(locationData);
                setIsEdit(true);
                setEventCategories(locationData.eventCategories || []);
                setIdCode(locationData.idCode);
                console.log('Fetched location data:', locationData);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (partnerUser?.companyId) {
            fetchLocationData(partnerUser.companyId);
        } else {
            // No user found; reset form to create mode
            reset(createEmptyLocationModel(0));
            setIsEdit(false);
            setIsLoading(false);
        }
    }, [partnerLocations]);

    useEffect(() => {
        setDomain(window.location.hostname);
    }, []);

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);

        try {
            const payload = {
                ...data,
                image: data.image ? data.image.name : undefined,
            };

            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/locations/${data.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/locations`;

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const responseData: CreateLocationResponse = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Failed to submit location");
            }

            if (responseData.uploadUrl && data.image) {
                await uploadFile(responseData.uploadUrl, data.image);
            }

            setResponseMessage(
                isEdit
                    ? "Location gespeichert!"
                    : "Location gespeichert!"
            );
        } catch (error) {
            console.error(error);
            setResponseMessage("An error occurred while submitting the location.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const uploadFile = async (uploadUrl: string, file: File) => {
        try {
            const uploadResponse = await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: {
                    "Content-Type": file.type,
                },
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload the file.");
            }
        } catch (error) {
            console.error("File upload error:", error);
        }
    };

    const copyToClipboard = () => {
        if (contentRef.current) {
            const textToCopy = contentRef.current.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
    };

    if (isLoading) {
        return (
            <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2, textAlign: "center" }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Loading location data...
                </Typography>
            </Box>
        );
    }

    const controlWidth = 10;

    return (
        <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
            <Typography variant="h3" sx={{ mb: 4 }}>
                {isEdit ? "Location bearbeiten" : "Location erstellen"}
            </Typography>
            <Typography variant="h5"
                sx={{ mb: 2, color: 'primary.main' }}>
                Allgemein
            </Typography>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid2 container spacing={2}>

                        {/* Title */}
                        <Grid2 size={{ xs: 12, sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="label">Name der Location</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
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
                        </Grid2>

                        {/* City */}
                        <Grid2 size={{ xs: 12, sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="label">Stadt</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
                                    <Controller
                                        name="city"
                                        control={control}
                                        render={({ field }) => (
                                            <FormControl fullWidth error={!!errors.city}>
                                                <Select
                                                    {...field}
                                                    variant="outlined"
                                                >
                                                    {AvailableCities.map((city: City) => (
                                                        <MenuItem key={city.value} value={city.value}>
                                                            {city.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.city &&
                                                    <FormHelperText>
                                                        {errors.city.message as string}
                                                    </FormHelperText>}
                                            </FormControl>
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Area */}
                        <Grid2 size={{ xs: 12, sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="label">Lage (z.B. Stadteil)</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
                                    <Controller
                                        name="area"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.area}
                                                helperText={errors.area?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Street Address */}
                        <Grid2 size={{ xs: 12, sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: 12, sm: 4 }}>
                                    <Typography variant="label">Anschrift</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
                                    <Controller
                                        name="streetAddress"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.streetAddress}
                                                helperText={errors.streetAddress?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Postal Code */}
                        <Grid2 size={{ xs: 12, sm: controlWidth }}>
                            <Grid2 container alignItems="flex-start">
                                <Grid2 size={{ xs: 12, sm: 4 }} >
                                    <Typography variant="label">Postleitzahl</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
                                    <Controller
                                        name="postalCode"
                                        control={control}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                fullWidth
                                                variant="outlined"
                                                error={!!errors.postalCode}
                                                helperText={errors.postalCode?.message}
                                            />
                                        )}
                                    />
                                </Grid2>
                            </Grid2>
                        </Grid2>

                        {/* Price */}
                        <Grid2 size={{ xs: 12, sm: controlWidth }}>
                            <Grid2 container alignItems="top">
                                <Grid2 size={{ xs: 12, sm: 4 }} >
                                    <Typography variant="label">Preis / Tag</Typography>
                                </Grid2>
                                <Grid2 size={{ xs: 12, sm: 8 }}>
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

                        <Grid2 size={{ xs: 12, sm: controlWidth }} mt={2} mb={2}>
                            <ImageUploadField name="image" />
                        </Grid2>

                        {/* Submit */}
                        <Grid2 size={{ xs: 12 }}>
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
                                {isSubmitting ? "Speichern..." : "Location Speichern"}
                                <Box component="span" sx={{ ml: 1 }}>
                                    <Save className="icon" width={16} height={16} />
                                </Box>
                            </Button>
                        </Grid2>

                    </Grid2>
                </form>
            </FormProvider>

            {/* Display Event Categories */}
            {eventCategories.length > 0 && (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row', },
                        gap: { xs: 2, sm: 0, },
                        mt: 4,
                    }}
                >
                    <Box sx={{
                        width: {
                            xs: "100%", // 100% width for small screens
                            sm: "25%", // Same as 3/12 in Grid2
                        },
                    }}><Typography variant="h5"
                        sx={{
                            color: 'primary.main',
                            lineHeight: 2,
                        }}>
                            Kategorien
                        </Typography>
                    </Box>
                    <ImmutableItemList
                        strings={eventCategories.map((c) =>
                            formatEventCategoriesSync([c as EventCategories])
                        )}
                    />
                </Box>
            )}

            {idCode && domain &&
                (<Box
                    sx={{
                        mt: 4,
                        mb: 4,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'primary.main',
                            lineHeight: 2,
                        }}>Embed Code
                    </Typography>
                    <Typography variant="body2"
                        sx={{
                            color: 'primary.main',
                            lineHeight: 2,
                        }}>

                        Copy and paste the following code into your website to embed the configurator:
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                        <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                            <IconButton
                                onClick={copyToClipboard}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    color: '#555',
                                }}
                            >
                                {copied ? <ClipboardCheck size={16} /> : <Clipboard size={16} />}
                            </IconButton>
                        </Tooltip>
                        <Typography
                            ref={contentRef}
                            sx={{
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                color: '#555',
                                padding: 2,
                                border: '1px solid #ddd',
                                overflowX: 'auto',
                                overflowWrap: 'anywhere',
                                borderRadius: '4px',
                            }}
                        >
                            &lt;div id=&quot;configurator-container&quot;&gt;&lt;/div&gt;
                            <br />
                            &lt;script src=&quot;https://{domain}/assets/embed.js?code={idCode}&quot;&gt;&lt;/script&gt;
                        </Typography>
                    </Box>
                </Box>
                )}

            {/*<Button onClick={() => console.log("Current Form Values: ", methods.getValues())}>
                Log Form Values
            </Button>*/}

            {responseMessage && (
                <Grid2 size={{ xs: 12, sm: controlWidth }}>
                    <Typography variant="body2" color="success">
                        {responseMessage}
                    </Typography>
                </Grid2>
            )}
        </Box >
    );
};

export default LocationForm;
