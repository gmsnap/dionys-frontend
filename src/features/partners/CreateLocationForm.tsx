"use client";

import React, { useState, useEffect } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    CircularProgress,
    MenuItem,
    Chip,
    Grid2,
} from "@mui/material";
import { CircleMinus } from "lucide-react";
import { CreateLocationResponse, GeoLocation } from "@/types/geolocation";
import { AvailableEventCategories, EventCategories } from "@/constants/EventCategories";
import { formatEventCategoriesSync } from "@/utils/formatEventCategories";
import useStore from '@/stores/partnerStore';

const LocationForm: React.FC<{ locationId?: string }> = ({ }) => {
    const [formData, setFormData] = useState({
        title: "",
        city: "",
        area: "",
        streetAddress: "",
        postalCode: "",
        geoLocation: { lat: 0, lng: 0 },
        image: null as File | null,
        price: "",
        eventCategories: [] as string[],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const { partnerUser } = useStore();
    const { partnerLocation, setPartnerLocation } = useStore();

    // Fetch location data if partnerUser is provided
    useEffect(() => {
        console.log("partnerUser");
        if (partnerUser) {
            setIsLoading(true);
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/partner/${partnerUser.id}?single=1`)
                .then((response) => response.json())
                .then((data) => {
                    setFormData({
                        title: data.title || "",
                        city: data.city || "",
                        area: data.area || "",
                        streetAddress: data.streetAddress || "",
                        postalCode: data.postalCode || "",
                        geoLocation: data.geoLocation || {
                            lat: 0,
                            lng: 0,
                        },
                        image: null, // Images are not fetched directly
                        price: data.price || "",
                        eventCategories: data.eventCategories || [],
                    });
                    setPartnerLocation(data);
                    setIsEdit(true);
                })
                .catch((error) => {
                    console.error("Failed to fetch location data:", error);
                    setResponseMessage("Failed to load location data.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [partnerUser]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setFormData((prev) => ({
            ...prev,
            image: file,
        }));
    };

    const handleAddCategory = (category: string) => {
        setFormData((prev) => ({
            ...prev,
            eventCategories: [...prev.eventCategories, category],
        }));
    };

    const handleRemoveCategory = (category: string) => {
        setFormData((prev) => ({
            ...prev,
            eventCategories: prev.eventCategories.filter((c) => c !== category),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                ...formData,
                image: formData.image ? formData.image.name : undefined,
            };

            const url = isEdit
                ? `${process.env.NEXT_PUBLIC_API_URL}/locations/${partnerLocation?.id}`
                : `${process.env.NEXT_PUBLIC_API_URL}/locations`;

            const method = isEdit ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data: CreateLocationResponse = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to submit location");
            }

            if (data.uploadUrl && formData.image) {
                await uploadFile(data.uploadUrl, formData.image);
            }

            setResponseMessage(
                isEdit
                    ? "Location updated successfully!"
                    : "Location created successfully!"
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

            setResponseMessage("File uploaded successfully!");
        } catch (error) {
            console.error(error);
            setResponseMessage("An error occurred during file upload.");
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

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4, p: 2, boxShadow: 3 }}>
            <Typography variant="h5" gutterBottom>
                {isEdit ? "Update Location" : "Create Location"}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Area"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Street Address"
                            name="streetAddress"
                            value={formData.streetAddress}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Postal Code"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <Typography variant="subtitle1">Event Categories</Typography>
                        <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                            {formData.eventCategories.map((category) => (
                                <Chip
                                    key={category}
                                    label={formatEventCategoriesSync([category as EventCategories])}
                                    onDelete={() => handleRemoveCategory(category)}
                                    deleteIcon={<CircleMinus />}
                                />
                            ))}
                        </Box>
                        <TextField
                            select
                            fullWidth
                            label="Add Category"
                            value=""
                            onChange={(e) => handleAddCategory(e.target.value)}
                        >
                            {AvailableEventCategories
                                .filter(
                                    (category) =>
                                        !formData.eventCategories.includes(category)
                                )
                                .map((category) => (
                                    <MenuItem key={category} value={category}>
                                        {formatEventCategoriesSync([category as EventCategories])}
                                    </MenuItem>
                                ))}
                        </TextField>
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <TextField
                            fullWidth
                            label="Price"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <Button variant="contained" component="label">
                            Upload Image
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>
                        {formData.image && <Typography>{formData.image.name}</Typography>}
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            disabled={isSubmitting}
                            startIcon={isSubmitting && <CircularProgress size={20} />}
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : isEdit
                                    ? "Update Location"
                                    : "Create Location"}
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            {responseMessage && (
                <Typography sx={{ mt: 2 }} color="primary">
                    {responseMessage}
                </Typography>
            )}
        </Box>
    );
};

export default LocationForm;
